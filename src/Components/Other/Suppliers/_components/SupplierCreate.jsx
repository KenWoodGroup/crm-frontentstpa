import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { Clients } from "../../../../utils/Controllers/Clients";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";


export default function WarehouseSupplierCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        type: "supplier",
        name: "",
        address: "",
        phone: "+998",
        parent_id: Cookies.get(`ul_nesw`),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await Clients?.ClientsCreate(form)
            Alert("Muvaffaqiyatli yaratildi ", "success");
            setForm({
                type: "supplier",
                name: "",
                address: "",
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
                + Добавить поставшика
            </Button>
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создание поставшика</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label="Имя поставшика"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Input
                            label="Адрес"
                            name="address"
                            value={form.address}
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
