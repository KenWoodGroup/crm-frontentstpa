import FactoryDashboard from "../Components/Factory/FactoryDashboard/FactoryDashboard";
import FactoryWarehouse from "../Components/Factory/FactoryWarehouse/FactoryWarehouse";
import WarehouseDetail from "../Components/Factory/WarehouseDetail/WarehouseDetail";
import WarehouseUser from "../Components/Factory/WarehouseUser/WarehouseUser";
import Profile from "../Components/Profile/Profile";

export const userRoutes = [
  {
    path: "/factory",
    name: "factory",
    element: <FactoryDashboard />
  },
  {
    path: "/warehouse",
    name: "Warehouse",
    element: <FactoryWarehouse />
  },
  {
    path: "/warehouse/user/:id",
    name: 'Warehouse user',
    element: <WarehouseUser />
  },
  {
    path: "/warehouse/:id",
    name: 'Warehouse detail',
    element: <WarehouseDetail />
  },
  {
    path: "/profile",
    name: 'Profile',
    element: <Profile />
  }
]