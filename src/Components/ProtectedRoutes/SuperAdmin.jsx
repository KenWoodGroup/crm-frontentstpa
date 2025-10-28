import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function SuperAdmin({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "SPAfefefeUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "SPAfefefeUID");
    }, [location]); // проверка при каждом изменении маршрута

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
