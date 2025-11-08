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
import { PriceType } from "../../../../utils/Controllers/PriceType";

export default function WarehousePriceTypeCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        location_id: Cookies.get("ul_nesw") || "",
        name: "",
        note: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await PriceType.PriceTypeCreatee(form);
            Alert("Тип цены успешно создан", "success");
            setForm({
                location_id: Cookies.get("ul_nesw") || "",
                name: "",
                note: "",
            });
            handleOpen();
            refresh && refresh();
        } catch (error) {
            Alert("Ошибка при создании", "error");
            console.log(error);
        }
    };

    return (
        <div>
            {/* Кнопка открытия модалки */}
            <Button
                onClick={handleOpen}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            >
                Создать тип цены
            </Button>

            {/* Модалка */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    Создание типа цены
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label="Название типа цены"
                        name="name"
                        value={form.name}
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
                        label="Примечание"
                        name="note"
                        value={form.note}
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
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
