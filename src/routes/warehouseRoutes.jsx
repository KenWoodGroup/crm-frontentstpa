
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
import WarehousePayment from "../Components/Warehouse/WarehousePayment/WarehousePayment";
import WarehouseSverka from "../Components/Warehouse/WarehouseSverka/WarehouseSverka";
import WarehouseDebtor from "../Components/Warehouse/WarehouseDebtor/WarehouseDebtor";
import WarehouseExpenses from "../Components/Warehouse/WarehouseExpenses/WarehouseExpenses";
import WarehouseClients from "../Components/Warehouse/WarehouseClients/WarehouseClients";
import WarehouseClientDetail from "../Components/Warehouse/WarehouseClientDetail/WarehouseClientDetail";
import WarehouseCash from "../Components/Warehouse/WarehouseCash/WarehouseCash";
import WarehouseСarrier from "../Components/Warehouse/WarehouseСarrier/WarehouseСarrier";
import WarehouseSupplier from "../Components/Warehouse/WarehouseSuppliers/WarehouseSupplier";
import WarehouseSupplierPayment from "../Components/Warehouse/WarehouseSupplierPayment/WarehouseSupplierPayment";
import WarehouseSupplierSverka from "../Components/Warehouse/WarehouseSupplierSverka/WarehouseSupplierSverka";
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
        path: "/warehouse/disposal",
        name: "Warehouse Disposal",
        element: <WareHouseDisposal />
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
        path: "/warehouse/dilers",
        name: "Warehouse Diler",
        element: <WarehouseDiler />
    },
    {
        path: "/warehouse/settings",
        name: "Warehouse settings",
        element: <SettingsWareHouse />
    },
    {
        path: "/warehouse/payment",
        name: "Warehouse payment",
        element: <WarehousePayment />
    },
    {
        path: "/warehouse/revisen",
        name: "Warehouse sverka",
        element: <WarehouseSverka />
    },
    {
        path: "/warehouse/debtor",
        name: "Warehouse Debtor",
        element: <WarehouseDebtor />
    },
    {
        path: "/warehouse/expenses",
        name: "Warehouse expenses",
        element: <WarehouseExpenses />
    },
    {
        path: "/warehouse/clients",
        name: "Warehouse Clients",
        element: <WarehouseClients />
    },
    {
        path: "/warehouse/client/:id",
        name: "Warehouse Client detail",
        element: <WarehouseClientDetail />
    },
    {
        path: "/warehouse/kassa",
        name: "Warehouse Kassa",
        element: <WarehouseCash />
    },
    {
        path: "/warehouse/carrier",
        name: "Warehouse carrier ",
        element: <WarehouseСarrier />
    },
    {
        path: "/warehouse/supplier",
        name: "Warehouse supplier ",
        element: <WarehouseSupplier />
    },
    {
        path: "/warehouse/supplier/payment",
        name: "Warehouse Payment supplier",
        element: <WarehouseSupplierPayment />
    },
    {
        path: "/warehouse/supplier/sverka",
        name: "Warehouse Payment sverka",
        element: <WarehouseSupplierSverka />
    }
];
