import FactoryAnalitik from "../Components/Factory/FactoryAnalitik/FactoryAnalitik";
import FactoryDashboard from "../Components/Factory/FactoryDashboard/FactoryDashboard";
import FactoryPartner from "../Components/Factory/FactoryPartner/FactoryPartnter";
import FactoryProductCreate from "../Components/Factory/FactoryProduct/_component/FactoryProductCreate";
import FactoryLocalProduct from "../Components/Factory/FactoryProduct/FactoryLocalProduct";
import FactoryProduct from "../Components/Factory/FactoryProduct/FactoryProduct";
import FactoryReport from "../Components/Factory/FactoryReport/FactoryReport";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";
import WarehouseAccess from "../Components/Factory/FactoryWarehouse/_components/WarehouseAccess";
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
    path: "factory/warehouse-access/:id",
    name: 'Warehouse access',
    element: <WarehouseAccess />
  },
  {
    path: "factory/product",
    name: 'Product create',
    element: <FactoryLocalProduct />
  },
  {
    path: "factory/product/create",
    name: 'Product create',
    element: <FactoryProduct />
  },
  {
    path: "factory/product/create/:id",
    name: 'Product create',
    element: <FactoryProductCreate />
  },
  {
    path: "factory/report",
    name: 'Factory report',
    element: <FactoryReport />
  },
  {
    path: "factory/produt-analiz",
    name: 'Factory analiz',
    element: <FactoryAnalitik />
  },
  {
    path: "factory/settings",
    name: 'Factory Setting',
    element: <FactorySettings />
  },
  {
    path: "factory/partner",
    name: 'Factory partner ',
    element: <FactoryPartner />
  },
  {
    path: "/factory/profile",
    name: 'Profile ',
    element: <Profile />
  }
]