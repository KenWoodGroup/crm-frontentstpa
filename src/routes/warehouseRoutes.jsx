
import { patch } from "@mui/material";
import WarehouseBarcodeCreate from "../Components/Warehouse/WarehouseBarcodeCreate/WarehouseBarcodeCreate";
import WarehouseDashboard from "../Components/Warehouse/WarehouseDashboard/WarehouseDashboard";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProdcut/WarehouseProduct";
import WarehouseDiler from "../Components/Warehouse/WarehouseDiler/WarehouseDiler";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WareHouseOutcome from "../Components/Warehouse/WareHouseOutcome/WareHouseOutcome";
import WareHouseDisposal from "../Components/Warehouse/WareHouseDisposal/WareHouseDisposal";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";
import { elements } from "chart.js";
import WarehouseInvoiceHistory from "../Components/Warehouse/WareHouseHistory/WarehouseInvoiceHistory";
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
        element: <WareHouseIncome/>
    },
    {
        path:"/warehouse/stockout",
        name:"Warehouse stock out",
        element:<WareHouseOutcome/>
    },
    {
        path:"/warehouse/disposal",
        name:"Warehouse Disposal",
        element:<WareHouseDisposal/>
    },
    {
        path:"\"/warehouse/history\"",
        name:"warehouse history",
        element:<WarehouseInvoiceHistory/>
    },
    {
        path:"\"/warehouse/history/:invoiceId\"",
        name:"warehouse detail history by id",
        element:<WarehouseInvoiceHistory/>
    },
    {
        path: "/warehouse/dilers",
        name: "Warehouse Diler",
        element: <WarehouseDiler />
    },
    {
        path: "/warehouse/settings",
        name: "Warehouse settings",
        element: <SettingsWareHouse/>
    }
];
