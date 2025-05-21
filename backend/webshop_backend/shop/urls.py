# shop/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.shop, name='shop'),  # Browse items
    path('signup/', views.create_account, name='signup'),
    path('login/', views.login_user, name='login'),
    path('add_item/', views.add_item, name='add_item'),
    path('item/<int:item_id>/add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('cart/', views.cart, name='cart'),
    path('cart/remove/<int:cart_item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('item/<int:item_id>/edit/', views.edit_item, name='edit_item'),
    path('pay/', views.pay, name='pay'),
    path('account/', views.edit_account, name='account'),
    path('user_items/', views.user_items, name='user_items'),
    #search
]
