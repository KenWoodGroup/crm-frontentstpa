import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import { OptionApi } from "../../../../utils/Controllers/OptionApi";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";

export default function EditOption({ data, refresh }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        price: "",
        note: "",
    });

    const formatNumber = (value) => {
        return value
            .replace(/\D/g, "")
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleOpen = () => setOpen(!open);

    // 👉 Заполняем форму при открытии
    useEffect(() => {
        if (open && data) {
            setForm({
                name: data.name || "",
                price: data.price
                    ? data.price.replace(/\D/g, "")
                    : "",
                note: data.note || "",
            });
        }
    }, [open, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "price") {
            setForm((prev) => ({
                ...prev,
                price: value.replace(/\D/g, ""),
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            await OptionApi.UpdateOption(data.id, {
                name: form.name,
                price: form.price,
                note: form.note,
            });

            Alert("Muvaffaqiyatli yangilandi", "success");
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
           <Tooltip content={'Edit'}>
                           <IconButton
                               variant="text"
                               color="blue"
                               onClick={handleOpen}
                           >
                               <Edit size={18} />
                           </IconButton>
                       </Tooltip>
           
            {/* Modal */}
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>
                    Variantni tahrirlash
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
                    <Button variant="text" onClick={handleOpen}>
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
