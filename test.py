from bs4 import BeautifulSoup
import requests
import json
import re
from backend.constants import COMMON_ALLERGENS

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

    all_placeholders = doc.find_all(class_='img-placeholder')

    if len(all_placeholders) > 1:
        img = all_placeholders[1]
        img_tag = img.find_next('img')
       # print(img_tag)
    
    try:
        img_href = img_tag["data-src"]
        # print(f"Real: {img_href}")
    except KeyError:
        try:
            img_href = img_tag["src"]
           # print(f"Fake: {img_href}")
        except KeyError:  
            img_href = ""
    print(img_href)

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

check_ingredients("https://www.allrecipes.com/cubano-from-chef-recipe-11927213", "fish")