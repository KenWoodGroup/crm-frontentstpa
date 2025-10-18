import CompanyDashboard from "../Components/Company/CompamyDashboard/CompanyDashboard";
import CompanyDilerDetail from "../Components/Company/CompanyDilerDetail/CompanyDilerDetail";
import CompanyFinance from "../Components/Company/CompanyFinance/CompanyFinance";
import CompanyWarehouse from "../Components/Company/CompanyWarehouse/CompanyWarehouse";
import CompanyWarehouseDetail from "../Components/Company/CompanyWarehouseDetail/CompanyWarehouseDetail";
import FactorySettings from "../Components/Factory/FactorySettings/FactorySettings";

export const companyRoutes = [
    {
        path: '/company/dashboard',
        name: "Company Dashboard",
        element: <CompanyDashboard />
    },
    {
        path: '/company/warehouse',
        name: "Company warehouse",
        element: <CompanyWarehouse />
    },
    {
        path: '/company/warehouse/:id',
        name: "Company warehouse detail",
        element: <CompanyWarehouseDetail />
    },
    {
        path: '/company/diler/:id',
        name: "Company diler detail",
        element: <CompanyDilerDetail />
    },
    {
        path: '/company/settings',
        name: "Company settings",
        element: <FactorySettings />
    },
    {
        path: '/company/finance',
        name: "Company finance",
        element: <CompanyFinance />
    }
]