
import { patch } from "@mui/material";
import WarehouseBarcodeCreate from "../Components/Warehouse/WarehouseBarcodeCreate/WarehouseBarcodeCreate";
import WarehouseDashboard from "../Components/Warehouse/WarehouseDashboard/WarehouseDashboard";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProduct";
import WareHouseIncomeFull from "../Components/Warehouse/WareHouseIncome/WareHouseIncomeFull";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProdcut/WarehouseProduct";
import WarehouseDiler from "../Components/Warehouse/WarehouseDiler/WarehouseDiler";
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
        path: "/warehouse/income",
        name: "Warehouse income",
        element: <WareHouseIncomeFull/>
    },
    {
        path: "/warehouse/dilers",
        name: "Warehouse Diler",
        element: <WarehouseDiler />
    },
    {
        path: "/warehouse/settings",
        name: "Warehouse settings",
        element: <div>Warehouse settings</div>
    }
];
