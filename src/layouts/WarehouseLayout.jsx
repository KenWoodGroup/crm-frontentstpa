import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import { LayoutDashboard, Package, PackagePlus, Settings } from "lucide-react";

export default function WarehouseLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    const links = [
        {
            id: 1,
            label: "Home Page",
            path: "/warehouse/dashboard",
            icon: LayoutDashboard
        },
        {
            id: 2,
            label: "Products",
            path: "/warehouse/product",
            icon: Package
        },
        {
            id: 3,
            label: "Income",
            path: "/warehouse/income",
            icon: PackagePlus
        },
        { path: "/warehouse/settings", label: "Settings", icon: Settings },

    ]
    return (
        <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
            }`} >
            <SuperAdminSidebar links={links} role={"Ombor Manager"} onToggle={setSidebarOpen} />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
}
