import SAdashboard from "../Components/SuperAdmin/SAdashboar";
import SAmanagers from "../Components/SuperAdmin/SAmanagers";
import SAusers from "../Components/SuperAdmin/SAusers";
export const supperAdminRoutes = [
    {
        path: "/",
        name: "superAdimDashboard",
        element:<SAdashboard/>
    },
    {
        path: "/users",
        name: "users",
        element: <SAusers/>
    },
    {
        path: "/managers",
        name: "managers",
        element: <SAmanagers/>
    }
];

export const managerRoutes = [
    {
        path: "/admin",
        name: "admins",
    }
]