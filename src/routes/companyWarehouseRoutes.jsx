import CompanyWarehouseSupplier from "../Components/Company-Warehouse/CompanyIndepentdentSuppliers/CompanyWarehouseSupplier";
import CompanyWarehouseCarrier from "../Components/Company-Warehouse/CompanyWarehouseCarrier/CompanyWarehouseCarrier";
import CompanyWarehouseCash from "../Components/Company-Warehouse/CompanyWarehouseCash/CompanyWarehouseCash";
import CompanyWarehouseDashboard from "../Components/Company-Warehouse/CompanyWarehouseDashboard/ConpanyWarehouseDashboard";
import CompanyWarehouseDiler from "../Components/Company-Warehouse/CompanyWarehouseDiler/CompanyWarehouseDiler";
import CompanyWarehouseExpenses from "../Components/Company-Warehouse/CompanyWarehouseExpenses/CompanyWarehouseExpenses";
import CompanyWarehouseFinance from "../Components/Company-Warehouse/CompanyWarehouseFinance/CompanyWarehouseFinance";
import CompanyWarehouseStock from "../Components/Company-Warehouse/CompanyWarehouseStock/CompanyWarehouseStock";
import CompanyWarehouseSupplierPayment from "../Components/Company-Warehouse/CompanyWarehouseSupplierPayment/CompanyWarehouseSupplierPayment";
import CompanyWarehouseSverka from "../Components/Company-Warehouse/CompanyWarehouseSverka/CompanyWarehouseSverka";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";

export const companyWarehouseRoutes = [
    {
        name: "Company Warehouse Dashboard",
        path: 'company-warehouse/dashboard',
        element: <CompanyWarehouseDashboard />
    },
    {
        name: "Company Warehouse objects",
        path: 'company-warehouse/objects',
        element: <CompanyWarehouseDiler />
    },
    {
        name: "Company Warehouse settings",
        path: 'company-warehouse/settings',
        element: <FactorySettings />
    },
    {
        name: "Company Warehouse Finance",
        path: 'company-warehouse/finance',
        element: <CompanyWarehouseFinance />
    },
    {
        name: "Company Warehouse stock",
        path: 'company-warehouse/stock',
        element: <CompanyWarehouseStock />
    },
    {
        path: '/company-warehouse/carrier',
        name: "Company carrier",
        element: <CompanyWarehouseCarrier />
    },
    {
        path: '/company-warehouse/expenses',
        name: "Company expenses",
        element: <CompanyWarehouseExpenses />
    },
    {
        path: '/company-warehouse/kassa',
        name: "Company kassa",
        element: <CompanyWarehouseCash />
    },
    {
        path: '/company-warehouse/suppliers',
        name: "Company suppliers",
        element: <CompanyWarehouseSupplier />
    },
    {
        path: '/company-warehouse/suppliers/sverka',
        name: "Company suppliers",
        element: <CompanyWarehouseSverka />
    },
    {
        path: '/company-warehouse/suppliers/payment',
        name: "Company suppliers",
        element: <CompanyWarehouseSupplierPayment />
    },
    {
        path: '/company-warehouse/settings',
        name: "Company settings",
        element: <SettingsWareHouse />
    }
]