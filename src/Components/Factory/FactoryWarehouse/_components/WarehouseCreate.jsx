import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Cookies from "js-cookie";

export default function WarehouseCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const initialData = {
        name: "",
        username: "",
        full_name: "",
        phone: "+998",
        password: "",
        confirm_password: "",
    };

    const [data, setData] = useState(initialData);

    const handleOpen = () => {
        setOpen(!open);
        setErrors({});
        setData(initialData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Простое форматирование номера
        let val = value;
        if (name === "phone") {
            val = value.replace(/[^\d+]/g, ""); // оставляем только цифры и +
        }

        setData((prev) => ({ ...prev, [name]: val }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateFields = () => {
        const newErrors = {};

        if (!data.name.trim()) newErrors.name = "Iltimos, ombor nomini kiriting";
        if (!data.username.trim()) newErrors.username = "Iltimos, username kiriting";
        if (!data.full_name.trim()) newErrors.full_name = "Iltimos, to'liq ism kiriting";
        if (!data.phone.trim()) newErrors.phone = "Iltimos, telefon raqam kiriting";
        else if (!/^\+998\d{9}$/.test(data.phone)) newErrors.phone = "Telefon raqam noto'g'ri formatda (+998xxxxxxxxx)";

        if (!data.password.trim()) newErrors.password = "Iltimos, parol kiriting";
        else if (data.password.length < 6) newErrors.password = "Parol kamida 6 belgidan iborat bo'lishi kerak";

        if (!data.confirm_password.trim()) newErrors.confirm_password = "Iltimos, parolni tasdiqlang";
        else if (data.password !== data.confirm_password) newErrors.confirm_password = "Parollar mos kelmadi";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createWarehouse = async () => {
        if (!validateFields()) return;

        try {
            setLoading(true);

            const payload = {
                name: data.name,
                username: data.username,
                full_name: data.full_name,
                phone: data.phone,
                password: data.password,
                type: "warehouse",
                address: 'Korsatilmagan',
                parent_id: Cookies.get("ul_nesw") || "",

            };

            await WarehouseApi.CreateWarehouse(payload);

            Alert("Ombor muvaffaqiyatli yaratildi", "success");
            handleOpen();
            refresh();
        } catch (error) {
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-black text-white normal-case hover:bg-gray-800 active:bg-gray-900 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
                + Yangi Ombor
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Ombor yaratish</DialogHeader>
                <DialogBody divider className="space-y-4">
                    <div>
                        <Input
                            label="Ombor nomi *"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            error={!!errors.name}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Input
                            label="Ombor logini *"
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            error={!!errors.username}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <Input
                            label="Omborchi ismi *"
                            name="full_name"
                            value={data.full_name}
                            onChange={handleChange}
                            error={!!errors.full_name}
                        />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                        <Input
                            label="Telefon raqam *"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <Input
                            label="Parol *"
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={handleChange}
                            error={!!errors.password}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <Input
                            label="Parolni tasdiqlash *"
                            name="confirm_password"
                            type="password"
                            value={data.confirm_password}
                            onChange={handleChange}
                            error={!!errors.confirm_password}
                        />
                        {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                    </div>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="text" color="gray" onClick={handleOpen} disabled={loading}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={createWarehouse}
                        disabled={loading}
                        className={`bg-black text-white ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
