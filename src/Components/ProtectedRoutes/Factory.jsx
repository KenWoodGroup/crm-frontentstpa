import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Factory({ children }) {
    const location = useLocation();
    const [isValid, setIsValid] = useState(null); // null для начальной загрузки

    useEffect(() => {
        const checkAuth = () => {
            const cookieValue = Cookies.get("nesw");
            // Проверяем оба значения
            const isValidCookie = cookieValue === "SefwfmgrUID" ||
                cookieValue === "CesdsdfmgrUID" ||
                cookieValue === "KesdsdfmgrUID" ||
                cookieValue === "SdsdfmgrUID";

            setIsValid(isValidCookie);
        };
        checkAuth();
    }, [location]);

    // Пока проверяем, показываем загрузку или ничего
    if (isValid === null) {
        return <div>Loading...</div>; // или <Spinner />
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
}