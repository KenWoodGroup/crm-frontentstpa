import CompanyWarehouseDashboard from "../Components/Company-Warehouse/CompanyWarehouseDashboard/ConpanyWarehouseDashboard";
import CompanyWarehouseDiler from "../Components/Company-Warehouse/CompanyWarehouseDiler/CompanyWarehouseDiler";
import CompanyWarehouseFinance from "../Components/Company-Warehouse/CompanyWarehouseFinance/CompanyWarehouseFinance";
import CompanyWarehouseStock from "../Components/Company-Warehouse/CompanyWarehouseStock/CompanyWarehouseStock";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";

export const companyWarehouseRoutes = [
    {
        name: "Company Warehouse Dashboard",
        path: 'company-warehouse/dashboard',
        element: <CompanyWarehouseDashboard />
    },
    {
        name: "Company Warehouse diler",
        path: 'company-warehouse/diler',
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
    }
]