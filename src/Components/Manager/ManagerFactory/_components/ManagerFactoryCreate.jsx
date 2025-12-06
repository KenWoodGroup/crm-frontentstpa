import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    Input,
    Typography,
} from "@material-tailwind/react";
import { location } from "../../../../utils/Controllers/location";
import { Alert } from "../../../../utils/Alert";

export default function RegisterModal({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => {
        setOpen(!open);
        setForm({
            companyName: "",
            username: "",
            password: "",
        });
        setErrors({});
    };

    const [form, setForm] = useState({
        companyName: "",
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    // Валидация обязательных полей
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "companyName":
                if (!value.trim()) error = "Kompaniya nomi majburiy";
                break;

            case "username":
                if (!value.trim()) error = "Username majburiy";
                break;

            case "password":
                if (!value) {
                    error = "Parol majburiy";
                } else if (value.length < 6) {
                    error = "Parol kamida 6 belgidan iborat bo'lishi kerak";
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateForm = () => {
        const newErrors = {};
        ["companyName", "username", "password"].forEach((key) => {
            const error = validateField(key, form[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (["companyName", "username", "password"].includes(name)) {
            const error = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Alert("Iltimos, barcha majburiy maydonlarni to'ldiring", "error");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: form.companyName,
                full_name: form.companyName,
                username: form.username,
                phone: '998901234567',
                password: form.password,
                address: 'Berilmagan',
                type: "factory",
            };

            const response = await location.Post(payload);

            if (response.status === 201) {
                Alert("Muvaffaqiyatli ro'yxatdan o'tdingiz", "success");
                handleOpen();
                refresh();
            }
        } catch (error) {
            Alert(
                `Xatolik yuz berdi: ${error?.response?.data?.message || error.message || "Noma'lum xatolik"}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const Spinner = () => (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    );

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
                Ro'yxatdan o'tish
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm" className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300 max-h-[90vh] overflow-y-auto" >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Yangi kompaniya yaratish
                </DialogHeader>

                <DialogBody className="py-4">
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <div>
                            <Input
                                label="Kompaniya nomi *"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                                placeholder="Masalan: Kenwood MChJ"
                                error={!!errors.companyName}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                            />
                            {errors.companyName && (
                                <Typography variant="small" color="red" className="mt-1 text-xs">
                                    {errors.companyName}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Username *"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Masalan: kenwood_user"
                                error={!!errors.username}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                            />
                            {errors.username && (
                                <Typography variant="small" color="red" className="mt-1 text-xs">
                                    {errors.username}
                                </Typography>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Parol *"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Kamida 6 belgidan iborat"
                                type="password"
                                error={!!errors.password}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}  
                            />
                            {errors.password && (
                                <Typography variant="small" color="red" className="mt-1 text-xs">
                                    {errors.password}
                                </Typography>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            {loading ? (
                                <Button type="button" className="flex items-center gap-2 bg-blue-500" disabled>
                                    <Spinner /> Yaratilmoqda...
                                </Button>
                            ) : (
                                <Button type="submit" color="blue">
                                    Yaratish
                                </Button>
                            )}
                        </div>
                    </form>
                </DialogBody>
            </Dialog>
        </>
    );
}
