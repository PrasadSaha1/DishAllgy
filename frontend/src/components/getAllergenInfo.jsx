import { ACCESS_TOKEN } from "../constants";

export const getAllergenInfo = async () => {
    
    const token = localStorage.getItem(ACCESS_TOKEN);

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fetch_allergens_request/`, {
        method: "GET",
        headers
    });

    const data = await res.json();
    return data;
};
