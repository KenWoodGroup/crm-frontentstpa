import { Outlet } from "react-router-dom";
import { useState } from "react";
import ManagerSidebar from "../Components/Manager/ManagerSidebar/ManagerSidebar";

export default function ManagerLayout() {
    const [active, setActive] = useState(false); // true = открыт сайдбар

    return (
        <div className="flex w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors relative min-h-screen">
            <ManagerSidebar open={active} onClose={() => setActive(false)} active={() => setActive(!active)} />
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
