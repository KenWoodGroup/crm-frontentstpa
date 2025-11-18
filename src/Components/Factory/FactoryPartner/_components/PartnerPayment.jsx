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

export default function ParentPayment({ refresh, partner }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        status: "confirmed",
        payer_id: Cookies.get("ul_nesw") || "",
        receiver_id: partner?.id,
        note: "",
        created_by: Cookies.get("us_nesw") || "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const CreatePayment = async () => {
        setLoading(true);
        try {
            await Payment.PaymentPartner(form);

            Alert("To'lov muvaffaqiyatli yaratildi", "success");

            setForm({
                amount: "",
                status: "confirmed",
                payer_id: "",
                receiver_id: "",
                note: "",
                created_by: Cookies.get("ul_nesw") || "",
            });

            handleOpen();
            refresh && refresh();
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi", "error");
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
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>To‘lov qo‘shish</DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Summasi"
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={handleChange}
                    />
                    <Textarea
                        label="Izoh"
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                    />
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={CreatePayment}
                        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading && <Spinner size="sm" />}
                        Qo‘shish
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
