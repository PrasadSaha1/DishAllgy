import { useState } from 'react';

function RecipeDisplay({ recipeUrls, isLoggedIn, saveRecipe, type, savedRecipesURLs }) {
  const [recipeSaved, setRecipeSaved] = useState({});


//     const saveRecipe = async (link, image, name, type, setRecipeSaved) => {

  const handleSave = (recipe) => {
    saveRecipe(
      recipe.website_url, 
      recipe.image_href,
      recipe.name,
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
        <div key={recipe.id} className='recipe-display'>
          <img src={recipe.image_href} alt="Loading..." width="300" />

          <label>
            {recipe.name} (
            <a href={recipe.website_url} target="_blank" rel="noopener noreferrer">
              Link
            </a>)
          </label>
          
          {/*
          <div dangerouslySetInnerHTML={{ __html: recipe.description }} />
          */}

          {isLoggedIn && !savedRecipesURLs.includes(recipe.website_url) && (
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