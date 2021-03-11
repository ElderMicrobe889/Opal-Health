from django import template

register = template.Library()

alertTypes={
  'info' : "skyblue",
  'error' : 'red',
  'warning' : 'yellow',
  'success' : "lightgreen",
}


@register.simple_tag(name="getAlert")
def get_alert(request):
  try:
    return request.GET["alert"]
  except KeyError:
    return None

@register.simple_tag(name="getAlertType")
def alert_type(request):
  try:
    return alertTypes[request.GET["alertType"]]
  except KeyError:
    return alertTypes['error']
