from bs4 import BeautifulSoup
import requests
import json
import time
import re
from fuzzywuzzy import fuzz

common_allergens = {
    "nuts": [
        "almond", "peanut", "cashew", "walnut", "pecan", "pistachio",
        "hazelnut", "macadamia", "brazil nut", "pine nut", "chestnut",
        "nut butter", "almond butter", "peanut butter", "cashew butter",
        "almond flour", "hazelnut spread", "praline", "marzipan", "gianduja"
    ],
    "dairy": [
        "milk", "cheese", "butter", "cream", "yogurt", "whey", "casein",
        "ghee", "lactose", "curds"
    ],
    "gluten": [
        "wheat", "barley", "rye", "malt", "semolina", "spelt",
        "farro", "bulgur", "couscous", "graham", "triticale",
        "wheat flour", "durum", "einkorn"
    ],
    "soy": [
        "soy", "soybean", "soy sauce", "edamame", "tofu", "miso", "tempeh",
        "soy lecithin", "tamari"
    ],
    "eggs": [
        "egg", "egg white", "egg yolk", "albumin", "meringue", "mayonnaise"
    ],
    "fish": [
        "anchovy", "bass", "catfish", "cod", "flounder", "grouper", "haddock",
        "hake", "halibut", "herring", "mackerel", "perch", "pike", "pollock",
        "salmon", "sardine", "sole", "snapper", "trout", "tuna"
    ],
    "shellfish": [
        "shrimp", "prawn", "crab", "lobster", "scallop", "clam",
        "oyster", "mussel", "langoustine", "crawfish", "krill"
    ],
    "sesame": [
        "sesame", "tahini", "benne", "gingelly", "til"
    ],
    "mustard": [
        "mustard", "mustard seed", "mustard flour", "prepared mustard"
    ]
}

def check_ingredients(url, allergens):
    result = requests.get(url)

    keywords = []
    for allergen in common_allergens:
        if allergen in allergens:
            for word in common_allergens[allergen]:
                keywords.append(word)

    doc = BeautifulSoup(result.text, "html.parser")
    script_tag = doc.find("script", {"type": "application/ld+json"})

    json_data = json.loads(script_tag.string)
    # Step 5: If the JSON is a list, loop through to find the Recipe
    if isinstance(json_data, list):
        recipe_data = next((item for item in json_data if "Recipe" in item.get("@type", [])), None)
    else:
        recipe_data = json_data

    # Step 6: Extract the ingredients
    if recipe_data:
        ingredients = recipe_data.get("recipeIngredient", [])
        ingredients_text = " ".join(ingredients).lower()
        for keyword in keywords:
            if keyword in ingredients_text:
                return "allergen"
    else:
        return "fail"
    return "no allergen"

def check_recipes(urls, allergens):
    num_recipes = 0
    num_recipes_with_allergen = 0
    num_fails = 0

    """
    name, old_name = format_name(name, cuisine)
    if not unique:
        unique.append(name)
    else:
        # Check similarity with existing unique names
        similarities = [(u, fuzz.ratio(name, u)) for u in unique]
        
        # Find the most similar existing name
        most_similar, score = max(similarities, key=lambda x: x[1])
        
        if score < 80:
            unique.append(name)
            final_recipes.append(old_name)
    """

    good_recipes = []
    bad_recipes = []

    for url in urls:
        recipe = check_ingredients(url, allergens)
        if recipe[0] == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if recipe[0] == "allergen": 
            bad_recipes.append([recipe[1], url])
            num_recipes_with_allergen += 1
        else:
            good_recipes.append([recipe[1], url])

    print(f"Number of recipes checked successfully: {num_recipes}")
    print(f"Number of recipes with allergen: {num_recipes_with_allergen} ({round(num_recipes_with_allergen / num_recipes * 100)}%)")
    print(f"Number of recipes checked unsuccessfully: {num_fails}")

    print("You should probably avoid the following popular recipes (note that there may be duplicates): ")
    for recipe in bad_recipes:
        print(recipe[0])


def get_allergen():
    print("The allergens are: ")
    for allegren in common_allergens.keys():
        print(allegren)

    while True:
        try:
            allergen = input("What allegern are you looking for today? ")
            if allergen not in common_allergens.keys():
                raise KeyError
        except KeyError:
            print("That is not supported")
        else:
            return allergen

def get_urls(url):
    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    # Step 2: Find the <script> tag with JSON-LD
    script_tag = doc.find("script", {"type": "application/ld+json"})

    # Step 3: Load JSON from script tag
    json_data = json.loads(script_tag.string)

    # Step 4: Loop through items and collect URLs
    urls = []

    # json_data is a list
    for item in json_data:
        if isinstance(item, dict) and item.get("@type") and "ItemList" in item.get("@type"):
            for element in item.get("itemListElement", []):
                url = element.get("url")
                if url:
                    urls.append(url)

    return urls

def format_name(name, cuisine):
    old_name = name
    name = name.lower()
    keywords = ["recipe", "easy", "simple", "homemade", cuisine]  
    for word in keywords:
        name = name.replace(word, "") 
    name = re.sub(r'\(.*?\)', '', name)
    
    return [name.strip().title(), old_name]

def deduplicate_recipes(recipes, cuisine, threshold=80):
    for name in recipes:
        pass
    return 

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

    check_recipes(dish_hrefs, allergens)

