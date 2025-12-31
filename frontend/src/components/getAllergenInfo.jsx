import { ACCESS_TOKEN } from "../constants";

export const getAllergenInfo = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:8000/api/fetch_allergens_request/", {
        method: "GET",
        headers
    });

    const data = await res.json();
    console.log("Allergen info:", data);
    return data;
};


//    var allergens = ["Nuts", "Dairy", "Gluten", "Soy", "Eggs", "Fish", "Shellfish", "Sesame", "Mustard"]
  //  return allergens;