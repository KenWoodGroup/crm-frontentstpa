import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";


export default function Mwarehouse({ children }) {

    const isLoged = Cookies.get("nesw");
    if (isLoged === "SesdsdfmgrUIM") {
        return children;
    }
    return <Navigate to="/login" replace />;
}