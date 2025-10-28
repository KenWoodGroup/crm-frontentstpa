import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Dealer({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "SwedsdfmgrUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "SwedsdfmgrUID");
    }, [location]); // проверяет при каждом изменении маршрута

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
