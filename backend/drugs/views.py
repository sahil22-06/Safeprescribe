from rest_framework import generics, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Drug, Allergy
from .serializers import DrugSerializer, AllergySerializer

class DrugListCreateView(generics.ListCreateAPIView):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form', 'category', 'availability']
    search_fields = ['name', 'generic_name', 'category']
    ordering_fields = ['name', 'created_at']

class DrugDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Drug.objects.all()
    serializer_class = DrugSerializer

@api_view(['GET'])
def drug_stats(request):
    total_drugs = Drug.objects.count()
    available_drugs = Drug.objects.filter(availability='available').count()
    out_of_stock = Drug.objects.filter(availability='out_of_stock').count()
    
    return Response({
        'total_drugs': total_drugs,
        'available_drugs': available_drugs,
        'out_of_stock': out_of_stock,
    })

class AllergyListCreateView(generics.ListCreateAPIView):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer

class AllergyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
