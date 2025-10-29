import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Factory({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(Cookies.get("nesw") === "SefwfmgrUID");

    useEffect(() => {
        const isLoged = Cookies.get("nesw");
        setIsValid(isLoged === "SefwfmgrUID");
    }, [location]);

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
