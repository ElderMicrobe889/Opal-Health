from django import template

register = template.Library()


@register.simple_tag(name="formSubmit")
def form_submit(text):
  first = f'<div class="submitLabel">{text}</div>'
  second = '<img style="display:none;" class="waitSpin submitLoading" src="/static/base/IMG/loading.svg"/>'
  return first + second