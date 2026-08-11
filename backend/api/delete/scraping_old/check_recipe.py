from bs4 import BeautifulSoup
import requests
import json
import time

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

    urls_with_allergen = []
    urls_without_allergen = []

    for url in urls:
        recipe = check_ingredients(url, allergens)
        if recipe == "fail":
            num_fails += 1
        else:
            num_recipes += 1

        if recipe == "allergen": 
            num_recipes_with_allergen += 1
            urls_with_allergen.append(url)
        else:
            urls_without_allergen.append(url)

    return [num_recipes, num_recipes_with_allergen, urls_without_allergen]

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


def check_dish(dish, allergen):
    url = f"https://www.allrecipes.com/search?q={dish}"

    result = requests.get(url)
    doc = BeautifulSoup(result.text, "html.parser")

    hrefs = [a['href'] for a in doc.find_all('a', href=True)]
    valid_recipes = []

    for href in hrefs:
        if href[0:34] == 'https://www.allrecipes.com/recipe/':
            valid_recipes.append(href)

    a, b, c = check_recipes(valid_recipes, allergen)
    return a, b, c


"""
time1 = time.perf_counter()


urls = ["https://www.allrecipes.com/recipe/68129/dads-pad-thai/",
        "https://www.allrecipes.com/recipe/238876/spaghetti-squash-pad-thai/",
        "https://www.allrecipes.com/recipe/263384/spicy-shrimp-pad-thai/",
        "https://www.allrecipes.com/recipe/246110/zucchini-noodles-pad-thai/",
        "https://www.allrecipes.com/recipe/280886/classic-chicken-pad-thai/",
        "https://www.allrecipes.com/best-instant-ramen-taste-test-7370078"]


url = "https://www.simplyrecipes.com/recipes/homemade_pepperoni_pizza/"

result = requests.get(url)
doc = BeautifulSoup(result.text, "html.parser")

ingredients = doc.find_all(string="Ingredients")
parent = ingredients[0].parent.parent.parent

actual_ingredients = parent.find_all("p")

final_ingredients = []
for ingredient in actual_ingredients:
    try:    
        final_ingredients.append(ingredient.find_all("span")[-1].string)
    except IndexError: 
        pass
print(time.perf_counter() - time1)
"""