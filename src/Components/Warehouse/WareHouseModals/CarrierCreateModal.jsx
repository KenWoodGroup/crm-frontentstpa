import React, { useState } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";
import { Staff } from "../../../utils/Controllers/Staff";
import {Alert} from "../../../utils/Alert"

export default function CarrierCreateModal({ refresh, onClose }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get("ul_nesw"),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await Staff.CreateStaff(form);
            Alert("Muvaffaqiyatli yaratildi", "success");
            refresh(res.data.staff.id);
            onClose(); // modalni yopish
        } catch (err) {
            Alert("Xatolik", "error");
        } finally {
            setLoading(false);
        }
    };

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-[350px] animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Yangi kuryer yaratish
                </h2>

                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Ism Familiya"
                        value={form.full_name}
                        onChange={handleChange}
                        className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Telefon raqam"
                        value={form.phone}
                        onChange={handleChange}
                        className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-gray-100"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition"
                    >
                        Bekor qilish
                    </button>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                    >
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
