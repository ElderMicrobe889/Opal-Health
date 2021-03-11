import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TSA_Webmaster2020.settings')

application = get_wsgi_application()
