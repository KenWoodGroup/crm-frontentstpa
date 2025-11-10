import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Textarea,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { ClientCategory } from "../../../../utils/Controllers/ClientCategory";
import { Alert } from "../../../../utils/Alert";
import { useTranslation } from "react-i18next";

export default function WarehouseClientCategoryCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        try {
            await ClientCategory.ClientCategoryCreate(form);
            Alert(`${'success'}`, "success");

            setForm({
                location_id: Cookies.get("ul_nesw") || "",
                name: "",
                note: "",
            });

            handleOpen();
            refresh && refresh();
        } catch (error) {
            console.log(error);
            Alert(`${'Error'}`, "error");
        } finally {
            setLoading(false);
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
                    {t('Category_Client_Create')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label={t("Name")}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={loading}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Textarea
                        label={t('Comment')}
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        disabled={loading} // ✅ блокируем во время загрузки
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
                        disabled={loading} // ✅ блокируем кнопку
                        className={`dark:text-gray-300 ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            } text-white dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors`}
                    >
                        {loading ? (
                            <>
                                {t('Saving')}
                            </>
                        ) : (
                            t('Save')
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
