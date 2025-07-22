"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

def test_api(request):
    return JsonResponse({"message": "Backend is running!", "status": "success"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_api, name='test-api'),
    path('api/', include('users.urls')),
    path('api/', include('patients.urls')),
    path('api/', include('drugs.urls')),
    path('api/', include('rx.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
