from django.urls import path
from .views import *

urlpatterns = [
    path('user_view/', user_view, name='user_view'),
    path('forgot_username/', forgot_username, name='forgot_username'),
    path('forgot_password/', forgot_password, name='forgot_password'),
    path("reset_password_confirm/", reset_password_confirm, name="reset_password_confirm"),
    path('delete_account/', delete_account, name='delete_account'),
    path('change_username/', change_username, name='change_username'),
    path('change_password/', change_password, name='change_password'),
    path('add_email/', add_email, name='add_email'),
    path('change_email/', change_email, name='change_email'),
    path('contact_us/', contact_us, name='contact_us'),
    path('fetch_allergens_request/', fetch_allergens_request, name='fetch_allergens_request'),
    path('search_for_allergens_in_dish/', search_for_allergens_in_dish, name='search_for_allergens_in_dish'),
    path('search_for_allergens_in_cuisine/', search_for_allergens_in_cuisine, name='search_for_allergens_in_cuisine'),
    path('save_search/', save_search, name='save_search'),
    path('get_saved_searches/', get_saved_searches, name='get_saved_searches'),
    path('save_recipe/', save_recipe, name='save_recipe'),
    path('get_saved_recipes/', get_saved_recipes, name='get_saved_recipes'),
]