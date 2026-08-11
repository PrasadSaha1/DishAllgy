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
        <h2 style={{ textAlign: "center", width: "100%" }}>
          No saved recipes yet.
        </h2>
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

          <img src={recipe.image} style={{"marginTop": "40px"}} alt="Loading..." width="300" />

          <label>
            {recipe.name} (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer">
              Link
            </a>
            )
          </label>

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
  const [unsafeRecipesExpanded, setUnsafeRecipesExpanded] = useState([]);
  const [recipesExpanded, setRecipesExpanded] = useState([]);

  return (
    <div className="search-results">
      {searches.length === 0 ? (
        <h2>No saved searches yet.</h2>
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
                <strong>Search:</strong> {search.element}
              </p>

              <p>
                <strong>Allergens:</strong>{" "}
                {formatAllergens(search.allergens)}
              </p>

              <p>
                <strong>Number of Recipes:</strong> {search.num_recipes}
              </p>

              <p>
                <strong>Percent Safe Recipes:</strong> {search.percent_safe_recipes}%
              </p>


                {search.type === "cuisine" && (
                  <>
                    <p>
                      <strong>Dishes with allergens:</strong>
                    </p>

                    {unsafeRecipesExpanded[search.id] ? (
                    <div>
                      <button className="btn btn-primary btn-sm" onClick={() => setUnsafeRecipesExpanded(prev => ({...prev,[search.id]: !prev[search.id]}))}>Hide</button>
                      {search.unsafe_recipes.map((recipe, idx) => (
                        <div key={idx}>
                            {recipe}
                        </div>
                      ))}
                    </div>
                    ) : (
                      <div>
                        <button className="btn btn-primary btn-sm" onClick={() => setUnsafeRecipesExpanded(prev => ({...prev,[search.id]: !prev[search.id]}))}>Show</button>
                      </div>
                    )}
                    <p></p> {/* Creates a margin */}
                  </>
                )}

              <p>
                <strong>Safe Recipes:</strong>
              </p>

              {recipesExpanded[search.id] ? (
                <div>
                <button className="btn btn-primary btn-sm" onClick={() => setRecipesExpanded(prev => ({...prev,[search.id]: !prev[search.id]}))}>Hide</button>
                {search.recipe_urls.map((recipe, idx) => (
                  <div key={idx}>
                    <a href={recipe.website_url} target="_blank" rel="noopener noreferrer">
                      {recipe.name}
                    </a>
                  </div>
                ))}
              </div>
              ) : (
                <div>
                  <button className="btn btn-primary btn-sm" onClick={() => setRecipesExpanded(prev => ({...prev,[search.id]: !prev[search.id]}))}>Show</button>
                </div>
              )}
              <p></p> {/* Creates a margin */}

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
  const [loading, setLoading] = useState(false);

  const getSearches = async () => {
    const res = await api.get(
      `${import.meta.env.VITE_API_URL}/api/get_saved_searches/`
    );
    setSearches(filterObject(res.data.saved_searches));
  };

  const getRecipes = async () => {
    const res = await api.get(
      `${import.meta.env.VITE_API_URL}/api/get_saved_recipes/`
    );
    setRecipes(filterObject(res.data.saved_recipes));
  };

  const toggleForm = (type) => {
    setActiveForm(type);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        getSearches(),
        getRecipes()
      ]);

      setLoading(false);
    };

    loadData();
    document.title = "Saved Recipes";
  }, []);

  const handleDelete = async (objectID, objectType) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${objectType}?`
    );

    if (!confirmDelete) return;

    try {
      const toastId = toast.loading(`Deleting ${title(objectType)}`);
      await api.post(
        `${import.meta.env.VITE_API_URL}/api/delete_saved_recipe_or_search/`,
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
      toast.dismiss(toastId);
      toast.success(`${title(objectType)} deleted successfully!`)
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  const handleFavorite = async (objectID, objectType) => {
    try {
      const toastId = toast.loading(`Updating ${title(objectType)}`);
      await api.post(
        `${import.meta.env.VITE_API_URL}/api/favorite_recipe_or_search/`,
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

      toast.dismiss(toastId)
      toast.success(`${title(objectType)} updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to favorite item");
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
          loading ? (
            <div>
              <h1>Loading...</h1>
              </div>
          ) : (
            <SearchDisplay
              searches={searches}
              handleDelete={handleDelete}
              handleFavorite={handleFavorite}
            />
          )
        )}

        {activeForm === "recipe" && (
          loading ? (
            <div>
              <h1>Loading...</h1>
              </div>          
              ) : (
            <RecipeDisplay
              recipes={recipes}
              handleDelete={handleDelete}
              handleFavorite={handleFavorite}
            />
          )
        )}
      </div>
    </Base>
  );
}

export default SavedRecipes;