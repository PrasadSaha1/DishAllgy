function RecipeDisplay({recipeUrls, isLoggedIn, saveRecipe, type}) {
    console.log(recipeUrls)
  return (
    <div className='recipe-grid'>
      {recipeUrls.map((recipe, index) => (
          <div key={index} className='recipe-display'>
            <img src={recipe[1]} alt="Loading..." width="300" />
            <label>{recipe[2]} (
              <a href={recipe[0]} target="_blank" rel="noopener noreferrer">Link</a>)
            </label>          
            <label>{recipe[3]}</label>
            {isLoggedIn && (
              <button className="btn btn-success" style={{marginTop: "10px"}} type="button" onClick={() => saveRecipe(recipe[0], recipe[1], recipe[2], recipe[3], type)} >Save Recipe</button>
            )}
        </div>
      ))}
    </div>
  );
}

export default RecipeDisplay;
