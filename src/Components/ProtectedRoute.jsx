import { Children } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";


export default function ProtectedRoute({children}) {

    const isLoged = Cookies.get("nesw");
    if(isLoged !== "SPAfefefeUID") {
        return <Navigate to={"/login"} replace/>
    }
    return children
}