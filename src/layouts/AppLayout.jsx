import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function AppLayout() {
    // useEffect(() => {
    //     const savedFont = localStorage.getItem("textFontSize");

    //     if (savedFont) {
    //         const base = 16;
    //         const scale = Number(savedFont) / base;


    //         document.documentElement.style.setProperty("--font-scale", scale);
    //     } else {
    //         document.documentElement.style.setProperty("--font-scale", 1);
    //     }
    // }, []);

    return (
        <div>
            <Outlet />
        </div>
    );
}
