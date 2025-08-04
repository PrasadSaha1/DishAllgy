import React from 'react';
import Base from '../components/Base';
import { isAuthenticated } from '../components/checkAuth';
import { getUser } from '../components/getUser';
import { getAllergenInfo } from "../components/getAllergenInfo";
import { useState, useEffect } from 'react';
import "../styles/home.css";
import api from '../api';

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
        <label key={allergen} style={{ marginRight: "10px" }}>
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



function RecipeDisplay({recipeUrls}) {
  return (
    <div className='recipe-grid'>
      {recipeUrls.map((recipe, index) => (
          <div key={index} className='recipe-display'>
            <img src={recipe[1]} alt="Dynamic Example" width="300" />
            <label>{recipe[2]} (
              <a href={recipe[0]} target="_blank" rel="noopener noreferrer">Link</a>)
            </label>          
            <label>{recipe[3]}</label>
        </div>
      ))}
    </div>
  );
}


export default function Home() {
    const [username, setUsername] = useState("");
    const [allergens, setAllergens] = useState([])
    const [recipeSearchResult, setRecipeSearchResult] = useState(null);
    const [cuisineSearchResult, setCuisineSearchResult] = useState(null);
    const [activeForm, setActiveForm] = useState("recipe");
    const [selectedAllergens, setSelectedAllergens] = useState([]); // Persist allergen selection

    const [dishChecked, setDishChecked] = useState(null);
    const [allergensChecked, setAllergensChecked] = useState(null);
    const [numRecipes, setNumRecipes] = useState(null);
    const [numRecipesWithAllergen, setNumRecipesWithAllergen] = useState(null);
    const [recipeUrls, setRecipeUrls] = useState(null);

    const [cuisineChecked, setCuisineChecked] = useState(null);
    const [allergensChecked2, setAllergensChecked2] = useState(null);
    const [numRecipes2, setNumRecipes2] = useState(null);
    const [numRecipesWithAllergen2, setNumRecipesWithAllergen2] = useState(null);
    const [recipesWithAllergen2, setRecipesWithAllergen2] = useState([]);
    const [recipeUrls2, setRecipeUrls2] = useState(null);

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
    }, []);
 

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const dish = formData.get('dish');
    var allergens = selectedAllergens;

    try {
      const res = await api.post('http://localhost:8000/api/search_for_allergens_in_dish/', {
        dish,
        allergens: allergens
      });
      setRecipeSearchResult(true);

      setDishChecked(dish);
      setAllergensChecked(allergens);
      setNumRecipes(res.data.num_recipes);
      setNumRecipesWithAllergen(res.data.num_recipes_with_allergen)
      setRecipeUrls(res.data.urls_without_allergen)

    } catch (err) {
      console.error(err);
    }
  };

  const handleCuisineSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const cuisine = formData.get('cuisine');
    var allergens = selectedAllergens;

    try {
      const res = await api.post('http://localhost:8000/api/search_for_allergens_in_cuisine/', {
        cuisine,
        allergens: allergens
      });

      setCuisineSearchResult(true);

      setCuisineChecked(cuisine);
      // setAllergensChecked2(allergens)

    
      var allergenString = "";
      allergens.forEach(allergen => {
        allergenString += allergen.charAt(0).toUpperCase() + allergen.slice(1) + ", ";
      });
      setAllergensChecked2(allergenString);
      
      
      
      setNumRecipes2(res.data.num_recipes);
      setNumRecipesWithAllergen2(res.data.num_recipes_with_allergen)
      setRecipeUrls2(res.data.urls_without_allergen)

      var names = [];
      res.data.urls_with_allergen.forEach(recipe => {
        names.push(recipe[2])
      });
      setRecipesWithAllergen2(names)

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
        <h1>Welcome to the Website</h1>
        <h4>This is the Website Description</h4>
        <AccountButtons isLoggedIn={isAuthenticated()} name={username} />

        <button className="btn btn-primary" onClick={() => toggleForm('recipe')}>Search Recipe</button>
        <button className="btn btn-primary" onClick={() => toggleForm('cuisine')}>Search Cuisine</button>

        {activeForm === "recipe" && (
          <form id="recipeForm" className="recipe-search" onSubmit={handleRecipeSubmit}>
            <h2>Search for recipes with allergens</h2>
            <h6>Specify your allergens and type in the dish...</h6>

          <AllergenList
            allergens={allergens}
            selectedAllergens={selectedAllergens}
            onAllergenChange={handleAllergenChange}
          />
            <input
                className="mt-3"
                name="dish"
                placeholder="Type in a dish"
                style={{ width: "50%" }}
                required
            />

            <button className="form-submit btn btn-success" type="submit">
                Submit
            </button>


            {/* Display response */}
            {recipeSearchResult && (
            <div className="mt-4">
                <h3>Search Results:</h3>
                <h5>Dish checked: {dishChecked}</h5>
                <h5>Allergens: {allergensChecked}</h5>

                <h6>Number of Recipes checked: {numRecipes}</h6>
                <h6>Number of Recipes with allergen: {numRecipesWithAllergen} ({Math.round(numRecipesWithAllergen / numRecipes * 100)}%)</h6>
              
                <h4 style={{"marginTop": "50px"}}>Here are some recipes that don't contain your allergens</h4>
                <RecipeDisplay recipeUrls={recipeUrls}/>
            </div>
            )}

          </form>
        )}

        {activeForm === "cuisine" && (
          <form id="cuisineForm" onSubmit={handleCuisineSubmit}>
            <h2>Search for cuisines with allergens</h2>
            <h6>Specify your allergens and type in the cuisine...</h6>

          <AllergenList
            allergens={allergens}
            selectedAllergens={selectedAllergens}
            onAllergenChange={handleAllergenChange}
          />
            <input
                className="mt-3"
                name="cuisine"
                placeholder="Type in a cuisine"
                style={{ width: "50%" }}
                required
            />

            <button className="form-submit btn btn-success" type="submit">
                Submit
            </button>

            {cuisineSearchResult && (
            <div className="mt-4">
                <h3>Search Results:</h3>
                <h5>Cuisine checked: {cuisineChecked}</h5>
                <h5>Allergens: {allergensChecked2}</h5>

                <h6>Number of Recipes checked: {numRecipes2}</h6>
                <h6>Number of Recipes with allergen: {numRecipesWithAllergen2} ({Math.round(numRecipesWithAllergen2 / numRecipes2 * 100)}%)</h6>
            
                {numRecipesWithAllergen2 !== 0 && (
                  <div>
                    <h4 style={{"marginTop": "50px"}}>You should avoid the following recipes from this cuisine as they may have your allergens</h4>
                    <RecipesWithAllergensDisplay recipeNames={recipesWithAllergen2} />
                  </div>
                )}

                <h4 style={{"marginTop": "50px"}}>Here are some recipes in the cuisine that don't contain your allergens</h4>
                <RecipeDisplay recipeUrls={recipeUrls2}/>
            </div>
            )}
          </form>

          
        )}



        <h4 style={{"marginTop": "1000px"}}>Hi</h4>



      </div>
    </Base>
  );
}
