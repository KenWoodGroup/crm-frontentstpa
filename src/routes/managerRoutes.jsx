import ManagerDashboard from "../Components/Manager/ManagerDashboard/ManagerDashboard";
import ManagerDealer from "../Components/Manager/ManagerDealer/ManagerDealer";
import ManagerFactory from "../Components/Manager/ManagerFactory/ManagerFactory";

export const managerRoutes = [
    {
        path: "/manager/dashboard",
        name: "Factory ",
        element: <ManagerDashboard />
    },
    {
        path: "/manager/factory",
        name: "Factory ",
        element: <ManagerFactory />
    },
    {
        path: "/manager/dealer",
        name: "Dealer ",
        element: <ManagerDealer />
    },
]