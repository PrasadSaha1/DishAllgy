import { ACCESS_TOKEN } from '../constants';

export const getAllergenInfo = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;

    const res = await fetch("http://localhost:8000/api/fetch_allergens_request/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();
    return data; 

};
