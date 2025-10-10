import React, { useEffect, useState } from "react";
import { notify } from "../../utils/toast"; // Toastify helper
import { Confirm } from "../../utils/Alert"; // Swal Confirm helper
import {user} from "../../utils/Controllers/users"

const SAmanagers = () => {
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Barcha managerlarni olish
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await user.getAdmins();
      console.log(res);
      
      setManagers(res.data || []);
    } catch (error) {
      notify.error("Ma'lumot yuklanmadi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // 🔹 Input o‘zgarishi
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Qo‘shish yoki tahrirlash
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await user.Put(editId, formData);
        notify.success("Manager tahrirlandi!");
      } else {
        await user.Post(formData);
        notify.success("Yangi manager qo‘shildi!");
      }
      setFormData({ full_name: "", email: "", password: "", role: "admin" });
      setEditId(null);
      fetchManagers();
    } catch (error) {
      notify.error("Xatolik yuz berdi!");
    }
  };

  // 🔹 Tahrirlash bosilganda
  const handleEdit = (m) => {
    setFormData({
      full_name: m.full_name,
      email: m.email,
      password: m.password,
      role: m.role,
    });
    setEditId(m.id);
  };

  // 🔹 O‘chirish
  const handleDelete = async (id) => {
    const isConfirmed = await Confirm("Rostan ham o‘chirmoqchimisiz?");
    if (!isConfirmed) return;

    try {
      await user.Delete(id);
      notify.success("Manager o‘chirildi!");
      fetchManagers();
    } catch (error) {
      notify.error("O‘chirishda xatolik!");
    }
  };

  return (
    <div className="p-6 text-[#fff]">
      <h1 className="text-2xl font-semibold mb-6 text-blue-400">Managers</h1>

      {/* --- FORM --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-[rgb(5,5,36)] p-5 rounded-2xl shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8"
      >
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="p-2 rounded-md text-black outline-none"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="p-2 rounded-md text-black outline-none"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required={!editId}
          className="p-2 rounded-md text-black outline-none"
        />

        <button
          type="submit"
          className="col-span-1 sm:col-span-2 md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
        >
          {editId ? "Saqlash" : "Qo‘shish"}
        </button>
      </form>

      {/* --- TABLE --- */}
      <div className="bg-[rgb(5,5,36)] rounded-2xl shadow-md overflow-x-auto">
        {loading ? (
          <p className="p-4 text-center text-gray-400">Yuklanmoqda...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-[rgb(2,2,59)] text-blue-300">
              <tr>
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-700 hover:bg-[rgb(8,8,46)]"
                >
                  <td className="py-2 px-4">{m.full_name}</td>
                  <td className="py-2 px-4">{m.email}</td>
                  <td className="py-2 px-4">{m.role}</td>
                  <td className="py-2 px-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-blue-400 hover:text-blue-500 font-medium"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-400 hover:text-red-500 font-medium"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default  SAmanagers