import { useState } from "react";
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
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";

export default function WarehouseDilerCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        type: "dealer",
        name: "",
        full_name: "",
        address: "",
        phone: "",
        email: "",
        parent_id: Cookies.get('ul_nesw'),
        password: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.name.trim())
            return Alert("Iltimos, ombor nomini kiriting ❗", "warning");
        if (!data.full_name.trim())
            return Alert("Iltimos, to‘liq ismni kiriting ❗", "warning");
        if (!data.address.trim())
            return Alert("Iltimos, manzilni kiriting ❗", "warning");
        if (!data.phone.trim())
            return Alert("Iltimos, telefon raqam kiriting ❗", "warning");
        if (!data.email.trim())
            return Alert("Iltimos, email kiriting ❗", "warning");
        if (!data.password.trim())
            return Alert("Iltimos, parolni kiriting ❗", "warning");
        return true;
    };

    const CreateWarehouse = async () => {
        if (validateFields() !== true) return;

        try {
            setLoading(true);
            const res = await WarehouseApi.CreateWarehouse(data);

            Alert("Ombor muvaffaqiyatli yaratildi ", "success");
            setOpen(false);
            setData({
                type: "warehouse",
                name: "",
                full_name: "",
                address: "",
                phone: "",
                email: "",
                password: "",
            });
            refresh()
        } catch (error) {
            console.error("Xatolik:", error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-black text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            >
                + Yangi Diler
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-white text-gray-900 rounded-xl dark:bg-card-dark"
            >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Diler maʼlumotlari
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label="Nomi"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                    <Input
                        label="To‘liq ism"
                        name="full_name"
                        value={data.full_name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                    <Input
                        label="Manzil"
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                    <Input
                        label="Telefon raqam"
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                    <Input
                        label="Email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                    <Input
                        label="Parol"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        variant="text"
                        onClick={handleOpen}
                        disabled={loading}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        className={`bg-black text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        onClick={CreateWarehouse}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                        ) : (
                            "Saqlash"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
