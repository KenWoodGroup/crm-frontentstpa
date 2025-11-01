import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Spinner,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { notify } from "../../utils/toast";
import { Confirm } from "../../utils/Alert";
import { user } from "../../utils/Controllers/users";

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

  // 🔹 Получение всех менеджеров
  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await user.getAdmins();
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

  // 🔹 Изменение инпута
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 🔹 Добавление или редактирование
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

  // 🔹 Редактирование
  const handleEdit = (m) => {
    setFormData({
      full_name: m.full_name,
      email: m.email,
      password: "",
      role: m.role,
    });
    setEditId(m.id);
  };

  // 🔹 Удаление
  const handleDelete = async (id) => {
    const isConfirmed = await Confirm("Rostan ham o‘chirmoqchimisiz?");
    if (!isConfirmed) return;

    try {
      await user.Delete(id);
      notify.success("Manager o‘chirildi!");
      fetchManagers();
    } catch {
      notify.error("O‘chirishda xatolik!");
    }
  };

  return (
    <div className=" min-h-screen">
      {/* --- Заголовок --- */}
      <div className="flex items-center gap-3 mb-6">
        <UserGroupIcon className="h-8 w-8 text-blue-600" />
        <Typography variant="h4" color="blue-gray" className="font-semibold">
          Managers
        </Typography>
      </div>

      {/* --- Форма --- */}
      <Card className="mb-10 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Input
            color="blue"
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          <Input
            color="blue"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            color="blue"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!editId}
          />

          <div className="md:col-span-3 flex justify-end mt-2">
            <Button
              type="submit"
              color="blue"
              className="flex items-center gap-2 rounded-lg px-5 py-2"
            >
              <PlusCircleIcon className="h-5 w-5" />
              {editId ? "Saqlash" : "Qo‘shish"}
            </Button>
          </div>
        </form>
      </Card>

      {/* --- Таблица --- */}
      <Card className="bg-white rounded-2xl shadow-md border border-gray-200">
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner color="blue" className="h-8 w-8" />
            </div>
          ) : managers.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              Hech qanday manager topilmadi
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 text-blue-gray-600">
                  <th className="py-3 px-4 font-semibold">Full Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 text-center font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m, index) => (
                  <tr
                    key={m.id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                  >
                    <td className="py-2 px-4">{m.full_name}</td>
                    <td className="py-2 px-4">{m.email}</td>
                    <td className="py-2 px-4 capitalize">{m.role}</td>
                    <td className="py-2 px-4 flex items-center justify-center gap-2">
                      <Tooltip content="Tahrirlash">
                        <IconButton
                          color="blue"
                          variant="text"
                          onClick={() => handleEdit(m)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="O‘chirish">
                        <IconButton
                          color="red"
                          variant="text"
                          onClick={() => handleDelete(m.id)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SAmanagers;
