# Geospatial File Measurement API — Backend

Django + Django REST Framework backend that accepts geospatial files, processes features, and returns measurements.

---

## Prerequisites

- Python 3.10+
- pip

---

## Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Start server
python manage.py runserver
```

API is available at: `http://localhost:8000`

---

## API Endpoints

### POST /api/files/
Upload a `.zip` (Shapefile) or `.kml` file.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "id": "abc123",
  "filename": "survey.kml",
  "file_type": "kml",
  "feature_count": 120,
  "crs": "EPSG:4326",
  "status": "COMPLETED",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:30:05Z"
}
```

---

### GET /api/files/
List all uploaded files.

---

### GET /api/files/{id}/
Get details of a specific file.

---

### GET /api/files/{id}/measurements/
Get measurements for all features.

**Response:**
```json
{
  "file_id": "abc123",
  "measurement_crs": "EPSG:32643",
  "measurements": [
    {
      "feature_id": 0,
      "geometry_type": "Polygon",
      "area": 12345.6789,
      "area_unit": "m²",
      "length": null,
      "length_unit": null,
      "measurement_crs": "EPSG:32643",
      "error": null
    }
  ]
}
```

---

### GET /api/files/{id}/features/
Get all features with geometry, properties, and measurements.

**Query params:** `page`, `page_size`, `search`, `geometry_type`

---

## Architecture

```
backend/
├── config/          # Django project settings, urls
├── files/
│   ├── models.py    # GeoFile model (UUID pk, status, crs, feature_count)
│   ├── views.py     # APIView classes for all 5 endpoints
│   ├── serializers.py
│   ├── processing.py  # Core geospatial logic
│   └── urls.py
├── uploads/         # Uploaded files stored here
└── manage.py
```

---

## File Processing Flow

1. File uploaded via `POST /api/files/`
2. Extension validated (`.zip` or `.kml` only)
3. `GeoFile` record created with `status=PROCESSING`
4. `process_file()` called:
   - `.zip` → extracted to temp dir → `geopandas.read_file()` on `.shp`
   - `.kml` → `geopandas.read_file()` with KML driver
5. CRS detected from file metadata
6. GeoDataFrame reprojected to UTM zone (see CRS Handling)
7. Area/length calculated on projected geometries
8. Record updated with `status=COMPLETED`, `feature_count`, `crs`

---

## Measurement Calculation

| Geometry | Measurement | Unit |
|----------|-------------|------|
| Polygon / MultiPolygon | `geom.area` | m² |
| LineString / MultiLineString | `geom.length` | m |
| Point / MultiPoint | None | — |
| Other | Error message | — |

All calculations use Shapely on **projected** geometries (never on lat/lon degrees).

---

## CRS Handling

Strategy: **UTM zone based on data centroid**

1. Reproject data to EPSG:4326 to find centroid longitude/latitude
2. Compute UTM zone: `zone = int((lon + 180) / 6) + 1`
3. Select EPSG:326xx (north) or EPSG:327xx (south)
4. Falls back to EPSG:3857 (Web Mercator) if UTM cannot be determined

This ensures measurements are in metres regardless of the input CRS.

---

## Design Decisions

- **SQLite** — zero-config for local development; swap to PostgreSQL for production
- **Synchronous processing** — file processed inline during POST for simplicity; use Celery for large files in production
- **No geometry storage in DB** — features/measurements recomputed on each request; add a JSONField cache for production performance
- **CORS allow all** — suitable for local dev; restrict `CORS_ALLOWED_ORIGINS` in production

---

## Learnings & Future Scope

- Add Celery + Redis for async processing of large files
- Store processed features in PostGIS for fast spatial queries
- Add DELETE endpoint for file management
- Support GeoJSON upload
- Add geometry type distribution aggregation endpoint
- Authentication with JWT
- File size limits and rate limiting
