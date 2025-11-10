import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    IconButton,
    Tooltip,
    Button,
} from "@material-tailwind/react";
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";
import { useTranslation } from "react-i18next";

export default function PaymentTypeEdit({ item, refresh }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation()
    const [form, setForm] = useState({
        id: item?.id || "",
        name: item?.name || "",
        note: item?.note || "",
    });

    const handleOpen = () => {
        // перед открытием модалки — обновляем форму
        setForm({
            id: item?.id || "",
            name: item?.name || "",
            note: item?.note || "",
        });
        setOpen(!open);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await PaymentMethodApi.PaymentTypeUpdate(form.id, {
                name: form.name,
                note: form.note,
            });
            Alert(`${'success'}`, "success");
            handleOpen();
            refresh && refresh();
        } catch (error) {
            Alert(`${'Error'}`, "error");
            console.log(error);
        }
    };

    return (
        <>
            <Tooltip content={'Edit'}>
                <IconButton
                    variant="text"
                    color="blue"
                    onClick={handleOpen}
                >
                    <Edit size={18} />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t('Payment_type_Edit')}
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
                        label={t("Comment")}
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
        </>
    );
}
