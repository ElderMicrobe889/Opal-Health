# Generated by Django 3.1.3 on 2020-11-10 23:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_auto_20201110_2344'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'permissions': [('create_appointment', 'Can Create Appointment'), ('accept_appointment', 'Can Accept Appointment'), ('view_appointment_grid', 'Can View Appointment Grid')]},
        ),
    ]
