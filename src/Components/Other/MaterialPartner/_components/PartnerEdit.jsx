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
import Edit from "../../../UI/Icons/Edit";
import { useTranslation } from "react-i18next";

export default function PartnerEdit({ partner, refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [form, setForm] = useState({
        name: partner?.name || "",
        address: partner?.address || "",
        phone: partner?.phone || "+998",
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
            await Partner.PartnerEdit(partner.id, form);
            Alert(`${t('success')}`, "success");

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
        <>
            {/* Кнопка для открытия модалки */}
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 normal-case p-[8px] transition-colors duration-200"
            >
                <Edit size={20} />
            </Button>

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t('Edit')}
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
                        disabled={loading} // блокируем при загрузке
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        disabled={loading} // блокировка кнопки при загрузке
                    >
                        {loading && <Spinner size="sm" />}
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
