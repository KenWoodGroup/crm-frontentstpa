import FactoryAnalitik from "../Components/Factory/FactoryAnalitik/FactoryAnalitik";
import FactoryCategoryDetail from "../Components/Factory/FactoryCategoryDeltail/FactoryCategoryDetail";
import FactoryDashboard from "../Components/Factory/FactoryDashboard/FactoryDashboard";
import FactoryPartner from "../Components/Factory/FactoryPartner/FactoryPartnter";
import FactoryProductCreate from "../Components/Factory/FactoryProduct/_component/FactoryProductCreate";
import FactoryLocalProduct from "../Components/Factory/FactoryProduct/FactoryLocalProduct";
import FactoryProduct from "../Components/Factory/FactoryProduct/FactoryProduct";
import FactoryReport from "../Components/Factory/FactoryReport/FactoryReport";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";
import FactoryUserDetail from "../Components/Factory/FactoryUserDetail/FactoryUserDetail";
import WarehouseAccess from "../Components/Factory/FactoryWarehouse/_components/WarehouseAccess";
import FactoryWarehouse from "../Components/Factory/FactoryWarehouse/FactoryWarehouse";
import WarehouseDetail from "../Components/Factory/WarehouseDetail/WarehouseDetail";
import WarehouseUser from "../Components/Factory/WarehouseUser/WarehouseUser";
import Kassa from "../Components/Other/Cash/Kassa";
import CategoryClient from "../Components/Other/ClientCategory/CategoryClient";
import ClientDetail from "../Components/Other/ClientDetail/ClientDetail";
import WarehouseClients from "../Components/Other/Clients/Clients";
import Debtor from "../Components/Other/Debtor/Debtor";
import Expensess from "../Components/Other/Expenses/Expensess";
import PaymentPage from "../Components/Other/Payment/PaymentPage";
import PaymentType from "../Components/Other/PaymentType/PaymentType";
import PriceTypePage from "../Components/Other/PriceType/PriceTypePage";
import PriceTypeStock from "../Components/Other/PriceTypeStock/PriceTypeStock";
import StockApi from "../Components/Other/Stock/StockApi";
import Sverka from "../Components/Other/Sverka/Sverka";
import Carrier from "../Components/Other/Сarrier/Сarrier";
import Profile from "../Components/Profile/Profile";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WareHouseOutcome from "../Components/Warehouse/WareHouseOutcome/WareHouseOutcome";

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
    path:"factory/warehouse/stockin",
    name:"factory de warehouse stockin",
    element:<WareHouseIncome role="factory"/>
  },
  {
    path:"factory/warehouse/stockout",
    name:"factory de warehouse stockout",
    element:<WareHouseOutcome role="factory"/>
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
    path: "factory/category/:id",
    name: 'Product create',
    element: <FactoryCategoryDetail />
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
  },
  {
    path: "/factory/clients",
    name: 'clients ',
    element: <WarehouseClients />
  },
  {
    path: "/factory/kassa",
    name: 'Kassa',
    element: <Kassa />
  },
  {
    path: "/factory/debtor",
    name: 'Debtor',
    element: <Debtor />
  },
  {
    path: "/factory/expenses",
    name: 'expenses',
    element: <Expensess />
  },
  {
    path: "/factory/payment",
    name: 'Payment',
    element: <PaymentPage />
  },
  {
    path: "/factory/payment-type",
    name: 'Payment type',
    element: <PaymentType />
  },
  {
    path: "/factory/price-type",
    name: 'Price type',
    element: <PriceTypePage />
  },
  {
    path: "/factory/price-type",
    name: 'Price type',
    element: <PriceTypePage />
  },
  {
    path: "/factory/price-type-stock",
    name: 'Price type stock',
    element: <PriceTypeStock />
  },
  {
    path: "/factory/clients-sverka",
    name: 'Price type stock',
    element: <Sverka />
  },
  {
    path: "/factory/carrier",
    name: 'Carrier',
    element: <Carrier />
  },
  {
    path: "/factory/stock",
    name: 'Stock',
    element: <StockApi />
  },
  {
    path: "/factory/users",
    name: 'Users',
    element: <WarehouseUser />
  },
  {
    path: "/factory/client-category",
    name: 'Client-Category',
    element: <CategoryClient />
  },
  {
    path: "/factory/client/:id",
    name: 'Client detail',
    element: <ClientDetail />
  },
  {
    path: "/factory/user/:id",
    name: 'Factory user',
    element: <FactoryUserDetail />
  },
]