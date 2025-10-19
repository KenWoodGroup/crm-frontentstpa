
import WarehouseBarcodeCreate from "../Components/Warehouse/WarehouseBarcodeCreate/WarehouseBarcodeCreate";
import WareHouseIncome from "../Components/Warehouse/WareHouseIncome/WareHouseIncome";
import WarehouseProdcut from "../Components/Warehouse/WarehouseProdcut/WarehouseProduct";
import WarehouseDiler from "../Components/Warehouse/WarehouseDiler/WarehouseDiler";
import DilerDashboard from "../Components/Diler/DilerDashboard/DilerDashboard";
import DilerStock from "../Components/Diler/DilerStock/DilerStock";
import DilerNotification from "../Components/Diler/DilerNotofication/DilerNotification";
import DilerNotificationDetail from "../Components/Diler/DilerNotificationDetail/DilerNotificationDetail";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";
import DilerFinance from "../Components/Diler/DilerFinance/DilerFinance";
import DealerIncome from "../Components/Diler/DealerIncome/DealerIncome";
import DealerOutcome from "../Components/Diler/DealerOutcome/DealerOutcome";
import DealerDisposal from "../Components/Diler/DealerDisposal/DealerDisposal";
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
        path:"/diler/stockin",
        name:"Diler income",
        element:<DealerIncome/>
    },
    {
        path:"/diler/stockout",
        name:"diler chiqim",
        element:<DealerOutcome/>
    },
    {
        path:"/diler/disposal",
        name:"diler disposal",
        element:<DealerDisposal/>,  
    },
    {
        path: "/diler/notification",
        name: "Diler notification",
        element: <DilerNotification />
    },
    {
        path: "/diler/notification/:id",
        name: "Diler notification",
        element: <DilerNotificationDetail />
    },
    {
        path: "/diler/settings",
        name: "Diler settings",
        element: <FactorySettings />
    },
    {
        path: "/diler/finance",
        name: "Diler settings",
        element: <DilerFinance />
    }
];
