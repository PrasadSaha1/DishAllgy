from django.contrib import admin
from .models import SavedSearch, SavedRecipe

# Register the model so it shows up in the Django admin
admin.site.register(SavedSearch)
admin.site.register(SavedRecipe)
