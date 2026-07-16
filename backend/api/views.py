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
from .scraping import check_dish, check_cuisine, check_ingredients, get_urls
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
from spellchecker import SpellChecker
from .models import SavedSearch, SavedRecipe


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
@permission_classes([AllowAny])  # anyone can access
def fetch_allergens_request(request):
    return Response({"allergens": constants.COMMON_ALLERGENS})

def check_url(args):
    url, allergens = args
    try:
        print(url, allergens)
        recipe = check_ingredients(url, allergens)
        return (url, *recipe)
    except Exception as e:
        return (url, "fail", None, None, str(e))

def sse_event(event: str, data: str):
    return f"event: {event}\ndata: {data}\n\n"

def spell_check(text):
    spell = SpellChecker()
    words = text.split()
    corrected_text = []

    for word in words:
        correct_word = spell.correction(word)
        if not correct_word:
            corrected_text.append(word)  # If no correction found, keep the original word
        else:
            corrected_text.append(spell.correction(word))

    final_text = " ".join(corrected_text)
    return final_text

def search_for_allergens_in_dish(request):
    dish = request.GET.get("dish")
    allergens = request.GET.get("allergens")
    try:
        max_recipes = int(request.GET.get("maxRecipes"))
    except (ValueError, TypeError):
        max_recipes = 999999

    dish = spell_check(dish)

    search_url = f"https://www.allrecipes.com/search?q={dish}"
    result = requests.get(search_url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    try:
        valid_recipes = [href for href in hrefs if href.startswith('https://www.allrecipes.com/recipe/')][:max_recipes]
    except Exception as e:
        valid_recipes = [href for href in hrefs if href.startswith('https://www.allrecipes.com/recipe/')]
   
    if not valid_recipes:
        def event_stream():
            yield "event: error\ndata: No recipes found\n\n"

        return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

    def event_stream():
        if not valid_recipes:
            yield sse_event("error", "No recipes found")
            return
        
        num_recipes = 0
        num_recipes_with_allergen = 0
        num_fails = 0

        urls_with_allergen = []
        urls_without_allergen = []
        print("Mbappe")
        with ThreadPoolExecutor(max_workers=8) as executor:
            for i, result in enumerate(executor.map(check_url, [(url, allergens) for url in valid_recipes])):
                # results.append(result)
                
                if result[1] == "fail":
                    num_fails += 1
                else:
                    num_recipes += 1

                if result[1] == "allergen":
                    num_recipes_with_allergen += 1
                    urls_with_allergen.append([result[0], result[2], result[3], result[4]])
                elif result[1] == "no allergen":
                    urls_without_allergen.append([result[0], result[2], result[3], result[4]])

                if i % 5 == 4 or i == len(valid_recipes) - 1 or True:
                    data = {
                        "num_total_recipes": len(valid_recipes),
                        "num_recipes": num_recipes,
                        "num_recipes_with_allergen": num_recipes_with_allergen,
                        "urls_without_allergen": urls_without_allergen,
                        "urls_with_allergen": urls_with_allergen,
                        "num_fails": num_fails,
                    }
                    # SSE format: "data: <json>\n\n"
                    yield f"data: {json.dumps(data)}\n\n"
                
                if i == len(valid_recipes) - 1:
                    yield "event: done\ndata: {}\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
 
def search_for_allergens_in_cuisine(request):
    cuisine = request.GET.get("cuisine")
    allergens = request.GET.get("allergens")
    try:
        max_recipes = int(request.GET.get("maxRecipes"))
    except (ValueError, TypeError):
        max_recipes = 999999

    cuisine = spell_check(cuisine)

    cuisine_search_url = "https://www.allrecipes.com/cuisine-a-z-6740455"
    result = requests.get(cuisine_search_url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    cuisine_url = None

    for href in hrefs:
        if re.search(rf'\b{re.escape(cuisine)}\b', href, re.IGNORECASE) :
            cuisine_url = href
            dish_hrefs = get_urls(cuisine_url)
            try:
                valid_recipes = dish_hrefs[:max_recipes]
            except Exception as e:
                valid_recipes = dish_hrefs
            break
    else:
        search_url = f"https://www.allrecipes.com/search?q={cuisine}"
        result = requests.get(search_url)
        doc = BeautifulSoup(result.text, "html.parser")

        hrefs = [a['href'] for a in doc.find_all('a', href=True)]
        try:
            valid_recipes = [href for href in hrefs if href.startswith('https://www.allrecipes.com/recipe/')][:max_recipes]
        except Exception as e:
            valid_recipes = [href for href in hrefs if href.startswith('https://www.allrecipes.com/recipe/')]

    if not valid_recipes:
        def event_stream():
            yield "event: error\ndata: No recipes found\n\n"

        return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

    def event_stream():
        num_recipes = 0
        num_recipes_with_allergen = 0
        num_fails = 0

        urls_with_allergen = []
        urls_without_allergen = []

        with ThreadPoolExecutor(max_workers=8) as executor:
            for i, result in enumerate(executor.map(check_url, [(url, allergens) for url in valid_recipes])):                
                if result[1] == "fail":
                    num_fails += 1
                else:
                    num_recipes += 1

                if result[1] == "allergen":
                    num_recipes_with_allergen += 1
                    urls_with_allergen.append([result[0], result[2], result[3], result[4]])
                elif result[1] == "no allergen":
                    urls_without_allergen.append([result[0], result[2], result[3], result[4]])

                data = {
                    "num_recipes": num_recipes,
                    "num_total_recipes": len(valid_recipes),
                    "num_recipes_with_allergen": num_recipes_with_allergen,
                    "urls_without_allergen": urls_without_allergen,
                    "urls_with_allergen": urls_with_allergen,
                    "num_fails": num_fails,
                }
                # SSE format: "data: <json>\n\n"
                yield f"data: {json.dumps(data)}\n\n"
                
                if i == len(valid_recipes) - 1:
                    yield "event: done\ndata: {}\n\n"


    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_search(request):
    type = request.data.get("type")
    element = request.data.get("element")
    allergens = request.data.get("allergens")
    num_recipes = request.data.get("num_recipes")
    num_recipes_with_allergen = request.data.get("num_recipes_with_allergen")
    recipe_urls = request.data.get("recipe_urls")

    try:
        SavedSearch.objects.create(
            user=request.user,
            type=type,
            element=element,
            allergens=allergens,
            num_recipes=num_recipes,
            num_recipes_with_allergen=num_recipes_with_allergen,
            recipe_urls=recipe_urls
        )
    except Exception as e:
        pass

    # Logic to save the search for the user
    return Response({'detail': 'Search saved successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_searches(request):
    saved_searches = SavedSearch.objects.filter(user=request.user)
    
    data = []
    for search in saved_searches:
        data.append({
            "id": search.id,
            "type": search.type,
            "element": search.element,
            "allergens": search.allergens,
            "num_recipes": search.num_recipes,
            "num_recipes_with_allergen": search.num_recipes_with_allergen,
            "recipe_urls": search.recipe_urls,
            "created_at": search.created_at.isoformat(),
            "is_favorite": search.is_favorite,
        })
    
    return Response({"saved_searches": data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_recipe(request):
    recipe_name = request.data.get("recipe_name")
    recipe_url = request.data.get("recipe_url")
    recipe_image = request.data.get("recipe_image")
    recipe_description = request.data.get("recipe_description")
    
    element_name = request.data.get("element_name")
    element_type = request.data.get("element_type")
    allergens = request.data.get("allergens")

    SavedRecipe.objects.create(
        user=request.user,
        recipe_name=recipe_name,
        recipe_url=recipe_url,
        recipe_image=recipe_image,
        recipe_description=recipe_description,
        element_name=element_name,
        element_type=element_type,
        allergens=allergens
    )

    return Response({'detail': 'Recipe saved successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])  # anyone can call this, but if no logged in, an error will display
def get_saved_recipes(request):
    if not request.user.is_authenticated:
        print("hello")
        return Response({"saved_recipes": []})
    
    saved_recipes = SavedRecipe.objects.filter(user=request.user)
    
    data = []
    for recipe in saved_recipes:
        data.append({
            "id": recipe.id,
            "type": recipe.element_type,
            "element_name": recipe.element_name,
            "allergens": recipe.allergens,
            "name": recipe.recipe_name,
            "image": recipe.recipe_image,
            "url": recipe.recipe_url,
            "description": recipe.recipe_description,
            "created_at": recipe.created_at.isoformat(),
            "is_favorite": recipe.is_favorite,
        })
    
    return Response({"saved_recipes": data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_saved_recipe_or_search(request):
    object_id = request.data.get("objectID")
    object_type = request.data.get("objectType")

    if object_type == "recipe":
        SavedRecipe.objects.filter(id=object_id).delete()
    elif object_type == "search":
        SavedSearch.objects.filter(id=object_id).delete()

    return Response({"success": True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def favorite_recipe_or_search(request):
    object_id = request.data.get("objectID")
    object_type = request.data.get("objectType")

    if object_type == "recipe":
        obj = SavedRecipe.objects.get(id=object_id, user=request.user)
    elif object_type == "search":
        obj = SavedSearch.objects.get(id=object_id, user=request.user)

    obj.is_favorite = not obj.is_favorite
    obj.save()

    return Response({"success": True})