import React from "react";
import { InventoryProvider } from "./InventoryContext";

export function IndependentProvider({ children, mode = "in" }) {
    return (
        <InventoryProvider role="independent" mode={mode}>
            {children}
        </InventoryProvider>
    );
}