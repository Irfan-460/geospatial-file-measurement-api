from rest_framework import serializers
from .models import GeoFile


class GeoFileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex_verbose', read_only=True)

    class Meta:
        model = GeoFile
        fields = [
            'id', 'filename', 'file_type', 'feature_count',
            'crs', 'status', 'error_message', 'uploaded_at', 'processed_at',
        ]
        read_only_fields = fields
