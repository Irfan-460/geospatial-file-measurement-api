from django.urls import path
from .views import FileListCreateView, FileDetailView, FileMeasurementsView, FileFeaturesView

urlpatterns = [
    path('files/', FileListCreateView.as_view(), name='file-list-create'),
    path('files/<uuid:pk>/', FileDetailView.as_view(), name='file-detail'),
    path('files/<uuid:pk>/measurements/', FileMeasurementsView.as_view(), name='file-measurements'),
    path('files/<uuid:pk>/features/', FileFeaturesView.as_view(), name='file-features'),
]
