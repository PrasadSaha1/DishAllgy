import { Navigate } from "react-router-dom";
import {useState, useEffect} from "react";
import { getUser } from "./getUser";

function RedirectEmailGiven({ children }) {
    const [hasEmail, setHasEmail] = useState(null);

    useEffect(() => {
        getUser().then(user => {
            if (user) {
                if (user.email) {
                    setHasEmail(true);
                } else {
                    setHasEmail(false);
                }
            } 
        });
    }, []);


    return hasEmail ? <Navigate to="/"/> : children;

}
export default RedirectEmailGiven;