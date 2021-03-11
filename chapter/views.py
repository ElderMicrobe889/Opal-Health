from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import HttpResponse


def chapterHome(request):
    return render(request, 'chapterHome.html')


def programs(request):
    return render(request, 'education.html')


def activities(request):
    return render(request, 'activities.html')


def about(request):
    return render(request, 'about.html')


def map(request):
    return render(request, 'chapterMap.html')


def info(request):
    return render(request, 'chapterInfo.html')


def chapterManifest(request):
    renderedManifest = render_to_string("chapter-manifest.json")
    return HttpResponse(renderedManifest,
                        content_type="application/manifest+json")


def paperwork(request):
    return render(request, "paperwork.html")
