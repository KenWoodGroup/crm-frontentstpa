import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Manager({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "AutngergUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "AutngergUID");
    }, [location]); // проверяет при каждом изменении пути

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
