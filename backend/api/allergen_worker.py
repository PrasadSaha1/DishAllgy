# allergen_worker.py
def check_url(args):
    from scraping import check_ingredients  # Import here to avoid circular imports
    url, allergens = args
    try:
        recipe = check_ingredients(url, allergens)
        return (url, *recipe)
    except Exception as e:
        return (url, "fail", None, None, str(e))
