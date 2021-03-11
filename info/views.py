from django.shortcuts import render
from django.conf import settings
from django.template.loader import render_to_string
from django.http import HttpResponse, Http404


def home(request):
    return render(request, 'home.html')


def contact(request):
    return render(request, 'contact.html')


def cookies(request):
    return render(request, 'cookies.html')


def privacy(request):
    return render(request, "privacy.html")


def sitemap(request):
    return render(request, "sitemap.html")


def terms(request):
    return render(request, "terms.html")


def works(request):
    return render(request, "works.html")


def services(request):
    return render(request, "services.html")


def manifest(request):
    renderedManifest = render_to_string("manifest.json")
    return HttpResponse(renderedManifest,
                        content_type="application/manifest+json")


def error_page(request):
    if settings.DEBUG:
        try:
            error_type = request.GET.get('type', '')
            return render(request, f'{error_type}.html')
        except:
            raise Http404()
    else:
        raise Http404()
