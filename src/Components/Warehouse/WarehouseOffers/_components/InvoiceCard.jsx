// ========== src/pages/ReceivedInvoices/InvoiceCard.jsx ==========
import React from 'react';

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


export default function InvoiceCard({ invoice, onView }) {
    const { invoice_number, sender_name, receiver_name, total_sum, status, createdAt, seen } = invoice;

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-start gap-4">
                <div className={`w-2 h-12 rounded ${seen === 'new' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                <div>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-700 font-medium">{invoice_number}</div>
                        <div className="text-xs text-gray-500">{status}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{sender_name} → {receiver_name}</div>
                    <div className="text-sm text-gray-800 font-semibold mt-2">Summa: {formatSum(total_sum)}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDateTime(createdAt)}</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onView}
                    className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm shadow-sm hover:shadow transition"
                >
                    Ko'rish
                </button>
            </div>
        </div>
    )
}