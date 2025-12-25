import ManagerCompany from "../Components/Manager/ManagerCompany/ManagerCompany";
import ManagerDashboard from "../Components/Manager/ManagerDashboard/ManagerDashboard";
import ManagerDealer from "../Components/Manager/ManagerDealer/ManagerDealer";
import ManagerFactory from "../Components/Manager/ManagerFactory/ManagerFactory";
import ManagerFactoryDetail from "../Components/Manager/ManagerFactoryDetail/ManagerFactoryDetail";
import ManagerInExel from "../Components/Manager/ManagerInExel/ManagerInExel";
import ManagerMateriExel from "../Components/Manager/ManagerMaterialExel/ManagerMateriExel";
import Option from "../Components/Other/Option/Option";
import Users from "../Components/Other/Users/Users";

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
    {
        path: "/manager/factory-users/:id",
        name: "Factory users",
        element: <Users />
    },
    {
        path: "/manager/factory/warehouse-material/:facId/:warId",
        name: "Factory users",
        element: <ManagerMateriExel />
    },
    {
        path: "/manager/option",
        name: "Option",
        element: <Option />
    },
]