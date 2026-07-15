import { useEffect, useState } from "react";
import Base from "../components/Base";
import api from "../api";
import "../styles/Home.css";
import { title, formatAllergens } from "../components/HelperFunctions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function RecipeDisplay({ recipes, handleDelete, handleFavorite }) {
  if (recipes.length === 0) {
    return (
        <p style={{ textAlign: "center", width: "100%" }}>
          No saved recipes yet.
        </p>
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="recipe-display">
          
          {/* top-right favorite button */}
          <button
            className={`favorite-btn btn ${recipe.is_favorite ? "btn-warning" : "btn-outline-danger"}`}
            onClick={() => handleFavorite(recipe.id, "recipe")}
          >
            <i className={`bi ${recipe.is_favorite ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>

          <img src={recipe.image} alt="Loading..." width="300" />

          <label>
            {recipe.name} (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer">
              Link
            </a>
            )
          </label>

          <label>{recipe.description}</label>

          <p>
            <strong>{title(recipe.type)}:</strong> {recipe.element_name}
          </p>

          <p>
            <strong>Allergens (not in recipe): </strong>
            {formatAllergens(recipe.allergens)}
          </p>

          <p>
            <strong>Saved at: </strong>
            {new Date(recipe.created_at).toLocaleString()}
          </p>

          <button
            className="btn btn-danger"
            onClick={() => handleDelete(recipe.id, "recipe")}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function SearchDisplay({ searches, handleDelete, handleFavorite }) {
  return (
    <div className="search-results">
      {searches.length === 0 ? (
        <p>No saved searches yet.</p>
      ) : (
        <ul>
          {searches.map((search) => (
           
            <li key={search.id} className="recipe-display">

              {/* favorite button top-right */}
              <button
                className={`favorite-btn btn ${search.is_favorite ? "btn-warning" : "btn-outline-danger"}`}
                onClick={() => handleFavorite(search.id, "search")}
              >
                <i className={`bi ${search.is_favorite ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>

              <p>
                <strong>Type:</strong> {title(search.type)}
              </p>

              <p>
                <strong>Dish:</strong> {search.element}
              </p>

              <p>
                <strong>Allergens:</strong>{" "}
                {formatAllergens(search.allergens)}
              </p>

              <p>
                <strong>Number of Recipes:</strong> {search.num_recipes}
              </p>

              <p>
                <strong>Recipes with Allergen:</strong>{" "}
                {search.num_recipes_with_allergen}
              </p>

              <p>
                <strong>Recipe URLs:</strong>
              </p>

              {search.recipe_urls.map((recipe, idx) => (
                <div key={idx}>
                  <a href={recipe[0]} target="_blank" rel="noopener noreferrer">
                    {recipe[2]}
                  </a>
                </div>
              ))}

              <p>
                <strong>Saved At:</strong>{" "}
                {new Date(search.created_at).toLocaleString()}
              </p>

              <button
                className="btn btn-danger"
                onClick={() => handleDelete(search.id, "search")}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function filterObject(objects) {
  // reverses the objects and puts the favorites first by first adding the favorites to the new array, then everything else
  var newObjects= [];
  objects = objects.reverse();
  objects.forEach(object => {
    if (object.is_favorite){
      newObjects.push(object);
    }});

  objects.forEach(object => {
    if (!object.is_favorite){
      newObjects.push(object);
    }});
  return newObjects;
}


function SavedRecipes() {
  const [searches, setSearches] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeForm, setActiveForm] = useState("recipe");

  const getSearches = async () => {
    const res = await api.get(
      "http://localhost:8000/api/get_saved_searches/"
    );
    setSearches(filterObject(res.data.saved_searches));
  };

  const getRecipes = async () => {
    const res = await api.get(
      "http://localhost:8000/api/get_saved_recipes/"
    );
    setRecipes(filterObject(res.data.saved_recipes));
  };

  const toggleForm = (type) => {
    setActiveForm(type);
  };

  useEffect(() => {
    getSearches();
    getRecipes();
    document.title = "Saved Recipes"
  }, []);


  const handleDelete = async (objectID, objectType) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${objectType}?`
    );

    if (!confirmDelete) return;

    try {
      await api.post(
        "http://localhost:8000/api/delete_saved_recipe_or_search/",
        {
          objectID,
          objectType,
        }
      );

      if (objectType === "recipe") {
        setRecipes((prev) =>
          prev.filter((item) => item.id !== objectID)
        );
      } else {
        setSearches((prev) =>
          prev.filter((item) => item.id !== objectID)
        );
      }

      toast(`${title(objectType)} deleted successfully!`);
    } catch (err) {
      console.error(err);
      toast("Failed to delete item");
    }
  };

  const handleFavorite = async (objectID, objectType) => {
    try {
      await api.post(
        "http://localhost:8000/api/favorite_recipe_or_search/",
        {
          objectID,
          objectType,
        }
      );

      if (objectType === "recipe") {
        setRecipes(prev =>
          prev.map(recipe =>
            recipe.id === objectID
              ? { ...recipe, is_favorite: !recipe.is_favorite }
              : recipe
          )
        );
      } else {
        setSearches(prev =>
          prev.map(search =>
            search.id === objectID
              ? { ...search, is_favorite: !search.is_favorite }
              : search
          )
        );
      }

      toast(`${title(objectType)} updated successfully!`);
    } catch (err) {
      console.error(err);
      toast("Failed to favorite item");
    }
  };


  return (
    <Base>
      <div style={{ justifyContent: "center", textAlign: "center" }}>
        <h2>Saved Recipes</h2>

        <button
          className="btn btn-primary type-button"
          onClick={() => toggleForm("recipe")}
        >
          Saved Recipes
        </button>

        <button
          className="btn btn-primary type-button"
          onClick={() => toggleForm("search")}
        >
          Saved Searches
        </button>
        <p>Favorited results are shown first</p>

        {activeForm === "search" && (
          <SearchDisplay
            searches={searches}
            handleDelete={handleDelete}
            handleFavorite={handleFavorite}
          />
        )}

        {activeForm === "recipe" && (
          <RecipeDisplay
            recipes={recipes}
            handleDelete={handleDelete}
            handleFavorite={handleFavorite}
          />
        )}
      </div>
    </Base>
  );
}

export default SavedRecipes;