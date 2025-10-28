import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AsyncSelect from 'react-select/async';
import { Pencil, ArrowLeft, Download, Filter, FileText, ChevronLeft, ChevronRight, Copy, Loader2 } from "lucide-react";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { location } from "../../../utils/Controllers/location";
import Cookies from "js-cookie";
import { notify } from "../../../utils/toast";
import Select from "react-select";
/*
  WarehouseInvoiceHistory.jsx
  - Keeps full original logic but modernized and fixed per requirements
  - PER_PAGE fixed to 15
  - sender/receiver use AsyncSelect but loadLocations uses controller
  - payload ALWAYS sends keys; if user didn't choose value we send "all"
  - date inputs default to start of month and today
  - search is debounced (doesn't call on every keystroke)
  - invoice id matches in table are highlighted with <mark>
*/

const LS_KEYS = {
    PAGE: "inv_page_v1",
    COLUMNS: "inv_cols_v1",
};

const PER_PAGE = 15;

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

function formatDateISO(d) {
    if (!d) return "-";
    const dt = new Date(d);
    return dt.toLocaleString();
}

function formatDateYMD(date) {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function downloadCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(",")].concat(
        rows.map((r) => header.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([csv.join("")], { type: "text / csv; charset = utf - 8; " });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// debounce hook
function useDebounce(value, delay = 450) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

export default function WarehouseInvoiceHistory() {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialPage = Number(localStorage.getItem(LS_KEYS.PAGE)) || 1;

    // pagination
    const [page, setPage] = useState(initialPage);
    const [total, setTotal] = useState(0);

    // filters
    const [typeFilter, setTypeFilter] = useState("all");
    const [senderFilter, setSenderFilter] = useState(null); // { value: id, label: name }
    const [receiverFilter, setReceiverFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [fromDate, setFromDate] = useState(formatDateYMD(startOfMonth));
    const [toDate, setToDate] = useState(formatDateYMD(today));

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 550);

    const [columns, setColumns] = useState(() => {
        try {
            const raw = localStorage.getItem(LS_KEYS.COLUMNS);
            return raw ? JSON.parse(raw) : defaultCols;
        } catch (e) {
            return defaultCols;
        }
    });

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // detail
    const invoiceId = params?.invoiceId || null;
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // UI
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [editingStatusInvoice, setEditingStatusInvoice] = useState(null)
    const [editingItem, setEditingItem] = useState(null);

    const [loadingEditStatus, setLoadingEditStatus] = useState(false)

    // small lists
    const statusesList = ["draft", "approved", "received", "cancelled"];
    const typesList = ["transfer_in", "return_in", "return_dis", "outgoing", "transfer_out", "disposal"];

    const nice = {
        type: {
            transfer_in: "Transfer (in)",
            return_in: "Return (in)",
            return_dis: "Return (dis)",
            outgoing: "Outgoing",
            transfer_out: "Transfer (out)",
            disposal: "Disposal",
        },
        status: {
            draft: "Draft",
            sent: 'Sent',
            received: "Received",
            cancelled: "Cancelled",
        },
        payment: {
            paid: "Paid",
            unpaid: "Unpaid",
        },
    };

    function typeBadge(t) {
        const map = {
            transfer_in: "bg-green-100 text-green-700",
            transfer_out: "bg-blue-100 text-blue-700",
            outgoing: "bg-yellow-100 text-yellow-800",
            return_in: "bg-indigo-100 text-indigo-700",
            return_dis: "bg-red-100 text-red-700",
            disposal: "bg-red-50 text-red-700",
        };
        return <span className={`px-2 py-0.5 text-xs rounded ${map[t] || "bg-gray-100 text-gray-700"}`}>{nice.type[t] || t}</span>;
    }

    function statusBadge(s) {
        const map = {
            draft: "bg-gray-100 text-gray-700",
            received: "bg-green-100 text-green-700",
            sent: "bg-blue-100 text-blue-700",
            cancelled: "bg-red-100 text-red-700",
        };
        return <span className={`px-2 py-0.5 text-xs rounded ${map[s] || "bg-gray-100 text-gray-700"}`}>{nice.status[s] || s}</span>;
    }

    function paymentBadge(p) {
        const map = {
            paid: "bg-green-50 text-green-700",
            unpaid: "bg-yellow-50 text-yellow-700",
        };
        return <span className={`px-2 py-0.5 text-xs rounded ${map[p] || "bg-gray-100 text-gray-700"}`}>{nice.payment[p] || p}</span>;
    }

    const toggleColumn = (k) => {
        const next = { ...columns, [k]: !columns[k] };
        setColumns(next);
        localStorage.setItem(LS_KEYS.COLUMNS, JSON.stringify(next));
    };

    // locations cache (loaded once)
    const [locations, setLocations] = useState([]);

    const getLocations = async () => {
        try {
            const baseId = Cookies.get("ul_nesw");
            const res = await location.getAllGroupLocations(baseId);
            const items = (res?.data || []).map((l) => ({ value: l.id, label: l.name }));
            // add "all" option
            setLocations([{ value: "all", label: "All locations" }, ...items]);
        } catch (err) {
            console.error(err);
            notify.error("Failed to load locations");
        }
    };
    useEffect(() => {
        // (async () => {
        //     try {
        //         const baseId = Cookies.get("ul_nesw");
        //         const res = await location.getAllGroupLocations(baseId);
        //         const items = (res?.data || []).map((l) => ({ value: l.id, label: l.name }));
        //         // add "all" option
        //         setLocationsCache([{ value: "all", label: "All locations" }, ...items]);
        //     } catch (err) {
        //         console.error(err);
        //         notify.error("Failed to load locations");
        //     }
        // })();
        getLocations()
    }, []);

    // loadOptions for AsyncSelect - uses cached list to avoid repeated server calls
    // const loadLocations = async (inputValue) => {
    //     if (!inputValue) return locationsCache;
    //     const q = inputValue.toLowerCase();
    //     return locationsCache.filter((o) => o.label.toLowerCase().includes(q));
    // };

    // Sender/Receiver auto-fill logic: if user selects receiver (not 'all') we set sender to current loc, and vice-versa
    // useEffect(() => {
    //     const baseId = Cookies.get("ul_nesw");
    //     if (receiverFilter && receiverFilter.value && receiverFilter.value !== "all") {
    //         // ensure sender is current warehouse
    //         setSenderFilter({ value: baseId, label: locationsCache.find((l) => l.value === baseId)?.label || baseId });
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [receiverFilter]);

    // useEffect(() => {
    //     const baseId = Cookies.get("ul_nesw");
    //     if (senderFilter && senderFilter.value && senderFilter.value !== "all") {
    //         setReceiverFilter({ value: baseId, label: locationsCache.find((l) => l.value === baseId)?.label || baseId });
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [senderFilter]);

    // fetch invoices - payload must include all keys (send "all" when nothing selected)
    const fetchInvoices = useCallback(async (opts = {}) => {
        setLoading(true);
        setError(null);

        const payload = {
            loc_id: Cookies.get("ul_nesw"),
            startDate: fromDate || formatDateYMD(startOfMonth),
            endDate: toDate || formatDateYMD(today),
            type: typeFilter || "all",
            sender: senderFilter?.value ?? "all",
            receiver: receiverFilter?.value ?? "all",
            status: statusFilter || "all",
            payment: paymentFilter || "all",
            search: debouncedSearch || "all",
            page: page || 1,
            per_page: PER_PAGE,
            ...opts,
        };

        try {
            const res = await InvoicesApi.GetFilteredInvoices(payload);
            if (res?.status === 200 || res?.status === 201) {
                setInvoices(res?.data?.data?.records || []);
                setTotal(res?.data?.data?.pagination?.total_count || 0);
            } else {
                setInvoices([]);
                setTotal(0);
            }
        } catch (err) {
            console.error(err);
            setError(err?.message || "Failed to fetch invoices");
            notify.error(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    }, [typeFilter, senderFilter, receiverFilter, statusFilter, paymentFilter, fromDate, toDate, debouncedSearch, page]);

    // trigger fetch when page or query params change
    useEffect(() => {
        localStorage.setItem(LS_KEYS.PAGE, String(page));
        const qp = new URLSearchParams(searchParams.toString());
        qp.set("page", page);
        qp.set("perPage", String(PER_PAGE));
        setSearchParams(qp);
        fetchInvoices();
    }, [fetchInvoices, page]);

    // re-run when filters / dates / search change - reset page to 1
    useEffect(() => {
        setPage(1);
        fetchInvoices();
    }, [typeFilter, senderFilter, receiverFilter, statusFilter, paymentFilter, fromDate, toDate, debouncedSearch]);

    // initial sync from query params
    useEffect(() => {
        const qpPage = Number(searchParams.get("page")) || initialPage;
        setPage(qpPage);
        fetchInvoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetch invoice detail when route :invoiceId present
    useEffect(() => {
        if (!invoiceId) return setSelectedInvoice(null);
        let mounted = true;
        setDetailLoading(true);
        (async () => {
            try {
                const res = await InvoicesApi.GetInvoiceById(invoiceId);
                if (!mounted) return;
                if (res?.status === 200 || res?.status === 201) {
                    const d = res?.data?.data || res?.data || res;
                    const { invoice_history, invoice_item_history, ...rest } = d;
                    setSelectedInvoice(rest);
                } else {
                    setSelectedInvoice(null);
                }
            } catch (err) {
                console.error(err);
                notify.error(err?.message || "Failed to load invoice");
            } finally {
                mounted && setDetailLoading(false);
            }
        })();
        return () => (mounted = false);
    }, [invoiceId]);

    const openDetail = (id) => {
        const qp = new URLSearchParams(searchParams.toString());
        qp.set("page", String(page));
        qp.set("perPage", String(PER_PAGE));
        navigate(`/warehouse/history/${id}?${qp.toString()}`);
    };

    const closeDetail = () => {
        const qp = new URLSearchParams(searchParams.toString());
        qp.set("page", String(page));
        qp.set("perPage", String(PER_PAGE));
        navigate(`/warehouse/history?${qp.toString()}`);
    };

    const openEditInvoice = (inv) => setEditingInvoice(inv);
    const closeEditInvoice = () => setEditingInvoice(null);
    const openEditItem = (item, invoiceId) => setEditingItem({ ...item, invoiceId });
    const closeEditItem = () => setEditingItem(null);

    async function saveInvoice(updated) {
        try {
            const res = await InvoicesApi.UpdateInvoice(updated.id, updated);
            if (!(res?.status === 200 || res?.status === 201)) throw new Error("Failed to save");
            await fetchInvoices();
            if (invoiceId === updated.id) {
                const fresh = await InvoicesApi.GetInvoiceById(updated.id);
                const d = fresh?.data?.data || fresh?.data || fresh;
                const { invoice_history, invoice_item_history, ...rest } = d;
                setSelectedInvoice(rest);
            }
            closeEditInvoice();
            notify.success("Saved");
        } catch (err) {
            console.error(err);
            notify.error(err?.message || "Save failed");
        }
    }
    async function saveStatusInvoice(updated) {
        setLoadingEditStatus(true)
        try {
            const res = await InvoicesApi.EditStatusInvoice(updated.id, { status: updated?.status?.value });
            if (!(res?.status === 200 || res?.status === 201)) throw new Error("Failed to save");
            await fetchInvoices();
            // if (invoiceId === updated.id) {
            //     const fresh = await InvoicesApi.GetInvoiceById(updated.id);
            //     const d = fresh?.data?.data || fresh?.data || fresh;
            //     const { invoice_history, invoice_item_history, ...rest } = d;
            //     setSelectedInvoice(rest);
            // }
            setEditingStatusInvoice(null)
            notify.success("Saved");
        } catch (err) {
            console.error(err);
            notify.error(err?.message || "Save failed");
        } finally {
            setLoadingEditStatus(false)
        }
    }

    async function saveItem(updated) {
        try {
            const res = await InvoicesApi.UpdateInvoiceItem(updated.id, updated);
            if (!(res?.status === 200 || res?.status === 201)) throw new Error("Failed to save item");
            if (invoiceId === updated.invoiceId) {
                const fresh = await InvoicesApi.GetInvoiceById(updated.invoiceId);
                const d = fresh?.data?.data || fresh?.data || fresh;
                const { invoice_history, invoice_item_history, ...rest } = d;
                setSelectedInvoice(rest);
            }
            closeEditItem();
            notify.success("Item saved");
        } catch (err) {
            console.error(err);
            notify.error(err?.message || "Save item failed");
        }
    }

    const exportCurrentToCSV = () => {
        const rows = invoices.map((inv) => {
            const { invoice_history, invoice_item_history, ...rest } = inv;
            return {
                id: rest.id,
                invoice_number: rest.invoice_number,
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

    function highlightMatch(text, query) {
        if (!query) return text;
        const safe = String(query).replace(`/[.*+?^${text}()|[\]\]/g, "\$&"`);
        const regex = new RegExp(`(${safe})`, "gi");
        return String(text).replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    }

    const totalPages = Math.max(1, Math.ceil((total || 0) / PER_PAGE));

    return (
        <div className=" bg-gray-50 min-h-screen px-4 py-3 rounded-xl">
            <div className=" mx-auto">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Invoice History</h1>
                        <p className="text-sm text-gray-500">Audit, filters and exports for all warehouse operations</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={exportCurrentToCSV} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md">
                            <Download size={16} /> <span className="text-sm">Export CSV</span>
                        </button>
                        <button onClick={() => alert("Export PDF - implement server-side or client lib")} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md">
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
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-lg p-2">
                            <option value="all">All types</option>
                            {typesList.map((t) => (
                                <option value={t} key={t}>{nice.type[t] || t}</option>
                            ))}
                        </select>

                        <Select
                            options={locations}
                            value={senderFilter}
                            onChange={(v) => setSenderFilter(v)}
                            placeholder="Sender (search...)"
                            isClearable
                            isSearchable
                        />

                        <Select
                            options={locations}
                            value={receiverFilter}
                            onChange={(v) => setReceiverFilter(v)}
                            placeholder="Receiver (search...)"
                            isClearable
                            isSearchable
                        />

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg p-2">
                            <option value="all">All statuses</option>
                            {statusesList.map((s) => (
                                <option value={s} key={s}>{nice.status[s] || s}</option>
                            ))}
                        </select>

                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-lg p-2" />
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-lg p-2" />

                        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border rounded-lg p-2">
                            <option value="all">All payments</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>

                        <div className="flex gap-2">
                            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search id / Receiver or Sender name" className="flex-1 border rounded-lg p-2 w-10" />
                        </div>
                    </div>

                    <div className="mt-2 flex justify-between">
                        <div />
                        <div className="flex gap-[10px]">
                            <button
                                onClick={() => {
                                    setTypeFilter("all");
                                    setSenderFilter(null);
                                    setReceiverFilter(null);
                                    setStatusFilter("all");
                                    setPaymentFilter("all");
                                    setFromDate(formatDateYMD(startOfMonth));
                                    setToDate(formatDateYMD(today));
                                    setSearchText("");
                                    setPage(1);
                                }}
                                className="px-3 py-2 bg-gray-100 rounded-lg"
                            >
                                Reset
                            </button>

                            <button onClick={() => fetchInvoices()} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Apply</button>
                        </div>
                    </div>

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
                                                {columns.id && <td className="py-3 px-2 text-sm" dangerouslySetInnerHTML={{ __html: highlightMatch(inv.invoice_number || inv.id, searchText) }} />}
                                                {columns.type && <td className="py-3 px-2 text-sm">{typeBadge(inv.type)}</td>}
                                                {columns.sender_name && <td className="py-3 px-2 text-sm">{inv.sender_name || (inv.sender && inv.sender.name) || "—"}</td>}
                                                {columns.receiver_name && <td className="py-3 px-2 text-sm">{inv.receiver_name || (inv.receiver && inv.receiver.name) || "—"}</td>}
                                                {columns.createdAt && <td className="py-3 px-2 text-sm">{formatDateISO(inv.createdAt)}</td>}
                                                {columns.status && <td className="py-3 px-2 text-sm"><button onClick={() => setEditingStatusInvoice(inv)} type="button">{statusBadge(inv.status)}</button></td>}
                                                {columns.payment_status && <td className="py-3 px-2 text-sm">{paymentBadge(inv.payment_status)}</td>}
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

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600">Showing {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, total)} of {total}</div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">First</button>

                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded">
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>

                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded"><ChevronRight size={16} />
                                    </button>

                                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 border rounded">Last</button>
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
                                            <div className="text-sm text-gray-600">Type: <span className="font-medium">{nice.type[selectedInvoice.type] || selectedInvoice.type}</span></div>
                                            <div className="text-sm text-gray-600">Status: <span className="font-medium">{nice.status[selectedInvoice.status] || selectedInvoice.status}</span></div>
                                            <div className="text-sm text-gray-600">Payment: <span className="font-medium">{selectedInvoice.payment_status}</span></div>
                                            <div className="text-sm text-gray-600">Total: <span className="font-medium">{selectedInvoice.total_sum}</span></div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold mb-2">Items</h3>
                                            <div className="space-y-3">
                                                {(selectedInvoice.invoice_items || []).map((it) => (
                                                    <div key={it.id} className="flex items-center justify-between border rounded p-3">
                                                        <div>
                                                            <div className="text-sm font-medium">{it.product.name} — {it.batch}</div>
                                                            <div className="text-xs text-gray-500">Barcode: {it.barcode}</div>
                                                            <div className="text-xs text-gray-500">Qty: {it.quantity + " " + it.product.unit} × Pirce: {it.price} Total: {+it.quantity * +it.price}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditItem(it, selectedInvoice.id)} className="p-2 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

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

                {editingInvoice && (
                    <EditInvoiceModal invoice={editingInvoice} onClose={closeEditInvoice} onSave={saveInvoice} />
                )}

                {editingItem && (
                    <EditItemModal item={editingItem} onClose={closeEditItem} onSave={saveItem} />
                )}

                {editingStatusInvoice && (
                    <EditStatusModal invoice={editingStatusInvoice} onClose={() => setEditingStatusInvoice(null)} onSave={saveStatusInvoice} loading={loadingEditStatus} />
                )}

            </div>
        </div>
    );
}

function EditInvoiceModal({ invoice, onClose, onSave }) {
    const [form, setForm] = useState(() => ({ ...invoice, org_status: invoice?.status }));
    useEffect(() => {
        setForm(prev => ({ ...invoice, org_status: invoice?.status || prev.org_status }));
    }, [invoice]);
    const statusBase = [
        { id: 1, value: "draft", label: "Draft" },
        { id: 3, value: "cancelled", label: "Cancelled" },
        { id: 4, value: "sent", label: "Sent" },
        { id: 5, value: "received", label: "Received" }
    ]
    const org_status_id = statusBase.find((st) => st.value === form.org_status)?.id
    const statusOptions = statusBase?.filter((st) => st.id > org_status_id)
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Edit invoice</h3>
                    <div className="ml-auto text-sm text-gray-500">{invoice?.invoice_number}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Status</span>
                        {/* <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="border rounded p-2">

                            <option value="draft">draft</option>
                            <option value="approved">confirmed</option>
                            <option value="sent">sent</option>
                            <option value="received">received</option>
                            <option value="cancelled">cancelled</option>
                        </select> */}
                        <Select
                            placeholder="Select new status"
                            options={statusOptions}
                            value={form.status}
                            onChange={(e) => setForm((p) => ({ ...p, status: e }))}
                        />

                    </label>
                    {/* <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Payment status</span>
                        <select value={form.payment_status} onChange={(e) => setForm((p) => ({ ...p, payment_status: e.target.value }))} className="border rounded p-2">
                            <option value="unpaid">unpaid</option>
                            <option value="paid">paid</option>
                        </select>
                    </label> */}

                    {/* <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Total sum</span>
                        <input type="text" value={form.total_sum} onChange={(e) => setForm((p) => ({ ...p, total_sum: e.target.value }))} className="border rounded p-2" />
                    </label> */}

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

function EditStatusModal({ invoice, onClose, onSave, loading }) {
    const [form, setForm] = useState(() => ({ ...invoice, org_status: invoice?.status }));
    useEffect(() => {
        setForm(prev => ({ ...invoice, org_status: invoice?.status || prev.org_status }));
    }, [invoice]);
    const statusBase = [
        { id: 1, value: "draft", label: "Draft" },
        { id: 3, value: "cancelled", label: "Cancelled" },
        { id: 4, value: "sent", label: "Sent" },
        { id: 5, value: "received", label: "Received" }
    ];
    const org_status_id = statusBase.find((st) => st.value === form.org_status)?.id
    const statusOptions = statusBase?.filter((st) => st.id > org_status_id)
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Edit Status</h3>
                    <div className="ml-auto text-sm text-gray-500">{invoice?.invoice_number}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600">Status</span>
                        <Select
                            placeholder="Select new status"
                            options={statusOptions}
                            value={form.status}
                            onChange={(e) => setForm((p) => ({ ...p, status: e }))}
                        />

                    </label>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updatinging...</span>
                        </>
                    ) : (
                        <button onClick={() => onSave(form)} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EditItemModal({ item, onClose, onSave }) {
    const [form, setForm] = useState(() => ({ ...item }));
    useEffect(() => setForm({ ...item }), [item]);
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
