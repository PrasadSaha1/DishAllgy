"""
# stuff to track
# number of recipes with and without allergen 
# for cuisine, we need the name of the recipe that has the allergen
for safe recipes, we need 
1. Name 
2. Description 
3. Image 
4. Website link 
5. Allergens not in recipe 
6. Cuisine vs dish 
7. Time searched

Main Logic 
1. Call the API for the general search, and save the ID of each recipe
2. Call the API for the search of recipes that avoid allergens. 
3. For each recipe in the general search, see if it matches up with the second search
4. If there's a match, call the API for that specific recipe and save the recipe's ID (maybe), name, image, website, and description (maybe) 
5. If not, ignore (ideally, for cuisines, call the API for the recipe name)
6. For dishes, return a list of recipes from step 4. For cuisines, also include names from step 5 (ideally)
7. Also return the amount of recipes searched

General Search Logic 
Enter in the recipe's name, allergens, or the cuisine name and allergens. 
Spell check the name of the recipe and cuisine 
Call the API with those parameters 
Maybe have a max

FDC API key: 7znVGQ3OKjVYXKOsRXNj9gW8UJRUh2DjhByaAdcK
Edaman API Key: 5120fd7e0b2de4515398f1b43c07f512

"""

import requests
import time

APP_ID = "da4e8e6f"
APP_KEY = "b3b3d146fc4c2a2564602204de38e3aa"

url = "https://api.edamam.com/api/recipes/v2"



def api_request(dish_or_cuisine, search, allergens):
    params = {"app_id": APP_ID, "app_key": APP_KEY, "type": "public", "from": 0, "to": 5, "health": allergens}

    if dish_or_cuisine == "cuisine":
        params["cuisineType"] = search
    elif dish_or_cuisine == "dish":
        params["q"] = search

    response = requests.get(url, params=params)
    data = response.json()

    for hit in data["hits"]:
        try:
            print(hit["recipe"]["label"])
            print(hit["recipe"]["source"])
            print(hit["recipe"]["images"]["REGULAR"]["url"])
            print()
        except:
            continue

dish_or_cuisine = "cuisine"
search = "Asian"
allergens = "egg-free"



api_request(dish_or_cuisine, search, allergens)

"""
API_KEY = "e62ee156c24c4163a735de874dd2b7e9"

def do_shit(dish_or_cuisine, search, allergens):
    search_url = "https://api.spoonacular.com/recipes/complexSearch"

    broad_search_params = {"apiKey": API_KEY, "number": 5}

    if dish_or_cuisine == "cuisine":
        broad_search_params["cuisine"] = search
    elif dish_or_cuisine == "dish":
        broad_search_params["query"] = search

    broad_search_results = requests.get(search_url, params=broad_search_params).json()

    if "results" not in broad_search_results:
        return
    
    broad_recipes = []
    for recipe in broad_search_results["results"]:
        recipe_id = recipe["id"]
        recipe_url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
        recipe_info = requests.get(recipe_url, params={"apiKey": API_KEY}).json()

        name = recipe_info["title"]
        image = recipe_info["image"]
        website_url = recipe_info["sourceUrl"]

        broad_recipes.append({"id": recipe_id, "name": name, "image": image, "website_url": website_url})

    # second part
    search_with_allergens_params = {"apiKey": API_KEY, "intolerances": ",".join(allergens), "number": 20}
    if dish_or_cuisine == "cuisine":
        search_with_allergens_params["cuisine"] = search
    elif dish_or_cuisine == "dish":
        search_with_allergens_params["query"] = search
    
    search_with_allergens_results = requests.get(search_url, params=search_with_allergens_params).json()

    recipes_without_allergen = []
    recipes_with_allergen = []
    recipe_without_allergen_ids = []

    for recipe in search_with_allergens_results["results"]:
        recipe_without_allergen_ids.append(recipe["id"])
        
        for recipe in broad_recipes:
            if recipe["id"] in recipe_without_allergen_ids:
                recipes_without_allergen.append(recipe)
            else:
                recipes_with_allergen.append(recipe)
    print(recipes_without_allergen)

allergens = ["fish"]

do_shit("dish", "Chocolate Cake", allergens)
"""