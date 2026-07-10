function title(string) {
  var words = string.split(" ")
  let finalWord = "";

  words.forEach((word) => {
    finalWord += word.charAt(0).toUpperCase() + word.slice(1) + " "
  })

  return finalWord.trim();
}

function formatAllergens(allergens) {
    if (!allergens.join(", ")) { 
        return "None"
    }

    return title(allergens.join(", ")) 
}

export { title, formatAllergens };