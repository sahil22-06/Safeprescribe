from django.urls import path
from .views import DrugListCreateView, DrugDetailView, drug_stats, AllergyListCreateView, AllergyDetailView

urlpatterns = [
    path('drugs/', DrugListCreateView.as_view(), name='drug-list'),
    path('drugs/<int:pk>/', DrugDetailView.as_view(), name='drug-detail'),
    path('drugs/stats/', drug_stats, name='drug-stats'),
    path('allergies/', AllergyListCreateView.as_view(), name='allergy-list'),
    path('allergies/<int:pk>/', AllergyDetailView.as_view(), name='allergy-detail'),
] 