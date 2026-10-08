# Geospatial File Measurement API

A full-stack application for uploading, processing, and measuring geospatial files. Built with **Django + Django REST Framework** (backend) and **React + TypeScript** (frontend).

---

## Project Structure

```
geospatial-file-measurement-api/
├── backend/          # Django REST API
└── frontend/         # React + TypeScript UI  (root of this repo)
```

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API runs at: `http://localhost:8000`

### 2. Frontend

```bash
# In the root folder
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

npm install
npm run dev
```

UI runs at: `http://localhost:5173`

---

## Backend — Django REST Framework

### Prerequisites
- Python 3.10+
- pip

### Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/files/` | Upload `.zip` (Shapefile) or `.kml` |
| `GET` | `/api/files/` | List all uploaded files |
| `GET` | `/api/files/{id}/` | Get file details |
| `GET` | `/api/files/{id}/measurements/` | Get measurements |
| `GET` | `/api/files/{id}/features/` | Get features with pagination |

### Architecture

```
backend/
├── config/
│   ├── settings.py     # Django settings, CORS, SQLite
│   └── urls.py         # Root URL config
├── files/
│   ├── models.py       # GeoFile model (UUID pk, status, crs, feature_count)
│   ├── views.py        # APIView classes for all 5 endpoints
│   ├── serializers.py  # DRF serializers
│   ├── processing.py   # Core geospatial logic
│   └── urls.py         # URL routing
└── uploads/            # Uploaded files stored here
```

### File Processing Flow

1. File uploaded via `POST /api/files/`
2. Extension validated — `.zip` or `.kml` only
3. `GeoFile` record created with `status=PROCESSING`
4. `process_file()` called:
   - `.zip` → extracted to temp dir → GeoPandas reads `.shp`
   - `.kml` → GeoPandas reads with KML/LIBKML driver
5. CRS detected from file metadata
6. GeoDataFrame reprojected to UTM zone
7. Area/length calculated on projected geometries
8. Record updated: `status=COMPLETED`, `feature_count`, `crs`

### Measurement Calculation

| Geometry | Measurement | Unit |
|----------|-------------|------|
| Polygon / MultiPolygon | `geom.area` | m² |
| LineString / MultiLineString | `geom.length` | m |
| Point / MultiPoint | None | — |
| Other | Error message | — |

### CRS Handling

Strategy: **UTM zone based on data centroid**

1. Reproject to EPSG:4326 to find centroid lon/lat
2. Compute UTM zone: `zone = int((lon + 180) / 6) + 1`
3. Select EPSG:326xx (north) or EPSG:327xx (south)
4. Falls back to EPSG:3857 if UTM fails

This ensures all measurements are in **metres**, never in degrees.

---

## Frontend — React + TypeScript

### Prerequisites
- Node.js 18+
- npm 9+

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Project Structure

```
src/
├── components/
│   ├── layout/         # Sidebar, Header
│   └── ui/             # Card, Table, Pagination, SearchBar,
│                       # StatusBadge, Skeleton, States, Modal, Toast, Breadcrumbs
├── pages/              # One file per route
├── layouts/            # AppLayout (sidebar + header shell)
├── services/api/       # All fetch calls — single source of truth
├── hooks/              # useAsync, useFileUpload, useApiHealth
├── types/              # TypeScript interfaces matching API contracts
├── utils/              # formatFileSize, formatDate, formatMeasurement
├── constants/          # Accepted file types, nav items
└── routes/             # AppRoutes.tsx
```

### Routes

| Path | Page |
|------|------|
| `/dashboard` | Overview stats |
| `/upload` | Drag-and-drop file upload |
| `/files` | All uploaded files table |
| `/files/:id` | File detail view |
| `/files/:id/features` | Feature inspection with pagination |
| `/files/:id/measurements` | Measurement results |
| `/measurements` | Select file → view measurements |
| `/features` | Select file → view features |
| `/api-docs` | API endpoint documentation |
| `/settings` | API URL configuration |

---

## Design Decisions

### Backend
- **SQLite** — zero-config for local dev; swap to PostgreSQL + PostGIS for production
- **Synchronous processing** — file processed inline during POST; use Celery for large files in production
- **UTM projection** — automatically selects the correct UTM zone per file, ensuring accurate metre-based measurements regardless of input CRS
- **No geometry storage in DB** — features/measurements recomputed on each request; add JSONField cache for production performance
- **CORS allow all** — suitable for local dev; restrict `CORS_ALLOWED_ORIGINS` in production

### Frontend
- **No mock data** — every value comes from the API; if API is offline, error states are shown
- **`useAsync` hook** — single reusable pattern for all data fetching with loading/error/data states
- **Inline styles + CSS variables** — zero build-time CSS complexity, all design tokens in `:root`
- **No external UI library** — keeps bundle small (~67 KB gzipped), full design control
- **Vite proxy** — `/api/*` proxied to backend in dev, eliminates CORS issues

---

## Learnings

- **GeoPandas + PyProj** — learned how coordinate reference systems work in practice; geographic CRS (degrees) vs projected CRS (metres) is a critical distinction for accurate measurements
- **UTM zone selection** — understanding how to automatically pick the right UTM zone from a file's centroid longitude/latitude
- **Shapely geometry types** — handling Multi* variants (MultiPolygon, MultiLineString) alongside their base types gracefully
- **Django REST Framework** — building clean APIView-based endpoints with proper HTTP status codes and error responses
- **React + TypeScript** — building a fully type-safe, API-driven UI with zero hardcoded data
- **Vite proxy** — using Vite's dev server proxy to avoid CORS issues during local development
- **Fiona KML driver** — enabling KML/LIBKML drivers explicitly for GeoPandas KML support

---

## Future Scope

### Backend
- **Async processing** — Celery + Redis for large file processing without blocking the HTTP request
- **PostGIS** — store geometries in PostgreSQL/PostGIS for fast spatial queries and filtering
- **GeoJSON support** — accept `.geojson` files in addition to Shapefile and KML
- **DELETE endpoint** — allow users to delete uploaded files and their data
- **File size limits** — enforce max upload size and add rate limiting
- **Geometry aggregation** — add endpoint returning geometry type distribution counts
- **Authentication** — JWT-based user sessions so each user sees only their files
- **Caching** — cache processed features/measurements to avoid reprocessing on every request

### Frontend
- **Map visualization** — render geometries on an interactive map using Leaflet or MapLibre GL
- **Auto-refresh** — poll `GET /api/files/{id}/` every few seconds while status is `PROCESSING`
- **Export to CSV** — download measurements table as CSV
- **Dark/light theme toggle** — user preference stored in localStorage
- **Bulk file upload** — upload multiple files at once
- **Geometry type chart** — pie/bar chart of geometry type distribution (when API provides aggregate data)
- **File delete** — delete button in Files table (when backend provides DELETE endpoint)
- **Authentication UI** — login/register pages when backend adds auth
