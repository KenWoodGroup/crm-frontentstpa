import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { Cash } from "../../../../utils/Controllers/Cash";
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { useTranslation } from "react-i18next";

export default function ClientDetailPayment({ client, refresh, invoice }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        amount: "",
        method_id: "", // меняем на method_id для ID метода оплаты
        status: "confirmed",
        payer_id: client?.id,
        receiver_id: Cookies?.get("ul_nesw"),
        note: "",
        cash_id: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    const GetAllCash = async () => {
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];
            setCashes(data);

            if (data.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    cash_id: prev.cash_id || String(data[0].id)
                }));
            }
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    const getAllPaymentMethod = async () => {
        try {
            const response = await PaymentMethodApi.PaymentTypeGet(Cookies?.get("ul_nesw"));
            const methods = response?.data || [];
            setPaymentMethods(methods);

            if (methods.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    method_id: prev.method_id || String(methods[0].id)
                }));
            }
        } catch (error) {
            console.log(error);
            setPaymentMethods([]);
        }
    };

    // форматирование суммы с пробелами
    const formatNumber = (value) => {
        if (!value) return "";
        const numericValue = value.replace(/\D/g, "");
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // обработка изменений
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "amount") {
            setForm((prev) => ({
                ...prev,
                amount: formatNumber(value),
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!form.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }
        if (!form.method_id) {
            Alert("Выберите метод оплаты!", "warning");
            return;
        }

        try {
            const numericAmount = Number(form.amount.replace(/\s/g, ""));

            // формируем payload динамически
            const payload = {
                ...form,
                amount: numericAmount,
                method_id: form.method_id, // отправляем ID метода оплаты
            };

            // если invoice передан — добавляем поле invoices
            if (invoice) {
                payload.invoices = [{ invoice_id: invoice.id }];
            }

            await Payment.Payment(payload);
            Alert("Muvaffaqiyatli", "success");

            handleOpen();
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                cash_id: "",
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });

            if (refresh) refresh();
        } catch (error) {
            console.log("Xato:", error);
            Alert("To'lovni yaratishda xato", "error");
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
            getAllPaymentMethod();
        } else {
            // Сбрасываем форму при закрытии диалога
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                cash_id: "",
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });
        }
    }, [open]);

    return (
        <>
            <Button className="py-[10px]" color="green" onClick={handleOpen}>
                {t('Payment')}
            </Button>

            <Dialog className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
                open={open} handler={handleOpen} size="sm">
                <DialogHeader className="flex justify-between items-center dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                    {t('Create_Payment')}
                </DialogHeader>

                <DialogBody divider className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark">
                    <Input
                        label={t('Price__sum')}
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />

                    <Select
                        label={t('Kassa')}
                        value={form.cash_id}
                        onChange={(val) => setForm((p) => ({ ...p, cash_id: val }))}
                        className="text-gray-900 dark:text-text-dark outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
                        }}
                    >
                        {cashes.map((cash) => (
                            <Option key={cash.id} value={String(cash.id)}>
                                {`${cash.name} — ${Number(cash.balance).toLocaleString()} so'm`}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label={t('Payment_type')}
                        value={form.method_id}
                        onChange={(val) => setForm((p) => ({ ...p, method_id: val }))}
                        className="text-gray-900 dark:text-text-dark outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
                        }}
                    >
                        {paymentMethods.map((method) => (
                            <Option key={method.id} value={String(method.id)}>
                                {method.name || `Метод ${method.id}`}
                            </Option>
                        ))}
                    </Select>

                    <Textarea
                        label={t('Comment')}
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button color="green" onClick={handleSubmit}>
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}