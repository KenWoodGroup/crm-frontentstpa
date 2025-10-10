import FactoryDashboard from "../Components/Factory/FactoryDashboard/FactoryDashboard";
import FactoryProduct from "../Components/Factory/FactoryProduct/FactoryProduct";
import FactoryWarehouse from "../Components/Factory/FactoryWarehouse/FactoryWarehouse";
import WarehouseDetail from "../Components/Factory/WarehouseDetail/WarehouseDetail";
import WarehouseUser from "../Components/Factory/WarehouseUser/WarehouseUser";
import Profile from "../Components/Profile/Profile";

export const userRoutes = [
  {
    path: "/factory/dashboard",
    name: "factory",
    element: <FactoryDashboard />
  },
  {
    path: "factory/warehouse",
    name: "Warehouse",
    element: <FactoryWarehouse />
  },
  {
    path: "factory/warehouse/user/:id",
    name: 'Warehouse user',
    element: <WarehouseUser />
  },
  {
    path: "factory/warehouse/:id",
    name: 'Warehouse detail',
    element: <WarehouseDetail />
  },
  {
    path: "/profile",
    name: 'Profile',
    element: <Profile />
  },
  {
    path: "factory/product",
    name: 'Product create',
    element: <FactoryProduct />
  }
]