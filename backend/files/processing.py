"""
Geospatial processing: parse .zip (Shapefile) or .kml, extract features,
reproject to a suitable projected CRS, calculate area/length.
"""
import os
import json
import zipfile
import tempfile
import shutil
from typing import Any

import geopandas as gpd
from pyproj import CRS
from shapely.geometry.base import BaseGeometry


SUPPORTED_EXTENSIONS = {'.zip', '.kml'}


def _detect_file_type(filename: str) -> str:
    ext = os.path.splitext(filename.lower())[1]
    if ext == '.zip':
        return 'shapefile'
    if ext == '.kml':
        return 'kml'
    raise ValueError(f'Unsupported file type: {ext}. Accepted: .zip, .kml')


def _load_geodataframe(filepath: str, file_type: str) -> gpd.GeoDataFrame:
    """Load file into a GeoDataFrame."""
    if file_type == 'shapefile':
        # Extract to a persistent temp dir (not context-managed) so GDF stays valid
        tmpdir = tempfile.mkdtemp()
        try:
            with zipfile.ZipFile(filepath, 'r') as zf:
                zf.extractall(tmpdir)
            shp_files = []
            for root, _, files in os.walk(tmpdir):
                for f in files:
                    if f.lower().endswith('.shp'):
                        shp_files.append(os.path.join(root, f))
            if not shp_files:
                raise ValueError('No .shp file found inside the ZIP archive.')
            gdf = gpd.read_file(shp_files[0])
        finally:
            shutil.rmtree(tmpdir, ignore_errors=True)
        return gdf

    if file_type == 'kml':
        import fiona
        fiona.drvsupport.supported_drivers['KML'] = 'rw'
        fiona.drvsupport.supported_drivers['LIBKML'] = 'rw'
        gdf = gpd.read_file(filepath, driver='KML')
        return gdf

    raise ValueError(f'Unknown file type: {file_type}')


def _get_projected_crs(gdf: gpd.GeoDataFrame) -> CRS:
    """
    Select UTM zone based on data centroid.
    Falls back to EPSG:3857 if UTM cannot be determined.
    """
    try:
        if gdf.crs is None:
            return CRS.from_epsg(3857)
        geo_gdf = gdf.to_crs(epsg=4326) if not gdf.crs.is_geographic else gdf
        bounds = geo_gdf.total_bounds  # [minx, miny, maxx, maxy]
        lon = (bounds[0] + bounds[2]) / 2
        lat = (bounds[1] + bounds[3]) / 2
        zone = int((lon + 180) / 6) + 1
        epsg = 32600 + zone if lat >= 0 else 32700 + zone
        return CRS.from_epsg(epsg)
    except Exception:
        return CRS.from_epsg(3857)


def _get_crs_string(gdf: gpd.GeoDataFrame) -> str:
    if gdf.crs is None:
        return 'Unknown'
    try:
        auth = gdf.crs.to_authority()
        if auth:
            return f'{auth[0]}:{auth[1]}'
        return gdf.crs.to_string()
    except Exception:
        return str(gdf.crs)


def _calculate_measurement(geom: BaseGeometry, geom_type: str) -> dict[str, Any]:
    """Calculate area or length for a single projected geometry."""
    result: dict[str, Any] = {
        'area': None, 'area_unit': None,
        'length': None, 'length_unit': None,
        'error': None,
    }
    try:
        base_type = geom_type.replace('Multi', '')
        if base_type == 'Polygon':
            result['area'] = round(geom.area, 4)
            result['area_unit'] = 'm²'
        elif base_type == 'LineString':
            result['length'] = round(geom.length, 4)
            result['length_unit'] = 'm'
        elif base_type == 'Point':
            pass  # No measurement required
        else:
            result['error'] = f'Measurement not supported for geometry type: {geom_type}'
    except Exception as e:
        result['error'] = str(e)
    return result


def _geom_to_dict(geom: BaseGeometry) -> dict | None:
    try:
        return json.loads(gpd.GeoSeries([geom]).to_json())['features'][0]['geometry']
    except Exception:
        return None


def _serialize_value(val: Any) -> Any:
    """Convert a value to a JSON-serialisable type."""
    if val is None:
        return None
    if hasattr(val, 'item'):          # numpy scalar
        return val.item()
    if isinstance(val, float) and val != val:  # NaN
        return None
    if isinstance(val, (int, float, bool, str)):
        return val
    return str(val)


def process_file(filepath: str, filename: str) -> dict[str, Any]:
    """
    Main entry point. Returns:
    {
        'file_type': str,
        'crs': str,
        'feature_count': int,
        'features': [...],
        'measurement_crs': str,
    }
    """
    file_type = _detect_file_type(filename)
    gdf = _load_geodataframe(filepath, file_type)

    if gdf is None or len(gdf) == 0:
        return {
            'file_type': file_type,
            'crs': 'Unknown',
            'feature_count': 0,
            'features': [],
            'measurement_crs': 'Unknown',
        }

    # Assign default CRS if missing
    if gdf.crs is None:
        gdf = gdf.set_crs(epsg=4326)

    original_crs = _get_crs_string(gdf)

    # Reproject to projected CRS for measurements
    projected_crs = _get_projected_crs(gdf)
    gdf_proj = gdf.to_crs(projected_crs)

    try:
        proj_auth = projected_crs.to_authority()
        measurement_crs = f'{proj_auth[0]}:{proj_auth[1]}' if proj_auth else projected_crs.to_string()
    except Exception:
        measurement_crs = str(projected_crs)

    # Reset index so positional access is safe
    gdf = gdf.reset_index(drop=True)
    gdf_proj = gdf_proj.reset_index(drop=True)

    features = []
    for pos in range(len(gdf)):
        row = gdf.iloc[pos]
        row_proj = gdf_proj.iloc[pos]

        geom = row.geometry
        geom_proj = row_proj.geometry
        geom_type = geom.geom_type if geom is not None else 'Unknown'

        # Properties: all non-geometry columns
        props = {
            col: _serialize_value(row[col])
            for col in gdf.columns
            if col != 'geometry'
        }

        geom_dict = _geom_to_dict(geom) if geom is not None else None

        measurement = (
            _calculate_measurement(geom_proj, geom_type)
            if geom_proj is not None
            else {'area': None, 'area_unit': None, 'length': None, 'length_unit': None, 'error': 'No geometry'}
        )
        measurement['measurement_crs'] = measurement_crs

        features.append({
            'id': pos,
            'geometry_type': geom_type,
            'geometry': geom_dict,
            'crs': original_crs,
            'properties': props,
            'measurement': measurement,
        })

    return {
        'file_type': file_type,
        'crs': original_crs,
        'feature_count': len(features),
        'features': features,
        'measurement_crs': measurement_crs,
    }
