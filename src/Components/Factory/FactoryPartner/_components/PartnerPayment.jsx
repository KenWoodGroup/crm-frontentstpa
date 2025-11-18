import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Spinner,
    Textarea,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { useTranslation } from "react-i18next";

export default function ParentPayment({ refresh, partner }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        amount: 0,
        status: "confirmed",
        payer_id: Cookies.get("ul_nesw") || "",
        receiver_id: partner?.id,
        note: "",
        created_by: Cookies.get("us_nesw") || "",
    });

    // ------------ FORMAT FUNCTIONS ---------------
    const formatNumber = (value) => {
        if (!value) return "";
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const unFormatNumber = (value) => {
        return value.replace(/\s/g, "");
    };

    // ------------ INPUT CHANGE HANDLER -----------
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            const pure = unFormatNumber(value);

            if (!/^\d*$/.test(pure)) return;

            setForm((prev) => ({
                ...prev,
                amount: Number(pure), // <-- передаём как number
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleOpen = () => setOpen(!open);

    // ------------ CREATE PAYMENT ----------------
    const CreatePayment = async () => {
        setLoading(true);

        try {
            await Payment.PaymentPartner(form);

            Alert(t(`success`), "success");

            setForm({
                amount: 0,
                status: "confirmed",
                payer_id: Cookies.get("ul_nesw") || "",
                receiver_id: partner?.id,
                note: "",
                created_by: Cookies.get("us_nesw") || "",
            });

            handleOpen();
            refresh && refresh();

        } catch (error) {
            console.log(error);
            Alert(t(`Error`), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 normal-case p-[8px]"
            >
                <svg className="text-[20px]" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                    <path fill="currentColor" d="M3.5 3A2.5 2.5 0 0 0 1 5.5V6h14v-.5A2.5 2.5 0 0 0 12.5 3zM15 7H1v3.5A2.5 2.5 0 0 0 3.5 13h9a2.5 2.5 0 0 0 2.5-2.5zm-4.5 3h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1"></path>
                </svg>
            </Button>

            {/* Modal */}
            <Dialog
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
                open={open}
                handler={handleOpen}
                size="sm"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    To‘lov qo‘shish
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark" divider>

                    <Input
                        label={t('Price__sum')}
                        name="amount"
                        type="text"
                        value={formatNumber(form.amount)}
                        onChange={handleChange}
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
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={CreatePayment}
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Spinner size="sm" />}
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
