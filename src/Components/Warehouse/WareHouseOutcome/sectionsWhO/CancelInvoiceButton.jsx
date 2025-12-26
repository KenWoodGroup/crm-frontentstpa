import React, { useState } from "react";
import { FileX, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { InvoicesApi } from "../../../../utils/Controllers/invoices";
import { notify } from "../../../../utils/toast";
import { useInventory } from "../../../../context/InventoryContext";
import { useTranslation } from "react-i18next";

const CancelInvoiceButton = ({ resetAll, appearance = "btn", id, disabled = true }) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // Restart invoices after success saved last
    const {
        resetMode,
        invoiceId,
        mode,
    } = useInventory()

    function resetModeBaseForNewInvoice() {
        if (id === invoiceId?.[mode] && appearance === "btn") {
            resetAll();
            return notify.success(t("invoiceDeleted"))
        } else if (appearance === "icn") {
            if (id === invoiceId?.in) {
                resetMode("in"); // reset mode provider
                resetAll()
                return notify.success(t("invoiceDeleted"))
            } else if (id === invoiceId?.out) {
                resetAll()
                resetMode("out");
                return notify.success(t("invoiceDeleted"))
            } else {
                resetAll()
                return notify.success(t("invoiceDeleted"))
            }
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const res = await InvoicesApi.DeleteInvoice(id)
            // TODO: delete invoice + clear context here
            if (res.status === 200 || res.status === 201) {
                resetModeBaseForNewInvoice();
                setOpen(false);
            }
        } catch (err) {
            console.error(t("failedToCancelInvoice"), err);
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
                        className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm dark:bg-card-dark dark:border-white dark:border-[1px]"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb- dark:text-text-dark">
                            {t("cancelThisInvoice")}
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            {t("cancelWarning")}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all dark:bg-card-dark dark:border-white dark:border-[1px]"
                            >
                                {t("close")}
                            </button>

                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t("canceling")}...</span>
                                    </>
                                ) : (
                                    <span>{t("yesCancel")}</span>
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
            {appearance === "btn" ?
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 laptop:px-3 laptop:rounded-lg laptop:text-sm"
                >
                    <FileX className="w-5 h-5" />
                    <span>{t("cancelInvoice")}</span>
                </motion.button>
                :
                <div className="relative group">

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => disabled ? null : setOpen(true)}
                        className={`${disabled ? "opacity-50 cursor-not-allowed" : ""} p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 shadow-sm transition-all duration-200 flex items-center justify-center`}
                    >
                        <Trash2 className="w-5 h-5" />
                    </motion.button>

                    {disabled && 
                        <div className="absolute right-0 bottom-full mb-1 
                            hidden group-hover:block
                            text-xs px-2 py-1 rounded 
                            bg-gray-800 text-white whitespace-nowrap">
                            {t("delete_only_zero")}
                        </div> }
                </div>
            }

            {/* ===== Modal ===== */}
            {createPortal(modalContent, document.body)}

        </>
    );
};

export default CancelInvoiceButton;
