from django.urls import path

from . import views

urlpatterns = [
    path('appointments/', views.view_appointments, name="appointment_view"),
    path('appointment/', views.appointment, name='appointment'),
    path('create/', views.create_appointment, name="create_appointment"),
    path('accept/', views.accept_appointment, name="accept_appointment"),
    path('list/', views.view_available, name="list_appointments"),
    path('delete/', views.cancel_appointment, name="cancel_appointment"),
    path('summary/', views.view_summary, name="appointment_summary"),
    path('complete/', views.complete, name='complete'),
    path('finalize/', views.close_appointment, name="finalize")
]
