import React, { useEffect, useState } from "react";
import { user } from "../../utils/Controllers/users";
// import { location } from "../../utils/Controller/location";
import { location } from "../../utils/Controllers/location"
// import { notify } from "../../utils/toast";
import { notify } from "../../utils/toast";
import { Confirm } from "../../utils/Alert";
import { Trash2, Edit, UserRoundPlus, Factory, Hammer, Boxes, Handshake } from "lucide-react";
import { Spinner } from "@material-tailwind/react";

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
    const [editData, setEditData] = useState(false);
    const [form, setForm] = useState({ full_name: "", email: "", password: "", location_id: "" });
    const [loading, setLoading] = useState(false);
    const [isPassUpd, setIsPassUpd] = useState(false)

    const renameBaseRole = [
        {
            from: "super_admin", to: "Super Admin", icon: "-"
        },
        {
            from: "admin", to: "Admin", icon: "-"
        },
        {
            from: "warehouse", to: "Omborchi", icon: <Boxes size={16} />
        },
        {
            from: "factory", to: "Zavod", icon: <Factory size={16} />
        },
        {
            from: "company", to: "Kompaniya", icon: <Hammer size={16} />
        },
        {
            from: "dealer", to: "Diller", icon: <Handshake size={16} />
        }
    ]

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
            setPagination({ ...pagination, currentPage: +pagination?.currentPage || 1 });
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
            setUsers(res?.data || []);
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
            if (editData) {
                if (!form.full_name || !form.email || !form.location_id) {
                    return notify.info("Barcha maydonlarni to‘ldiring", "warn");
                }
                const ready = {
                    location_id: form.location_id,
                    full_name: form.full_name,
                    email: form.email,
                    role: locations.find((item) => item.id == form.location_id).type
                }
                await user.Put(editData.id, ready);
                notify.success("User yangilandi", "success");
            } else {
                if (!form.full_name || !form.email || !form.location_id || !form.password) {
                    return notify.info("Barcha maydonlarni to‘ldiring", "warn");
                }
                const ready = {
                    location_id: form.location_id,
                    full_name: form.full_name,
                    email: form.email,
                    role: locations.find((item) => item.id == form.location_id).type,
                    password: form.password
                }
                await user.Post(ready);
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
    const handleDelete = async (u) => {
        let confirmation = await Confirm(u.location.name + " foydalanuvchisi " + u.full_name + "ni" + ` o‘chirishni tasdiqlaysizmi?`);
        if (!confirmation) return;
        try {
            const res = await user.Delete(u.id);
            console.log(res);
            if (res?.status !== 200) {
                return notify.error("O‘chirishda xatolik", "error");
            }
            notify.success("User o‘chirildi", "success");
            fetchUsers(pagination.currentPage);
        } catch (err) {
            notify.error("O‘chirishda xatolik", "error");
        };
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
                    className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg"
                >
                    <UserRoundPlus size={22} /> Create User
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

                <table className="min-w-full text-sm text-[rgb(2,2,59)] border border-gray-200 shadow-md rounded-xl overflow-hidden">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-[rgb(2,2,59)] uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4 text-left">№</th>
                            <th className="p-4 text-left">F.I.O</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Location</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-5 text-center flex gap-3 items-center justify-center text-gray-500 italic"
                                >
                                    {<Spinner />} Yuklanmoqda...

                                </td>
                            </tr>
                        ) : users.length ? (
                            users.map((u, index) => (
                                <tr
                                    key={u.id}
                                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="p-4 font-medium">{index + 1}</td>
                                    <td className="p-4">{u.full_name}</td>
                                    <td className="p-4">{u.email}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        {renameBaseRole?.find((item) => item.from === u.role).icon
                                        }
                                        {
                                            renameBaseRole?.find((item) => item.from === u.role).to
                                        }
                                    </td>
                                    <td className="p-4">{u.location?.name}</td>

                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEdit(u)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u)}
                                                className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-5 text-center text-gray-500 italic"
                                >
                                    Ma'lumot topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>

            {/* Pagination */}
            {!selectedLocation &&
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
            }

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

                            {
                                !editData &&
                                <input
                                    name="password"
                                    placeholder="Password edit"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="border px-3 py-2 rounded"
                                />
                            }


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
                                        setIsPassUpd(false);
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
