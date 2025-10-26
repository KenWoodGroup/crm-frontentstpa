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

export default function ManagerDealerCreate({ refresh }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    const handleOpen = () => {
        setOpen(!open)
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
        termsAccepted: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const readyLocation = {
                type: 'independent',
                name: form.companyName,
                full_name: form.fullName,
                address: form.legalAddress,
                phone: form.companyPhone,
                email: form.companyEmail,
                password: form.password,
            };

            const base_data = await location.Post(readyLocation);

            if (base_data.status === 201) {
                const readyLocationInfo = {
                    list: [
                        { location_id: base_data.data.location.id, key: "bank", value: form.bank },
                        { location_id: base_data.data.location.id, key: "stir", value: form.stir },
                        { location_id: base_data.data.location.id, key: "account_number", value: form.accountNumber },
                        { location_id: base_data.data.location.id, key: "terms_accepted", value: String(form.termsAccepted) },
                    ],
                };

                await locationInfo.Post(readyLocationInfo);
                Alert("Muvaffaqiyatli ", "success");
                handleOpen();
                refresh()
            }
        } catch (error) {
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message || ""}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const Spinner = () => (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    );

    return (
        <>
            {/* Кнопка для открытия модального окна */}
            <Button
                onClick={handleOpen}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
                Ro'yxatdan o'tish
            </Button>

            <Dialog open={open} handler={handleOpen} size="xl" className="max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <Typography variant="h4" className="text-left text-gray-900">
                        Dealer yaratish
                    </Typography>
                </DialogHeader>

                <DialogBody className="py-4">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Левая колонка */}
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        label="Kompaniya nomi"
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
                                        label="Kompaniya emaili"
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
                                        label="Telefon raqam"
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
                                        label="FISh"
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
                                        label="Parol"
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
                                        label="Parolni tasdiqlash"
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
                                        label="Bank"
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
                                        label="STIR / INN"
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
                                    label="Hisob raqami"
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
                                    label="Yuridik manzil"
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
                        {/* Чекбокс и кнопки */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4">
                                {loading ? (
                                    <Button type="button" className="flex items-center gap-2" disabled>
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