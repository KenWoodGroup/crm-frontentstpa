
import WarehouseBarcodeCreate from "../Components/Warehouse/WarehouseBarcodeCreate/WarehouseBarcodeCreate";
import WarehouseDashboard from "../Components/Warehouse/WarehouseDashboard/WarehouseDashboard";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProdcut/WarehouseProduct";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WareHouseOutcome from "../Components/Warehouse/WareHouseOutcome/WareHouseOutcome";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";

import WarehouseInvoiceHistory from "../Components/Warehouse/WareHouseHistory/WarehouseInvoiceHistory";
import Profile from "../Components/Profile/Profile";
import ReceivedInvoices from "../Components/Warehouse/WarehouseOffers/WarehouseOffers";

export const warehouseRoutes = [
    {
        path: "/warehouse/dashboard",
        name: "Warehouse Dashboard",
        element: <WarehouseDashboard />
    },
    {
        path: "/warehouse/product",
        name: "Warehouse Product",
        element: <WarehouseProdcut />
    },
    {
        path: "/warehouse/barcode/create",
        name: "Warehouse barcode create",
        element: <WarehouseBarcodeCreate />
    },
    {
        path: "/warehouse/stockin",
        name: "Warehouse stock in",
        element: <WareHouseIncome />
    },
    {
        path: "/warehouse/stockout",
        name: "Warehouse stock out",
        element: <WareHouseOutcome />
    },
    {
        path:"/warehouse/notifications",
        name:"notifications",
        element:<ReceivedInvoices/>
    },
    {
        path: "/warehouse/history",
        name: "warehouse history",
        element: <WarehouseInvoiceHistory />
    },

    {
        path: "/warehouse/history/:invoiceId",
        name: "warehouse detail history by id",
        element: <WarehouseInvoiceHistory />
    },

    {
        path: "/warehouse/settings",
        name: "Warehouse settings",
        element: <SettingsWareHouse />
    },
    {
        path: "/warehouse/profile",
        name: "Warehouse profile ",
        element: <Profile />
    },


];
