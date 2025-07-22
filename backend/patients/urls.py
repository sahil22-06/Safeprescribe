from django.urls import path
from .views import PatientListCreateView, PatientDetailView, patient_stats

urlpatterns = [
    path('patients/', PatientListCreateView.as_view(), name='patient-list'),
    path('patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
    path('patients/stats/', patient_stats, name='patient-stats'),
] 