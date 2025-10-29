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
import Edit from "../../../UI/Icons/Edit";

export default function ManagerFactoryEdit({ refresh, data }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const [form, setForm] = useState({
        companyName: data?.name || "",
        companyEmail: data?.email || "",
        companyPhone: data?.phone || "",
        legalAddress: data?.address || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const readyData = {
                name: form.companyName,
                full_name: form.fullName,
                email: form.companyEmail,
                phone: form.companyPhone,
                address: form.legalAddress,
            };

            const response = await location.Put(data.id, readyData);
            Alert("Muvaffaqiyatli tahrirlandi ", "success");
            handleOpen();
            refresh();

        } catch (error) {
            Alert(`Xatolik: ${error?.response?.data?.message || ""}`, "error");
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
                className="bg-yellow-600 text-white hover:bg-yellow-700 normal-case p-[8px]"
            >
                <Edit size={20} />
            </Button>
            <Dialog open={open} handler={handleOpen} size="sm" className="max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <Typography variant="h4" className="text-left text-gray-900">
                        Fabrikani tahrirlash
                    </Typography>
                </DialogHeader>

                <DialogBody className="py-4">
                    <form onSubmit={handleSubmit} noValidate>
                        {/* Левая колонка */}
                        <div className="space-y-4">
                            <Input
                                label="Kompaniya nomi"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Kompaniya emaili"
                                name="companyEmail"
                                value={form.companyEmail}
                                onChange={handleChange}
                                type="email"
                            />
                            <Input
                                label="Telefon raqam"
                                name="companyPhone"
                                value={form.companyPhone}
                                onChange={handleChange}
                                type="tel"
                            />
                            <Input
                                label="Yuridik manzil"
                                name="legalAddress"
                                value={form.legalAddress}
                                onChange={handleChange}
                            />
                        </div>


                        {/* Кнопки */}
                        <div className="flex justify-end pt-4 gap-3">
                            <Button
                                type="button"
                                color="gray"
                                variant="outlined"
                                onClick={handleOpen}
                            >
                                Bekor qilish
                            </Button>
                            {loading ? (
                                <Button type="button" className="flex items-center gap-2" disabled>
                                    <Spinner />
                                    Saqlanmoqda...
                                </Button>
                            ) : (
                                <Button type="submit" color="blue">
                                    Saqlash
                                </Button>
                            )}
                        </div>
                    </form>
                </DialogBody>
            </Dialog>
        </>
    );
}
