// src/context/WarehouseContext.js
// Per-mode WarehouseProvider: in va out uchun alohida (namespaced) state saqlaydi.
// Minimal change bilan existing reducerni qayta ishlatadi va provider APIsi oldingi kabi qoladi,
// lekin mix data, isDirty, saveSuccess va invoiceMeta per-mode bo'ladi.

import React, { createContext, useContext, useMemo, useReducer, useState, useEffect, useCallback } from "react";

// mixReducer: eski WarehouseIncome dagi reducer bilan mos keladi (ADD, UPDATE_QTY, UPDATE_PRICE, UPDATE_BATCH, REMOVE, SET, RESET)

function mixReducer(state, action) {
    switch (action.type) {
        case "SET":
            return action.payload || [];
        case "RESET":
            return [];
        case "ADD": {
            const item = action.payload;
            const idx = state.findIndex(
                (p) =>
                    (p.product_id && item.product_id && String(p.product_id) === String(item.product_id)) &&
                    ((p.batch && item.batch && String(p.batch) === String(item.batch) && !p.is_new_batch) || (p.batch === null && item.batch === null && !p.is_new_batch))
            );
            if (idx !== -1) {
                const copy = [...state];
                copy[idx] = {
                    ...copy[idx],
                    quantity: Number(copy[idx].quantity || 0) + Number(1),
                };
                return copy;
            } else {
                const newItem = {
                    is_raw_stock: item.is_raw_stock,
                    name: item.name,
                    price: Number(item.price) || 0,
                    // is_new_batch may be used only by income UI; keep optional
                    is_new_batch: item.is_new_batch || false,
                    origin_price: Number(item.origin_price) || 0,
                    quantity: item.quantity,
                    unit: item.unit || "-",
                    product_id: item.product_id || null,
                    barcode: item.barcode || null,
                    batch: item.batch || null,
                    // stock_quantity — UI/server passed mayida mavjud bo'lsa saqlaymiz (outgoing validation uchun)
                    stock_quantity: item.stock_quantity ?? null,
                    fixed_qty: item.fixed_quantity ?? true,
                    discount: item.discount || 0,
                    purchase_price: Number(item.purchase_price || 0),
                    is_returning: item.is_returning
                };
                return [...state, newItem];
            }
        }
        case "ADD_PLUSQTY": {
            const item = action.payload;
            const idx = state.findIndex(
                (p) =>
                    (p.product_id && item.product_id && String(p.product_id) === String(item.product_id)) &&
                    (p.batch && item.batch && String(p.batch) === String(item.batch) && !p.is_new_batch) &&
                    (p.purchase_price && item.purchase_price && Number(p.purchase_price) === Number(item.purchase_price)) &&
                    (p.discount === item.discount)
            );
            if (idx !== -1) {
                const copy = [...state];
                copy[idx] = {
                    ...copy[idx],
                    return_quantity: Number(copy[idx].return_quantity || 0) + Number(item.return_quantity),
                };
                return copy;
            } else {
                return [...state, item];
            }
        }
        case "UPDATE_QTY":
            return state.map((it, i) => (i === action.index ? { ...it, quantity: action.value === "0" ? 0 : (action.value || "") } : it));
        case "UPDATE_PRICE":
            return state.map((it, i) => (i === action.index ? { ...it, price: Math.max(0, Number(action.value)) || "" } : it));
        case "UPDATE_BATCH":
            return state.map((it, i) => (i === action.index ? { ...it, is_new_batch: action.value || false } : it))
        case "UPDATE_DISCOUNT":
            return state.map((it, i) => (i === action.index ? { ...it, discount: Math.max(0, Number(action.value)) || "" } : it))

        case "REMOVE":
            return state.filter((_, i) => i !== action.index);
        default:
            return state;
    }
}

const InventoryContext = createContext(null);

export function InventoryProvider({ children, role = "warehouse", mode = "in" }) {
    // uch alohida reducer: in, out and dis
    const [mixIn, dispatchIn] = useReducer(mixReducer, []);
    const [mixOut, dispatchOut] = useReducer(mixReducer, []);

    // per-mode flags/object
    const [isDirty, setIsDirty] = useState({ in: false, out: false, });
    const [saveSuccess, setSaveSuccess] = useState({ in: false, out: false, });
    const [invoiceMeta, setInvoiceMeta] = useState({
        in: { sender: null, receiver: "Me", operation_type: null, time: new Date().toLocaleString() },
        out: { sender: "Me", receiver: null, operation_type: null, time: new Date().toLocaleString() },
    });
    const [returnInvoices, setReturnInvoices] = useState([])

    const [invoiceStarted, setInvoiceStartedRaw] = useState({ in: false, out: false, });
    const [invoiceId, setInvoiceIdRaw] = useState({ in: null, out: null });

    // helpers to get active mix and dispatch based on current mode
    const getMix = (m) => (m === "out" ? mixOut : mixIn);
    const getDispatch = (m) => (m === "out" ? dispatchOut : dispatchIn);

    // local wrappers for invoiceStarted/invoiceId setters that are per-mode
    const setInvoiceStarted = (m, v) => setInvoiceStartedRaw(prev => ({ ...prev, [m]: v }));
    const setInvoiceId = (m, v) => setInvoiceIdRaw(prev => ({ ...prev, [m]: v }));

    // API: all action helpers are mode-aware
    const addItem = useCallback((item, m = mode) => {
        if (m === "out") {
            // normalize incoming quantity
            const avail = item.quantity != null ? Number(item.quantity) : null;
            // try to find matching in current mixOut
            const idxExisting = mixOut.findIndex(p => p.product_id && item.product_id && String(p.product_id) === String(item.product_id) && ((p.batch && item.batch && String(p.batch) === String(item.batch)) || (p.batch === null && item.batch === null)));
            if (idxExisting === -1 && (avail === null || Number.isNaN(avail) || avail <= 0)) {
                return { ok: false, message: "Item not available in stock (no matching batch or zero quantity)" };
            }
            dispatchOut({ type: "ADD", payload: item });
            setIsDirty(prev => ({ ...prev, out: true }));
            return { ok: true };
        } else {
            // incoming: always allow
            dispatchIn({ type: "ADD", payload: item });
            setIsDirty(prev => ({ ...prev, in: true }));
            return { ok: true };
        }
    }, [mode, mixOut]);

    const addItemPlusQty = useCallback((item) => {
        dispatchIn({ type: "ADD_PLUSQTY", payload: item });
        setIsDirty(prev => ({ ...prev, in: true }));
        return { ok: true }
    }, [mixIn]);

    const updateQty = useCallback((index, value, m = mode) => {
        let val = value;
        if (val !== "" && val !== null && val !== undefined) {
            const asNum = Number(val);
            if (!Number.isNaN(asNum)) val = asNum;
        }

        if (m === "out") {
            const currentMix = getMix(m);
            const item = currentMix?.[index];
            if (!item) return;
            const avail = item.fixed_qty ? Number(item?.stock_quantity || 0) : Infinity;
            if (val !== "" && val !== null && !Number.isNaN(Number(val))) {
                const clamped = Math.max(0, Math.min(Number(val), avail));
                const toSend = clamped === 0 ? "0" : clamped;
                getDispatch(m)({ type: "UPDATE_QTY", index, value: toSend });
            } else {
                getDispatch(m)({ type: "UPDATE_QTY", index, value: val });
            }
            setIsDirty(prev => ({ ...prev, out: true }));
        } else {
            // in or other modes

            getDispatch(m)({ type: "UPDATE_QTY", index, value: val });
            setIsDirty(prev => ({ ...prev, [m]: true }));
        }
    }, [getMix, getDispatch, mode]);

    const updatePrice = useCallback((index, value, m = mode) => {
        const parsed = value === "" ? "" : Math.max(0, Number(value));
        getDispatch(m)({ type: "UPDATE_PRICE", index, value: parsed });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    }, [getDispatch, mode]);

    const updateBatch = useCallback((index, value, m = mode) => {
        // outgoing UI shouldn't call this; leave support for incoming
        getDispatch(m)({ type: "UPDATE_BATCH", index, value });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    }, [getDispatch, mode]);

    const updateDiscount = useCallback((index, value, m = mode) => {
        const parsed = value === "" ? "" : Math.max(0, Number(value));
        getDispatch(m)({ type: "UPDATE_DISCOUNT", index, value: parsed });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    }, [getDispatch, mode])

    const removeItem = useCallback((index, m = mode) => {
        getDispatch(m)({ type: "REMOVE", index });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    }, [getDispatch, mode]);

    const resetMode = useCallback((m = mode) => {
        getDispatch(m)({ type: "RESET" });
        setInvoiceStarted(m, false);
        setInvoiceId(m, null);
        setInvoiceMeta(prev => ({ ...prev, [m]: { sender: null, receiver: "Me", time: new Date().toLocaleString() } }));
        setIsDirty(prev => ({ ...prev, [m]: false }));
        setSaveSuccess(prev => ({ ...prev, [m]: false }));
    }, [getDispatch, mode]);

    const resetAll = () => {
        dispatchIn({ type: "RESET" });
        dispatchOut({ type: "RESET" });
        setInvoiceStartedRaw({ in: false, out: false, });
        setInvoiceIdRaw({ in: null, out: null });
        setInvoiceMeta({
            in: { sender: null, receiver: "Me", time: new Date().toLocaleString(), operation_type: null },
            out: { sender: "Me", receiver: null, time: new Date().toLocaleString(), operation_type: null },
        });
        setIsDirty({ in: false, out: false, });
        setSaveSuccess({ in: false, out: false, });
    };

    // expose a unified API but with per-mode internals
    const value = useMemo(() => ({
        // active mode
        role,
        mode,
        mixData: getMix(mode),
        mixIn,
        mixOut,
        addItem,
        addItemPlusQty,
        updateQty,
        updatePrice,
        updateBatch,
        updateDiscount,
        removeItem,
        resetMode,
        resetAll,
        invoiceStarted,
        setInvoiceStarted,
        returnInvoices,
        setReturnInvoices,
        invoiceId,
        setInvoiceId,
        invoiceMeta,
        // ✅ fixed: preserve previous fields like total
        setInvoiceMeta: (m, v) =>
            setInvoiceMeta(prev => ({
                ...prev,
                [m]: { ...prev[m], ...v },
            })),
        isDirty,
        setIsDirty: (m, v) => setIsDirty(prev => ({ ...prev, [m]: v })),
        saveSuccess,
        setSaveSuccess: (m, v) => setSaveSuccess(prev => ({ ...prev, [m]: v })),
        _dispatchIn: dispatchIn,
        _dispatchOut: dispatchOut,
    }), [role, mode, mixIn, mixOut, isDirty, saveSuccess, invoiceMeta, invoiceStarted, invoiceId, returnInvoices]);

    return (
        <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
    );
}

export function useInventory() {
    const ctx = useContext(InventoryContext);
    if (!ctx) throw new Error("useInventory must be used inside Provider");
    return ctx;
}
