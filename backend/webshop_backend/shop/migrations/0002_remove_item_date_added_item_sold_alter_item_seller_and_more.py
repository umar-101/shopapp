# Generated by Django 5.1.7 on 2025-03-08 22:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='date_added',
        ),
        migrations.AddField(
            model_name='item',
            name='sold',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='item',
            name='seller',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shop.user'),
        ),
        migrations.CreateModel(
            name='Cart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shop.item')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shop.user')),
            ],
        ),
    ]
