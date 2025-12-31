import { useEffect, useState } from "react";
import Base from "../components/Base";
import api from "../api"; 
// import RecipeDisplay from "../components/RecipeDisplay";
import "../styles/home.css";

function RecipeDisplay({recipeUrls}) {
  return (
    <div className='recipe-grid'>
      {recipeUrls.map((recipe, index) => (
          <div key={index} className='recipe-display'>
            <img src={recipe.image} alt="Loading..." width="300" />
            <label>{recipe.name} (
              <a href={recipe.image} target="_blank" rel="noopener noreferrer">Link</a>)
            </label>          
            <label>{recipe.description}</label>

            <label>Original Search: </label>
            <p>
              <strong> {recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1).toLowerCase()}: </strong> {recipe.element_name}
            </p>
            <p>
              <strong>Allergens (not in recipe): </strong> {recipe.allergens}
            </p>
            <p>
            <strong>Search Time: </strong> {new Date(recipe.created_at).toLocaleString()}
            </p>
        </div>
      ))}
    </div>
  );
}

function SavedRecipes() {
  const [searches, setSearches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeForm, setActiveForm] = useState("recipe");

  // Function to fetch saved searches
  const getSearches = async () => {
      const res = await api.get("http://localhost:8000/api/get_saved_searches/");
      setSearches(res.data.saved_searches);
  };

  const getRecipes = async () => {
    const res = await api.get(`http://localhost:8000/api/get_saved_recipes/`);
    setRecipes(res.data.saved_recipes);
  };

  const toggleForm = (type) => {
    setActiveForm(type);
  }

  useEffect(() => {
    getSearches();
    getRecipes();
  }, []);

  return (
    <Base>
      <div style={{justifyContent: "center", textAlign: "center"}}>
        <h2>Saved Recipes</h2>
        <button className="btn btn-primary" onClick={() => toggleForm('recipe')}>Search Saved Recipes</button>
        <button className="btn btn-primary" onClick={() => toggleForm('search')}>Search Saved Searches</button>

      {activeForm === "search" && (
        <div className="search-results">
          {searches.length === 0 ? (
            <p>No saved searches yet.</p>
          ) : (
            <ul>
              {searches.map((search) => (
                <li key={search.id} className="search-item" style={{ marginBottom: "20px" }}>
                  <p><strong>Type:</strong> {search.type}</p>
                  <p><strong>Dish:</strong> {search.element}</p>
                  <p><strong>Allergens:</strong> {search.allergens.join(", ") || "None"}</p>
                  <p><strong>Number of Recipes:</strong> {search.num_recipes}</p>
                  <p><strong>Recipes with Allergen:</strong> {search.num_recipes_with_allergen}</p>
                  
                  <p><strong>Recipe URLs:</strong></p>
                  <ul>
                    {search.recipe_urls.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                      </li>
                    ))}
                  </ul>
                  
                  <p><strong>Created At:</strong> {new Date(search.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}


            
        {activeForm === "recipe" && (
          <RecipeDisplay recipeUrls={recipes} isLoggedIn={true} type={"dish"} />
        )}

      </div>
    </Base>
  );
}

export default SavedRecipes;
