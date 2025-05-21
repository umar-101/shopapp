from django.db import models
from django.contrib.auth.models import User

class Item(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    buyer = models.ForeignKey(User, related_name='purchased_items', on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    AVAILABILITY = [
        ('IN_STOCK', 'In Stock'),
        ('PURCHASED', 'Purchased'),
    ]
    availability = models.CharField(max_length=12, choices=AVAILABILITY, default='IN_STOCK')

    def __str__(self):
        return f"{self.title} - {self.availability}"

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}'s Cart"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="cart_items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    price_added = models.DecimalField(max_digits=12, decimal_places=2)
    status_added = models.CharField(max_length=12, choices=Item.AVAILABILITY)
    time_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.title} added by {self.cart.user.username}"
