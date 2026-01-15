import { useEffect } from "react";
import socket from "../utils/Socket";

export function useStockSocket({ locationId, onUpdate }) {
  useEffect(() => {
    if (!locationId) return;

    socket.connect();
    socket.emit("joinLocation", locationId);

    socket.on("stockUpdate", () => {
      onUpdate?.();
    });

    return () => {
      socket.off("stockUpdate");
      socket.disconnect();
    };
  }, [locationId, onUpdate]);
}
