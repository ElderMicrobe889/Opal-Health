from django.urls import path

from . import views

urlpatterns = [
    path('', views.chapterHome, name="chapter_home"),
    path('about/', views.about, name="chapter_about"),
    path('education/', views.programs, name="chapter_programs"),
    path('activities/', views.activities, name="chapter_activities"),
    path('sitemap/', views.map, name="chapter_map"),
    path('info/', views.info, name="chapter_info"),
    path('manifest/', views.chapterManifest, name="chapter_manifest"),
    path('paperwork/', views.paperwork, name="paperwork")
]
