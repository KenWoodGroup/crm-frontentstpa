import { useEffect } from "react";
import Cookies from "js-cookie";
import { SocketManager } from "../utils/socketManager";

export default function SocketProvider({ children }) {
    const role = Cookies.get("nesw");
    const warehouseId = Cookies.get("ul_nesw");
    const factoryId = Cookies.get("usd_nesw");

    useEffect(() => {
        if (!role) return;

        SocketManager.connect();

        if ((role === "SesdsdfmgrUID" || role === "SesdsdfmgrUIM") && warehouseId) {
            SocketManager.joinLocation(warehouseId);
        }

        if (role === "SefwfmgrUID" && factoryId) {
            SocketManager.joinLocation(factoryId);
        }

        if (role === "manager") {
            // manager faqat o‘ziga kerakli roomlar
            // masalan: monitoring yoki dashboard
        }

        return () => {
            SocketManager.disconnect();
        };
    }, [role, warehouseId, factoryId]);

    return children;
}
