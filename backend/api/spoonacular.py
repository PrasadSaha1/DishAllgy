import requests
from urllib.parse import urlparse

def get_website_name(url):
    domain = urlparse(url).netloc
    return domain.replace("www.", "").split(".")[0].capitalize()


API_KEY = "03d0947b137e4ba782fc77bd985e7645"

url = "https://api.spoonacular.com/recipes/complexSearch"

def api_request(dish_or_cuisine, search, allergens):
    params = [("apiKey", API_KEY), ("intolerances", ",".join(allergens)), ("number", 100), ("addRecipeInformation", True)]

    recipes = []

    if dish_or_cuisine == "cuisine":
        params.append(("cuisine", search))
    elif dish_or_cuisine == "dish":
        params.append(("query", search))
 
    response = requests.get(url, params=params)
    data = response.json()

    try:
        data["results"]
    except KeyError as e:
        return []

    websites = []
    names = []
 
    for recipe in data["results"]:
        try:
            id = recipe["id"]
            name = recipe["title"]
            image = recipe["image"]
            website_url = recipe["sourceUrl"]
            description = recipe["summary"]

            names.append(name)

            # websites.append(get_website_name(website_url))
            recipes.append({"name": name, "website_url": website_url, "image_href": image, "id": id, "description": description})
        except Exception as e:
            print(e)
            pass
    # print(websites)
    print(names)
    
    # print(recipes)
    return recipes

# dish_or_cuisine = "cuisine"
# search = "Asian"
# allergens = "egg-free"

# api_request(dish_or_cuisine, search, allergens)
