// src/layouts/WarehouseLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    PackagePlus,
    PackageMinus,
    Recycle,
    Settings,
    User,
} from "lucide-react";
import { WarehouseProvider, useWarehouse } from "../context/WarehouseContext";
import useConfirmNavigation from "../hooks/useConfirmNavigation";
import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";

export default function WarehouseLayout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );

    // simple detection: agar path stockout ni o'z ichiga olsa => out, aks holda in
    const mode = location.pathname.includes("/warehouse/stockout")
        ? "out"
        : location.pathname.includes("/warehouse/disposal")
            ? "dis"
            : "in";

    const links = [
        { id: 1, label: "Home Page", path: "/warehouse/dashboard", icon: LayoutDashboard },
        { id: 2, label: "Products", path: "/warehouse/product", icon: Package },
        { id: 3, label: "Kirim", path: "/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: "Chiqim", path: "/warehouse/stockout", icon: PackageMinus },
        { id: 5, label: "Chiqindi", path: "/warehouse/disposal", icon: Recycle },
        { id: 6, label: "Dilers", path: "/warehouse/dilers", icon: User },
        { id: 7, label: "Settings", path: "/warehouse/settings", icon: Settings },
    ];


    return (
        <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
            <SuperAdminSidebar
                links={links}
                role={"Ombor Manager"}
                onToggle={setSidebarOpen}
            />
            <div className="p-6">
                {/* pass mode to provider so provider can expose per-mode state */}
                <WarehouseProvider mode={mode}>
                    <InnerGuard>
                        <Outlet />
                    </InnerGuard>
                </WarehouseProvider>
            </div>
        </div>
    );
}

/* InnerGuard — confirm modalni hozirgi mode bo'yicha ishlatadi.
   useConfirmNavigation ga `when` (true bo'lsa modal ko'rinadi) va `clearAll` (confirm qilinganda chaqiriladi) yuboriladi.
*/
function InnerGuard({ children }) {
    const location = useLocation(); // optional, saqlab qoldik agar kerak bo'lsa
    const { mode, isDirty, saveSuccess, resetMode } = useWarehouse();

    // modalni ko'rsatish sharti: joriy mode da saqlanmagan o'zgarishlar mavjud va hali saveSuccess bo'lmagan
    const shouldPrompt = Boolean(isDirty?.[mode] && !saveSuccess?.[mode]);

    const { showModal, handleConfirm, handleCancel } = useConfirmNavigation({
        when: shouldPrompt,
        clearAll: () => resetMode(mode) // confirm qilinsa joriy mode dagi state tozalanadi
    });

    return (
        <>
            {children}
            <ConfirmModalNav
                open={showModal}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
}
