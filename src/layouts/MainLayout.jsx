import { Outlet } from "react-router-dom";
import { useState } from "react";
import FactorySidebar from "../Components/Factory/FactorySidebar/FactorySidebar";
import AdminHeader from "../Components/UI/Header/AdminHeader";

export default function MainLayout() {
    const [active, setActive] = useState(false); // true = открыт сайдбар

    return (
        <div className="flex w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors relative min-h-screen">
            <FactorySidebar
                open={active}
                onClose={() => setActive(false)}
                active={() => setActive((s) => !s)}
            />
            <div
                className="FactoryLayout  mt-[95px] pb-[30px] ml-[100px] px-[15px] min-h-screen transition-all duration-300"
                style={{
                    width: "calc(100% - 100px)",
                }}
            >
                <AdminHeader sidebarOpen={!active} />
                <Outlet />
            </div>
        </div>
    );
}
