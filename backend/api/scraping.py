from bs4 import BeautifulSoup
import requests
import json
import re
from constants import COMMON_ALLERGENS

def check_ingredients(url, allergens):
    result = requests.get(url)

    keywords = []
    for allergen in COMMON_ALLERGENS:
        if allergen in allergens:
            for word in COMMON_ALLERGENS[allergen]:
                keywords.append(word)

    doc = BeautifulSoup(result.text, "html.parser")

    title = doc.title.string
    description = doc.find("meta", attrs={"name": "description"})["content"]

   # img = doc.find(class_='img-placeholder')
     #img_tag = img.find_next('img')
    all_placeholders = doc.find_all(class_='img-placeholder')

    if len(all_placeholders) > 1:
        img = all_placeholders[2]
        img_tag = img.find_next('img')

    try:
        img_href = img_tag["data-src"]
        # print(f"Real: {img_href}")
    except KeyError:
        try:
            img_href = img_tag["src"]
            # print(f"Fake: {img_href}")
        except KeyError:  
            img_href = ""

    script_tag = doc.find("script", {"type": "application/ld+json"})

    json_data = json.loads(script_tag.string)
    if isinstance(json_data, list):
        recipe_data = next((item for item in json_data if "Recipe" in item.get("@type", [])), None)
    else:
        recipe_data = json_data

    if recipe_data:
        ingredients = recipe_data.get("recipeIngredient", [])
        ingredients_text = " ".join(ingredients).lower()
        for keyword in keywords:
            if keyword in ingredients_text:
                return ["allergen", img_href, title, description]
    else:
        return ["fail", img_href, title, description]
    return ["no allergen", img_href, title, description]

def check_recipes(urls, allergens):
    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0

    urls_with_allergen = []
    urls_without_allergen = []
    for url in urls:
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

    return [num_recipes, num_recipes_with_allergen, urls_without_allergen, urls_with_allergen]


def check_dish(dish, allergens):
    url = f"https://www.allrecipes.com/search?q={dish}"

    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    valid_recipes = []

    for href in hrefs:
        if href[0:34] == 'https://www.allrecipes.com/recipe/':
            valid_recipes.append(href)

    num_recipes, num_recipes_with_allergen, urls_without_allergen, urls_with_allergen = check_recipes(valid_recipes, allergens)

    return num_recipes, num_recipes_with_allergen, urls_without_allergen

def get_urls(url):
    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    script_tag = doc.find("script", {"type": "application/ld+json"})

    json_data = json.loads(script_tag.string)

    urls = []

    # json_data is a list
    for item in json_data:
        if isinstance(item, dict) and item.get("@type") and "ItemList" in item.get("@type"):
            for element in item.get("itemListElement", []):
                url = element.get("url")
                if url:
                    urls.append(url)

    return urls

def check_cuisine(cuisine, allergens):
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

    num_recipes, num_recipes_with_allergen, urls_without_allergen, urls_with_allergen = check_recipes(dish_hrefs, allergens)
    return num_recipes, num_recipes_with_allergen, urls_without_allergen, urls_with_allergen
