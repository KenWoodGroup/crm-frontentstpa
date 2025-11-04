import { Outlet } from "react-router-dom";
import { useState } from "react";
import {
    Home,
    Users,
    ClipboardList,
    Settings,
    BarChart3,
    UserCog,
    User
} from "lucide-react";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";

export default function SuperAdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );

    const links = [
        { path: "/", label: "Dashboard", icon: Home },
        { path: "/managers", label: "Managers", icon: UserCog },
        {path:"/users", label:"Users", icon:User}
        // { path: "/users", label: "Users", icon: Users },
        // { path: "/reports", label: "Reports", icon: ClipboardList },
        // { path: "/stats", label: "Statistics", icon: BarChart3 },
        // { path: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <section
            className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
                }`}
        >
            <SuperAdminSidebar links={links} role="SupperAdmin" onToggle={setSidebarOpen} />
            <div className="p-6">
                <Outlet />
            </div>
        </section>
    );
}
