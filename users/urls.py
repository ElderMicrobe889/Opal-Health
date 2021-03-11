from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.register, name="register"),
    path('login/', views.login, name="login"),
    path('account/', views.account, name='account'),
    path('account/delete/', views.delete_user, name='delete_user'),
    path('account/change/', views.change_password, name='change_password'),
    path('logout/', views.logout, name='logout'),
    path('confirm/', views.confirm_email, name="confirm_email"),
    path('reset/', views.reset_password, name="reset_password"),
    path('resetrequest/', views.reset_request, name="reset_request"),
    path('sendconfirm/', views.send_confirmation, name="send_confirmation"),
    path('change_email/', views.change_email, name="change_email"),
    path('check_login/', views.check_login, name="check_login"),
    path('check_taken/', views.check_taken, name='check_taken'),
    path('password_check/', views.check_password, name="check_password")
]
