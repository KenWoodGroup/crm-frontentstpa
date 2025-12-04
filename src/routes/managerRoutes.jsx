import ManagerCompany from "../Components/Manager/ManagerCompany/ManagerCompany";
import ManagerDashboard from "../Components/Manager/ManagerDashboard/ManagerDashboard";
import ManagerDealer from "../Components/Manager/ManagerDealer/ManagerDealer";
import ManagerFactory from "../Components/Manager/ManagerFactory/ManagerFactory";
import ManagerFactoryDetail from "../Components/Manager/ManagerFactoryDetail/ManagerFactoryDetail";
import ManagerInExel from "../Components/Manager/ManagerInExel/ManagerInExel";

export const managerRoutes = [
    {
        path: "/manager/dashboard",
        name: "Factory ",
        element: <ManagerDashboard />
    },
    {
        path: "/manager/factory",
        name: "Factory ",
        element: <ManagerFactory />
    },
    {
        path: "/manager/dealer",
        name: "Dealer ",
        element: <ManagerDealer />
    },
    {
        path: "/manager/company",
        name: "Company ",
        element: <ManagerCompany />
    },
    {
        path: "/manager/factory/:id",
        name: "Factory",
        element: <ManagerFactoryDetail />
    },
    {
        path: "/manager/factory/warehouse/:facId/:warId",
        name: "Factory",
        element: <ManagerInExel />
    },
]