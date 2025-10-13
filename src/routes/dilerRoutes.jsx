
import WarehouseBarcodeCreate from "../Components/Warehouse/WarehouseBarcodeCreate/WarehouseBarcodeCreate";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProdcut/WarehouseProduct";
import WarehouseDiler from "../Components/Warehouse/WarehouseDiler/WarehouseDiler";
import DilerDashboard from "../Components/Diler/DilerDashboard/DilerDashboard";
import DilerStock from "../Components/Diler/DilerStock/DilerStock";
export const dilertoutes = [
    {
        path: "/diler/dashboard",
        name: "Diler Dashboard",
        element: <DilerDashboard />
    },
    {
        path: "/diler/product",
        name: "Diler Product",
        element: <DilerStock />
    },
    {
        path: "/warehouse/barcode/create",
        name: "Warehouse barcode create",
        element: <WarehouseBarcodeCreate />
    },
    {
        path: "/warehouse/income",
        name: "Warehouse income",
        element: <WareHouseIncome />
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
