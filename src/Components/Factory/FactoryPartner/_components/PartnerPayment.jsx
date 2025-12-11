import React, { useEffect, useState } from "react";
import {
    Dialog, DialogHeader, DialogBody, DialogFooter,
    Button, Input, IconButton, Tooltip, Textarea
} from "@material-tailwind/react";
import { BanknoteArrowDown } from "lucide-react";
import Cookies from "js-cookie";
import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { Cash } from "../../../../utils/Controllers/Cash";
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { useTranslation } from "react-i18next";
import { location } from "../../../../utils/Controllers/location";

export default function PartnerPayment({ partner, refresh }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);
    const [warehouse, setWarehouses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        amount: "",
        method_id: "",
        status: "confirmed",
        receiver_id: partner?.id,
        payer_id: "",
        cash_id: "",
        note: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen((p) => !p);

    const GetAllCash = async () => {
        try {
            const response = await Cash.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];

            setCashes(data);

            if (data.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    cash_id: prev.cash_id || String(data[0].id)
                }));
            }
        } catch {
            setCashes([]);
        }
    };

    const getAllPaymentMethod = async () => {
        try {
            const response = await PaymentMethodApi.PaymentTypeGet(Cookies.get("ul_nesw"));
            const methods = response?.data || [];

            setPaymentMethods(methods);

            if (methods.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    method_id: prev.method_id || String(methods[0].id)
                }));
            }
        } catch {
            setPaymentMethods([]);
        }
    };

    const getWarehouse = async () => {
        try {
            const response = await location.GetAllWarehouse(Cookies.get("ul_nesw"));
            setWarehouses(response.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const formatNumber = (value) => {
        if (!value) return "";
        const numeric = value.replace(/\D/g, "");
        return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            setForm((prev) => ({ ...prev, amount: formatNumber(value) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!form.cash_id) return Alert("Выберите кассу!", "warning");
        if (!form.method_id) return Alert("Выберите метод оплаты!", "warning");
        if (!form.payer_id) return Alert("Выберите склад!", "warning");

        try {
            const numericAmount = Number(form.amount.replace(/\s/g, ""));

            const payload = {
                ...form,
                amount: numericAmount,
            };

            await Payment.PaymentPartner(payload);

            Alert(t("success"), "success");

            handleOpen(); // закрыть модалку

            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                payer_id: partner?.id,
                receiver_id: "",
                cash_id: "",
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });

            if (refresh) refresh();
        } catch (error) {
            console.log("Ошибка:", error);
            Alert(t("Error_occurred"), "error");
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
            getWarehouse();
            getAllPaymentMethod();
        } else {
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                payer_id: partner?.id,
                receiver_id: "",
                cash_id: "",
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });
        }
    }, [open]);

    return (
        <>
            <Tooltip content={t("Create_Payment")}>
                <IconButton variant="text" color="green" onClick={handleOpen}>
                    <BanknoteArrowDown size={18} />
                </IconButton>
            </Tooltip>

            <Dialog open={open} handler={handleOpen} size="sm"
                className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl">

                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t("Create_Payment")}
                </DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">

                    {/* Amount */}
                    <Input
                        label={t("Price__sum")}
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    {/* Warehouse Select */}
                    <div>
                        <label className="text-gray-700 dark:text-text-dark font-medium">
                            {t("Warehouse")}
                        </label>

                        <select
                            value={form.warehouse_id}
                            onChange={(e) => {
                                const val = e.target.value;
                                setForm(prev => ({
                                    ...prev,
                                    receiver_id: val || ""
                                }));
                            }}
                            className="
                                mt-1 w-full px-3 py-2 rounded-lg border border-gray-300
                                dark:border-gray-700 dark:bg-gray-800 dark:text-white
                                focus:ring-2 focus:ring-blue-500 outline-none transition
                            "
                        >
                            <option value="">{t("")}</option>
                            {warehouse.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cash Select */}
                    <div>
                        <label className="text-gray-700 dark:text-text-dark font-medium">
                            {t("Kassa")}
                        </label>

                        <select
                            value={form.cash_id}
                            onChange={(e) => setForm((p) => ({ ...p, cash_id: e.target.value }))}
                            className="
                                mt-1 w-full px-3 py-2 rounded-lg border border-gray-300
                                dark:border-gray-700 dark:bg-gray-800 dark:text-white
                                focus:ring-2 focus:ring-blue-500 outline-none transition
                            "
                        >
                            {cashes.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name} — {Number(c.balance).toLocaleString()} so'm
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment method */}
                    <div>
                        <label className="text-gray-700 dark:text-text-dark font-medium">
                            {t("Payment_type")}
                        </label>

                        <select
                            value={form.method_id}
                            onChange={(e) => setForm((p) => ({ ...p, method_id: e.target.value }))}
                            className="
                                mt-1 w-full px-3 py-2 rounded-lg border border-gray-300
                                dark:border-gray-700 dark:bg-gray-800 dark:text-white
                                focus:ring-2 focus:ring-blue-500 outline-none transition
                            "
                        >
                            {paymentMethods.map((method) => (
                                <option key={method.id} value={String(method.id)}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Note */}
                    <Textarea
                        label={t("Comment")}
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

                <DialogFooter className="border-t dark:border-gray-700">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        {t("Cancel")}
                    </Button>

                    <Button color="green" onClick={handleSubmit}>
                        {t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
