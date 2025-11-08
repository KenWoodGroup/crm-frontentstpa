import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Spinner,
} from "@material-tailwind/react";
import { Partner } from "../../../../utils/Controllers/Partner";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { useTranslation } from "react-i18next";

export default function PartnerCreate({ refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [form, setForm] = useState({
        type: "partner",
        name: "",
        address: "",
        phone: "+998",
        parent_id: Cookies.get("ul_nesw") || "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true); // включаем загрузку
        try {
            await Partner.PartnerCreate(form);
            Alert(`${t('success')}`, "success");
            setForm({
                type: "partner",
                name: "",
                address: "",
                phone: "+998",
                parent_id: Cookies.get("ul_nesw") || "",
            });

            handleOpen();
            refresh && refresh();
        } catch (error) {
            Alert(`${t('Error_occurred')}`, "error");
            console.log(error);
        } finally {
            setLoading(false); // отключаем загрузку
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
                    {t('Add_partner')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label={`${t(`Name_partner`)}`}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Input
                        label={`${t(`Address`)}`}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Input
                        label={`${t(`Phone_number`)}`}
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
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
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        disabled={loading} // блокировка кнопки при загрузке
                    >
                        {loading && <Spinner size="sm" />}
                        {t(`Add`)}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
