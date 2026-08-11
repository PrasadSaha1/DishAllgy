import { ACCESS_TOKEN } from '../constants';

export const getUser = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return null;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user_view/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();
    return data;  // { username: "...", email: "...", ... }

};
