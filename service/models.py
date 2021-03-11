import uuid
from datetime import datetime
from django.db import models
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from users.models import User


class Appointment(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    doctor = models.ForeignKey(User,
                               on_delete=models.SET_NULL,
                               related_name="doctor",
                               blank=True,
                               null=True)
    patient = models.ForeignKey(User,
                                on_delete=models.CASCADE,
                                related_name="patient")
    issue = models.CharField(max_length=200)
    post_summary = models.CharField(max_length=500, blank=True, null=True)

    scheduled = models.DateTimeField()

    offset = models.CharField(max_length=6, default="+00:00")

    created = models.DateField(auto_now_add=True)

    OPEN = "OP"
    SCHEDULED = "SC"
    ONGOING = "ON"
    CLOSED = "CL"

    status_display = {
        OPEN: "Pending",
        ONGOING: "Ongoing",
        CLOSED: "Completed",
        SCHEDULED: "Scheduled",
    }

    status_choices = [(OPEN, "Pending"), (ONGOING, "Ongoing"),
                      (CLOSED, "Completed"), (SCHEDULED, "Scheduled")]

    status = models.CharField(max_length=2,
                              choices=status_choices,
                              default=CLOSED)

    def __str__(self):
        if self.doctor is None:
            return f"{self.patient.display_name()}'s Appointment On {self.get_date()}"
        else:
            return f"{self.patient.display_name()}'s Appointment With {self.doctor.display_name()} On {self.get_date()}"

    def link(self):
        if self.status == self.ONGOING:
            return f"/service/appointment?id={self.id}"
        else:
            return "None"

    def public_link(self):
        if self.status == self.ONGOING:
            return f"{settings.ALLOWED_HOSTS[0]}/service/appointment?id={self.id}"
        else:
            return "None"

    def email(self):
        html_content = render_to_string('acceptedEmail.html', {"app": self})
        text_content = f"Hello, {self.patient.display_name()} your appointment got accepted, it will take place on {self.get_scheduled()}"

        out_message = EmailMultiAlternatives(
            subject='Healine Appointment Accepted', body=text_content)

        out_message.html_content = html_content

        out_message.attach_alternative(html_content, "text/html")

        out_message.to = [self.patient.email]

        return out_message

    def summary_email(self):
        html_content = render_to_string('summaryEmail.html', {"app": self})
        text_content = f"Hello, {self.patient.display_name()}, your appointment has been completed, here is the summary"

        out_message = EmailMultiAlternatives(
            subject='Healine Appointment Completed', body=text_content)

        out_message.html_content = html_content

        out_message.attach_alternative(html_content, "text/html")

        out_message.to = [self.patient.email]

        return out_message

    def reverse_offset(self):
        m = self.offset
        if m[0] == "+": m = m.replace("+", "-")
        elif m[0] == "-": m = m.replace("-", "+")
        return m

    def get_date(self):
        return self.created.strftime('%m/%d/%Y')

    def get_scheduled(self):
        neutrual = self.scheduled.replace()
        iHateTimeZones = neutrual.strftime("%Y-%m-%dT%H:%M")
        offset = self.reverse_offset()
        updated = datetime.strptime(f"{iHateTimeZones}|{offset}",
                                    "%Y-%m-%dT%H:%M|%z")
        return updated

    def get_status(self):
        return self.status_display[self.status]

    def update(self):
        #update is run everytime the appointments page is loaded, on every appointment the user has/had
        MAX_HOURS = 2
        if self.status == self.SCHEDULED:
            right_now = datetime.now()
            if self.scheduled.replace(tzinfo=None) < right_now.replace(
                    tzinfo=None) and self.doctor is not None:
                self.status = self.ONGOING
                self.save()
        elif self.status == self.ONGOING and not settings.DEBUG:
            right_now = datetime.now()
            time_delta = right_now.replace(
                tzinfo=None) - self.scheduled.replace(tzinfo=None)
            hours_since = time_delta.seconds / 60 / 60
            if hours_since > MAX_HOURS:
                self.status = self.CLOSED
                self.post_summary = "Ended due to timeout"
                self.save()
