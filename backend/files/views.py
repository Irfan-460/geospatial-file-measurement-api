import os
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import GeoFile
from .serializers import GeoFileSerializer
from .processing import process_file, SUPPORTED_EXTENSIONS


class FileListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        files = GeoFile.objects.all()
        return Response(GeoFileSerializer(files, many=True).data)

    def post(self, request):
        uploaded = request.FILES.get('file')
        if not uploaded:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(uploaded.name.lower())[1]
        if ext not in SUPPORTED_EXTENSIONS:
            return Response(
                {'detail': f'Unsupported file type "{ext}". Accepted: .zip, .kml'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        geo_file = GeoFile.objects.create(
            filename=uploaded.name,
            file=uploaded,
            status=GeoFile.STATUS_PROCESSING,
        )

        try:
            result = process_file(geo_file.file.path, uploaded.name)
            geo_file.file_type = result['file_type']
            geo_file.crs = result['crs']
            geo_file.feature_count = result['feature_count']
            geo_file.status = GeoFile.STATUS_COMPLETED
            geo_file.processed_at = timezone.now()
            # Store features as JSON in a separate field (we compute on-the-fly for API)
            # Cache features on the model instance for this request
            geo_file._cached_result = result
        except Exception as e:
            geo_file.status = GeoFile.STATUS_FAILED
            geo_file.error_message = str(e)
            geo_file._cached_result = None

        geo_file.save()
        return Response(GeoFileSerializer(geo_file).data, status=status.HTTP_201_CREATED)


class FileDetailView(APIView):
    def get(self, request, pk):
        try:
            geo_file = GeoFile.objects.get(pk=pk)
        except GeoFile.DoesNotExist:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(GeoFileSerializer(geo_file).data)


class FileMeasurementsView(APIView):
    def get(self, request, pk):
        try:
            geo_file = GeoFile.objects.get(pk=pk)
        except GeoFile.DoesNotExist:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        if geo_file.status != GeoFile.STATUS_COMPLETED:
            return Response(
                {'detail': f'File is not yet processed. Current status: {geo_file.status}'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            result = process_file(geo_file.file.path, geo_file.filename)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        measurements = []
        for f in result['features']:
            m = f.get('measurement', {})
            measurements.append({
                'feature_id': f['id'],
                'geometry_type': f['geometry_type'],
                'area': m.get('area'),
                'area_unit': m.get('area_unit'),
                'length': m.get('length'),
                'length_unit': m.get('length_unit'),
                'measurement_crs': m.get('measurement_crs', result['measurement_crs']),
                'error': m.get('error'),
            })

        return Response({
            'file_id': str(geo_file.id),
            'measurement_crs': result['measurement_crs'],
            'measurements': measurements,
        })


class FileFeaturesView(APIView):
    def get(self, request, pk):
        try:
            geo_file = GeoFile.objects.get(pk=pk)
        except GeoFile.DoesNotExist:
            return Response({'detail': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

        if geo_file.status != GeoFile.STATUS_COMPLETED:
            return Response(
                {'detail': f'File is not yet processed. Current status: {geo_file.status}'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            result = process_file(geo_file.file.path, geo_file.filename)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        features = result['features']

        # Optional filtering
        geometry_type = request.query_params.get('geometry_type')
        search = request.query_params.get('search', '').lower()

        if geometry_type:
            features = [f for f in features if f['geometry_type'] == geometry_type]

        if search:
            def matches(f: dict) -> bool:
                if search in f['geometry_type'].lower():
                    return True
                for v in f['properties'].values():
                    if v and search in str(v).lower():
                        return True
                return False
            features = [f for f in features if matches(f)]

        total = len(features)

        # Pagination
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(200, max(1, int(request.query_params.get('page_size', 50))))
        except (ValueError, TypeError):
            page, page_size = 1, 50

        start = (page - 1) * page_size
        paginated = features[start:start + page_size]

        return Response({
            'file_id': str(geo_file.id),
            'total': total,
            'page': page,
            'page_size': page_size,
            'features': paginated,
        })
