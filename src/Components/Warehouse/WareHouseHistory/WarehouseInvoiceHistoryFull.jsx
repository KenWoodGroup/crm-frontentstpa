import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Pencil, ArrowLeft, Download, Filter, FileText, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import Cookies from "js-cookie";
import { notify } from "../../../utils/toast";

// WarehouseInvoiceHistory.jsx
// Senior-quality, single-file React + Tailwind component for Invoice History / Audit page.
// Features:
// - Filters bar (type, sender/receiver, client, status, date range, search)
// - Table (desktop) + Card list (mobile)
// - Column toggle / persist to localStorage
// - Pagination with persistent page state (localStorage + query params)
// - Per-invoice detail view (route: /warehouse/history/:invoiceId) fetched from API
// - Edit invoice modal & edit invoice-item modal (inline pencil icons)
// - Export CSV (client-side) and PDF placeholder
// - Excludes invoice_history and invoice_item_history from UI rendering deliberately
// - Designed to be connected to your existing backend controllers (placeholder endpoints)

// -------------------------------
// Helper utilities
// -------------------------------
const LS_KEYS = {
    PAGE: "inv_page_v1",
    PER_PAGE: "inv_per_page_v1",
    COLUMNS: "inv_cols_v1",
};

function formatDateISO(d) {
    if (!d) return null;
    const dt = new Date(d);
    return dt.toLocaleString();
}

function downloadCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(",")].concat(
        rows.map((r) => header.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// Debounce hook
function useDebounce(value, delay = 450) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

// -------------------------------
// Main component
// -------------------------------
export default function WarehouseInvoiceHistoryFull() {
    const navigate = useNavigate();
    const params = useParams(); // optional invoiceId if route is dynamic
    const [searchParams, setSearchParams] = useSearchParams();

    // Pagination persisted
    const initialPage =  Number(localStorage.getItem(LS_KEYS.PAGE)) || 1;
    // const initialPerPage = Number(searchParams.get("perPage")) || Number(localStorage.getItem(LS_KEYS.PER_PAGE)) || 15;

    const [page, setPage] = useState(initialPage);
    // const [perPage, setPerPage] = useState(initialPerPage);
    const [total, setTotal] = useState(0);

    // Filters
    const [typeFilter, setTypeFilter] = useState("all");
    const [senderFilter, setSenderFilter] = useState("all");
    const [receiverFilter, setReceiverFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchText, setSearchText] = useState("all");

    const debouncedSearch = useDebounce(searchText, 450);

    // Columns toggle (persisted)
    const defaultCols = {
        id: true,
        type: true,
        sender_name: true,
        receiver_name: true,
        createdAt: true,
        status: true,
        payment_status: true,
        total_sum: true,
        actions: true,
    };
    const [columns, setColumns] = useState(() => {
        try {
            const raw = localStorage.getItem(LS_KEYS.COLUMNS);
            return raw ? JSON.parse(raw) : defaultCols;
        } catch (e) {
            return defaultCols;
        }
    });

    // Data
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Selected invoice detail
    const invoiceId = params?.invoiceId || null;
    console.log(params);
    
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // UI modals
    const [editingInvoice, setEditingInvoice] = useState(null); // invoice being edited
    const [editingItem, setEditingItem] = useState(null);

    // per-filter option lists (fetched separately, server-side recommended)
    const [sendersList, setSendersList] = useState([]);
    const [receiversList, setReceiversList] = useState([]);
    const [statusesList] = useState(["draft", "approved", "received", "cancelled"]);
    const [typesList] = useState(["transfer_in", "return_in", "return_dis", "outgoing", "transfer_out", "disposal"]);

    // -------------------------------
    // Effects: fetch filter options (small lists) — separate endpoints recommended
    // -------------------------------
    // useEffect(() => {
    //     // NOTE: Your backend should expose endpoints like /api/senders and /api/receivers to populate filters.
    //     // Here we call placeholders.
    //     fetch("/api/filters/senders")
    //         .then((r) => r.json())
    //         .then((data) => setSendersList(data || []))
    //         .catch(() => setSendersList([]));

    //     fetch("/api/filters/receivers")
    //         .then((r) => r.json())
    //         .then((data) => setReceiversList(data || []))
    //         .catch(() => setReceiversList([]));
    // }, []);

    // -------------------------------
    // Fetch invoices list — this effect depends on all filters + pagination
    // Server-side should accept these query params and return { rows: [], total }
    // -------------------------------
    // const fetchInvoices = useCallback(async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         // construct query params
    //         const qp = new URLSearchParams();
    //         qp.set("page", page);
    //         qp.set("per_page", perPage);
    //         if (typeFilter) qp.set("type", typeFilter);
    //         if (senderFilter) qp.set("sender_id", senderFilter);
    //         if (receiverFilter) qp.set("receiver_id", receiverFilter);
    //         if (statusFilter) qp.set("status", statusFilter);
    //         if (paymentFilter) qp.set("payment_status", paymentFilter);
    //         if (fromDate) qp.set("from", fromDate);
    //         if (toDate) qp.set("to", toDate);
    //         if (debouncedSearch) qp.set("q", debouncedSearch);

    //         // update URL query params & persist page/perPage
    //         setSearchParams((old) => {
    //             const newParams = new URLSearchParams(old.toString());
    //             newParams.set("page", page);
    //             newParams.set("perPage", perPage);
    //             return newParams;
    //         });
    //         localStorage.setItem(LS_KEYS.PAGE, String(page));
    //         localStorage.setItem(LS_KEYS.PER_PAGE, String(perPage));

    //         const res = await fetch(`/api/invoices?${qp.toString()}`);
    //         if (!res.ok) throw new Error("Failed to fetch invoices");
    //         const json = await res.json();
    //         // expected { rows: [...], total: number }
    //         setInvoices(json.rows || []);
    //         setTotal(json.total || 0);
    //     } catch (err) {
    //         console.error(err);
    //         setError(err.message || "Unknown error");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [page, perPage, typeFilter, senderFilter, receiverFilter, statusFilter, paymentFilter, fromDate, toDate, debouncedSearch, setSearchParams]);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // Sana formatlash funksiyasi (YYYY-MM-DD)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    const fetchInvoices = useCallback(async () => {
        const data = {
            loc_id: Cookies.get("ul_nesw"),
            startDate: fromDate || formatDate(startOfMonth),
            endDate: toDate || formatDate(today),
            type: typeFilter || "all",
            sender: senderFilter || "all",
            receiver: receiverFilter || "all",
            status: statusFilter || "all",
            payment: paymentFilter || "all",
            search: searchText || "all",
            page: page || 1,
        }
        console.log(data);

        try {
            const res = await InvoicesApi.GetFilteredInvoices(data);
            if (res.status === 200 || res.status === 201) {
                setInvoices(res?.data?.data?.records || []);
                setTotal(res?.data?.data?.pagination?.total_count)
            }
            console.log(res);
        } catch (err) {
            notify.error(err)
        }

    }, [page, typeFilter, senderFilter, receiverFilter, statusFilter, paymentFilter, fromDate, toDate, debouncedSearch]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    // -------------------------------
    // Fetch invoice detail when route has :invoiceId
    // -------------------------------
    useEffect(() => {
        if (!invoiceId) return setSelectedInvoice(null);
        let mounted = true;
        setDetailLoading(true);
        fetch(`/api/invoices/${invoiceId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                // remove invoice_history & invoice_item_history if present
                if (data) {
                    const { invoice_history, invoice_item_history, ...rest } = data;
                    setSelectedInvoice(rest);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => mounted && setDetailLoading(false));
        return () => (mounted = false);
    }, [invoiceId]);

    // -------------------------------
    // Column toggles
    // -------------------------------
    const toggleColumn = (key) => {
        const next = { ...columns, [key]: !columns[key] };
        setColumns(next);
        localStorage.setItem(LS_KEYS.COLUMNS, JSON.stringify(next));
    };

    // -------------------------------
    // Actions: open detail, edit invoice, edit item
    // -------------------------------
    const openDetail = (id) => {
        // navigate to /warehouse/history/:id but keep query params page/perPage
        const qp = new URLSearchParams(searchParams.toString());
        // qp.set("page", page);
        // qp.set("perPage", 15);
        navigate(`/warehouse/history/${id}?${qp.toString()}`);
    };

    const closeDetail = () => {
        // navigate back to list preserving page/perPage
        const qp = new URLSearchParams(searchParams.toString());
        qp.set("page", page);
        qp.set("perPage", perPage);
        navigate(`/warehouse/history?${qp.toString()}`);
    };

    const openEditInvoice = (inv) => setEditingInvoice(inv);
    const closeEditInvoice = () => setEditingInvoice(null);
    const openEditItem = (item, invoiceId) => setEditingItem({ ...item, invoiceId });
    const closeEditItem = () => setEditingItem(null);

    // Save invoice (placeholder)
    async function saveInvoice(updated) {
        // call your backend: PATCH /api/invoices/:id
        const res = await fetch(`/api/invoices/${updated.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Failed to save");
        // refetch list & detail
        await fetchInvoices();
        if (invoiceId === updated.id) {
            // refresh detail
            const d = await (await fetch(`/api/invoices/${updated.id}`)).json();
            const { invoice_history, invoice_item_history, ...rest } = d;
            setSelectedInvoice(rest);
        }
        closeEditInvoice();
    }

    // Save invoice item (placeholder)
    async function saveItem(updated) {
        // call your backend: PATCH /api/invoice-items/:id
        const res = await fetch(`/api/invoice-items/${updated.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Failed to save item");
        // refresh detail if opened
        if (invoiceId === updated.invoiceId) {
            const d = await (await fetch(`/api/invoices/${updated.invoiceId}`)).json();
            const { invoice_history, invoice_item_history, ...rest } = d;
            setSelectedInvoice(rest);
        }
        closeEditItem();
    }

    // Export current page to CSV
    const exportCurrentToCSV = () => {
        // Build rows but remove invoice_history / invoice_item_history
        const rows = invoices.map((inv) => {
            const { invoice_history, invoice_item_history, ...rest } = inv;
            return {
                id: rest.id,
                type: rest.type,
                sender_name: rest.sender_name || (rest.sender && rest.sender.name) || "",
                receiver_name: rest.receiver_name || (rest.receiver && rest.receiver.name) || "",
                status: rest.status,
                payment_status: rest.payment_status,
                total_sum: rest.total_sum,
                createdAt: rest.createdAt,
            };
        });
        downloadCSV(`invoices_page_${page}.csv`, rows);
    };

    // -------------------------------
    // Render helpers
    // -------------------------------
    const totalPages = Math.max(1, Math.ceil(total / 15)); // /15 = /perPage if ew use select page item count

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Invoice History</h1>
                        <p className="text-sm text-gray-500">Audit, filters and exports for all warehouse operations</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => exportCurrentToCSV()} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md">
                            <Download size={16} /> <span className="text-sm">Export CSV</span>
                        </button>
                        <button onClick={() => alert('Export PDF - implement server-side or client lib')} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md">
                            <FileText size={16} /> <span className="text-sm">Export PDF</span>
                        </button>
                        <a href="/warehouse/inventory-adjustments" className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md">
                            <Copy size={16} /> <span className="text-sm">Inventory log</span>
                        </a>
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="border rounded-lg p-2">
                            <option value="">All types</option>
                            {typesList.map((t) => (
                                <option value={t} key={t}>{t}</option>
                            ))}
                        </select>

                        <select value={senderFilter} onChange={(e) => { setSenderFilter(e.target.value); setPage(1); }} className="border rounded-lg p-2">
                            <option value="">All senders</option>
                            {sendersList.map((s) => (
                                <option value={s.id} key={s.id}>{s.name}</option>
                            ))}
                        </select>

                        <select value={receiverFilter} onChange={(e) => { setReceiverFilter(e.target.value); setPage(1); }} className="border rounded-lg p-2">
                            <option value="">All receivers</option>
                            {receiversList.map((r) => (
                                <option value={r.id} key={r.id}>{r.name}</option>
                            ))}
                        </select>

                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-lg p-2">
                            <option value="">All statuses</option>
                            {statusesList.map((s) => (
                                <option value={s} key={s}>{s}</option>
                            ))}
                        </select>

                        <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border rounded-lg p-2" />
                        <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border rounded-lg p-2" />

                        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} className="border rounded-lg p-2">
                            <option value="">All payments</option>
                            <option value="paid">paid</option>
                            <option value="unpaid">unpaid</option>
                        </select>

                        <div className="flex gap-2">
                            <input value={searchText} onChange={(e) => { setSearchText(e.target.value); setPage(1); }} placeholder="Search id / barcode / batch" className="flex-1 border rounded-lg p-2 w-10" />
                        </div>

                    </div>
                    <div className="mt-2 flex justify-between">
                        <div></div>
                        <div className="flex gap-[10px]">

                            <button onClick={() => { setTypeFilter("all"); setSenderFilter("all"); setReceiverFilter("all"); setStatusFilter("all"); setPaymentFilter("all"); setFromDate(startOfMonth); setToDate(today); setSearchText(""); setPage(1); }} className="px-3 py-2 bg-gray-100 rounded-lg">Reset</button>

                            <button onClick={() => fetchInvoices()} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Apply</button>
                        </div>

                    </div>
                    {/* Columns toggle */}
                    <div className="mt-4 flex items-center gap-3">
                        <Filter size={16} />
                        <div className="flex items-center gap-2 flex-wrap">
                            {Object.keys(columns).map((k) => (
                                <label key={k} className="flex items-center gap-2 text-sm bg-gray-50 px-2 py-1 rounded">
                                    <input type="checkbox" checked={columns[k]} onChange={() => toggleColumn(k)} />
                                    <span className="capitalize">{k.replaceAll("_", " ")}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List area */}
                <div className="bg-white rounded-2xl p-4 border shadow-sm">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="py-10 text-center text-red-500">{error}</div>
                    ) : (
                        <div>
                            {/* Table for desktop */}
                            <div className="hidden md:block">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600 border-b">
                                            {columns.id && <th className="py-3 px-2">ID</th>}
                                            {columns.type && <th className="py-3 px-2">Type</th>}
                                            {columns.sender_name && <th className="py-3 px-2">Sender</th>}
                                            {columns.receiver_name && <th className="py-3 px-2">Receiver</th>}
                                            {columns.createdAt && <th className="py-3 px-2">Created</th>}
                                            {columns.status && <th className="py-3 px-2">Status</th>}
                                            {columns.payment_status && <th className="py-3 px-2">Payment</th>}
                                            {columns.total_sum && <th className="py-3 px-2">Total</th>}
                                            {columns.actions && <th className="py-3 px-2">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices?.map((inv) => (
                                            <tr key={inv.id} className="border-b hover:bg-gray-50">
                                                {columns.id && <td className="py-3 px-2 text-sm">{inv.invoice_number}</td>}
                                                {columns.type && <td className="py-3 px-2 text-sm">{inv.type}</td>}
                                                {columns.sender_name && <td className="py-3 px-2 text-sm">{inv.sender_name || (inv.sender && inv.sender.name) || "—"}</td>}
                                                {columns.receiver_name && <td className="py-3 px-2 text-sm">{inv.receiver_name || (inv.receiver && inv.receiver.name) || "—"}</td>}
                                                {columns.createdAt && <td className="py-3 px-2 text-sm">{formatDateISO(inv.createdAt)}</td>}
                                                {columns.status && <td className="py-3 px-2 text-sm">{inv.status}</td>}
                                                {columns.payment_status && <td className="py-3 px-2 text-sm">{inv.payment_status}</td>}
                                                {columns.total_sum && <td className="py-3 px-2 text-sm">{inv.total_sum}</td>}
                                                {columns.actions && <td className="py-3 px-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openDetail(inv.id)} className="text-sm px-2 py-1 rounded bg-blue-50 border">Open</button>
                                                        <button onClick={() => openEditInvoice(inv)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                                                    </div>
                                                </td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cards for mobile */}
                            <div className="md:hidden grid gap-3">
                                {invoices.map((inv) => (
                                    <div key={inv.id} className="p-3 border rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-medium">{inv.type} — {inv.id.slice(0, 8)}</div>
                                                <div className="text-xs text-gray-500">{inv.sender_name || (inv.sender && inv.sender.name)}</div>
                                                <div className="text-xs text-gray-500">{formatDateISO(inv.createdAt)}</div>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="text-sm">{inv.total_sum}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openDetail(inv.id)} className="text-sm px-2 py-1 rounded bg-blue-50 border">Open</button>
                                                    <button onClick={() => openEditInvoice(inv)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600">Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, total)} of {total}</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setPage(1); }} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">First</button>

                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded">
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>

                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded"><ChevronRight size={16} />
                                    </button>

                                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded">Last</button>

                                    {/* <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded p-1">
                                        {[10, 15, 25, 50].map((n) => (
                                            <option key={n} value={n}> {n} / page</option>
                                        ))}
                                    </select> */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail drawer/modal */}
                {invoiceId && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6">
                        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 overflow-auto max-h-[90vh]">
                            <div className="flex items-center gap-3 mb-4">
                                <button onClick={closeDetail} className="p-2 rounded hover:bg-gray-100"><ArrowLeft size={18} /></button>
                                <h2 className="text-lg font-semibold">Invoice detail</h2>
                                <div className="ml-auto text-sm text-gray-500">{detailLoading ? "Loading..." : formatDateISO(selectedInvoice?.createdAt)}</div>
                                <button onClick={() => openEditInvoice(selectedInvoice)} className="ml-3 p-2 rounded hover:bg-gray-100"><Pencil size={16} /></button>
                            </div>

                            {detailLoading ? (
                                <div className="py-10 text-center text-gray-500">Loading...</div>
                            ) : selectedInvoice ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                                            <div className="text-sm text-gray-600">Type: <span className="font-medium">{selectedInvoice.type}</span></div>
                                            <div className="text-sm text-gray-600">Status: <span className="font-medium">{selectedInvoice.status}</span></div>
                                            <div className="text-sm text-gray-600">Payment: <span className="font-medium">{selectedInvoice.payment_status}</span></div>
                                            <div className="text-sm text-gray-600">Total: <span className="font-medium">{selectedInvoice.total_sum}</span></div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold mb-2">Items</h3>
                                            <div className="space-y-3">
                                                {selectedInvoice.invoice_items.map((it) => (
                                                    <div key={it.id} className="flex items-center justify-between border rounded p-3">
                                                        <div>
                                                            <div className="text-sm font-medium">{it.product_id} — {it.batch}</div>
                                                            <div className="text-xs text-gray-500">Barcode: {it.barcode}</div>
                                                            <div className="text-xs text-gray-500">Qty: {it.quantity} × {it.price}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditItem(it, selectedInvoice.id)} className="p-2 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Optional: invoice history / item history not shown as requested */}
                                    </div>

                                    <aside className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-500">Sender</div>
                                        <div className="font-medium">{selectedInvoice.sender?.name || selectedInvoice.sender_name || "—"}</div>
                                        <div className="mt-3 text-sm text-gray-500">Receiver</div>
                                        <div className="font-medium">{selectedInvoice.receiver?.name || selectedInvoice.receiver_name || "—"}</div>

                                        <div className="mt-4 text-sm text-gray-500">Created by</div>
                                        <div className="font-medium">{selectedInvoice.created?.full_name}</div>

                                        <div className="mt-4">
                                            <button className="w-full py-2 bg-blue-600 text-white rounded-lg" onClick={() => alert('Print / download invoice')}>Print / PDF</button>
                                        </div>
                                    </aside>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-gray-500">Not found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit invoice modal */}
                {editingInvoice && (
                    <EditInvoiceModal invoice={editingInvoice} onClose={closeEditInvoice} onSave={saveInvoice} />
                )}

                {/* Edit item modal */}
                {editingItem && (
                    <EditItemModal item={editingItem} onClose={closeEditItem} onSave={saveItem} />
                )}
            </div>
        </div>
    );
}

// -------------------------------
// EditInvoiceModal - simple modal for editing basic invoice fields
// -------------------------------
function EditInvoiceModal({ invoice, onClose, onSave }) {
    const [form, setForm] = useState(() => ({ ...invoice }));
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Edit invoice</h3>
                    <div className="ml-auto text-sm text-gray-500">{invoice?.id?.slice(0, 8)}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Status</span>
                        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="border rounded p-2">
                            <option value="draft">draft</option>
                            <option value="confirmed">confirmed</option>
                            <option value="received">received</option>
                            <option value="cancelled">cancelled</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Payment status</span>
                        <select value={form.payment_status} onChange={(e) => setForm((p) => ({ ...p, payment_status: e.target.value }))} className="border rounded p-2">
                            <option value="unpaid">unpaid</option>
                            <option value="paid">paid</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Total sum</span>
                        <input type="text" value={form.total_sum} onChange={(e) => setForm((p) => ({ ...p, total_sum: e.target.value }))} className="border rounded p-2" />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Note</span>
                        <input type="text" value={form.note || ""} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="border rounded p-2" />
                    </label>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                </div>
            </div>
        </div>
    );
}

// -------------------------------
// EditItemModal - edit invoice item
// -------------------------------
function EditItemModal({ item, onClose, onSave }) {
    const [form, setForm] = useState(() => ({ ...item }));
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Edit item</h3>
                    <div className="ml-auto text-sm text-gray-500">{item?.id?.slice(0, 8)}</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Quantity</span>
                        <input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} className="border rounded p-2" />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Price</span>
                        <input type="text" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="border rounded p-2" />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Batch</span>
                        <input type="text" value={form.batch} onChange={(e) => setForm((p) => ({ ...p, batch: e.target.value }))} className="border rounded p-2" />
                    </label>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                </div>
            </div>
        </div>
    );
}
