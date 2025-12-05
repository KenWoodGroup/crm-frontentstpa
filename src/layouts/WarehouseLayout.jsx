// src/layouts/WarehouseLayout.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"
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

import { WarehouseProvider } from "../context/WarehouseContext";
import useConfirmNavigation from "../hooks/useConfirmNavigation";
import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";
import WarehouseSidebar from "../Components/Warehouse/WarehouseSideBar/WarehouseSidebar";
import Header from "../Components/UI/Header/Header";
import { useInventory } from "../context/InventoryContext";
import AdminHeader from "../Components/UI/Header/AdminHeader";
import { useNotifyStore } from "../store/useNotifyStore";
import { InvoicesApi } from "../utils/Controllers/invoices";
import socket from "../utils/Socket";
import { toast, ToastContainer } from "react-toastify";
import NotifyToast from "../Components/UI/notify/NotifyToast";

export default function WarehouseLayout() {
    const userLid = Cookies.get("ul_nesw");
    const navigate = useNavigate()
    const location = useLocation();
    const mode = location.pathname.includes("/warehouse/stockout")
        ? "out" : (location.pathname.includes("/warehouse/stockin") || location.pathname.includes("/warehouse/notifications")) ? "in" : "m_other";

    const changeNotifyCount = useNotifyStore((s) => s.setUnreadCount)
    const fetchNotify = async () => {
        try {
            const res = await InvoicesApi.GetInvoiceNotifications(userLid, 1);
            const val = res.data?.data?.new;
            changeNotifyCount(val);
        } finally { }
    };
    useEffect(() => {
        fetchNotify();
        socket.emit("joinLocation", userLid);

        socket.on("invoiceUpdate", (data) => {
            if (data.location_id === userLid) {
                fetchNotify();
                toast(
                    <NotifyToast message={"Yangi jo'natma"} handleClick={() => navigate("warehouse/notifications")} />,
                    { containerId: "warehouseNotify" }
                );
            };
        });

        return () => socket.off("invoiceUpdate");
    }, [userLid]);

    return (
        <div className={`WarehouseLayout bg-background-light dark:bg-background-dark transition-colors  min-h-screen duration-300 pl-[125px]`}>
            <WarehouseSidebar />
            <ToastContainer
                containerId="warehouseNotify"
                position="top-center"
                hideProgressBar={true}
                closeOnClick={false}
                draggable={false}
                theme="light"
                newestOnTop
                autoClose={3500}
                icon={false}     
                closeButton={false} 
                toastClassName={() => "bg-transparent shadow-none p-0 m-0"}
                bodyClassName={() => "p-0 m-0"}
            />




            <div className={`${mode === "m_other" ? "pt-[100px]" : "pt-[40px]"} pr-[10px]`}>
                {mode === "m_other" ? <AdminHeader /> : ""}

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
    const { mode, isDirty, saveSuccess, resetMode } = useInventory();

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
