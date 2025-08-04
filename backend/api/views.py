from django.core.mail import send_mail
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import authenticate
import re
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import constants
from .scraping import check_dish, check_cuisine, check_ingredients, get_urls, check_ingredients_async
import requests
from bs4 import BeautifulSoup
from django.http import StreamingHttpResponse
from django.core.cache import cache
import random 
import json
import asyncio
import time
import uuid
from api.allergen_worker import check_url  # This module has no Django imports
from concurrent.futures import ThreadPoolExecutor



class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "id": user.id,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_username(request):
    email = request.data.get('email')
    # user = User.objects.get(username=username)
    users = User.objects.filter(email=email)

    if not users.exists():
        return Response({"error": "No users found with that email"}, status=404)

    usernames = [user.username for user in users]
    message = f"The username(s) associated with your email are:\n\n" + "\n".join(usernames)
    subject = "Your Username(s)"
    recipient = email

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )

    return Response({"success": "Email sent to user"})

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    username = request.data.get('username')

    try:
        user = User.objects.get(username=username)
        email = user.email
        if not email:
            return Response({"error": "No email associated with that username"}, status=400)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = f"{settings.FRONTEND_URL}/reset_password/{uid}/{token}"

    subject = "Password Reset Request"
    message = f"Hi {user.username},\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you didn’t request this, you can ignore this email."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return Response({"success": "Reset link sent to email"})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    from django.utils.http import urlsafe_base64_decode
    uidb64 = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Invalid link"}, status=400)

    if default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({"success": "Password has been reset successfully"})
    else:
        return Response({"error": "Invalid or expired token"}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    user.delete()
    return Response({'detail': 'Account deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_username(request):
    new_username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=request.user.username, password=password)
    if user is None:
        return Response({'detail': 'Invalid password'}, status=401)
    elif User.objects.filter(username=new_username).exists():
        return Response({'detail': 'Username already taken'}, status=409)
    elif len(new_username) < 8:
        return Response({'detail': 'Username is too short'}, status=400)
    else:
        request.user.username = new_username
        request.user.save()
        return Response({'detail': 'Username changed successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    user = authenticate(username=request.user.username, password=old_password)
    if user is None:
        return Response({'detail': 'Invalid password'}, status=401)
    elif len(new_password) < 8:
        return Response({'detail': 'New password must be at least 8 characters long'}, status=400)
    elif new_password != confirm_password:    
        return Response({'detail': 'New passwords do not match'}, status=409)
    else:
        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Password changed successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_email(request):
    email = request.data.get('email')

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        return Response({"error": "Invalid email format"}, status=401)
    else:
        request.user.email = email
        request.user.save()
        return Response({'detail': 'Email changed successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=request.user.username, password=password)

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        return Response({"error": "Invalid email format"}, status=401)
    elif user is None:
        return Response({'detail': 'Invalid password'}, status=400)
    else:
        request.user.email = email
        request.user.save()
        return Response({'detail': 'Email changed successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def contact_us(request):
    email = request.data.get("email")
    subject = request.data.get("subject")
    message = request.data.get("message")
    
    final_message = f"Username: {request.user.username}\nEmail: {email} \nmessage: {message}"

    send_mail(
        subject,
        final_message,
        settings.DEFAULT_FROM_EMAIL,
        [settings.DEFAULT_FROM_EMAIL],
        fail_silently=False,
    )

    return Response({'detail': 'Message sent'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_allergens_request(request):
    return Response({"allergens": constants.COMMON_ALLERGENS})

def sse_view(request):
    request_id = request.GET.get("request_id")

    def event_stream():
        while True:
            data = cache.get(request_id)
            if data and data.get("status") != "started":
                yield f"data: {json.dumps(data)}\n\n"
                break
            time.sleep(1)

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')



def check_url(args):
    url, allergens = args
    try:
        recipe = check_ingredients(url, allergens)
        return (url, *recipe)
    except Exception as e:
        return (url, "fail", None, None, str(e))


"""
no mutliprocessing at all
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_for_allergens_in_dish(request):
    dish = request.data.get("dish")
    allergens = request.data.get("allergens")

    time1 = time.perf_counter()
    url = f"https://www.allrecipes.com/search?q={dish}"

    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    valid_recipes = []

    for href in hrefs:
        if href[0:34] == 'https://www.allrecipes.com/recipe/':
            valid_recipes.append(href)

    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0

    urls_with_allergen = []
    urls_without_allergen = []

    for url in valid_recipes:
        recipe = check_ingredients(url, allergens)
        if recipe[0] == "fail":
            num_fails += 1
        else:
            num_recipes += 1
        
        if recipe[0] == "allergen": 
            num_recipes_with_allergen += 1
            urls_with_allergen.append([url, recipe[1], recipe[2], recipe[3]])
        elif recipe[0] == "no allergen":
            urls_without_allergen.append([url, recipe[1], recipe[2], recipe[3]])
    print(time.perf_counter() - time1)

    return Response({"num_recipes": num_recipes, "num_recipes_with_allergen": num_recipes_with_allergen, "urls_without_allergen": urls_without_allergen})
"""


# threads 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_for_allergens_in_dish(request):
    dish = request.data.get("dish")
    allergens = request.data.get("allergens")

    time1 = time.perf_counter()
    search_url = f"https://www.allrecipes.com/search?q={dish}"
    result = requests.get(search_url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    valid_recipes = [href for href in hrefs if href.startswith('https://www.allrecipes.com/recipe/')]

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(check_url, [(url, allergens) for url in valid_recipes]))


    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0

    urls_with_allergen = []
    urls_without_allergen = []

    for res in results:
        url, status, name, ingredients, instructions = res

        if status == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if status == "allergen":
            num_recipes_with_allergen += 1
            urls_with_allergen.append([url, name, ingredients, instructions])
        elif status == "no allergen":
            urls_without_allergen.append([url, name, ingredients, instructions])

    print(time.perf_counter() - time1)
    return Response({
        "num_recipes": num_recipes,
        "num_recipes_with_allergen": num_recipes_with_allergen,
        "urls_without_allergen": urls_without_allergen,
        "urls_with_allergen": urls_with_allergen,
        "num_fails": num_fails,
    })


"""
# asynico 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_for_allergens_in_dish(request):
    dish = request.data.get("dish")
    allergens = request.data.get("allergens")
    time1 = time.perf_counter()

    # Scrape search results with normal requests
    search_url = f"https://www.allrecipes.com/search?q={dish}"
    result = requests.get(search_url)
    doc = BeautifulSoup(result.text, "html.parser")

    valid_recipes = [
        a['href'] for a in doc.find_all('a', href=True)
        if a['href'].startswith('https://www.allrecipes.com/recipe/')
    ]
    valid_recipes = list(set(valid_recipes))

    # Run async scraping
    async def run_allergen_checks():
        async with ClientSession() as session:
            tasks = [
                check_ingredients_async(session, url, allergens)
                for url in valid_recipes
            ]
            return await asyncio.gather(*tasks)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    results = loop.run_until_complete(run_allergen_checks())

    # Process results
    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0
    urls_with_allergen = []
    urls_without_allergen = []

    for i, recipe in enumerate(results):
        url = valid_recipes[i]
        status, name, ingredients, instructions = recipe

        if status == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if status == "allergen":
            num_recipes_with_allergen += 1
            urls_with_allergen.append([url, name, ingredients, instructions])
        elif status == "no allergen":
            urls_without_allergen.append([url, name, ingredients, instructions])
    print(time.perf_counter() - time1)

    return Response({
        "num_recipes": num_recipes,
        "num_recipes_with_allergen": num_recipes_with_allergen,
        "urls_without_allergen": urls_without_allergen,
        "urls_with_allergen": urls_with_allergen,
        "num_fails": num_fails,
    })
"""
     
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_for_allergens_in_cuisine(request):
    cuisine = request.data.get("cuisine")
    allergens = request.data.get("allergens")
    # num_recipes, num_recipes_with_allergen, urls_without_allergen, urls_with_allergen = check_cuisine(cuisine, allergens)

    time1 = time.perf_counter()
    cuisine_search_url = "https://www.allrecipes.com/cuisine-a-z-6740455"
    result = requests.get(cuisine_search_url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    cuisine_url = None

    for href in hrefs:
        if re.search(rf'\b{re.escape(cuisine)}\b', href, re.IGNORECASE):
            cuisine_url = href
            break
    else:
        print("we got an error with the cuisine and are bond to get 15 thousand errors in the future")

    dish_hrefs = get_urls(cuisine_url)

    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0

    urls_with_allergen = []
    urls_without_allergen = []

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(check_url, [(url, allergens) for url in dish_hrefs]))



    for res in results:
        url, status, name, ingredients, instructions = res

        if status == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if status == "allergen":
            num_recipes_with_allergen += 1
            urls_with_allergen.append([url, name, ingredients, instructions])
        elif status == "no allergen":
            urls_without_allergen.append([url, name, ingredients, instructions])

    """
    for url in dish_hrefs:
        recipe = check_ingredients(url, allergens)
        if recipe[0] == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if recipe[0] == "allergen": 
            num_recipes_with_allergen += 1
            urls_with_allergen.append([url, recipe[1], recipe[2], recipe[3]])
        elif recipe[0] == "no allergen":
            urls_without_allergen.append([url, recipe[1], recipe[2], recipe[3]])
    """

    print(time.perf_counter() - time1)

    return Response({"num_recipes": num_recipes, "num_recipes_with_allergen": num_recipes_with_allergen, "urls_without_allergen": urls_without_allergen, "urls_with_allergen": urls_with_allergen})



