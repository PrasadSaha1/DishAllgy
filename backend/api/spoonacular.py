import requests
from backend.settings import API_KEY 

url = "https://api.spoonacular.com/recipes/complexSearch"

def api_request(dish_or_cuisine, search, allergens):
    def search_allergen_free():
        params = [("apiKey", API_KEY), ("intolerances", ",".join(allergens)), ("number", 100), ("addRecipeInformation", True)]

        if dish_or_cuisine == "cuisine":
            params.append(("cuisine", search))
        elif dish_or_cuisine == "dish":
            params.append(("query", search))

        recipes = []
        response = requests.get(url, params=params)
        data = response.json()

        try:
            data["results"]
        except KeyError as e:
            return []
    
        for recipe in data["results"]:
            try:
                id = recipe["id"]
                name = recipe["title"]
                image = recipe["image"]
                website_url = recipe["sourceUrl"]
                description = recipe["summary"]

                recipes.append({"name": name, "website_url": website_url, "image_href": image, "id": id, "description": description})
            except Exception as e:
                print(e)
                pass

        return recipes

    def search_all():
        params = [("apiKey", API_KEY), ("number", 100)]  # don't add recipe information

        if dish_or_cuisine == "cuisine":
            params.append(("cuisine", search))
        elif dish_or_cuisine == "dish":
            params.append(("query", search))

        recipes = []
        response = requests.get(url, params=params)
        data = response.json()

        try:
            data["results"]
        except KeyError as e:
            return []
    
        for recipe in data["results"]:
            try:
                id = recipe["id"]
                name = recipe["title"]

                recipes.append({"name": name, "id": id})
            except Exception as e:
                print(e)
                pass

        return recipes

    
    allergen_free_recipes = search_allergen_free()
    allergen_free_recipe_ids = [recipe["id"] for recipe in allergen_free_recipes]
    all_recipes = search_all()
    recipe_names_containing_allergen = []

    num_safe_recipes = 0
    num_total_recipes = 0

    for recipe in all_recipes:
        num_total_recipes += 1
        if recipe["id"] in allergen_free_recipe_ids:
            num_safe_recipes += 1
        else:
            recipe_names_containing_allergen.append(recipe["name"])

    if num_total_recipes != 0:
        percent_safe_recipes = round(num_safe_recipes / num_total_recipes * 100, 1)
    else:
        percent_safe_recipes = 0.0
    return allergen_free_recipes, recipe_names_containing_allergen, percent_safe_recipes
