import uuid
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    confirmed = models.BooleanField(default=False)

    def display_name(self):
        if len(self.first_name) == 0:
            return self.username
        else:
            if self.has_perm("view_appointment_grid"):
                return f"Dr. {self.last_name}"
            else:
                return f'{self.first_name} {self.last_name}'

    dateOfBirth = models.DateField(null=True, blank=True)

    class Meta:
        permissions = [
            ("create_appointment", "Can Create Appointment"),
            ("accept_appointment", "Can Accept Appointment"),
            ("view_appointment_grid", "Can View Appointment Grid"),
        ]


class ConfirmationEmail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    user = models.OneToOneField(User,
                                on_delete=models.CASCADE,
                                related_name="user_to_confirm")

    def link(self):
        return f"{settings.ALLOWED_HOSTS[0]}/users/confirm?id={self.id}"

    def email(self):
        html_content = render_to_string('confirmEmail.html', {
            "user": self.user,
            "link": self.link()
        })
        text_content = f"Hello, {self.user.display_name()} please confirm you email, the link is: {self.link()}"

        out_message = EmailMultiAlternatives(
            subject='Healine Email Confirmation', body=text_content)

        out_message.html_content = html_content

        out_message.attach_alternative(html_content, "text/html")

        out_message.to = [self.user.email]

        return out_message


class PassResetEmail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    date_created = models.DateTimeField(auto_now_add=True)

    user = models.OneToOneField(User,
                                on_delete=models.CASCADE,
                                related_name="user_to_reset")

    def link(self):
        return f"{settings.ALLOWED_HOSTS[0]}/users/reset?id={self.id}"

    def email(self):
        html_content = render_to_string('resetEmail.html', {
            "user": self.user,
            "link": self.link()
        })
        text_content = f"Hello, {self.user.display_name()} you have requested a password reset, the link is: {self.link()}"

        out_message = EmailMultiAlternatives(subject='Healine Password Reset',
                                             body=text_content)

        out_message.html_content = html_content

        out_message.to = [self.user.email]

        out_message.attach_alternative(html_content, "text/html")

        return out_message
