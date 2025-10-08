import React, { useEffect, useState } from "react";
import { user } from "../../utils/Controllers/users";
// import { location } from "../../utils/Controller/location";
import { location } from "../../utils/Controllers/location"
// import { notify } from "../../utils/toast";
import { notify } from "../../utils/toast";
import { Confirm } from "../../utils/Alert";

export default function SAusers() {
    const [users, setUsers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        total_pages: 1,
        total_count: 0,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({ full_name: "", email: "", role: "", location_id: "" });
    const [loading, setLoading] = useState(false);

    // 📦 1. locationlarni olish
    const fetchLocations = async () => {
        try {
            const { data } = await location.GetAll();
            console.log(data);

            setLocations(data || []);
        } catch (err) {
            notify.error("Locationlarni olishda xatolik", "error");
        }
    };

    // 👥 2. userlarni pagination bilan olish
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const res = await user.GetPagination(page);
            const res_obj = res?.data
            const { records, pagination } = res_obj?.data || {};
            setUsers(records || []);
            setPagination({ ...pagination, currentPage: pagination?.currentPage || 1 });
        } catch (err) {
            notify.error("Userlarni olishda xatolik", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔎 3. location filter bo‘yicha userlarni olish
    const fetchUsersByLocation = async (locId) => {
        try {
            setLoading(true);
            const res = await user.GetLocationUsers(locId);
            setUsers(res?.data?.data || []);
        } catch (err) {
            notify.error("Filterlashda xatolik", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🧩 initial
    useEffect(() => {
        fetchUsers(1);
        fetchLocations();
    }, []);

    // 🧾 form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 💾 create/update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!form.full_name || !form.email || !form.role || !form.location_id) {
                return notify.info("Barcha maydonlarni to‘ldiring", "warn");
            }

            if (editData) {
                await user.Put(editData.id, form);
                notify.success("User yangilandi", "success");
            } else {
                await user.Post(form);
                notify.success("Yangi user qo‘shildi", "success");
            }

            setModalOpen(false);
            setForm({ full_name: "", email: "", role: "", location_id: "" });
            setEditData(null);
            fetchUsers(pagination.currentPage);
        } catch (err) {
            notify.error("So‘rov bajarilmadi", "error");
        }
    };

    // 🗑 delete
    const handleDelete = async (id) => {
        Confirm(async () => {
            try {
                await user.Delete(id);
                notify.success("User o‘chirildi", "success");
                fetchUsers(pagination.currentPage);
            } catch (err) {
                notify.error("O‘chirishda xatolik", "error");
            }
        });
    };

    // 🔄 pagination
    const handlePageChange = (page) => {
        setSelectedLocation("");
        fetchUsers(page);
    };

    // 🔍 filter select
    const handleFilterChange = (e) => {
        const locId = e.target.value;
        setSelectedLocation(locId);
        if (locId) {
            fetchUsersByLocation(locId);
        } else {
            fetchUsers(1);
        }
    };

    // ✏️ edit
    const handleEdit = (u) => {
        setEditData(u);
        setForm({
            full_name: u.full_name,
            email: u.email,
            role: u.role,
            location_id: u.location_id,
        });
        setModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    + Create User
                </button>
            </div>

            {/* Filter */}
            <div className="mb-4 flex items-center gap-3">
                <label className="text-sm text-gray-700">Filtrlash:</label>
                <select
                    value={selectedLocation}
                    onChange={handleFilterChange}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Barcha joylashuvlar</option>
                    {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                            {loc.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">N</th>
                            <th className="p-3 text-left">F.I.O</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-center">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                    Yuklanmoqda...
                                </td>
                            </tr>
                        ) : users.length ? (
                            users.map((u, index) => (
                                <tr key={u.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{u.full_name}</td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">{u.role}</td>
                                    <td className="p-3">{u.location?.name}</td>
                                    <td className="p-3 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(u)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                    Ma'lumot topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mt-5">
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage < 2}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    ← Oldingi
                </button>
                <span>
                    {pagination.currentPage} / {pagination.total_pages}
                </span>
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.total_pages}
                    className="px-3 py-1 border rounded disabled:opacity-40"
                >
                    Keyingi →
                </button>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg relative">
                        <h2 className="text-lg font-semibold mb-4">
                            {editData ? "Userni tahrirlash" : "Yangi user qo‘shish"}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid gap-3">
                            <input
                                name="full_name"
                                placeholder="F.I.O"
                                value={form.full_name}
                                onChange={handleChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                name="role"
                                placeholder="Role"
                                value={form.role}
                                onChange={handleChange}
                                className="border px-3 py-2 rounded"
                            />
                            <select
                                name="location_id"
                                value={form.location_id}
                                onChange={handleChange}
                                className="border px-3 py-2 rounded"
                            >
                                <option value="">Joylashuv tanlang</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalOpen(false);
                                        setEditData(null);
                                        setForm({ full_name: "", email: "", role: "", location_id: "" });
                                    }}
                                    className="border px-4 py-2 rounded hover:bg-gray-100"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Saqlash
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
