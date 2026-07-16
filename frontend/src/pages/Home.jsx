import Base from '../components/Base';
import { isAuthenticated } from '../components/checkAuth';
import { getUser } from '../components/getUser';
import { getAllergenInfo } from "../components/getAllergenInfo";
import  RecipeDisplay  from '../components/RecipeDisplay';
import { useState, useEffect, useRef } from 'react';
import "../styles/Home.css";
import api from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { all } from 'axios';
import { title, formatAllergens } from "../components/HelperFunctions";
import  CuisineAutofill  from "../components/CuisineAutofill";

const cuisines = [
  "Amish and Mennonite",
  "Argentinian",
  "Australian and New Zealander",
  "Austrian",
  "Bangladeshi",
  "Belgian",
  "Brazilian",
  "Cajun and Creole",
  "Canadian",
  "Chilean",
  "Chinese",
  "Colombian",
  "Cuban",
  "Danish",
  "Dutch",
  "Filipino",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Indian",
  "Indonesian",
  "Israeli",
  "Italian",
  "Jamaican",
  "Japanese",
  "Jewish",
  "Korean",
  "Lebanese",
  "Malaysian",
  "Norwegian",
  "Pakistani",
  "Persian",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Puerto Rican",
  "Russian",
  "Scandinavian",
  "Soul Food",
  "South African",
  "Southern Recipes",
  "Spanish",
  "Swedish",
  "Swiss",
  "Tex-Mex",
  "Thai",
  "Turkish",
  "Vietnamese"
];

function AccountButtons({isLoggedIn, name}){
    if (isLoggedIn) {
        return <div>
            <h2>Welcome {name}</h2>
        </div>
    } else {
        return <div>
            <h3>Create an account to get started</h3>
            <a href="/register">
                <button className="btn btn-primary btn-lg">Create Account</button>
            </a>

            <h3 style={{marginTop: "50px"}}>Or log into an existing account</h3>
            <a href="/login">
                <button className="btn btn-primary btn-lg">Login</button>
            </a>
        </div>
    }
}

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

function RecipesWithAllergensDisplay({ recipeNames = [] }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "200px" }}>
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
    </div>
  );
}

function StopSearchDisplay({ currentState, stopSearch, isLoggedIn, saveSearch, setSearchSaved, type, searchSaved }) {
  if (currentState) {
    return (
      <div>
        <button 
          className='btn btn-danger' 
          type="button" 
          onClick={stopSearch}
        >
          Stop search
        </button>
      </div>
    );
  } else {
      if (isLoggedIn) {
        console.log(searchSaved)
        if (searchSaved) {
          return (
          <div>
            <h3>Search Saved!</h3>
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
        <h3>Create an account to save results!</h3>
        <a href="/register" className="btn btn-primary btn-lg type-button">
          Create Account
        </a>

        <a href="/login" className="btn btn-primary btn-lg type-button">
          Login
        </a>
      </div>
      )
    }
  }
}




export default function Home() {
    const [username, setUsername] = useState("");

    const [allergens, setAllergens] = useState([])
    const [recipeSearchResult, setRecipeSearchResult] = useState(null);
    const [cuisineSearchResult, setCuisineSearchResult] = useState(null);
    const [activeForm, setActiveForm] = useState("dish");
    const [selectedAllergens, setSelectedAllergens] = useState([]); 

    const [dishChecked, setDishChecked] = useState(null);
    const [allergensChecked, setAllergensChecked] = useState(null);
    const [numTotalRecipes, setNumTotalRecipes] = useState(null);
    const [numRecipes, setNumRecipes] = useState(null);
    const [numRecipesWithAllergen, setNumRecipesWithAllergen] = useState(null);
    const [recipeUrls, setRecipeUrls] = useState(null);
    const [error, setError] = useState(null);
    const [inRecipeSearch, setInRecipeSearch] = useState(false);

    const [cuisineChecked, setCuisineChecked] = useState(null);
    const [allergensChecked2, setAllergensChecked2] = useState(null);
    const [numTotalRecipes2, setNumTotalRecipes2] = useState(null);
    const [numRecipes2, setNumRecipes2] = useState(null);
    const [numRecipesWithAllergen2, setNumRecipesWithAllergen2] = useState(null);
    const [recipesWithAllergen2, setRecipesWithAllergen2] = useState([]);
    const [recipeUrls2, setRecipeUrls2] = useState(null);
    const [inCuisineSearch, setInCuisineSearch] = useState(false);

    const recipeSourceRef = useRef(null);
    const cuisineSearchRef = useRef(null);
    const [search, setSearch] = useState("");
    const [searchSaved, setSearchSaved] = useState(false);
    const [savedRecipesURLs, setSavedRecipesURLs] = useState([]);

    const getSavedRecipes = async () => {
      var recipeURLs = [];
      if (isAuthenticated()){
        const res = await api.get(
          "https://dishallgy-backend.onrender.com/api/get_saved_recipes/"
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
        getAllergenInfo().then(allergens => {
            const keys = Object.keys(allergens.allergens);
            setAllergens(keys);
        });

        getUser().then(user => {
            if (user) {
                setUsername(user.username);
            } 
        });
        getSavedRecipes();
        document.title = "DishAllgy";
    }, []);
 

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    if (inRecipeSearch) {
      toast.error("A search is alreay in progress")
      return
    }

    const formData = new FormData(e.target);
    var dishToSend = formData.get('dish');
    var allergensToSend = selectedAllergens;
    var maxRecipesToSend = formData.get('max_recipes');

    //  startSSE();
    try {
      const dish = encodeURIComponent(dishToSend);
      const allergens = encodeURIComponent(allergensToSend);
      const maxRecipes = encodeURIComponent(maxRecipesToSend);

      const source = new EventSource(`https://dishallgy-backend.onrender.com/api/search_for_allergens_in_dish/?dish=${dish}&allergens=${allergens}&maxRecipes=${maxRecipes}`);        
      setDishChecked(dishToSend);
      setAllergensChecked(allergensToSend);

      recipeSourceRef.current = source;
      
      setNumTotalRecipes("");
      setNumRecipes("");
      setNumRecipesWithAllergen("")
      setRecipeUrls("")
      setError("");
      // setInRecipeSearch(false);

      setRecipeSearchResult(true);

      source.onmessage = function(event) {
        const data = JSON.parse(event.data);

        setNumTotalRecipes(data.num_total_recipes);
        setNumRecipes(data.num_recipes);
        setNumRecipesWithAllergen(data.num_recipes_with_allergen)
        setRecipeUrls(data.urls_without_allergen)
        setInRecipeSearch(true);

      };
      source.addEventListener('done', function(event) {
        source.close();  // THIS closes the SSE connection
        setInRecipeSearch(false);
      });
      source.addEventListener("error", (event) => {
        source.close();
        setInRecipeSearch(false);
      });
    source.addEventListener("error", (event) => {
      try {
        const data = event.data ? JSON.parse(event.data) : null;
        setError("No results found. Input may be invalid");
      } catch {
        setError("No results found. Input may be invalid");
      }

      source.close();
      setInRecipeSearch(false);
    });
                  

    } catch (err) {
      console.error(err);
    }
  };

  const stopRecipeSearch = () => {
    if (recipeSourceRef.current) {
      recipeSourceRef.current.close(); // close SSE manually
      recipeSourceRef.current = null;
      setInRecipeSearch(false);
    }
  };

    const saveSearch = async (type, setObjectSaved) => {
      let elementChecked, allergens, numRecipesSend, numRecipesWithAllergenSend, recipeUrlsSend;

      if (type === "dish") {
        elementChecked = dishChecked;
        allergens = allergensChecked;
        numRecipesSend = numRecipes;
        numRecipesWithAllergenSend = numRecipesWithAllergen;
        recipeUrlsSend = recipeUrls;
      } else {
        elementChecked = cuisineChecked;
        allergens = allergensChecked2;
        numRecipesSend = numRecipes2;
        numRecipesWithAllergenSend = numRecipesWithAllergen2;
        recipeUrlsSend = recipeUrls2;
      }
      setObjectSaved(true);

      try {
        const res = await api.post("https://dishallgy-backend.onrender.com/api/save_search/", {
          type: type,
          element: elementChecked,                     
          allergens: allergens,                     
          num_recipes: numRecipesSend,
          num_recipes_with_allergen: numRecipesWithAllergenSend,
          recipe_urls: recipeUrlsSend,
        });
        

        toast("Search saved successfully!");
      } catch (err) {
        console.error("Error saving search:", err);
        toast("Error saving search!");
      }
    };

    const saveRecipe = async (link, image, name, description, type, setRecipeSaved) => {
      if (type === "dish") {
        var allergensToSend = allergensChecked;
        var search = dishChecked;
      } else {
        var allergensToSend = allergensChecked2;
        var search = cuisineChecked;
      }

      const res = await api.post("https://dishallgy-backend.onrender.com/api/save_recipe/", {
        recipe_name: name,
        recipe_description: description,
        recipe_url: link,
        recipe_image: image,
        element_type: type,
        allergens: allergensToSend,
        element_name: search,
        });
        toast("Recipe saved successfully!");
        setRecipeSaved(true);  // stress test this, maybe put it earlier
        setSavedRecipesURLs(prev => [
          ...prev,
          link
        ]);
    }


  const stopCuisineSearch = () => {
    if (cuisineSearchRef.current) {
      cuisineSearchRef.current.close(); // close SSE manually
      cuisineSearchRef.current = null;
      setInCuisineSearch(false);
    }
  };

  const handleCuisineSubmit = async (e) => {
    e.preventDefault();

    if (inCuisineSearch) {
      toast.error("A search is alreay in progress")
      return
    }


    var formData = new FormData(e.target);
    var cuisineToSend = formData.get('cuisine');
    var allergensToSend = selectedAllergens;
    var maxRecipesToSend = formData.get('max_recipes_2');

    if (!cuisines.some(c => c.toLowerCase() === cuisineToSend.toLowerCase())) {
      toast.error("Invalid cuisine");
          return;
        }

    setNumTotalRecipes2("");
    setNumRecipes2("");
    setNumRecipesWithAllergen2("")
    setRecipeUrls2("")
    setError("");


    try {
      const cuisine = encodeURIComponent(cuisineToSend);
      const allergens = encodeURIComponent(allergensToSend);
      const maxRecipes = encodeURIComponent(maxRecipesToSend);

      const source = new EventSource(`https://dishallgy-backend.onrender.com/api/search_for_allergens_in_cuisine/?cuisine=${cuisine}&allergens=${allergens}&maxRecipes=${maxRecipes}`);  


      cuisineSearchRef.current = source;

      setCuisineSearchResult(true);
      setAllergensChecked2(allergensToSend);
      setCuisineChecked(cuisineToSend);
      
      source.onmessage = function(event) {
        const data = JSON.parse(event.data);

        setNumTotalRecipes2(data.num_total_recipes);
        setNumRecipes2(data.num_recipes);
        setNumRecipesWithAllergen2(data.num_recipes_with_allergen)
        setRecipeUrls2(data.urls_without_allergen)
        setInCuisineSearch(true);

        var names = [];
        data.urls_with_allergen.forEach(recipe => {
          names.push(recipe[2])
        });
        setRecipesWithAllergen2(names)

      };
      source.addEventListener('done', function(event) {
        setInCuisineSearch(false);
        source.close();  // THIS closes the SSE connection
      });
      source.addEventListener("error", (event) => {
        console.error("Error event:", event.data);
        setInCuisineSearch(false);
        source.close();
      });
    source.addEventListener("error", (event) => {
      try {
        const data = event.data ? JSON.parse(event.data) : null;
        setError("No results found. Input may be invalid");
      } catch {
        setError("No results found. Input may be invalid");
      }

      source.close();
      setInCuisineSearch(false);
    });
                

    } catch (err) {
      console.error(err);
    }
  };

  const toggleForm = (type) => {
    setActiveForm(type);
  }

  return (
    <Base>
      <div className="text-center">
        <h1>DishAllgy</h1>
        <h4>Find recipes for a certain dish or cuisine that avoid your allergens</h4>

        <div className="search-container">
          <div className="type-button-container">
            <button className="type-button btn btn-primary" onClick={() => toggleForm('dish')}>Recipe</button>
            <button className="type-button btn btn-primary" onClick={() => toggleForm('cuisine')}>Cuisine</button>
          </div>

          {activeForm === "dish" && (
            <form id="recipeForm" onSubmit={handleRecipeSubmit}>
              <h2>Search for recipes with allergens</h2>
              <h6>Specify your allergens and type in the dish</h6>

            <AllergenList
              allergens={allergens}
              selectedAllergens={selectedAllergens}
              onAllergenChange={handleAllergenChange}
            />
            
              <input
                  className="form-control mt-3"
                  name="dish"
                  placeholder="Type in a dish"
                  style={{ width: "50%", margin: "auto"}}
                  required
              />

              <button className="form-submit btn btn-success mt-2" type="submit">
                  Submit
              </button>

              {/*
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p>Max Number of Recipes: </p>
                <input
                    type="number"
                    name="max_recipes"
                    min="1"
                    placeholder="Ex. 15"
                    style={{ width: "10%", marginLeft: "15px" }}
                />
              </div>
              */}


              {recipeSearchResult && (
              <div className="mt-4">
                  <h3>Search Results:</h3>
                  <h5>Dish checked: {dishChecked}</h5>
                  <h5>Allergens: {formatAllergens(allergensChecked)}</h5>

                {(numRecipes) ? (
                  <div>
                    <h6>Total Number of Recipes Found: {numTotalRecipes}</h6>
                    <h6>Number of Recipes Successfully Checked: {numRecipes}</h6>
                    <h6>
                      Number of Recipes with Allergen: {numRecipesWithAllergen} (
                      {Math.round((numRecipesWithAllergen / numRecipes) * 100)}%)
                    </h6>
                        <StopSearchDisplay currentState={inRecipeSearch} stopSearch={stopRecipeSearch} isLoggedIn={isAuthenticated()} saveSearch={saveSearch} type={"dish"} searchSaved={searchSaved} setSearchSaved={setSearchSaved}/>

                    

                    <h4 style={{ marginTop: "50px" }}>
                      Here are some recipes that don't contain your allergens
                    </h4>
                    <RecipeDisplay recipeUrls={recipeUrls} isLoggedIn={isAuthenticated()} saveRecipe={saveRecipe} type={"dish"} savedRecipesURLs={savedRecipesURLs} />
                  </div>
                ) : error ? (
                  <div>
                    <h2 style={{marginTop: "50px"}}>{error}</h2>
                  </div>
                ) : (
                  <div>
                    <h2>Scraping Recipes...</h2>
                  </div>
                )}


              </div>
              )}

            </form>
          )}

          {activeForm === "cuisine" && (
            <form id="cuisineForm" onSubmit={handleCuisineSubmit}>
              <h2>Search for cuisines with allergens</h2>
              <h6>Specify your allergens and type in the cuisine</h6>

            <AllergenList
              allergens={allergens}
              selectedAllergens={selectedAllergens}
              onAllergenChange={handleAllergenChange}
            />

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

              {/* 
              <input
                  className="mt-3"
                  name="cuisine"
                  placeholder="Type in a cuisine"
                  style={{ width: "50%" }}
                  required
              />
              */}

              <button className="form-submit btn btn-success mt-2" type="submit">
                  Submit
              </button>

              {cuisineSearchResult && (
              <div className="mt-4">
                  <h3>Search Results:</h3>
                  <h5>Cuisine checked: {cuisineChecked}</h5>
                  <h5>Allergens: {formatAllergens(allergensChecked2)}</h5>

                  {numRecipes2 ? (
                    <div>
                      <h6>Total Number of Recipes Found: {numTotalRecipes2}</h6>
                      <h6>Number of Recipes Successfully Checked: {numRecipes2}</h6>
                      <h6>Number of Recipes with allergen: {numRecipesWithAllergen2} ({Math.round(numRecipesWithAllergen2 / numRecipes2 * 100)}%)</h6>
                  
                      <StopSearchDisplay currentState={inCuisineSearch} stopSearch={stopCuisineSearch} isLoggedIn={isAuthenticated()} saveSearch={saveSearch} type={"cuisine"} searchSaved={searchSaved} setSearchSaved={setSearchSaved}/>


                      {/* {numRecipesWithAllergen2 !== 0 && ( */}
                        <div>
                          <h4 style={{"marginTop": "50px"}}>You should avoid the following recipes from this cuisine as they may have your allergens</h4>
                          <RecipesWithAllergensDisplay recipeNames={recipesWithAllergen2} />
                        </div>
                      {/* )} */}

                      <h4 style={{"marginTop": "50px"}}>Here are some recipes in the cuisine that don't contain your allergens</h4>
                      <RecipeDisplay recipeUrls={recipeUrls2} isLoggedIn={isAuthenticated()} saveRecipe={saveRecipe} type={"cuisine"} savedRecipesURLs={savedRecipesURLs} />
                    </div>
                  ) : error ? (
                    <div>
                    <h2 style={{marginTop: "50px"}}>{error}</h2>
                      </div>
                  ) : (
                  <div>
                    <h2>Scraping Recipes...</h2>
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
