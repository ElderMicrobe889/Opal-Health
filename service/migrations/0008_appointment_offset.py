# Generated by Django 3.1.3 on 2020-11-12 19:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0007_auto_20201112_1800'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='offset',
            field=models.CharField(default='+00:00', max_length=6),
        ),
    ]
