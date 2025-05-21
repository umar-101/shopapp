# webshop_backend/urls.py

from django.contrib import admin
from django.urls import path, include  # Import include to reference URLs from other apps
from shop.views import populate_db, landing_page,clear_db  # Import views from the shop app

urlpatterns = [
    path('', landing_page, name='landing_page'),  # Root URL mapped to landing_page view
    path('admin/', admin.site.urls),  # Django admin page
    path('populate-db/', populate_db, name='populate-db'),  # A view to populate the database with test data
    path('clear-db/', clear_db, name='clear_db'),
    # Include authentication URLs
    path('accounts/', include('django.contrib.auth.urls')),  # This adds login, logout, etc.

    # Include URLs from the shop app
    path('shop/', include('shop.urls')),  # All shop-related URLs are handled by shop/urls.py
]
