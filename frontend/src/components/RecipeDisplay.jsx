import { useState } from 'react';

function RecipeDisplay({ recipeUrls, isLoggedIn, saveRecipe, type, savedRecipesURLs }) {
  const [recipeSaved, setRecipeSaved] = useState({});

  const handleSave = (recipe) => {
    saveRecipe(
      recipe[0],
      recipe[1],
      recipe[2],
      recipe[3],
      type,
      () => {
        setRecipeSaved(prev => ({
          ...prev,
          [recipe[0]]: true
        }));
      }
    );
  };

  return (
    <div className='recipe-grid'>
      {recipeUrls.map((recipe, index) => (
        <div key={recipe[0]} className='recipe-display'>
          <img src={recipe[1]} alt="Loading..." width="300" />

          <label>
            {recipe[2]} (
            <a href={recipe[0]} target="_blank" rel="noopener noreferrer">
              Link
            </a>)
          </label>

          <label>{recipe[3]}</label>

          {isLoggedIn && !savedRecipesURLs.includes(recipe[0]) && (
            <button
              className="btn btn-success"
              style={{marginTop: "10px"}}
              type="button"
              onClick={() => handleSave(recipe)}
            >
              Save Recipe
            </button>
          )}

          {isLoggedIn && savedRecipesURLs.includes(recipe[0]) && (
            <h3>Recipe Saved!</h3>
          )}
        </div>
      ))}
    </div>
  );
}

export default RecipeDisplay;