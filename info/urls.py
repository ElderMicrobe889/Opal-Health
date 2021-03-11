from django.urls import path

from . import views

urlpatterns = [
    path('contact/', views.contact, name="contact"),
    path('cookies/', views.cookies, name="cookies"),
    path('privacy/', views.privacy, name="privacy"),
    path('sitemap/', views.sitemap, name="sitemap"),
    path('terms/', views.terms, name="terms"),
    path('works/', views.works, name="works"),
    path('services/', views.services, name="services"),
    path('manifest/', views.manifest, name="manifest")
]
