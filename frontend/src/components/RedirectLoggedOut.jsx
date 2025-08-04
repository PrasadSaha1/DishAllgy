import { NavLink, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import {useState, useEffect} from "react";


function RedirectLoggedOut({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []); 

    // refreshes acces token automatically
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try { // trying to get new access token
            const res = await api.post("/auth/token/refresh/", {refresh: refreshToken})
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }

        } catch (error) {
            setIsAuthorized(false);
        }
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);  // if there's a token
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decodedToken = jwtDecode(token);
        const tokenExpiration = decodedToken.exp 
        const now = Date.now() / 1000; // in seconds
        if (tokenExpiration < now) { // token expired
            await refreshToken()
        } else {
            setIsAuthorized(true);
        }
    }

    // loading until is authroized  rnot
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/"/>;

}
export default RedirectLoggedOut;