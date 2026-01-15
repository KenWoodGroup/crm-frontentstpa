import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";


export default function Warehouse({ children }) {

    const isLoged = Cookies.get("nesw");
    if (isLoged === "SesdsdfmgrUID" || isLoged === "KesdsdfmgrUID" || isLoged === "SesdsdfmgrUIM") {
        return children;
    }
    return <Navigate to="/login" replace />;
}