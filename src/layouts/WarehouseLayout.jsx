import { Outlet } from "react-router-dom";
import Sidebar from "../Components/UI/Sidebar/Sidebar";
import AdminHeader from "../Components/UI/Header/AdminHeader";
import { useState } from "react";
import FactorySidebar from "../Components/Factory/FactorySidebar/FactorySidebar";
import WarehouseSidebar from "../Components/Warehouse/WarehouseSideBar/WarehouseSidebar";

export default function WarehouseLayout() {
    const [active, setActive] = useState(false);
    return (
        <div className="flex w-full overflow-hidden bg-[#FAFAFA] relative">
            <WarehouseSidebar open={active} onClose={() => setActive(false)} />
            <div
                className={`mt-[110px] pb-[30px] px-[15px] min-h-screen transition-all duration-300`}
                style={{
                    marginLeft: !active ? "300px" : "110px",
                    width: !active ? "calc(100% - 320px)" : "100%",
                }}
            >
                <AdminHeader active={() => setActive(!active)} sidebarOpen={!active} />
                <Outlet />
            </div>
        </div>
    );
}
