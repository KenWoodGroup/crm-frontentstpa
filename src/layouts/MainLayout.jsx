import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import FactorySidebar from "../Components/Factory/FactorySidebar/FactorySidebar";
import AdminHeader from "../Components/UI/Header/AdminHeader";
import { FactoryProvider } from "../context/FactoryContext";
import { useInventory } from "../context/InventoryContext";
import useConfirmNavigation from "../hooks/useConfirmNavigation";
import ConfirmModalNav from "../Components/Warehouse/WareHouseModals/ConfirmModalNav";

export default function MainLayout() {
    const [active, setActive] = useState(false); // true = открыт сайдбар
    const location = useLocation();
    const mode = location.pathname.includes("/warehouse/stockout")
        ? "out" : location.pathname.includes("/warehouse/stockin") ? "in" : "m_other";

    return (
        <div className="flex w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors relative min-h-screen">
            <FactorySidebar
                open={active}
                onClose={() => setActive(false)}
                active={() => setActive((s) => !s)}
            />
            <div
                className={`FactoryLayout ${mode === "m_other" ? "mt-[95px]" : "mt-0"}    pb-[30px] ml-[100px] px-[15px] min-h-screen transition-all duration-300`}
                style={{
                    width: "calc(100% - 100px)",
                }}
            >
                {mode === "m_other" ? <AdminHeader sidebarOpen={!active} /> : <noscript></noscript>}
                <FactoryProvider mode={mode}>
                    <InnerGuard>
                        <Outlet />
                    </InnerGuard>
                </FactoryProvider>

            </div>
        </div>
    );
};

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
};


