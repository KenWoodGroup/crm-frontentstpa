import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AsyncSelect from 'react-select/async';
import { Pencil, ArrowLeft, Download, Filter, FileText, ChevronLeft, ChevronRight, Copy, Loader2 } from "lucide-react";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { location } from "../../../utils/Controllers/location";
import Cookies from "js-cookie";
import { notify } from "../../../utils/toast";
import Select from "react-select";
import CancelInvoiceButton from "../WareHouseOutcome/sectionsWhO/CancelInvoiceButton";
import { customSelectStyles } from "../WareHouseModals/ThemedReactTagsStyles";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    const defaultColsLabels = {
        id: "ID",
        type: t("table.type"),
        sender_name: t("table.sender"),
        receiver_name: t("table.receiver"),
        createdAt: t("table.created"),
        status: t("table.status"),
        payment_status: t("table.payment"),
        total_sum: t("table.total"),
        actions: t("table.actions"),
    };
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
    const statusesList = ["draft", "sent", "received", "cancelled"];
    const typesList = ["transfer_in", "incoming", "return_in", "return_dis", "outgoing", "transfer_out", "disposal"];

    const nice = {
        type: {
            incoming: `${t("op_incoming_card")}`,
            transfer_in: `${t("op_transfer_card")}`,
            return_in: `${t("op_return_card")}`,
            return_dis: `${t("return_disposal_label")}`,
            outgoing: `${t("type.outgoing_label")}`,
            transfer_out: `${t("type.transfer_out_label")}`,
            disposal: `${t("type.disposal_label")}`,
        },
        status: {
            draft: `${t("status.draft")}`,
            sent: `${t("status.sent")}`,
            received: `${t("status.received")}`,
            cancelled: `${t("cancelled")}`,
        },
        payment: {
            paid: `${t("paid")}`,
            unpaid: `${t("unpaid")}`,
            partly_paid:`${t("partlyPaid")}`
        },
    };

    function typeBadge(t) {
        const map = {
            incoming: "bg-green-300 text-green-900",
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
        return <span className={`px-4 py-1 text-sm font-semibold rounded ${map[s] || "bg-gray-100 text-gray-700"}`}>{nice.status[s] || s}</span>;
    }

    function paymentBadge(p) {
        const map = {
            paid: "bg-green-50 text-green-700",
            unpaid: "bg-yellow-50 text-yellow-700",
            partlyPaid: "bg-blue-50 text-blue-700",
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
            setLocations([{ value: "all", label: `${t("allLocations")}` }, ...items]);
        } catch (err) {
            console.error(err);
            notify.error(t("failedToLoadLocations"));
        }
    };
    useEffect(() => {
        getLocations()
    }, []);

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
            setError(err?.message || t("failedToFetchInvoices"));
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
                notify.error(err?.message || t("failedToFetchInvoices"));
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
        const { id, ...rest } = updated
        try {
            const res = await InvoicesApi.EditInvoice(updated.id, rest);
            if (!(res?.status === 200 || res?.status === 201)) throw new Error("Failed to save");
            await fetchInvoices();
            if (invoiceId === updated.id) {
                const fresh = await InvoicesApi.GetInvoiceById(updated.id);
                const d = fresh?.data?.data || fresh?.data || fresh;
                const { invoice_history, invoice_item_history, ...rest } = d;
                setSelectedInvoice(rest);
            }
            closeEditInvoice();
            notify.success(t("saved"));
        } catch (err) {
            console.error(err);
            notify.error(err?.message || t("saveFailed"));
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
            notify.success(t("saved"));
        } catch (err) {
            console.error(err);
            notify.error(err?.message || t("saveFailed"));
        } finally {
            setLoadingEditStatus(false)
        }
    }

    async function saveItem(updated) {
        try {
            const res = await InvoicesApi.UpdateInvoiceItem(updated.id, updated);
            if (!(res?.status === 200 || res?.status === 201)) throw new Error(t("saveFailed"));
            if (invoiceId === updated.invoiceId) {
                const fresh = await InvoicesApi.GetInvoiceById(updated.invoiceId);
                const d = fresh?.data?.data || fresh?.data || fresh;
                const { invoice_history, invoice_item_history, ...rest } = d;
                setSelectedInvoice(rest);
            }
            closeEditItem();
            notify.success(t("saved"));
        } catch (err) {
            console.error(err);
            notify.error(err?.message || t("saveFailed"));
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


    // — ensure: const { t } = useTranslation(); is present in function scope

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark min-h-screen rounded-xl transition-colors duration-300">
            <div className="mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">{t("invoices.title")}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("invoices.subtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCurrentToCSV}
                            className="flex items-center gap-2 px-3 py-2 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
                            aria-label={t("invoices.export_csv")}
                            title={t("invoices.export_csv")}
                        >
                            <Download size={16} />
                            <span className="text-sm">{t("invoices.export_csv")}</span>
                        </button>

                        <button
                            onClick={() => alert(t("invoices.export_pdf_alert"))}
                            className="flex items-center gap-2 px-3 py-2 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
                            aria-label={t("invoices.export_pdf")}
                            title={t("invoices.export_pdf")}
                        >
                            <FileText size={16} />
                            <span className="text-sm">{t("invoices.export_pdf")}</span>
                        </button>

                        <a
                            href="/warehouse/inventory-adjustments"
                            className="flex items-center gap-2 px-3 py-2 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
                            aria-label={t("invoices.inventory_log")}
                            title={t("invoices.inventory_log")}
                        >
                            <Copy size={16} />
                            <span className="text-sm">{t("invoices.inventory_log")}</span>
                        </a>
                    </div>
                </header>

                {/* Filters */}
                <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm transition-colors duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                            aria-label={t("invoices.filter.type")}
                        >
                            <option value="all">{t("invoices.filter.all_types")}</option>
                            {typesList.map((tKey) => (
                                <option value={tKey} key={tKey}>
                                    {nice.type[tKey] || tKey}
                                </option>
                            ))}
                        </select>

                        <Select
                            options={locations}
                            value={senderFilter}
                            onChange={(v) => setSenderFilter(v)}
                            placeholder={t("placeholder.sender_search")}
                            isClearable
                            isSearchable
                            styles={customSelectStyles()}
                            aria-label={t("placeholder.sender_search")}
                        />

                        <Select
                            options={locations}
                            value={receiverFilter}
                            onChange={(v) => setReceiverFilter(v)}
                            placeholder={t("placeholder.receiver_search")}
                            isClearable
                            isSearchable
                            styles={customSelectStyles()}
                            aria-label={t("placeholder.receiver_search")}
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                            aria-label={t("invoices.filter.status")}
                        >
                            <option value="all">{t("invoices.filter.all_statuses")}</option>
                            {statusesList.map((s) => (
                                <option value={s} key={s}>
                                    {nice.status[s] || s}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                            aria-label={t("invoices.filter.from_date")}
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                            aria-label={t("invoices.filter.to_date")}
                        />

                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                            aria-label={t("invoices.filter.payment")}
                        >
                            <option value="all">{t("invoices.filter.all_payments")}</option>
                            <option value="paid">{t("invoices.filter.paid")}</option>
                            <option value="unpaid">{t("invoices.filter.unpaid")}</option>
                        </select>

                        <div className="flex gap-2">
                            <input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder={t("placeholder.search_invoice")}
                                className="flex-1 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark rounded-lg p-2 text-sm"
                                aria-label={t("placeholder.search_invoice")}
                            />
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
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg transition"
                            >
                                {t("button.reset")}
                            </button>

                            <button
                                onClick={() => fetchInvoices()}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition"
                            >
                                {t("button.apply")}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <Filter size={16} />
                        <div className="flex items-center gap-2 flex-wrap">
                            {Object.keys(columns).map((k) => (
                                <label
                                    key={k}
                                    className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={columns[k]}
                                        onChange={() => toggleColumn(k)}
                                    />
                                    <span className="capitalize">{defaultColsLabels[Object.keys(defaultColsLabels).find((l) => l === k)]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List area */}
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition">
                    {loading ? (
                        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                            {t("loading")}
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center text-red-500">{error}</div>
                    ) : (
                        <div>
                            {/* Table */}
                            <div className="hidden md:block">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                            {columns.id && <th className="py-3 px-2">{t("table.id")}</th>}
                                            {columns.type && <th className="py-3 px-2">{t("table.type")}</th>}
                                            {columns.sender_name && <th className="py-3 px-2">{t("table.sender")}</th>}
                                            {columns.receiver_name && <th className="py-3 px-2">{t("table.receiver")}</th>}
                                            {columns.createdAt && <th className="py-3 px-2">{t("table.created")}</th>}
                                            {columns.status && <th className="py-3 px-2">{t("table.status")}</th>}
                                            {columns.payment_status && <th className="py-3 px-2">{t("table.payment")}</th>}
                                            {columns.total_sum && <th className="py-3 px-2">{t("table.total")}</th>}
                                            {columns.actions && <th className="py-3 px-2">{t("table.actions")}</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices?.map((inv) => (
                                            <tr
                                                key={inv.id}
                                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                            >
                                                {columns.id && (
                                                    <td
                                                        className="py-3 px-2 text-sm"
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightMatch(inv.invoice_number || inv.id, searchText),
                                                        }}
                                                    />
                                                )}
                                                {columns.type && <td className="py-3 px-2 text-sm">{typeBadge(inv.type)}</td>}
                                                {columns.sender_name && (
                                                    <td className="py-3 px-2 text-sm">{inv.sender_name || inv.sender?.name || "—"}</td>
                                                )}
                                                {columns.receiver_name && (
                                                    <td className="py-3 px-2 text-sm">{inv.receiver_name || inv.receiver?.name || "—"}</td>
                                                )}
                                                {columns.createdAt && (
                                                    <td className="py-3 px-2 text-sm">{formatDateISO(inv.createdAt)}</td>
                                                )}
                                                {columns.status && (
                                                    <td className="py-3 px-2 text-sm">
                                                        <button onClick={() => setEditingStatusInvoice(inv)} type="button">
                                                            {statusBadge(inv.status)}
                                                        </button>
                                                    </td>
                                                )}
                                                {columns.payment_status && (
                                                    <td className="py-3 px-2 text-sm">{paymentBadge(inv.payment_status)}</td>
                                                )}
                                                {columns.total_sum && <td className="py-3 px-2 text-sm">{inv.total_sum}</td>}
                                                {columns.actions && (
                                                    <td className="py-3 px-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openDetail(inv.id)}
                                                                className="text-sm px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                                            >
                                                                {t("button.open")}
                                                            </button>
                                                            {Number(inv?.total_sum) === 0 ? (
                                                                <CancelInvoiceButton
                                                                    resetAll={() => fetchInvoices()}
                                                                    appearance="icn"
                                                                    id={inv?.id}
                                                                />
                                                            ) : (
                                                                <noscript />
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden grid gap-3">
                                {invoices.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-card-light dark:bg-card-dark shadow-sm"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {inv.type} — {String(inv.id).slice(0, 8)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {inv.sender_name || inv.sender?.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDateISO(inv.createdAt)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="text-sm">{inv.total_sum}</div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openDetail(inv.id)}
                                                        className="text-sm px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                                    >
                                                        {t("button.open")}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditInvoice(inv)}
                                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        aria-label={t("button.edit")}
                                                        title={t("button.edit")}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t("invoices.showing_range", {
                                        from: (page - 1) * PER_PAGE + 1,
                                        to: Math.min(page * PER_PAGE, total),
                                        total,
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
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
                    )}
                </div>

                {/* Detail drawer/modal */}
                {invoiceId && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6">
                        <div className="bg-card-light dark:bg-card-dark  w-full max-w-4xl rounded-2xl shadow-2xl p-6 overflow-auto max-h-[90vh] transition-colors duration-300">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={closeDetail}
                                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label={t("button.back")}
                                    title={t("button.back")}
                                >
                                    <ArrowLeft size={18} className="text-text-light dark:text-text-dark" />
                                </button>

                                <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
                                    {t("detail.title")}
                                </h2>

                                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                    {detailLoading ? t("loading") : formatDateISO(selectedInvoice?.createdAt)}
                                </div>

                                <button
                                    onClick={() => openEditInvoice(selectedInvoice)}
                                    className="ml-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title={t("button.edit")}
                                >
                                    <Pencil size={16} className="text-text-light dark:text-text-dark" />
                                </button>
                            </div>

                            {/* Body */}
                            {detailLoading ? (
                                <div className="py-10 text-center text-gray-500 dark:text-gray-400">{t("loading")}</div>
                            ) : selectedInvoice ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Left Side */}
                                    <div className="col-span-2">
                                        <div className="mb-4 bg-gray-50 dark:bg-[#2A2A2A] p-4 rounded-lg transition-colors">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {t("detail.type")}: <span className="font-medium">{nice.type[selectedInvoice.type] || selectedInvoice.type}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {t("detail.status")}: <span className="font-medium">{nice.status[selectedInvoice.status] || selectedInvoice.status}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {t("detail.payment")}: <span className="font-medium">{selectedInvoice.payment_status}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                {t("detail.total")}: <span className="font-medium">{selectedInvoice.total_sum}</span>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold mb-2 text-text-light dark:text-text-dark">{t("detail.items")}</h3>
                                            <div className="space-y-3">
                                                {(selectedInvoice.invoice_items || []).map((it) => (
                                                    <div
                                                        key={it.id}
                                                        className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-[#1F1F1F] transition-colors"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-text-light dark:text-text-dark">
                                                                {it.product.name} — {it.batch}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {t("detail.barcode")}: {it.barcode}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {t("detail.qty")}: {it.quantity} {it.product.unit} × {t("detail.price")}: {it.price} {t("detail.total")}: {+it.quantity * +it.price}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEditItem(it, selectedInvoice.id)}
                                                                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                                aria-label={t("button.edit_item")}
                                                                title={t("button.edit_item")}
                                                            >
                                                                <Pencil size={14} className="text-text-light dark:text-text-dark" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side (Aside) */}
                                    <aside className="p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-lg transition-colors">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{t("detail.sender")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">
                                            {selectedInvoice.sender?.name || selectedInvoice.sender_name || "—"}
                                        </div>

                                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t("detail.receiver")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">
                                            {selectedInvoice.receiver?.name || selectedInvoice.receiver_name || "—"}
                                        </div>

                                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t("detail.created_by")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">
                                            {selectedInvoice.created?.full_name}
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                onClick={() => alert(t("detail.print_alert"))}
                                            >
                                                {t("button.print")}
                                            </button>
                                        </div>
                                    </aside>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-gray-500 dark:text-gray-400">{t("not_found")}</div>
                            )}
                        </div>
                    </div>
                )}
                {editingInvoice && (
                    <EditInvoiceModal invoice={editingInvoice} onClose={closeEditInvoice} onSave={saveInvoice} />
                )}
                {editingItem && <EditItemModal item={editingItem} onClose={closeEditItem} onSave={saveItem} />}
                {editingStatusInvoice && (
                    <EditStatusModal invoice={editingStatusInvoice} onClose={() => setEditingStatusInvoice(null)} onSave={saveStatusInvoice} loading={loadingEditStatus} />
                )}
            </div>
        </div>
    );

}

function EditInvoiceModal({ invoice, onClose, onSave }) {
    const { t } = useTranslation()
    const [form, setForm] = useState(() => ({ ...invoice }));
    useEffect(() => {
        const { note, id } = invoice
        setForm({ note, id, changed_by: Cookies.get("us_nesw") });
    }, [invoice]);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 w-full max-w-2xl shadow-2xl transition-colors duration-300">

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                        {t("editInvoiceComment")}
                    </h3>
                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {invoice?.invoice_number}
                    </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Example for Note input */}
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t("note")}</span>
                        <input
                            type="text"
                            value={form.note || ""}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, note: e.target.value }))
                            }
                            className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-[#1f1f1f] text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </label>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {t("save")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditStatusModal({ invoice, onClose, onSave, loading }) {
    const { t } = useTranslation()
    const [form, setForm] = useState(() => ({ ...invoice, org_status: invoice?.status }));
    useEffect(() => {
        setForm(prev => ({ ...invoice, org_status: invoice?.status || prev.org_status }));
    }, [invoice]);
    const statusBase = [
        { id: 1, value: "received", label: "Received" },
        { id: 2, value: "draft", label: "Draft" },
        { id: 3, value: "cancelled", label: "Cancelled" },
        { id: 4, value: "sent", label: "Sent" },
    ];
    const org_status_id = statusBase.find((st) => st.value === form.org_status)?.id
    const statusOptions = invoice?.status === "cancelled" ? statusBase.filter((st) => st.id === 2 || st.id === 4)
        : invoice?.status === "sent" ? statusBase.filter((st) => st.id === 1)
            : statusBase?.filter((st) => st.id > org_status_id)
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl dark:bg-background-dark">
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Edit Status</h3>
                    <div className="ml-auto text-sm text-gray-500">{invoice?.invoice_number}</div>
                </div>
                {invoice?.status === "received" ?
                    <div>{t("returnViaRefund")}</div> :

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col">
                            <span className="text-sm text-gray-600">{t("status")}</span>
                            <Select
                                placeholder="Select new status"
                                options={statusOptions}
                                value={form.status}
                                onChange={(e) => setForm((p) => ({ ...p, status: e }))}
                                styles={customSelectStyles()}
                            />

                        </label>
                    </div>
                }

                <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                    {invoice?.status === "received" ?
                        <noscript></noscript> :
                        <button onClick={() => onSave(form)} className={`px-4 py-2 flex items-center gap-2 rounded bg-blue-600 text-white transition-all disabled:opacity-70 ${loading ? "cursor-wait" : "cursor-pointer"}`}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t("updating")}...</span>
                                </>
                            ) : <span>{t("save")}</span>}
                        </button>
                    }

                </div>
            </div>
        </div>
    );
}

function EditItemModal({ item, onClose, onSave }) {
    const { t } = useTranslation()
    const [form, setForm] = useState(() => ({ ...item }));
    useEffect(() => setForm({ ...item }), [item]);
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-lg transition-colors duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit item
                    </h3>
                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {item?.id?.slice(0, 8)}
                    </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 gap-3">
                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Quantity</span>
                        <input
                            type="number"
                            value={form.quantity}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, quantity: e.target.value }))
                            }
                            className="border dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Price</span>
                        <input
                            type="text"
                            value={form.price}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, price: e.target.value }))
                            }
                            className="border dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Batch</span>
                        <input
                            type="text"
                            value={form.batch}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, batch: e.target.value }))
                            }
                            className="border dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </label>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
