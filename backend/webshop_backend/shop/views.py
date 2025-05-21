import json
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import get_object_or_404
from .models import Item, Cart, CartItem
from django.contrib.auth import update_session_auth_hash
from django.http import JsonResponse
import random
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

def populate_db(request):
    Item.objects.all().delete()
    users = list(User.objects.all())
    
    if not users:
        for i in range(1, 7):
            user = User.objects.create_user(
                username=f'testuser{i}',
                password=f'pass{i}',
                email=f'testuser{i}@shop.aa'
            )
            users.append(user)

    for i in range(3):
        seller = users[i]
        for j in range(10):
            Item.objects.create(
                title=f'Item {j+1}',
                description=f'Description for Item {j+1}',
                price=random.randint(10, 100),
                seller=seller,
                availability='IN_STOCK'
            )

    return JsonResponse({'message': 'Database populated successfully!'})

def landing_page(request):
    return JsonResponse({'message': 'Welcome to the landing page'})


@csrf_exempt  # For testing only; use proper CSRF handling in production
def create_account(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists!'}, status=400)

            User.objects.create_user(username=username, password=password, email=email)
            return JsonResponse({'message': 'Account created successfully!'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            body_unicode = request.body.decode('utf-8')
            data = json.loads(body_unicode)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'error': 'Username and password required'}, status=400)

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful'})
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)


def shop(request):
    search_query = request.GET.get('search', '').strip()
    
    base_queryset = Item.objects.filter(availability='IN_STOCK')  # Only on sale items
    
    if search_query:
        items = base_queryset.filter(
            Q(title__icontains=search_query) | Q(description__icontains=search_query)
        ).values('id', 'title', 'description', 'price', 'date', 'availability', 'seller__username')
    else:
        items = base_queryset.values('id', 'title', 'description', 'price', 'date', 'availability', 'seller__username')
    
    return JsonResponse({'items': list(items)})

# @csrf_exempt
# @login_required
# def user_items(request):
#     search_query = request.GET.get('search', '').strip()
    
#     if search_query:
#         items = Item.objects.filter(
#             seller=request.user
#         ).filter(
#             Q(title__icontains=search_query) | Q(description__icontains=search_query)
#         ).values('id', 'title', 'description', 'price', 'availability', 'seller__username')
#     else:
#         items = Item.objects.filter(seller=request.user).values('id', 'title', 'description', 'price', 'availability', 'seller__username')
    
#     return JsonResponse({'items': list(items)})

@csrf_exempt
@login_required
def user_items(request):
    on_sale = Item.objects.filter(seller=request.user, availability='IN_STOCK')
    sold = Item.objects.filter(seller=request.user, availability='PURCHASED')
    purchased = Item.objects.filter(buyer=request.user)

    def serialize(items):
        return list(items.values('id', 'title', 'description', 'price', 'availability', 'seller__username', 'buyer__username'))

    return JsonResponse({
        'on_sale': serialize(on_sale),
        'sold': serialize(sold),
        'purchased': serialize(purchased)
    })

@csrf_exempt
@login_required
def add_item(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        price = request.POST.get('price')

        item = Item.objects.create(
            title=title,
            description=description,
            price=price,
            seller=request.user
        )
        return JsonResponse({'message': 'Item added', 'item_id': item.id})
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

@csrf_exempt
def add_to_cart(request, item_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    item = get_object_or_404(Item, id=item_id)

    if item.seller == request.user:
        return JsonResponse({'error': 'You cannot add your own item to cart'}, status=400)

    if item.availability != 'IN_STOCK':
        return JsonResponse({'error': 'Item not available'}, status=400)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item = CartItem.objects.create(
        cart=cart,
        item=item,
        price_added=item.price,
        status_added=item.availability
    )
    return JsonResponse({'message': 'Item added to cart', 'cart_item_id': cart_item.id})


@csrf_exempt
@login_required
def remove_from_cart(request, cart_item_id):
    cart_item = get_object_or_404(CartItem, id=cart_item_id)
    if cart_item.cart.user == request.user:
        cart_item.delete()
        return JsonResponse({'message': 'Item removed from cart'})
    return JsonResponse({'error': 'Not authorized'}, status=403)

@csrf_exempt
@login_required
def edit_item(request, item_id):
    item = get_object_or_404(Item, id=item_id)
    if item.seller == request.user:
        if request.method == 'POST':
            new_price = request.POST.get('price')
            item.price = new_price
            item.save()
            return JsonResponse({'message': 'Item price updated'})
        return JsonResponse({'error': 'Only POST method allowed for update'}, status=405)
    return JsonResponse({'error': 'Not authorized'}, status=403)

@login_required
def cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.cart_items.select_related('item').all()
    data = [{
        'cart_item_id': ci.id,
        'item_id': ci.item.id,
        'title': ci.item.title,
        'price': ci.price_added,
        'status': ci.status_added
    } for ci in cart_items]
    return JsonResponse({'cart_items': data})

@csrf_exempt
@login_required
def pay(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.cart_items.select_related('item').all()
    errors = []

    for cart_item in cart_items:
        item = Item.objects.get(id=cart_item.item.id)

        if item.availability != 'IN_STOCK':
            errors.append(f"The item '{item.title}' is no longer available.")
        elif item.price != cart_item.price_added:
            errors.append(f"The price of '{item.title}' has changed from ${cart_item.price_added} to ${item.price}.")
            cart_item.price_added = item.price
            cart_item.save()

    if errors:
        return JsonResponse({'errors': errors}, status=400)

    for cart_item in cart_items:
        item = Item.objects.get(id=cart_item.item.id)
        item.availability = 'PURCHASED'
        item.buyer = request.user
       # item.seller = request.user  # or set item.buyer if such field exists
        item.save()
        cart_item.delete()

    return JsonResponse({'message': 'Payment successful and items purchased'})

@csrf_exempt
@login_required
def edit_account(request):
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return JsonResponse({'message': 'Password changed successfully'})
        return JsonResponse({'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)
