import IndependentClients from "../Components/Independent/IndepemdentClients/IndependentClients";
import IndependentCarrier from "../Components/Independent/IndependentCarrier/IndependentCarrier";
import IndependentCash from "../Components/Independent/IndependentCash/IndependentCash";
import IndependentClientDetail from "../Components/Independent/IndependentClientDetail/IndependentClientDetail";
import IndependentClientPayments from "../Components/Independent/IndependentClientPayments/IndependentClientPayments";
import IndependentDashboard from "../Components/Independent/IndependentDashboard/IndependentDashboard";
import IndependentDebtor from "../Components/Independent/IndependentDebtor/IndependentDebtor";
import IndependentExpenses from "../Components/Independent/IndependentExpenses/IndependentExpenses";
import IndependentStock from "../Components/Independent/IndependentStock/IndependentStock";
import IndependentSupplierPayment from "../Components/Independent/IndependentSupplierPayment/IndependentSupplierPayment";
import IndependentSupplierSverka from "../Components/Independent/IndependentSupplierSverka/IndependentSupplierSverka";
import IndependentSverka from "../Components/Independent/IndependentSverka/IndependentSverka";
import IndepentdentSuppliers from "../Components/Independent/IndepentdentSuppliers/IndepentdentSuppliers";
import SettingsWareHouse from "../Components/Warehouse/SettingsWareHouse/SettingsWareHouse";
export const independentRoutes = [
    {
        path: "/independent/dashboard",
        name: "IndependentDashboard",
        element: <IndependentDashboard />
    },
    {
        path: "/independent/stock",
        name: "IndependentStock",
        element: <IndependentStock />
    },
    {
        path: "/independent/clients",
        name: "IndependentClients",
        element: <IndependentClients />
    },
    {
        path: "/independent/payments",
        name: "IndependentPayments",
        element: <IndependentClientPayments />
    },
    {
        path: "/independent/cash",
        name: "IndependentCash",
        element: <IndependentCash />
    },
    {
        path: "/independent/expenses",
        name: "IndependentExpenses",
        element: <IndependentExpenses />
    },
    {
        path: "/independent/carrier",
        name: "IndependentCarrier",
        element: <IndependentCarrier />
    },
    {
        path: "/independent/client-detail/:id",
        name: "IndependentClientDetail",
        element: <IndependentClientDetail />
    },
    {
        path: "/independent/debtor",
        name: "IndependentClientDebtor",
        element: <IndependentDebtor />
    },
    {
        path: "/independent/sverka",
        name: "IndependentClientSverka",
        element: <IndependentSverka />
    },
    {
        path: "/independent/sverka",
        name: "IndependentClientSverka",
        element: <IndependentSverka />
    },
    {
        path: "/independent/settings",
        name: "IndependentClientSettings",
        element: <SettingsWareHouse />
    },
    {
        path: "/independent/suppliers",
        name: "IndependentClientSuppliers",
        element: <IndepentdentSuppliers />
    },
    {
        path: "/independent/suppliers/sverka",
        name: "IndependentClientSverka",
        element: <IndependentSupplierSverka />
    },
    {
        path: "/independent/suppliers/payment",
        name: "IndependentClientPayment",
        element: <IndependentSupplierPayment />
    },
];

