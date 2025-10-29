import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const LogoutButton = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
        navigate("/login");
    };

    const modalContent = (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-red-500" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Confirm Logout
                            </h2>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Are you sure you want to log out? You’ll need to sign in again to
                            access your dashboard.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 p-3 w-full rounded-xl text-[rgb(2,2,59)] hover:bg-red-100 hover:text-red-700 transition"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h4a2 2 0 002-2v-1m-6-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1"
                    />
                </svg>
                <span
                    className={`whitespace-nowrap transition-opacity text-sm`}
                >
                    Выйти
                </span>
            </button>

            {/* Modalni body ichiga chiqaramiz */}
            {createPortal(modalContent, document.body)}
        </>
    );
};

export default LogoutButton;
