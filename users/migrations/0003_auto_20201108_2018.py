# Generated by Django 3.1.3 on 2020-11-08 20:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20201106_1451'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='confirmed',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='PassResetEmail',
            fields=[
                ('id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('date_created', models.DateField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_to_reset', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ConfirmationEmail',
            fields=[
                ('id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='user_to_confirm', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
