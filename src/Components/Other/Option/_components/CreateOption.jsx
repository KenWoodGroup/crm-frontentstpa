import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { OptionApi } from "../../../../utils/Controllers/OptionApi";
import { Alert } from "../../../../utils/Alert";

export default function CreateOption({ refresh }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        price: "",
        note: "",
    });

    const formatNumber = (value) => {
        return value
            .replace(/\D/g, "") // только цифры
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };


    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "price") {
            setForm((prev) => ({
                ...prev,
                price: value.replace(/\D/g, ""), // храним ТОЛЬКО цифры
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };


    const handleSubmit = async () => {
        try {
            await OptionApi.CreateOption({
                name: form.name,
                price: form.price,
                note: form.note,
            });

            Alert("Muvaffaqiyatli yaratildi", "success");

            setForm({
                name: "",
                price: "",
                note: "",
            });

            handleOpen();
            refresh && refresh();
        } catch (error) {
            Alert("Xatolik yuz berdi", "error");
            console.log(error);
        }
    };

    return (
        <>
            {/* Tugma */}
            <Button
                onClick={handleOpen}
                className="bg-blue-600 text-white hover:bg-blue-700"
            >
                + Yaratish
            </Button>

            {/* Modal */}
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>
                    Variant yaratish
                </DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Nomi"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <Input
                        label="Narxi"
                        name="price"
                        value={formatNumber(form.price)}
                        onChange={handleChange}
                        inputMode="numeric"
                    />


                    <Input
                        label="Izoh"
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                    />
                </DialogBody>

                <DialogFooter className="gap-2">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Saqlash
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
