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
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import { Alert } from "../../../../utils/Alert";

export default function RegisterModal({ refresh }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    const handleOpen = () => {
        setOpen(!open)
        // Сброс формы и ошибок при открытии/закрытии модального окна
        setForm({
            companyName: "",
            companyEmail: "",
            companyPhone: "",
            fullName: "",
            password: "",
            confirmPassword: "",
            bank: "",
            stir: "",
            accountNumber: "",
            legalAddress: "",
            activityType: "",
        });
        setErrors({});
    }

    const [form, setForm] = useState({
        companyName: "",
        companyEmail: "",
        companyPhone: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        bank: "",
        stir: "",
        accountNumber: "",
        legalAddress: "",
        activityType: "",
    });

    const [errors, setErrors] = useState({});

    // Функции валидации
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "companyName":
                if (!value.trim()) {
                    error = "Kompaniya nomi majburiy";
                } else if (value.trim().length < 2) {
                    error = "Kompaniya nomi kamida 2 belgidan iborat bo'lishi kerak";
                }
                break;

            case "companyEmail":
                if (!value.trim()) {
                    error = "Email majburiy";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Iltimos, to'g'ri email manzilini kiriting";
                }
                break;

            case "companyPhone":
                if (!value.trim()) {
                    error = "Telefon raqam majburiy";
                } else if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(value.replace(/\s/g, ''))) {
                    error = "Iltimos, to'g'ri telefon raqamini kiriting (+998 XX XXX XX XX)";
                }
                break;

            case "fullName":
                if (!value.trim()) {
                    error = "FISh majburiy";
                } else if (value.trim().length < 3) {
                    error = "FISh kamida 3 belgidan iborat bo'lishi kerak";
                }
                break;

            case "password":
                if (!value) {
                    error = "Parol majburiy";
                } else if (value.length < 8) {
                    error = "Parol kamida 8 belgidan iborat bo'lishi kerak";
                }
                break;

            case "confirmPassword":
                if (!value) {
                    error = "Parolni tasdiqlash majburiy";
                } else if (value !== form.password) {
                    error = "Parollar mos kelmadi";
                }
                break;

            case "bank":
                if (!value.trim()) {
                    error = "Bank nomi majburiy";
                }
                break;

            case "stir":
                if (!value.trim()) {
                    error = "STIR/INN majburiy";
                } else if (!/^\d{9}$/.test(value)) {
                    error = "STIR/INN 9 raqamdan iborat bo'lishi kerak";
                }
                break;

            case "accountNumber":
                if (!value.trim()) {
                    error = "Hisob raqami majburiy";
                } else if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
                    error = "Hisob raqami 16 raqamdan iborat bo'lishi kerak";
                }
                break;

            case "legalAddress":
                if (!value.trim()) {
                    error = "Yuridik manzil majburiy";
                } else if (value.trim().length < 10) {
                    error = "Yuridik manzil kamida 10 belgidan iborat bo'lishi kerak";
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateForm = () => {
        const newErrors = {};

        // Валидация всех полей
        Object.keys(form).forEach(key => {
            if (key !== "termsAccepted") { // Пропускаем чекбокс
                const error = validateField(key, form[key]);
                if (error) {
                    newErrors[key] = error;
                }
            }
        });

        // Валидация типа деятельности
        if (!form.activityType) {
            newErrors.activityType = "Faoliyat turini tanlash majburiy";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let processedValue = value;

        // Форматирование номера телефона
        if (name === "companyPhone") {
            processedValue = formatPhoneNumber(value);
        }

        // Форматирование номера счета (добавление пробелов каждые 4 цифры)
        if (name === "accountNumber") {
            processedValue = formatAccountNumber(value);
        }

        // Форматирование STIR (только цифры)
        if (name === "stir") {
            processedValue = value.replace(/\D/g, '').slice(0, 9);
        }

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : processedValue,
        }));

        // Валидация в реальном времени для полей, которые были изменены
        if (errors[name]) {
            const error = validateField(name, type === "checkbox" ? checked : processedValue);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }

        // Особенная валидация для confirmPassword при изменении password
        if (name === "password" && form.confirmPassword) {
            const confirmError = validateField("confirmPassword", form.confirmPassword);
            setErrors(prev => ({
                ...prev,
                confirmPassword: confirmError
            }));
        }
    };

    // Функция форматирования номера телефона
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');

        if (numbers.startsWith('998')) {
            const match = numbers.match(/^998(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
            if (match) {
                return `+998 ${match[1] ? match[1] : ''}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}${match[4] ? ' ' + match[4] : ''}`.trim();
            }
        }

        return value;
    };

    // Функция форматирования номера счета
    const formatAccountNumber = (value) => {
        const numbers = value.replace(/\D/g, '').slice(0, 16);
        return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const handleActivitySelect = (type) => {
        setForm((prev) => ({ ...prev, activityType: type }));
        // Убираем ошибку при выборе типа деятельности
        if (errors.activityType) {
            setErrors(prev => ({
                ...prev,
                activityType: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация всей формы перед отправкой
        if (!validateForm()) {
            Alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring", "error");
            return;
        }

        try {
            setLoading(true);

            // Очистка данных перед отправкой (удаление пробелов)
            const cleanData = {
                ...form,
                companyPhone: form.companyPhone.replace(/\s/g, ''),
                accountNumber: form.accountNumber.replace(/\s/g, ''),
                stir: form.stir.replace(/\s/g, '')
            };

            const readyLocation = {
                type: cleanData.activityType,
                name: cleanData.companyName,
                full_name: cleanData.fullName,
                address: cleanData.legalAddress,
                phone: cleanData.companyPhone,
                email: cleanData.companyEmail,
                password: cleanData.password,
            };

            const base_data = await location.Post(readyLocation);

            if (base_data.status === 201) {
                const readyLocationInfo = {
                    list: [
                        { location_id: base_data.data.location.id, key: "bank", value: cleanData.bank },
                        { location_id: base_data.data.location.id, key: "stir", value: cleanData.stir },
                        { location_id: base_data.data.location.id, key: "account_number", value: cleanData.accountNumber },
                        { location_id: base_data.data.location.id, key: "terms_accepted", value: String(cleanData.termsAccepted) },
                    ],
                };

                await locationInfo.Post(readyLocationInfo);
                Alert("Muvaffaqiyatli ro'yxatdan o'tdingiz", "success");
                handleOpen();
                refresh();
            }
        } catch (error) {
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message || "Noma'lum xatolik"}`, "error");
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

            <Dialog open={open} handler={handleOpen} size="xl" className="max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <Typography variant="h4" className="text-left text-gray-900">
                        Factory yaratish
                    </Typography>
                </DialogHeader>

                <DialogBody className="py-4">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Левая колонка */}
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        label="Kompaniya nomi *"
                                        name="companyName"
                                        value={form.companyName}
                                        onChange={handleChange}
                                        placeholder="Kenwood Qurilish MChJ"
                                        error={!!errors.companyName}
                                    />
                                    {errors.companyName && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.companyName}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="Kompaniya emaili *"
                                        name="companyEmail"
                                        value={form.companyEmail}
                                        onChange={handleChange}
                                        placeholder="email@company.uz"
                                        type="email"
                                        error={!!errors.companyEmail}
                                    />
                                    {errors.companyEmail && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.companyEmail}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="Telefon raqam *"
                                        name="companyPhone"
                                        value={form.companyPhone}
                                        onChange={handleChange}
                                        placeholder="+998 90 123 45 67"
                                        type="tel"
                                        error={!!errors.companyPhone}
                                    />
                                    {errors.companyPhone && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.companyPhone}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="FISh *"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Ism Familiya"
                                        error={!!errors.fullName}
                                    />
                                    {errors.fullName && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.fullName}
                                        </Typography>
                                    )}
                                </div>
                            </div>

                            {/* Правая колонка */}
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        label="Parol *"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Kamida 8 belgi"
                                        type="password"
                                        error={!!errors.password}
                                    />
                                    {errors.password && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.password}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="Parolni tasdiqlash *"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Parolni qayta kiriting"
                                        type="password"
                                        error={!!errors.confirmPassword}
                                    />
                                    {errors.confirmPassword && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.confirmPassword}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="Bank *"
                                        name="bank"
                                        value={form.bank}
                                        onChange={handleChange}
                                        placeholder="Bank nomi"
                                        error={!!errors.bank}
                                    />
                                    {errors.bank && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.bank}
                                        </Typography>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        label="STIR / INN *"
                                        name="stir"
                                        value={form.stir}
                                        onChange={handleChange}
                                        placeholder="Masalan: 123456789"
                                        error={!!errors.stir}
                                    />
                                    {errors.stir && (
                                        <Typography variant="small" color="red" className="mt-1 text-xs">
                                            {errors.stir}
                                        </Typography>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Нижние поля */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <Input
                                    label="Hisob raqami *"
                                    name="accountNumber"
                                    value={form.accountNumber}
                                    onChange={handleChange}
                                    placeholder="1234 5678 9101 1121"
                                    error={!!errors.accountNumber}
                                />
                                {errors.accountNumber && (
                                    <Typography variant="small" color="red" className="mt-1 text-xs">
                                        {errors.accountNumber}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Yuridik manzil *"
                                    name="legalAddress"
                                    value={form.legalAddress}
                                    onChange={handleChange}
                                    placeholder="Viloyat, shahar, ko'cha, uy"
                                    error={!!errors.legalAddress}
                                />
                                {errors.legalAddress && (
                                    <Typography variant="small" color="red" className="mt-1 text-xs">
                                        {errors.legalAddress}
                                    </Typography>
                                )}
                            </div>
                        </div>

                        {/* Тип деятельности */}
                        <div className="mb-6">
                            <Typography variant="small" className="block mb-3 font-medium text-gray-900">
                                Faoliyat turi *
                            </Typography>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant={form.activityType === "factory" ? "filled" : "outlined"}
                                    color={form.activityType === "factory" ? "blue" : "gray"}
                                    onClick={() => handleActivitySelect("factory")}
                                    className="flex-1"
                                >
                                    Ta'minotchi
                                </Button>
                                <Button
                                    type="button"
                                    variant={form.activityType === "company" ? "filled" : "outlined"}
                                    color={form.activityType === "company" ? "blue" : "gray"}
                                    onClick={() => handleActivitySelect("company")}
                                    className="flex-1"
                                >
                                    Iste'molchi
                                </Button>
                            </div>
                            {errors.activityType && (
                                <Typography variant="small" color="red" className="mt-1 text-xs">
                                    {errors.activityType}
                                </Typography>
                            )}
                        </div>


                        {/* Кнопка отправки */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4">
                                {loading ? (
                                    <Button type="button" className="flex items-center gap-2 bg-blue-500" disabled>
                                        <Spinner />
                                        Yaratilmoqda...
                                    </Button>
                                ) : (
                                    <Button type="submit" color="blue" className="w-full sm:w-auto">
                                        Yaratish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </DialogBody>
            </Dialog>
        </>
    );
}