import { Children, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";


export default function ProtectedRoute({children}) {

    const [isLoged, setIsLoged] = useState(Cookies.get("nesw") === "SPAfefefeUID");
    const location = useLocation().pathname
    useEffect(()=> {
        setIsLoged(Cookies.get("nesw") === "SPAfefefeUID")
    }, [location]);

    if(!isLoged) {
        return <Navigate to={"/login"} replace/>
    }
    return children;
}