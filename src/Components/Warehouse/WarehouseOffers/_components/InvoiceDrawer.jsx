// ========== src/pages/ReceivedInvoices/InvoiceDrawer.jsx ==========
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InvoiceItemsTable from './InvoiceItemsTable';
import { InvoicesApi } from '../../../../utils/Controllers/invoices';
import Spinner from '../../../UI/spinner/Spinner';
function formatSum(sumStr) {
    if (!sumStr) return '0';
    const n = Number(sumStr);
    if (Number.isNaN(n)) return sumStr;
    return n % 1 === 0 ? n.toLocaleString('ru-RU') : n.toLocaleString('ru-RU', { minimumFractionDigits: 2 });
}
export function formatDateTime(iso) {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return iso;
    }
}


export default function InvoiceDrawer({ isOpen, invoiceId, onClose, onApplied, seen, reload, setSelectedInv, startLoading }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [markingSeen, setMarkingSeen] = useState(false);

    useEffect(() => {
        if (isOpen && invoiceId) {
            openAndLoad(invoiceId);
        } else {
            // clear state when closed
            setInvoice(null);
            setError(null);
        }
    }, [isOpen, invoiceId]);

    async function openAndLoad(id) {
        setLoading(true);
        setError(null);
        setInvoice(null);

        try {
            // 1) Optimistic UI: open drawer with skeleton and immediately call PUT to mark seen
            if (seen === "new") {
                setMarkingSeen(true);
                // await axios.put(`/api/invoices/${id}`, { seen: 'old' });
                await InvoicesApi.EditInvoiceSeen(id, { seen: "old" })
                setMarkingSeen(false);
                reload();
            }
            // 2) Fetch full invoice detail
            // const res = await axios.get(`/api/invoices/${id}`);
            const res = await InvoicesApi.GetInvoiceById(id);
            const data = res.data?.data ?? res.data ?? null;
            setInvoice(data);
            setSelectedInv(data)

        } catch (err) {
            console.error(err);
            setError('Invoice tafsilotlarini yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
            setMarkingSeen(false);
        }
    };

    if (!isOpen) return null;

    return (
        // backdrop + drawer
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex overflow-y-auto">
            <div className="absolute  z-60" onClick={onClose} />

            <aside className="ml-auto w-full sm:w-[720px] max-w-[100%] h-full shadow-xl flex flex-col bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark z-10">
                    <div>
                        <div className="text-lg font-semibold text-slate-900">{invoice?.invoice_number ?? 'Invoice'}</div>
                        <div className="text-sm text-gray-500">{invoice?.status ?? ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="px-3 py-2 rounded-md border">Bekor qilish</button>
                        <button
                            onClick={()=> onApplied()}
                            className={`px-4 py-2 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center gap-[6px] ${startLoading ? "cursor-progress" : "cursor-pointer"}`}
                        >
                         {startLoading && <Spinner/> } Qo'llash
                        </button>
                        
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {(loading || markingSeen) && (
                        <div>
                            <div className="h-6 w-48 rounded animate-pulse mb-4 duration-300 shadow-sm bg-card-light dark:bg-card-dark" />
                            <div className="grid grid-cols-2 gap-4 mb-6 duration-300 shadow-sm bg-card-light dark:bg-card-dark">
                                <div className="h-16  rounded animate-pulse duration-300 shadow-sm bg-card-light dark:bg-card-dark"></div>
                                <div className="h-16  rounded animate-pulse duration-300 shadow-sm bg-card-light dark:bg-card-dark"></div>
                            </div>
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 rounded animate-pulse duration-300 shadow-sm bg-card-light dark:bg-card-dark"></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
                    )}

                    {!loading && !error && invoice && (
                        <div className="space-y-6 ">
                            {/* General info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark">
                                    <div className="text-xs text-gray-500">Jo'natuvchi</div>
                                    <div className="text-sm font-medium text-slate-800">{invoice.sender_name}</div>

                                    <div className="text-xs text-gray-500 mt-3">Qabul qiluvchi</div>
                                    <div className="text-sm font-medium text-slate-800">{invoice.receiver_name}</div>
                                </div>
                                <div className="p-4 border transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark rounded">
                                    <div className="text-xs text-gray-500">Summa</div>
                                    <div className="text-sm font-medium text-slate-800">{formatSum(invoice.total_sum)}</div>

                                    <div className="text-xs text-gray-500 mt-3">Holat</div>
                                    <div className="text-sm font-medium text-slate-800">{invoice.status} • {invoice.payment_status}</div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 border rounded text-sm transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark">
                                    <div className="text-xs text-gray-400">Yaratildi</div>
                                    <div className="text-sm">{formatDateTime(invoice.createdAt)}</div>
                                </div>
                                <div className="transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark p-3 border rounded text-sm">
                                    <div className="text-xs text-gray-400">Yangilangan</div>
                                    <div className="text-sm">{formatDateTime(invoice.updatedAt)}</div>
                                </div>
                                <div className="transition-all duration-300 shadow-sm bg-card-light dark:bg-card-dark p-3 border rounded text-sm">
                                    <div className="text-xs text-gray-400">Izoh</div>
                                    <div className="text-sm">{invoice.note ?? '-'}</div>
                                </div>
                            </div>

                            {/* Items table */}
                            <div>
                                <div className="text-sm font-medium mb-2">Mahsulotlar</div>
                                <InvoiceItemsTable items={invoice.invoice_items ?? []} />
                            </div>
                        </div>
                    )}
                </div>

            </aside>
        </div>
    )
}
