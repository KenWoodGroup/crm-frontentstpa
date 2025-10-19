import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import { LayoutDashboard, Package, Warehouse, PackageMinus, ChartCandlestick, Settings, User } from "lucide-react";

export default function CompanyLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    const links = [
        {
            id: 1,
            label: "Dashboard",
            path: "/company/dashboard",
            icon: LayoutDashboard
        },
        {
            id: 2,
            label: "Omborlar",
            path: "/company/warehouse",
            icon: Warehouse
        },
        {
            id: 2,
            label: "Hisobot",
            path: "/company/finance",
            icon: ChartCandlestick
        },
        { path: "/company/settings", label: "Settings", icon: Settings },

    ]
    return (
        <div className={`transition-all bg-[#FAFAFA] min-h-screen duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
            }`} >
            <SuperAdminSidebar links={links} role={"Company"} onToggle={setSidebarOpen} />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
}
