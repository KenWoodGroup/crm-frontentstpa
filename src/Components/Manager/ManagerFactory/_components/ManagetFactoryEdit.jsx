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
        Username: data?.users[0]?.username || "",
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
                Username: form.Username,
                full_name: form.fullName,
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
            <Dialog open={open} handler={handleOpen} size="sm" className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300 max-h-[90vh] overflow-y-auto" >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Fabrikani tahrirlash
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
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                            />
                            <Input
                                label="Login"
                                name="Username"
                                value={form.Username}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                                onChange={handleChange}
                            />
                            <Input
                                label="Telefon raqam"
                                name="companyPhone"
                                value={form.companyPhone}
                                onChange={handleChange}
                                type="tel"
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                            />
                            <Input
                                label="Manzil"
                                name="legalAddress"
                                value={form.legalAddress}
                                onChange={handleChange}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                containerProps={{
                                    className: "!min-w-0",
                                }}
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark`,
                                }}
                            />
                        </div>


                        {/* Кнопки */}
                        <div className="flex justify-end pt-4 gap-3">
                            <Button
                                type="button"
                                color="gray"
                                variant="outlined"
                                onClick={handleOpen}
                                className="dark:text-gray-300"

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
