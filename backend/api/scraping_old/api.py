import requests

def get_popular_recipe_titles(cuisine, number, api_key="03d0947b137e4ba782fc77bd985e7645"):
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "cuisine": cuisine,
        "sort": "popularity",
        "number": number,
        "apiKey": api_key
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.text}")
        return []

    data = response.json()

    titles = [item["title"] for item in data.get("results", [])]
    return titles

foods = get_popular_recipe_titles("French", 15)
for food in foods:
    print(food)