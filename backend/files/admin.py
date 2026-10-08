from django.contrib import admin
from .models import GeoFile

@admin.register(GeoFile)
class GeoFileAdmin(admin.ModelAdmin):
    list_display = ['filename', 'file_type', 'feature_count', 'crs', 'status', 'uploaded_at']
    list_filter = ['status', 'file_type']
    readonly_fields = ['id', 'uploaded_at', 'processed_at']
