import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { InvoicesApi } from "../../../../utils/Controllers/invoices";
import { useWarehouse } from "../../../../context/WarehouseContext";

const ReturnedInvoiceProcessor = () => {
    const [statuses, setStatuses] = useState({});
    const [mergingAll, setMergingAll] = useState(false)
    const {
        addItemPlusQty,
        returnInvoices,
        mixData,
        _dispatchIn
    } = useWarehouse();

    useEffect(() => {
        if (returnInvoices?.length && mixData.length === 0) fetchAllInvoices();
    }, [returnInvoices]);

    // ---------- Normalize & add to mixData (uses context addItem) ----------
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        return {
            invoice_number: raw.invoice_number || '-',
            is_new_batch: false,
            name: productObj.name || "-",
            price: Number(raw.purchase_price || 0),
            purchase_price: Number(raw.price || 0),
            origin_price: Number(raw.purchase_price || 0),
            discount: Number(raw.discount || 0),
            quantity: 1,
            unit: productObj.unit || "-",
            product_id: raw.product_id || productObj.id,
            barcode: raw.barcode || null,
            batch: raw.batch || null,
            return_quantity: Number(raw.quantity || 0),
            is_returning:true
        };
    };

    const fetchAllInvoices = async () => {
        setMergingAll(true)
        const promises = returnInvoices.map(async (inv) => {
            setStatuses((prev) => ({ ...prev, [inv.id]: "loading" }));
            try {
                const res = await InvoicesApi.GetInvoiceById(inv.id);
                const items = res.data.invoice_items || [];
                for (const item of items) {
                    const normalized = normalizeIncomingItem(item);
                    const res = addItemPlusQty(normalized); // provider default mode = provided mode at creation
                    if (res && res.ok === false) {
                        notify.error(res.message || "Item qo'shilmadi");
                    }
                }

                setStatuses((prev) => ({ ...prev, [inv.id]: "merged" }));
            } catch (err) {
                setStatuses((prev) => ({ ...prev, [inv.id]: "error" }));
            }
        });
        await Promise.all(promises);
        setMergingAll(false)
    };

    const getCardStyle = (status) => {
        switch (status) {
            case "loading":
                return "bg-gradient-to-r from-blue-500/10 to-blue-300/10 animate-pulse border-blue-400 shadow-blue-200";
            case "merged":
                return "bg-green-50 border-green-400 shadow-green-200 animate-[pulse_1.5s_ease-in-out_1]";
            case "error":
                return "bg-red-50 border-red-400 shadow-red-200";
            default:
                return "bg-white border-gray-200";
        }
    };

    const getStatusContent = (status) => {
        switch (status) {
            case "loading":
                return (
                    <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                    </div>
                );
            case "merged":
                return (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Merged successfully</span>
                    </div>
                );
            case "error":
                return (
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>Error fetching data</span>
                    </div>
                );
            default:
                return <span className="text-gray-500">Selected</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between w-full">
                <h2 className="text-xl font-semibold text-gray-800">
                    Returned Invoices Progress
                </h2>
                <button
                    type="button"
                    onClick={()=> {
                        if(mixData.length > 0) {
                            _dispatchIn({ type: "RESET" })
                        }
                        fetchAllInvoices()
                    }}
                    disabled={mergingAll}
                    className={`p-2 rounded-lg border transition-all duration-300
                            ${mergingAll
                            ? "bg-blue-100 border-blue-300 cursor-not-allowed"
                            : "hover:bg-blue-50 border-gray-300"}
                            `}
                    >
                    <RefreshCcw
                        size={22}
                        className={`transition-transform duration-300 ${mergingAll ? "animate-spin text-blue-600" : "text-blue-500"}`}
                    />
                </button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {returnInvoices.map((inv) => {
                    const status = statuses[inv.id];
                    return (
                        <motion.div
                            key={inv.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`border rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg ${getCardStyle(
                                status
                            )}`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {inv.invoice_number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(inv.createdAt).toLocaleString()}
                                    </p>
                                    <p className="font-semibold text-gray-700">
                                        {inv.total}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    ID: {inv.id.slice(0, 8)}...
                                </div>
                            </div>

                            <div className="mt-2 flex justify-center">
                                {getStatusContent(status)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* <AnimatePresence>
                {mixData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-8 bg-white border rounded-2xl shadow-sm p-4"
                    >
                        <h3 className="text-base font-semibold mb-3">
                            Combined Items Table
                        </h3>
                        <div className="overflow-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">Product</th>
                                        <th className="p-2 text-left">Batch</th>
                                        <th className="p-2 text-right">Quantity</th>
                                        <th className="p-2 text-left">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mixData.map((item, i) => (
                                        <tr
                                            key={item.id || i}
                                            className="border-t hover:bg-gray-50"
                                        >
                                            <td className="p-2">{item.product?.name}</td>
                                            <td className="p-2">{item.batch}</td>
                                            <td className="p-2 text-right">{item.quantity}</td>
                                            <td className="p-2">{item.product?.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence> */}
        </div>
    );
};

export default ReturnedInvoiceProcessor;
