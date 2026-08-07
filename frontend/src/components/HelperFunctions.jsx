function title(string) {
  var words = string.split(" ")
  let finalWord = "";

  words.forEach((word) => {
    finalWord += word.charAt(0).toUpperCase() + word.slice(1) + " "
  })

  return finalWord.trim();
}

function formatAllergens(allergens) {
  try {
    if (!allergens.join(", ")) { 
          return "None"
      }

      return title(allergens.join(", ")) 
  } catch {
    return "None"
  }
}

export { title, formatAllergens };