import BuildingDashboard from "../Components/Building/BuildingDashboard/BuildingDashboard";
import BuildingStock from "../Components/Building/BuildingStock/BuildingStock";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";

export const buildingRoutes = [
    {
        path: "/building/dashboard",
        name: "Building dashboard",
        element: <BuildingDashboard />
    },
    {
        path: "/building/stock",
        name: "Building stock",
        element: <BuildingStock />
    },
    {
        path: "/building/settings",
        name: "Building settings",
        element: <SettingsWareHouse />
    },
]