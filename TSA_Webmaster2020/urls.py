from django.contrib import admin
from django.urls import path, include
from info.views import home, error_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('info/', include('info.urls')),
    path('service/', include('service.urls')),
    path('chapter/', include('chapter.urls')),
    path('', home, name="home"),
    path('test_error', error_page, name="error_test")
]
