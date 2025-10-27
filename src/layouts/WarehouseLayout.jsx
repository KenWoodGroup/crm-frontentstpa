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
    Move,
    BanknoteArrowDown,
    ChevronsLeftRight,
    UserPen,
    Blocks,
    UsersRound,
    CreditCard,
    Car,
} from "lucide-react";
import { WarehouseProvider, useWarehouse } from "../context/WarehouseContext";
import useConfirmNavigation from "../hooks/useConfirmNavigation";
import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";
import WarehouseSidebar from "../Components/Warehouse/WarehouseSideBar/WarehouseSidebar";

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

        { id: 3, label: "Приём", path: "/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: "Отгрузки", path: "/warehouse/stockout", icon: PackageMinus },
        { id: 5, label: "Chiqindi", path: "/warehouse/disposal", icon: Recycle },
        { id: 6, label: "Операции Склада", path: "/warehouse/history", icon: Move },
        { id: 6, label: "Dilers", path: "/warehouse/dilers", icon: User },
        { id: 6, label: "Клиенты", path: "/warehouse/clients", icon: UsersRound },
        { id: 6, label: "Оплата клиентов", path: "/warehouse/payment", icon: BanknoteArrowDown },
        { id: 6, label: "Сверка клиентов", path: "/warehouse/revisen", icon: ChevronsLeftRight },
        { id: 6, label: "Долги", path: "/warehouse/debtor", icon: UserPen },
        { id: 6, label: "Касса", path: "/warehouse/kassa", icon: CreditCard },
        { id: 6, label: "Расход", path: "/warehouse/expenses", icon: Blocks },
        { id: 6, label: "Доставщик", path: "/warehouse/supplier", icon: Car },
        { id: 7, label: "Settings", path: "/warehouse/settings", icon: Settings },
    ];


    return (
        <div className={`transition-all bg-[#FAFAFA] min-h-screen duration-300 ml-[125px]`}>
            <WarehouseSidebar />
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
