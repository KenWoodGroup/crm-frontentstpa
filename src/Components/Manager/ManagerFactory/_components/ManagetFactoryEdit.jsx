import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    Input,
} from "@material-tailwind/react";
import { location } from "../../../../utils/Controllers/location";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";

export default function ManagerFactoryEdit({ refresh, data }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const [form, setForm] = useState({
        companyName: data?.name || "",
        Username: data?.users?.[0]?.username || "",
        companyPhone: data?.phone || "",
        legalAddress: data?.address || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const readyData = {
                name: form.companyName,
                username: form.Username,       // ← поправлено
                phone: form.companyPhone,
                address: form.legalAddress,
            };

            await location.Put(data.id, readyData);

            Alert("Muvaffaqiyatli tahrirlandi", "success");
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

            <Dialog open={open} handler={handleOpen} size="sm"
                className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl max-h-[90vh] overflow-y-auto"
            >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
                    Fabrikani tahrirlash
                </DialogHeader>

                <DialogBody className="py-4">
                    <form onSubmit={handleSubmit}>

                        <div className="space-y-4">
                            <Input
                                label="Kompaniya nomi"
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Login"
                                name="Username"
                                value={form.Username}
                                onChange={handleChange}
                            />
                            <Input
                                label="Telefon raqam"
                                name="companyPhone"
                                value={form.companyPhone}
                                onChange={handleChange}
                                type="tel"
                            />
                            <Input
                                label="Manzil"
                                name="legalAddress"
                                value={form.legalAddress}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={handleOpen}
                            >
                                Bekor qilish
                            </Button>

                            {loading ? (
                                <Button type="button" disabled className="flex items-center gap-2">
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
