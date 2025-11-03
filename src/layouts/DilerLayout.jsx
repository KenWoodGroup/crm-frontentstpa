import { Outlet, useLocation } from "react-router-dom";
import SuperAdminSidebar from "../Components/SuperAdminSidebar/SuperAdminSidebar";
import { useState } from "react";
import {
    LayoutDashboard, Package, ChartCandlestick, Settings, Bell, PackagePlus,
    PackageMinus,
    Recycle,
} from "lucide-react";

import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";
import useConfirmNavigation from "../hooks/useConfirmNavigation";

export default function DilerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    // simple detection: agar path stockout ni o'z ichiga olsa => out, aks holda in
    const mode = location.pathname.includes("/diler/stockout")
        ? "out"
        : location.pathname.includes("/diler/disposal")
            ? "dis"
            : "in";

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
            label: "Kirim",
            path: "/diler/stockin",
            icon:PackagePlus,
        },
        {
            id:4,
            label:"Outgoing",
            path:"/diler/stockout",
            icon:PackageMinus,
        },
        {
            id:5,
            label:"Chiqindi",
            path:"diler/disposal",
            icon:Recycle,
        },
        {
            id: 6,
            label: "Notification",
            path: "/diler/notification",
            icon: Bell
        },
        {
            id: 7,
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

// function InnerGuard({ children }) {
//     const location = useLocation(); // optional, saqlab qoldik agar kerak bo'lsa
//     const { mode, isDirty, saveSuccess, resetMode } = useDealer();

//     // modalni ko'rsatish sharti: joriy mode da saqlanmagan o'zgarishlar mavjud va hali saveSuccess bo'lmagan
//     const shouldPrompt = Boolean(isDirty?.[mode] && !saveSuccess?.[mode]);

//     const { showModal, handleConfirm, handleCancel } = useConfirmNavigation({
//         when: shouldPrompt,
//         clearAll: () => resetMode(mode) // confirm qilinsa joriy mode dagi state tozalanadi
//     });

//     return (
//         <>
//             {children}
//             <ConfirmModalNav
//                 open={showModal}
//                 onConfirm={handleConfirm}
//                 onCancel={handleCancel}
//             />
//         </>
//     );
// }