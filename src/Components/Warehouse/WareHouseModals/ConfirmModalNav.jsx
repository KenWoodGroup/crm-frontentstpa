import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModalNav({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Sahifadan chiqmoqchimisiz?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Saqlanmagan ma'lumotlar yo‘qoladi.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
              >
                Yo‘q
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Ha
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
