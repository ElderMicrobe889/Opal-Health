# Generated by Django 3.1.3 on 2020-11-18 02:28

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0009_auto_20201113_1832'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appointment',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False),
        ),
    ]