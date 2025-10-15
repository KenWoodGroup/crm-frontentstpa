import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import { LayoutDashboard, Package, ChartCandlestick, Settings, Bell } from "lucide-react";

export default function DilerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    const links = [
        {

            id: 1,
            label: "Dashboard",
            path: "/diler/dashboard",
            icon: LayoutDashboard
        },
        {
            id: 2,
            label: "Products",
            path: "/diler/product",
            icon: Package
        },
        {
            id: 3,
            label: "Notification",
            path: "/diler/notification",
            icon: Bell
        },
        {
            id: 3,
            label: "Hisobot",
            path: "/diler/finance",
            icon: ChartCandlestick
        },
        { path: "/diler/settings", label: "Settings", icon: Settings },

    ]
    return (
        <div className={`transition-all bg-[#FAFAFA] min-h-screen duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
            }`} >
            <SuperAdminSidebar links={links} role={"Diler"} onToggle={setSidebarOpen} />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
}
