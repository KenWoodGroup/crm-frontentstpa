// ========== src/pages/ReceivedInvoices/ReceivedInvoices.jsx ==========
import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceCard from "./_components/InvoiceCard";
import InvoiceDrawer from "./_components/InvoiceDrawer";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import Cookies from "js-cookie";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { notify } from "../../../utils/toast";
import { useInventory } from "../../../context/InventoryContext";
import { useNavigate } from "react-router-dom";
import { useNotifyStore } from "../../../store/useNotifyStore";

export default function ReceivedInvoices() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedSeen, setSelectedSeen] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false);
    const userLid = Cookies.get("ul_nesw");
    const userId = Cookies.get("us_nesw");
    const { unreadCount } = useNotifyStore();
    const [selectedInv, setSelectedInv] = useState({})


    // pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil((total || 0) / 15));

    // invoice 
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);

    // Context (per-mode provider)
    const {
        mode, // 'in' or 'out' provided by WarehouseLayout -> WarehouseProvider
        mixData,
        addItem,
        updateQty,
        updatePrice,
        updateSPrice,
        updateBatch,
        removeItem,
        resetMode,
        invoiceStarted, // object { in, out }
        setInvoiceStarted, // fn (mode, value)
        invoiceId, // object { in, out }
        setInvoiceId, // fn (mode, value)
        returnInvoices,
        setReturnInvoices,
        selectedSalePriceType,
        setSelectedSalePriceType,
        invoiceMeta, // object { in: {...}, out: {...} }
        setInvoiceMeta, // fn (mode, value)
        setIsDirty, // fn (mode, value)
        saveSuccess, // object { in, out }
        setSaveSuccess, // fn (mode, value)
    } = useInventory();


    useEffect(() => {
        fetchInvoices();
    }, [page, unreadCount]);

    async function fetchInvoices() {
        setLoading(true);
        setError(null);
        try {
            // Example GET - adapt URL/params to your backend
            const res = await InvoicesApi.GetInvoiceNotifications(userLid, page);
            // adapt to your response shape (sample you provided has data.records)
            const records = res.data?.data ?? {};
            setData(records);
            setTotal(res.data?.data?.pagination?.total_count)
        } catch (err) {
            console.error(err);
            setError('Ro\'yxatni yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    }

    function handleView(id, seen) {
        setSelectedId(id);
        setSelectedSeen(seen)
        setDrawerOpen(true);
    }

    function handleCloseDrawer() {
        setDrawerOpen(false);
        setSelectedId(null);
    };

    // ---------- Normalize & add to mixData (uses context addItem) ----------
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined;
        // const sspt_id = selectedSalePriceType?.[mode]?.value;
        // const spts = raw.sale_price_type || [];
        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: (is_raw_stock && raw.batch) ? false : true,
            name: productObj.name,
            price: Number(raw.purchase_price || 0),
            origin_price: Number(raw.purchase_price || 0),
            quantity: raw.quantity || 1,
            unit: productObj.unit,
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id,
            barcode: raw.barcode || null,
            batch: is_raw_stock ? (raw.batch || "def") : null,
            is_returning: false,
            // s_price_types: spts,
            // s_price: (sspt_id && spts.length > 0) ? spts.find((t) => t.price_type_id === sspt_id)?.sale_price || 0 : 0,
        };
    };

    function addItemToMixData(raw) {
        const item = normalizeIncomingItem(raw);
        // addItem in provider will respect mode (incoming allows new batch; outgoing validates existence)
        const res = addItem(item); // provider default mode = provided mode at creation
        if (res && res.ok === false) {
            notify.error(res.message || t("save_error"));
        }
    };

    const startInvoice = async () => {
        const type = "transfer_in"
        const sender_name = selectedInv?.sender_name
        const receiver_name = selectedInv?.receiver_name
        try {
            setCreateInvoiceLoading(true);
            const payload = {
                type,
                sender_id: selectedInv?.sender_id,
                receiver_id: userLid,
                receiver_name,
                sender_name,
                created_by: userId,
                status: "received",
                note: "",
            };
            const res = await InvoicesApi.CreateInvoice(payload);

            // robust id extraction
            const invoice_id = res?.data?.invoice?.id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error(t("server_invoice_id_missing"));
                    throw new Error("Invoice id topilmadi");
                }

                setInvoiceId(mode, invoice_id);
                setInvoiceStarted(mode, true);
                setInvoiceMeta(mode, {
                    sender: sender_name,
                    receiver: receiver_name,
                    time: new Date(res.data?.invoice?.createdAt).toLocaleString("uz-UZ", {
                        timeZone: "Asia/Tashkent",
                    }),
                    operation_type: type
                });
                setIsDirty(mode, true);
                // add each product there
                for (const product of selectedInv?.invoice_items) {
                    addItemToMixData(product);
                }
                notify.success(t("start_invoice_success_transfer"));
                navigate("/warehouse/stockin")
            } else {
                throw new Error("Invoice yaratishda xato");
            }
        } catch (err) {
            notify.error(t("invoice_creation_error") + ": " + (err?.message || err));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };


    console.log(selectedInv);



    return (
        <div className="p-6 min-h-screen transition-all duration-300 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 relative">
                    <h1 className="text-2xl font-semibold text-slate-900 relative inline-flex items-center gap-2">
                        Kelib tushgan jo'natmalar
                        {/* Notification badge */}
                        {data?.new > 0 &&
                            <span className="absolute -top-2 -right-6 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {data?.new}
                            </span>
                        }
                    </h1>
                </div>


                {loading && (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 transition-all duration-300 bg-card-light dark:bg-card-dark border border-gray-200 rounded-md shadow-sm animate-pulse h-28"></div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-4">
                        {data?.records?.length === 0 && (
                            <div className="p-6 transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark border border-gray-200 rounded text-center text-gray-600">Hech qanday invoice topilmadi</div>
                        )}

                        {data?.records?.map(inv => (
                            <InvoiceCard key={inv.id} invoice={inv} onView={() => handleView(inv.id, inv.seen)} />
                        ))}
                    </div>
                )}

                {/* Drawer */}
                <InvoiceDrawer
                    setSelectedInv={setSelectedInv}
                    reload={() => fetchInvoices()}
                    seen={selectedSeen}
                    isOpen={drawerOpen}
                    invoiceId={selectedId}
                    onClose={handleCloseDrawer}
                    startLoading={createInvoiceLoading}
                    onApplied={startInvoice}
                />
            </div>
            <div className="max-w-6xl mx-auto mt-4 flex items-center flex-wrap justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("invoices.showing_range", {
                        from: (page - 1) * 15 + 1,
                        to: Math.min(page * 15, total),
                        total,
                    })}
                </div>
                <div className="flex items-center flex-wrap gap-2">
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded disabled:opacity-50"
                    >
                        {t("pagination.first")}
                    </button>

                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded"
                        aria-label={t("pagination.previous")}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded">
                        {t("pagination.page_of", { page, totalPages })}
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded"
                        aria-label={t("pagination.next")}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded"
                    >
                        {t("pagination.last")}
                    </button>
                </div>
            </div>
        </div>
    );
}


