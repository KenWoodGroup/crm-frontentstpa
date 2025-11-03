import { Outlet } from "react-router-dom";
import { useState } from "react";
import FactorySidebar from "../Components/Factory/FactorySidebar/FactorySidebar";
import Header from "../Components/UI/Header/Header";

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
                className="mt-[10px] pb-[30px] px-[15px] min-h-screen transition-all duration-300"
                style={{
                    marginLeft: !active ? "300px" : "110px",
                    width: !active ? "calc(100% - 320px)" : "calc(100% - 120px)",
                }}
            >
                <Header />
                <Outlet />
            </div>
        </div>
    );
}
