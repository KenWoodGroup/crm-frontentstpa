import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Company({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "SeCfmgrUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "SeCfmgrUID");
    }, [location]);

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
