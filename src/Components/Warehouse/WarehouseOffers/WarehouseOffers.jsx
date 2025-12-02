// ========== src/pages/ReceivedInvoices/ReceivedInvoices.jsx ==========
import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceCard from "./_components/InvoiceCard";
import InvoiceDrawer from "./_components/InvoiceDrawer";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import Cookies from "js-cookie";

export default function ReceivedInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const userLid = Cookies.get("ul_nesw")

    useEffect(() => {
        fetchInvoices();
    }, []);

    async function fetchInvoices() {
        setLoading(true);
        setError(null);
        try {
            // Example GET - adapt URL/params to your backend
            const res = await InvoicesApi.GetInvoiceNotifications(userLid, 1);
            // adapt to your response shape (sample you provided has data.records)
            const records = res.data?.data?.records ?? [];
            setInvoices(records);
        } catch (err) {
            console.error(err);
            setError('Ro\'yxatni yuklashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    }

    function handleView(id) {
        setSelectedId(id);
        setDrawerOpen(true);
    }

    function handleCloseDrawer() {
        setDrawerOpen(false);
        setSelectedId(null);
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-slate-900">Kelib tushgan jo'natmalar</h1>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm animate-pulse h-28"></div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
                )}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-4">
                        {invoices.length === 0 && (
                            <div className="p-6 bg-white border border-gray-200 rounded text-center text-gray-600">Hech qanday invoice topilmadi</div>
                        )}

                        {invoices.map(inv => (
                            <InvoiceCard key={inv.id} invoice={inv} onView={() => handleView(inv.id)} />
                        ))}
                    </div>
                )}

                {/* Drawer */}
                <InvoiceDrawer
                    isOpen={drawerOpen}
                    invoiceId={selectedId}
                    onClose={handleCloseDrawer}
                    onApplied={() => { /* if you want to refetch list after apply */ fetchInvoices(); }}
                />
            </div>
        </div>
    );
}



// ========== src/setupProxyExample.md ==========
// NOTE:
// - The code uses endpoints:
//    GET  /api/invoices/received?page=1        -> returns { data: { records: [...] } }//    PUT  /api/invoices/:id                    -> body { seen: 'old' }
//    GET  /api/invoices/:id                    -> returns { data: { ...invoice } }
// - Adjust axios baseURL or proxy in your project (vite/CRA) to forward /api/* to your backend.


// ========== Usage notes ==========
// - TailwindCSS should be configured in your project.
// - Install axios: npm i axios
// - The drawer opens immediately and sends PUT to mark seen, then fetches details.
// - Change locale formatting to suit your currency/region.

