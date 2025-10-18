import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import { LayoutDashboard, Package, PackagePlus, PackageMinus, Recycle, Settings, User } from "lucide-react";
import { patch } from "@mui/material";

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
            label: "Kirim",
            path: "/warehouse/stockin",
            icon: PackagePlus
        },
        {
            id: 4,
            label: "Chiqim",
            path: "/warehouse/stockout",
            icon: PackageMinus,
        },
        {
            id: 5,
            label: "Chiqindi",
            path: "/warehouse/disposal",
            icon: Recycle
        },
        {
            id: 5,
            label: "Dilers",
            path: "/warehouse/dilers",
            icon: User
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
