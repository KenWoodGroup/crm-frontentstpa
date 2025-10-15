import { Outlet } from "react-router-dom";
import Sidebar from "../Components/UI/Sidebar/Sidebar";
import AdminHeader from "../Components/UI/Header/AdminHeader";
import { useState } from "react";
import FactorySidebar from "../Components/Factory/FactorySidebar/FactorySidebar";

export default function MainLayout() {
    const [active, setActive] = useState(false); // true = открыт сайдбар
    return (
        <div className="flex hello w-full overflow-hidden bg-[#FAFAFA] relative">
            <FactorySidebar open={active} onClose={() => setActive(false)} active={() => setActive(!active)} />
            <div
                className={`mt-[30px] pb-[30px] px-[15px] min-h-screen transition-all duration-300`}
                style={{
                    marginLeft: !active ? "300px" : "110px",
                    width: !active ? "calc(100% - 320px)" : "100%",
                }}
            >
                <Outlet />
            </div>
        </div>
    );
}
