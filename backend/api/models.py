from django.db import models
from django.contrib.auth.models import User

class SavedSearch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_searches')
    created_at = models.DateTimeField(auto_now_add=True)  # timestamp

    type = models.CharField(max_length=50, default="recipe")  # e.g., 'recipe', 'cuisine'
    element = models.CharField(max_length=200)  
    allergens = models.JSONField(default=list)  
    num_recipes = models.IntegerField(default=0)  
    num_recipes_with_allergen = models.IntegerField(default=0)  
    recipe_urls = models.JSONField(default=list)  

class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_recipes')
    created_at = models.DateTimeField(auto_now_add=True)    
   
    recipe_name = models.CharField(max_length=255)
    recipe_url = models.URLField()
    recipe_image = models.URLField(blank=True, null=True)
    recipe_description = models.TextField(blank=True, null=True)
    
    element_name = models.CharField(max_length=200)  
    element_type = models.CharField(max_length=50)  
    allergens = models.JSONField(default=list)
