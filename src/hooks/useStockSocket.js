import { useEffect } from "react";
import { SocketManager } from "../utils/socketManager";

export function useStockSocket({ locationId, onUpdate }) {
  useEffect(() => {
    if (!locationId) return;

    SocketManager.joinLocation(locationId);

    const handler = () => {
      onUpdate?.();
    };

    SocketManager.on("stockUpdate", handler);

    return () => {
      SocketManager.off("stockUpdate", handler);
    };
  }, [locationId, onUpdate]);
}
