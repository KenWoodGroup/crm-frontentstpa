
import WarehouseDashboard from "../Components/Warehouse/WarehouseDashboard/WarehouseDashboard";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WareHouseOutcome from "../Components/Warehouse/WareHouseOutcome/WareHouseOutcome";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";

import WarehouseInvoiceHistory from "../Components/Warehouse/WareHouseHistory/WarehouseInvoiceHistory";
import Profile from "../Components/Profile/Profile";
import ReceivedInvoices from "../Components/Warehouse/WarehouseOffers/WarehouseOffers";
import WarehouseStockPage from "../Components/Warehouse/WarehouseStock/WarehouseStockPage";

export const mWarehouseRoutes = [
    {
        path: "/materials/warehouse/dashboard",
        name: "materials Warehouse Dashboard",
        element: <WarehouseDashboard />
    },
    {
        path: "/materials/warehouse/product",
        name: "materials Warehouse Product",
        element: <WarehouseStockPage productType="material" role="warehouse"/>
    },
    {
        path: "/materials/warehouse/stockin",
        name: "materials Warehouse stock in",
        element: <WareHouseIncome prd_type="material" role="warehouse"/>
    },
    {
        path: "/materials/warehouse/stockout",
        name: "materials Warehouse stock out",
        element: <WareHouseOutcome prd_type="material"  role="warehouse" />
    },
    {
        path:"/materials/warehouse/notifications",
        name:"materials notifications",
        element:<ReceivedInvoices/>
    },
    {
        path: "/materials/warehouse/history",
        name: "materials warehouse history",
        element: <WarehouseInvoiceHistory />
    },

    {
        path: "/materials/warehouse/history/:invoiceId",
        name: "materials warehouse detail history by id",
        element: <WarehouseInvoiceHistory />
    },

    {
        path: "/materials/warehouse/settings",
        name: "materials Warehouse settings",
        element: <SettingsWareHouse />
    },
    {
        path: "/materials/warehouse/profile",
        name: "materials Warehouse profile ",
        element: <Profile />
    },


];
