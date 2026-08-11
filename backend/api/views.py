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
from .models import SavedSearch, SavedRecipe
from .spoonacular import api_request
from .helper_functions import spell_check

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

@api_view(['POST'])
@permission_classes([AllowAny])  # anyone can access
def search_for_recipes(request):
    type = request.data.get("type")  # dish or cuisine
    query = request.data.get("query")
    raw_allergens = request.data.get("allergens")

    query = spell_check(query)

    allergen_free_recipes, recipe_names_containing_allergen, percent_safe_recipes = api_request(type, query, raw_allergens)
    return Response({"recipes": allergen_free_recipes, "recipes_containing_allergen": recipe_names_containing_allergen, "percent_safe_recipes": percent_safe_recipes})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_search(request):
    type = request.data.get("type")
    element = request.data.get("element")
    allergens = request.data.get("allergens")
    num_recipes = request.data.get("num_recipes")
    recipe_urls = request.data.get("recipe_urls")
    percent_safe_recipes = request.data.get("percent_safe_recipes")
    unsafe_recipes = request.data.get("unsafe_recipes")

    try:
        SavedSearch.objects.create(
            user=request.user,
            type=type,
            element=element,
            allergens=allergens,
            num_recipes=num_recipes,
            recipe_urls=recipe_urls,
            percent_safe_recipes=percent_safe_recipes,
            unsafe_recipes=unsafe_recipes,
        )
    except Exception as e:
        print(e)
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
            "percent_safe_recipes": search.percent_safe_recipes,
            "unsafe_recipes": search.unsafe_recipes,
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
    
    element_name = request.data.get("element_name")
    element_type = request.data.get("element_type")
    allergens = request.data.get("allergens")

    SavedRecipe.objects.create(
        user=request.user,
        recipe_name=recipe_name,
        recipe_url=recipe_url,
        recipe_image=recipe_image,
        element_name=element_name,
        element_type=element_type,
        allergens=allergens
    )

    return Response({'detail': 'Recipe saved successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])  # anyone can call this, but if no logged in, an error will display
def get_saved_recipes(request):
    if not request.user.is_authenticated:
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