// src/layouts/WarehouseLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import { WarehouseProvider, useWarehouse } from "../context/WarehouseContext";
import useConfirmNavigation from "../hooks/useConfirmNavigation";
import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";
import Header from "../Components/UI/Header/Header";
import CompanyWarehouseSidebar from "../Components/Company-Warehouse/CompanyWarehouseSidebar/CompanyWarehouseSidebar";

export default function CompanyWarehouseLayout() {
    const location = useLocation();
    const mode = location.pathname.includes("/warehouse/stockout")
        ? "out" : "in";

    return (
        <div className={` bg-background-light dark:bg-background-dark transition-colors  min-h-screen duration-300 pl-[125px]`}>
            <CompanyWarehouseSidebar />
            <div className="pt-[10px] pr-[10px]">
                <Header />
                <Outlet />
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
