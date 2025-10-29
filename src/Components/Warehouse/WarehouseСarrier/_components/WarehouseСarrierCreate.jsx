import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Staff } from "../../../../utils/Controllers/Staff";


export default function WarehouseСarrierCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get(`ul_nesw`),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await Staff?.CreateStaff(form)
            Alert("Muvaffaqiyatli yaratildi ", "success");
            setForm({
                role: "carrier",
                phone: "+998",
            })
            handleOpen()
            refresh()
        } catch (error) {
            Alert("Xato ", "error");
            console.log(error)
        }
    };

    return (
        <div className="">
            <Button onClick={handleOpen}>
                + Добавить Поставшик
            </Button>
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создание Поставшик</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label="Имя клиента"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>

                        <Input
                            label="Телефон"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
