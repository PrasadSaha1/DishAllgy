import Base from '../components/Base';
import { isAuthenticated } from '../components/checkAuth';
import { getUser } from '../components/getUser';
import { getAllergenInfo } from "../components/getAllergenInfo";
import  RecipeDisplay  from '../components/RecipeDisplay';
import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import "../styles/Home.css";
import api from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { all } from 'axios';
import { title, formatAllergens } from "../components/HelperFunctions";
import CuisineAutofill from "../components/CuisineAutofill";

const cuisines = [
  "African",
  "Asian",
  "American",
  "British",
  "Cajun",
  "Caribbean",
  "Chinese",
  "Eastern European",
  "European",
  "French",
  "German",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Japanese",
  "Jewish",
  "Korean",
  "Latin American",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Nordic",
  "Southern",
  "Spanish",
  "Thai",
  "Vietnamese"
];

const allergens = [
  "Dairy",
  "Egg",
  "Gluten",
  "Grain",
  "Peanut",
  "Seafood",
  "Sesame",
  "Shellfish",
  "Soy",
  "Sulfite",
  "Tree Nut",
  "Wheat"
]


function AllergenList({ allergens, selectedAllergens, onAllergenChange }) {
  return (
    <div>
      {allergens.map((allergen) => (
        <label key={allergen} className="allergen-label" style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            checked={selectedAllergens.includes(allergen)}
            onChange={() => onAllergenChange(allergen)}
          />
          {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
        </label>
      ))}
    </div>
  );
}

function DishSearch(){
  return (
    <input
    className="form-control mt-3"
    name="dish"
    placeholder="Type in a dish"
    style={{ width: "50%", margin: "auto"}}
    required
/>
  )
}

function RecipesWithAllergensDisplay({ recipeNames = [] }) {
  return (
    <div className="recipe-with-allergens-grid">
      {recipeNames.map((recipe, index) => (
        <span
          key={index}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            textAlign: "center"
          }}
        >
          {recipe.replace(/Recipe/i, "").trim()}
        </span>
      ))}
    </div>
  );
}

function SaveSearchDisplay({ isLoggedIn, saveSearch, setSearchSaved, type, searchSaved }) {
      if (isLoggedIn) {
        if (searchSaved === true) {
          return (
          <div>
            <h3>Search Saved!</h3>
          </div>
          )
        } else if (searchSaved === "loading") {
          return (
            <div>
              <h3>Saving Search...</h3>
            </div>
          )
        } else {
          return (
          <div>
            <button className="btn btn-success" type="button" onClick={() => saveSearch(type, setSearchSaved)} >Save Search</button>
          </div>
          )
        }
      } else {
      return (
      <div style={{marginTop: "20px"}}>
        <h4>Create an account to save results!</h4>
        <Link to="/register" className="btn btn-primary btn-md type-button">
          Create Account
        </Link>

        <Link to="/login" className="btn btn-primary btn-md type-button">
          Login
        </Link>
      </div>
      )
    }
}




export default function Home() {
    const [recipeSearchResult, setRecipeSearchResult] = useState(null);
    const [cuisineSearchResult, setCuisineSearchResult] = useState(null);
    const [activeForm, setActiveForm] = useState("dish");
    const [selectedAllergens, setSelectedAllergens] = useState([]); 

    const [dishChecked, setDishChecked] = useState(null);
    const [allergensChecked, setAllergensChecked] = useState(null);
    const [numRecipes, setNumRecipes] = useState(null);
    const [recipeUrls, setRecipeUrls] = useState(null);

    const [dishError, setDishError] = useState(null);
    const [cuisineError, setCuisineError] = useState(null);

    const [cuisineChecked, setCuisineChecked] = useState(null);
    const [allergensChecked_Cuisine, setAllergensChecked_Cuisine] = useState(null);
    const [numRecipes_Cuisine, setNumRecipes_Cuisine] = useState(null);
    const [numRecipesWithAllergen_Cuisine, setNumRecipesWithAllergen_Cuisine] = useState(null);
    const [recipesWithAllergen_Cuisine, setRecipesWithAllergen_Cuisine] = useState([]);
    const [recipeUrls_Cuisine, setRecipeUrls_Cuisine] = useState(null);
    const [inRecipeSearch, setInRecipeSearch] = useState(false);
    const [inCuisineSearch, setInCuisineSearch] = useState(false);

    const [search, setSearch] = useState("");
    const [searchSaved_Dish, setSearchSaved_Dish] = useState(false);
    const [searchSaved_Cuisine, setSearchSaved_Cuisine] = useState(false);
    const [savedRecipesURLs, setSavedRecipesURLs] = useState([]);
    const [loadingRecipesUrls, setLoadingRecipesUrls] = useState([])

    const [percentSafeRecipes, setPercentSafeRecipes] = useState(null);
    const [percentSafeRecipes_Cuisine, setPercentSafeRecipes_Cuisine] = useState(null);
    const [showUnsafeRecipes_Cuisine, setShowUnsafeRecipes_Cuisine] = useState(null)

    const getSavedRecipes = async () => {
      var recipeURLs = [];
      if (isAuthenticated()){
        const res = await api.get(
          `${import.meta.env.VITE_API_URL}/api/get_saved_recipes/`
        );
              res.data.saved_recipes.forEach(recipe => {
          recipeURLs.push(recipe.url)
        });
      setSavedRecipesURLs(recipeURLs);
      }


    };

    const handleAllergenChange = (allergen) => {
      setSelectedAllergens((prev) =>
        prev.includes(allergen)
          ? prev.filter((a) => a !== allergen) // Remove if already selected
          : [...prev, allergen] // Add if not selected
      );
    };

    useEffect(() => {
        getSavedRecipes();
        document.title = "DishAllgy";
    }, []);
 

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    var dishToSend = formData.get('dish');
    var allergensToSend = selectedAllergens;

    if (!/^[a-zA-Z0-9 ]+$/.test(dishToSend)) {
      toast.error("No special symbols allowed!")
      return;
    }

    try {
        setInRecipeSearch(true)
        setDishError("")
        setSearchSaved_Dish(false)
        const res = await api.post(`${import.meta.env.VITE_API_URL}/api/search_for_recipes/`, {
            type: "dish",
            query: dishToSend,
            allergens: allergensToSend,
        });      

        setAllergensChecked(allergensToSend)
        setDishChecked(dishToSend)
        setRecipeSearchResult(true)
        setInRecipeSearch(false)

        if (res.data.recipes.length === 0){
          setDishError("No results found. Input may be invalid, or no recipes avoid your allergens")
          setRecipeUrls("")
          setNumRecipes("")
          return;
        }

        setRecipeUrls(res.data.recipes)
        setNumRecipes(res.data.recipes.length)
        setPercentSafeRecipes(res.data.percent_safe_recipes)
                
    } catch (err) {
      console.error(err);
      toast.error("Search unsuccessful!")
    }
  };

  const handleCuisineSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    var cuisineToSend = formData.get('cuisine');
    var allergensToSend = selectedAllergens;

    if (!cuisines.some(c => c.toLowerCase() === cuisineToSend.toLowerCase())) {
      toast.error("Invalid cuisine");
          return;
        }

    try {
        setInCuisineSearch(true)
        setCuisineError("")
        setSearchSaved_Cuisine(false)
        const res = await api.post(`${import.meta.env.VITE_API_URL}/api/search_for_recipes/`, {
            type: "cuisine",
            query: cuisineToSend,
            allergens: allergensToSend,
        });      

        setCuisineSearchResult(true)
        setInCuisineSearch(false)
        setAllergensChecked_Cuisine(allergensToSend)
        setCuisineChecked(cuisineToSend)

        if (res.data.recipes.length === 0){
          setCuisineError("No results found. Input may be invalid, or no recipes avoid your allergens")
          return;
        }

        setRecipeUrls_Cuisine(res.data.recipes)
        setNumRecipes_Cuisine(res.data.recipes.length)
        setPercentSafeRecipes_Cuisine(res.data.percent_safe_recipes)
        setRecipesWithAllergen_Cuisine(res.data.recipes_containing_allergen)
                
    } catch (err) {
      console.error(err);
      toast.error("Search unsuccessful!")
    }
  };


    const saveSearch = async (type, setObjectSaved) => {
      let elementChecked, allergens, numRecipesSend, recipeUrlsSend, percentSafeRecipesSend, unsafeRecipesSend;

      if (type === "dish") {
        elementChecked = dishChecked;
        allergens = allergensChecked;
        numRecipesSend = numRecipes;
        recipeUrlsSend = recipeUrls;
        percentSafeRecipesSend = percentSafeRecipes;
        unsafeRecipesSend = [];
      } else {
        elementChecked = cuisineChecked;
        allergens = allergensChecked_Cuisine;
        numRecipesSend = numRecipes_Cuisine;
        recipeUrlsSend = recipeUrls_Cuisine;
        percentSafeRecipesSend = percentSafeRecipes_Cuisine;
        unsafeRecipesSend = recipesWithAllergen_Cuisine;
        
      }
      setObjectSaved("loading");

      try {
        const res = await api.post(`${import.meta.env.VITE_API_URL}/api/save_search/`, {
          type: type,
          element: elementChecked,                     
          allergens: allergens,                     
          num_recipes: numRecipesSend,
          recipe_urls: recipeUrlsSend,
          percent_safe_recipes: percentSafeRecipesSend,
          unsafe_recipes: unsafeRecipesSend,
        });
        setObjectSaved(true);
        toast.success("Search saved successfully!");
      } catch (err) {
        console.error("Error saving search:", err);
        toast.error("Error saving search!");
      }
    };

    const saveRecipe = async (link, image, name, type, setRecipeSaved) => {
      if (type === "dish") {
        var allergensToSend = allergensChecked;
        var search = dishChecked;
      } else {
        var allergensToSend = allergensChecked_Cuisine;
        var search = cuisineChecked;
      }

        setLoadingRecipesUrls(prev => [  
          ...prev,
          link
        ]);

      const res = await api.post(`${import.meta.env.VITE_API_URL}/api/save_recipe/`, {
        recipe_name: name,
        recipe_url: link,
        recipe_image: image,
        element_type: type,
        allergens: allergensToSend,
        element_name: search,
        });
        toast.success("Recipe saved successfully!");
        setRecipeSaved(true); 

        // adding to the react state - can't just push
        setSavedRecipesURLs(prev => [  
          ...prev,
          link
        ]);

        // remove from loading 
        setLoadingRecipesUrls(prev =>
          prev.filter(url => url !== link)
        );
    }

  const toggleForm = (type) => {
    setActiveForm(type);
  }

  return (
    <Base>
      <div className="text-center">
        <h1>DishAllgy</h1>
        <h4>Find recipes for a certain dish or cuisine that avoid your allergens (test)</h4>
        <h6>Note: please verify all recipes before using them</h6>

        <div className="search-container">
          <div className="type-button-container">
            <button className="type-button btn btn-primary" onClick={() => toggleForm('dish')}>Dish</button>
            <button className="type-button btn btn-primary" onClick={() => toggleForm('cuisine')}>Cuisine</button>
          </div>

          {activeForm === "dish" && (
            <form id="recipeForm" onSubmit={handleRecipeSubmit}>
              <h2>Find safe recipes for a dish</h2>
              <h6>Specify your allergens and type in the dish</h6>

            <AllergenList
              allergens={allergens}
              selectedAllergens={selectedAllergens}
              onAllergenChange={handleAllergenChange}
            />
            
<div className="input-container">
    <DishSearch />

    <span className="help-icon">
        ?
        <span className="tooltip">
            To get better results, try to keep searches broad, and avoid special symbols.
        </span>
    </span>
</div>
              <button className="form-submit btn btn-success mt-2" type="submit">
                  Submit
              </button>

              {inRecipeSearch && (
                  <div>
                    <h2>Loading...</h2>
                  </div>
              )}

              {recipeSearchResult && !inRecipeSearch && (
              <div className="mt-4">
                <h3>Search Results:</h3>
                <h5>Dish checked: {dishChecked}</h5>
                <h5>Allergens: {formatAllergens(allergensChecked)}</h5>

                {numRecipes && (
                  <div>
                    <h6>Number of Recipes Found: {numRecipes}</h6>
                    <h6>Percent of Safe Recipes: {percentSafeRecipes}%</h6>
                    <SaveSearchDisplay isLoggedIn={isAuthenticated()} saveSearch={saveSearch} type={"dish"} searchSaved={searchSaved_Dish} setSearchSaved={setSearchSaved_Dish}/>


                    <h4 style={{ marginTop: "50px" }}>
                      Here are some recipes that don't contain your allergens
                    </h4>
                    <RecipeDisplay
                      recipeUrls={recipeUrls}
                      isLoggedIn={isAuthenticated()}
                      saveRecipe={saveRecipe}
                      type="dish"
                      savedRecipesURLs={savedRecipesURLs}
                      loadingRecipesUrls={loadingRecipesUrls}
                    />
                  </div>
                )}

                {dishError && (
                  <div>
                    <h4 style={{ marginTop: "50px" }}>{dishError}</h4>
                  </div>
                )}
              </div>
              )}

            </form>
          )}

          {activeForm === "cuisine" && (
            <form id="cuisineForm" onSubmit={handleCuisineSubmit}>
              <h2>Find safe recipes for a cuisine</h2>
              <h6>Specify your allergens and type in the cuisine</h6>

            <AllergenList
              allergens={allergens}
              selectedAllergens={selectedAllergens}
              onAllergenChange={handleAllergenChange}
            />

            <div className="input-container">
              <CuisineAutofill
                className="form-control mt-3"
                name="cuisine"
                suggestions={cuisines}
                value={search}
                setValue={setSearch}
                placeholder="Type in a cuisine"
                style={{ width: "50%", margin: "auto"}}
                required
            />

                <span className="help-icon">
                    ?
                    <span className="tooltip">
                        For better results, keep searches broad and avoid special symbols.
                    </span>
                </span>
            </div>



              <button className="form-submit btn btn-success mt-2" type="submit">
                  Submit
              </button>

              {inCuisineSearch && (
                  <div>
                    <h2>Loading...</h2>
                  </div>
              )}


              {cuisineSearchResult && !inCuisineSearch && (
                <div className="mt-4">
                  <h3>Search Results:</h3>
                  <h5>Cuisine checked: {cuisineChecked}</h5>
                  <h5>Allergens: {formatAllergens(allergensChecked)}</h5>

                  {numRecipes_Cuisine && (
                    <div>
                      <h6>Number of Recipes Found: {numRecipes_Cuisine}</h6>
                      <h6>Percent of Safe Recipes: {percentSafeRecipes_Cuisine}%</h6>
                      <SaveSearchDisplay isLoggedIn={isAuthenticated()} saveSearch={saveSearch} type={"cuisine"} searchSaved={searchSaved_Cuisine} setSearchSaved={setSearchSaved_Cuisine}/>

                        <h4 style={{"marginTop": "50px"}}>You should avoid the following dishes from this cuisine as they may have your allergens</h4>
                        {showUnsafeRecipes_Cuisine ? (
                          <button style={{"marginBottom": "20px"}} className="btn btn-primary" type="button" onClick={() => setShowUnsafeRecipes_Cuisine(false)}>Hide Unsafe Recipes</button>
                        ) : (
                          <button style={{"marginBottom": "20px"}} className="btn btn-primary" type="button" onClick={() => setShowUnsafeRecipes_Cuisine(true)}>Show Unsafe Recipes</button>
                        )}
                        {showUnsafeRecipes_Cuisine && (
                          <RecipesWithAllergensDisplay recipeNames={recipesWithAllergen_Cuisine} />
                        )}
                        
                      <h4 style={{ marginTop: "50px" }}>
                        Here are some recipes that don't contain your allergens
                      </h4>

                      <RecipeDisplay
                        recipeUrls={recipeUrls_Cuisine}
                        isLoggedIn={isAuthenticated()}
                        saveRecipe={saveRecipe}
                        type="cuisine"
                        savedRecipesURLs={savedRecipesURLs}
                        loadingRecipesUrls={loadingRecipesUrls}
                      />
                    </div>
                  )}

                  {cuisineError && (
                    <div>
                      <h4 style={{ marginTop: "50px" }}>{cuisineError}</h4>
                    </div>
                  )}

                </div>
              )}

          </form>

            
          )}
        </div>



      </div>
    </Base>
  );
}
