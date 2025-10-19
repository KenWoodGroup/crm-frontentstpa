// src/context/WarehouseContext.js
// Per-mode WarehouseProvider: in va out uchun alohida (namespaced) state saqlaydi.
// Minimal change bilan existing reducerni qayta ishlatadi va provider APIsi oldingi kabi qoladi,
// lekin mix data, isDirty, saveSuccess va invoiceMeta per-mode bo'ladi.

import React, { createContext, useContext, useMemo, useReducer, useState, useEffect } from "react";

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
                    ((p.batch && item.batch && String(p.batch) === String(item.batch)) || (p.batch === null && item.batch === null))
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
                    id: item.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
                    barcode: item.barcode || "",
                    stock_id: item.id || null,
                    location_id: item.location_id || null,
                    price: Number(item.price) || 0,
                    product: item.product || {},
                    product_id: item.product_id || null,
                    quantity: 1,
                    batch: item.batch || null,
                    // is_new_batch may be used only by income UI; keep optional
                    is_new_batch: item.is_new_batch || false,
                    origin_price: Number(item.price || 0),
                    // stock_quantity — UI/server passed mayida mavjud bo'lsa saqlaymiz (outgoing validation uchun)
                    stock_quantity: item.stock_quantity ?? null,
                };
                return [...state, newItem];
            }
        }
        case "UPDATE_QTY":
            return state.map((it, i) => (i === action.index ? { ...it, quantity: action.value === "0" ? 0 : (action.value || "") } : it));
        case "UPDATE_PRICE":
            return state.map((it, i) => (i === action.index ? { ...it, price: Math.max(0, Number(action.value)) || "" } : it));
        case "UPDATE_BATCH":
            return state.map((it, i) => (i === action.index ? { ...it, is_new_batch: action.value || false } : it))
        case "REMOVE":
            return state.filter((_, i) => i !== action.index);
        default:
            return state;
    }
}

const WarehouseContext = createContext(null);

export function WarehouseProvider({ children, mode = "in" }) {
    // uch alohida reducer: in, out and dis
    const [mixIn, dispatchIn] = useReducer(mixReducer, []);
    const [mixOut, dispatchOut] = useReducer(mixReducer, []);
    const [mixDis, dispatchDis] = useReducer(mixReducer, [])

    // per-mode flags/object
    const [isDirty, setIsDirty] = useState({ in: false, out: false, dis: false });
    const [saveSuccess, setSaveSuccess] = useState({ in: false, out: false, dis: false });
    const [invoiceMeta, setInvoiceMeta] = useState({
        in: { sender: null, receiver: "Me", time: new Date().toLocaleString() },
        out: { sender: "Me", receiver: null, time: new Date().toLocaleString() },
        dis: { sender: "Me", receiver: "Disposal", time: new Date().toLocaleString() },
    });

    const [invoiceStarted, setInvoiceStartedRaw] = useState({ in: false, out: false, dis: false });
    const [invoiceId, setInvoiceIdRaw] = useState({ in: null, out: null, dis: null });

    // helpers to get active mix and dispatch based on current mode
    const getMix = (m) => (m === "out" ? mixOut : m === "in" ? mixIn : mixDis);
    const getDispatch = (m) => (m === "out" ? dispatchOut : m === "in" ? dispatchIn : dispatchDis);

    // local wrappers for invoiceStarted/invoiceId setters that are per-mode
    const setInvoiceStarted = (m, v) => setInvoiceStartedRaw(prev => ({ ...prev, [m]: v }));
    const setInvoiceId = (m, v) => setInvoiceIdRaw(prev => ({ ...prev, [m]: v }));

    // API: all action helpers are mode-aware
    const addItem = (item, m = mode) => {
        // item expected to include stock_quantity or stock info when adding outgoing
        if (m === "out") {
            // outgoing: do not create new batch if not present in stock (caller should provide correct batch or server id)
            // try to find matching in current mixOut
            const idxExisting = mixOut.findIndex(p => p.product.id && item.product.id && String(p.product.id) === String(item.product.id) && ((p.batch && item.batch && String(p.batch) === String(item.batch)) || (p.batch === null && item.batch === null)));
            // If not existing in mixOut, we still might allow adding if server-stock exists (caller should provide stock_quantity)
            const avail = item.quantity ?? null;
            if (idxExisting === -1 && (avail === null || avail <= 0)) {
                return { ok: false, message: "Item not available in stock (no matching batch or zero quantity)" };
            }
            // allow dispatch (will create or increment)
            dispatchOut({ type: "ADD", payload: item });
            setIsDirty(prev => ({ ...prev, out: true }));
            return { ok: true };
        } else if (m === "dis") {
            // try to find matching in current mixOut
            const idxExisting = mixDis.findIndex(p => p.product.id && item.product.id && String(p.product.id) === String(item.product.id) && ((p.batch && item.batch && String(p.batch) === String(item.batch)) || (p.batch === null && item.batch === null)));
            // If not existing in mixOut, we still might allow adding if server-stock exists (caller should provide stock_quantity)
            const avail = item.quantity ?? null;
            if (idxExisting === -1 && (avail === null || avail <= 0)) {
                return { ok: false, message: "Item not available in stock (no matching batch or zero quantity)" };
            }
            // allow dispatch (will create or increment)
            dispatchDis({ type: "ADD", payload: item });
            setIsDirty(prev => ({ ...prev, dis: true }));
            return { ok: true };
        }
        else {
            // incoming: always allow
            dispatchIn({ type: "ADD", payload: item });
            setIsDirty(prev => ({ ...prev, in: true }));
            return { ok: true };
        }
    };

    const updateQty = (index, value, m = mode) => {
        // value can be empty string, numeric or string "0" per existing reducer expectation
        let val = value;
        if (val !== "" && val !== null && val !== undefined) {
            // normalize to number if possible
            const asNum = Number(val);
            if (!Number.isNaN(asNum)) val = asNum;
        };

        if (m === "out") {
            // if (val !== "0" && !val !== "") {
            //     getDispatch(m)({ type: "UPDATE_QTY", index, value: val })
            // } else {
            //     getDispatch(m)({ type: "UPDATE_QTY", index, value })

            // }

            // clamp to stock_quantity if available
            const currentMix = getMix(m);
            const item = currentMix[index];
            const avail = Number(item?.stock_quantity || Infinity);
            if (val !== "" && val !== null && !Number.isNaN(Number(val))) {
                const clamped = Math.max(0, Math.min(Number(val), avail));
                // store as string "0" when zero to keep compatibility with reducer behavior
                const toSend = clamped === 0 ? "0" : clamped;
                getDispatch(m)({ type: "UPDATE_QTY", index, value: toSend });
            } else {
                getDispatch(m)({ type: "UPDATE_QTY", index, value: val });
            }
            setIsDirty(prev => ({ ...prev, out: true }));
        } else if (m === "dis") {
            // clamp to stock_quantity if available
            const currentMix = getMix(m);
            const item = currentMix[index];
            const avail = Number(item?.stock_quantity || Infinity);
            if (val !== "" && val !== null && !Number.isNaN(Number(val))) {
                const clamped = Math.max(0, Math.min(Number(val), avail));
                // store as string "0" when zero to keep compatibility with reducer behavior
                const toSend = clamped === 0 ? "0" : clamped;
                getDispatch(m)({ type: "UPDATE_QTY", index, value: toSend });
            } else {
                getDispatch(m)({ type: "UPDATE_QTY", index, value: val });
            }
            setIsDirty(prev => ({ ...prev, dis: true }));
        }
        else {
            getDispatch(m)({ type: "UPDATE_QTY", index, value: val });
            setIsDirty(prev => ({ ...prev, in: true }));
        }
    };

    const updatePrice = (index, value, m = mode) => {
        // price must be >= 0
        const parsed = value === "" ? "" : Math.max(0, Number(value));
        getDispatch(m)({ type: "UPDATE_PRICE", index, value: parsed });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    };

    const updateBatch = (index, value, m = mode) => {
        // outgoing UI shouldn't call this; leave support for incoming
        getDispatch(m)({ type: "UPDATE_BATCH", index, value });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    };

    const removeItem = (index, m = mode) => {
        getDispatch(m)({ type: "REMOVE", index });
        setIsDirty(prev => ({ ...prev, [m]: true }));
    };

    const resetMode = (m = mode) => {
        getDispatch(m)({ type: "RESET" });
        setInvoiceStarted(m, false);
        setInvoiceId(m, null);
        setInvoiceMeta(prev => ({ ...prev, [m]: { sender: null, receiver: "Me", time: new Date().toLocaleString() } }));
        setIsDirty(prev => ({ ...prev, [m]: false }));
        setSaveSuccess(prev => ({ ...prev, [m]: false }));
    };

    const resetAll = () => {
        dispatchIn({ type: "RESET" });
        dispatchOut({ type: "RESET" });
        dispatchDis({type:"RESET"});
        setInvoiceStartedRaw({ in: false, out: false, dis:false });
        setInvoiceIdRaw({ in: null, out: null, dis:null });
        setInvoiceMeta({
            in: { sender: null, receiver: "Me", time: new Date().toLocaleString() },
            out: { sender: "Me", receiver: null, time: new Date().toLocaleString() },
            dis: { sender: "Me", receiver: null, time: new Date().toLocaleString() }
        });
        setIsDirty({ in: false, out: false, dis:false });
        setSaveSuccess({ in: false, out: false, dis:false });
    };

    // expose a unified API but with per-mode internals
    const value = useMemo(() => ({
        // active mode
        mode,
        mixData: getMix(mode),
        mixIn,
        mixOut,
        mixDis,
        addItem,
        updateQty,
        updatePrice,
        updateBatch,
        removeItem,
        resetMode,
        resetAll,
        invoiceStarted,
        setInvoiceStarted,
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
        _dispatchDis: dispatchDis
    }), [mode, mixIn, mixOut, mixDis, isDirty, saveSuccess, invoiceMeta, invoiceStarted, invoiceId]);

    return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
    const ctx = useContext(WarehouseContext);
    if (!ctx) throw new Error("useWarehouse must be used inside WarehouseProvider");
    return ctx;
}
