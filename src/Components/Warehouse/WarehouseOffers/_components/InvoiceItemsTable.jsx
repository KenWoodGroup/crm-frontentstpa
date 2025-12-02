// ========== src/pages/ReceivedInvoices/InvoiceItemsTable.jsx ==========
import React from 'react';
function calcSum(qty, price) {
    const nQty = Number(qty || 0);
    const nPrice = Number(price || 0);
    const s = nQty * nPrice;
    return Number.isNaN(s) ? '-' : s.toLocaleString('ru-RU');
}
function formatPrice(p) {
    if (!p) return '0';
    const n = Number(p);
    if (Number.isNaN(n)) return p;
    return n.toLocaleString('ru-RU');
}

export default function InvoiceItemsTable({ items }) {
    if (!items || items.length === 0) {
        return (
            <div className="p-6 bg-white border rounded text-center text-gray-500">Mahsulotlar ro'yxati bo'sh</div>
        )
    }

    return (
        <div className="bg-white border rounded">
            <table className="w-full text-sm table-auto">
                <thead className="bg-gray-50">
                    <tr className="text-left">
                        <th className="px-4 py-3">Mahsulot</th>
                        <th className="px-4 py-3">Soni</th>
                        <th className="px-4 py-3">Narx</th>
                        <th className="px-4 py-3">Birlik</th>
                        <th className="px-4 py-3">Partiya</th>
                        <th className="px-4 py-3">Jami</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-3">{item.product?.name ?? '—'}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">{formatPrice(item.sale_price)}</td>
                            <td className="px-4 py-3">{item.product?.unit ?? '—'}</td>
                            <td className="px-4 py-3">{item.batch ?? '—'}</td>
                            <td className="px-4 py-3">{calcSum(item.quantity, item.sale_price)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
