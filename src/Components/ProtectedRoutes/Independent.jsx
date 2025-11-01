import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Independent({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "inedsdfmgrUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "inedsdfmgrUID");
    }, [location]);

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
