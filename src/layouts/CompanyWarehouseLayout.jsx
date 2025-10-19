import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import { LayoutDashboard, HardHat, DollarSign, Settings, User, Warehouse } from "lucide-react";

export default function CompanyWarehouseLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    const links = [
        {
            id: 1,
            label: "Dashboard",
            path: "/company-warehouse/dashboard",
            icon: LayoutDashboard
        },
        {
            id: 2,
            label: "Ombor hona",
            path: "/company-warehouse/stock",
            icon: Warehouse
        },
        {
            id: 2,
            label: "Qurilish obekti",
            path: "/company-warehouse/diler",
            icon: HardHat
        },
        { path: "/company-warehouse/finance", label: "Hisobot", icon: DollarSign },
        { path: "/company-warehouse/settings", label: "Settings", icon: Settings },
    ]
    return (
        <div className={`transition-all bg-[#FAFAFA]  duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
            }`} >
            <SuperAdminSidebar links={links} role={"Warehouse"} onToggle={setSidebarOpen} />
            <div className="p-6">
                <Outlet />
            </div>
        </div>
    );
}
