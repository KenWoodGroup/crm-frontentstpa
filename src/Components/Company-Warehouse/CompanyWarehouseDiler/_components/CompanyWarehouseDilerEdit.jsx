import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";

export default function CompanyWarehouseDilerEdit({ diler, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouseId, setWarehouseId] = useState(""); // сюда передаём id для редактирования
    const [data, setData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (diler) {
            setData({
                name: diler.name || "",
                address: diler.address || "",
                phone: diler.phone || "",
                email: diler.users?.[0]?.email || "",
            });
            setWarehouseId(diler?.id)
        }
    }, [diler]);

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.name.trim())
            return Alert("Iltimos, ombor nomini kiriting ❗", "warning");
        if (!data.address.trim())
            return Alert("Iltimos, manzilni kiriting ❗", "warning");
        if (!data.phone.trim())
            return Alert("Iltimos, telefon raqam kiriting ❗", "warning");
        if (!data.email.trim())
            return Alert("Iltimos, email kiriting ❗", "warning");
        return true;
    };

    const EditWarehouse = async () => {
        if (validateFields() !== true) return;

        try {
            setLoading(true);

            await WarehouseApi.WarehouseEdit(data, warehouseId);
            Alert("Ombor muvaffaqiyatli yangilandi ", "success");
            setOpen(false);
            refresh();
        } catch (error) {
            console.error(error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message || ""}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 text-white hover:bg-yellow-700 normal-case p-[8px]"
            >
                <Edit size={20} />
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-white text-gray-900 rounded-xl dark:bg-card-dark"
            >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Diler maʼlumotlarini tahrirlash
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label="Nomi"
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                    />
                    <Input
                        label="Manzil"
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                    />
                    <Input
                        label="Telefon raqam"
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                    />
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        className={`bg-black text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        onClick={EditWarehouse}
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
