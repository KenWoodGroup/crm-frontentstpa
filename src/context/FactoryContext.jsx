import React from "react";
import { InventoryProvider } from "./InventoryContext";

export function FactoryProvider({ children, mode = "in" }) {
    return (
        <InventoryProvider role="factory" mode={mode}>
            {children}
        </InventoryProvider>
    );
}