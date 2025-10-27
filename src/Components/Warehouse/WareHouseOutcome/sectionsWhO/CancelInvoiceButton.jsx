import React, { useState } from "react";
import { FileX, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { InvoicesApi } from "../../../../utils/Controllers/invoices";
import { useWarehouse } from "../../../../context/WarehouseContext";
import { notify } from "../../../../utils/toast";

const CancelInvoiceButton = ({resetAll}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        mode, // 'in' or 'out' provided by WarehouseLayout -> WarehouseProvider
        invoiceId, // object { in, out }
    } = useWarehouse();
    // Restart invoices after success saved last
    function resetAllBaseForNewInvoice() {
        resetAll(); // resets both modes per provider
    }

    const handleCancel = async () => {
        setLoading(true);
        try {
            const res = await InvoicesApi.DeleteInvoice(invoiceId?.[mode])
            // TODO: delete invoice + clear context here
            if (res.status === 200 || res.status === 201) {
                resetAllBaseForNewInvoice()
                setOpen(false);
            }
        } catch (err) {
            console.error("Failed to cancel invoice", err);
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Cancel this invoice?
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            All invoice items will be removed. This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                            >
                                Close
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Canceling...</span>
                                    </>
                                ) : (
                                    <span>Yes, Cancel</span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* ===== Button in Header ===== */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md transition-all duration-200"
            >
                <FileX className="w-5 h-5" />
                <span>Cancel Invoice</span>
            </motion.button>

            {/* ===== Modal ===== */}
            {createPortal(modalContent, document.body)}

        </>
    );
};

export default CancelInvoiceButton;
