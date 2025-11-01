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

export default function WarehouseCarrierCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get("ul_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await Staff.CreateStaff(form);
            Alert("Muvaffaqiyatli yaratildi", "success");
            setForm({
                role: "carrier",
                full_name: "",
                phone: "+998",
                location_id: Cookies.get("ul_nesw"),
            });
            handleOpen();
            refresh();
        } catch (error) {
            Alert("Xato", "error");
            console.log(error);
        }
    };

    return (
        <div>
            {/* Кнопка открытия */}
            <Button
                onClick={handleOpen}
                className="bg-text-light text-card-light normal-case hover:bg-gray-800
                           dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300
                           transition-colors"
            >
                + Добавить Доставщика
            </Button>

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="bg-card-light text-text-light dark:bg-card-dark dark:text-text-dark"
            >
                <DialogHeader className="text-text-light dark:text-text-dark">
                    Создание Доставщика
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 bg-background-light dark:bg-background-dark"
                >
                    <Input
                        label="Имя Доставщика"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Input
                        label="Телефон"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                </DialogBody>

                <DialogFooter className="bg-card-light dark:bg-card-dark rounded-b-lg">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 normal-case text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-text-light text-card-light normal-case hover:bg-gray-800
                                   dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300
                                   transition-colors"
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
