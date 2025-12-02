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
import { useTranslation } from "react-i18next";


export default function PriceTypeCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
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
            Alert(`${t('success')}`, "success");
            setForm({
                location_id: Cookies.get("ul_nesw") || "",
                name: "",
                note: "",
            });
            handleOpen();
            refresh && refresh();
        } catch (error) {
            Alert(`${t('Error')}`, "error");
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
                + {t('Add')}
            </Button>

            {/* Модалка */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t('Type_Price')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label={t('Name')}
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
                        label={t('Comment')}
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
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                    >
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
