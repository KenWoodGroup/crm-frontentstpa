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

export default function WarehouseEdit({ warehouse, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouseId, setWarehouseId] = useState("");
    const [data, setData] = useState({
        name: "",
        address: "",
        phone: "",
        password: "",
    });

    useEffect(() => {
        if (warehouse) {
            setData({
                name: warehouse.name || "",
                address: warehouse.address || "",
                phone: warehouse.phone || "",
            });
            setWarehouseId(warehouse?.id)
        }
    }, [warehouse]);

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
                className="bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 normal-case p-[8px] transition-colors duration-200"
            >
                <Edit size={20} />
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
            >
                <DialogHeader className="text-lg dark:text-text-dark font-semibold border-b border-gray-200 dark:border-gray-700 pb-4 bg-card-light dark:bg-card-dark rounded-t-xl">
                    Ombor maʼlumotlarini tahrirlash
                </DialogHeader>

                <DialogBody divider className="space-y-4 py-6">
                    <Input
                        label="Nomi"
                        color="gray"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark"
                        }}
                        crossOrigin={undefined}
                    />
                    <Input
                        label="Manzil"
                        color="gray"
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark"
                        }}
                        crossOrigin={undefined}
                    />
                    <Input
                        label="Telefon raqam"
                        color="gray"
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark"
                        }}
                        crossOrigin={undefined}
                    />
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2 text-text-light dark:text-text-dark 
                                  hover:bg-gray-100 dark:hover:bg-gray-700 
                                  active:bg-gray-200 dark:active:bg-gray-600
                                  transition-colors duration-200 font-medium"
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        className={`bg-black text-white normal-case 
                                  hover:bg-gray-800 active:bg-gray-900
                                  dark:bg-white dark:text-black 
                                  dark:hover:bg-gray-200 dark:active:bg-gray-300
                                  flex items-center gap-2 transition-colors duration-200 
                                  font-medium shadow-md hover:shadow-lg active:shadow-sm
                                  ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        onClick={EditWarehouse}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-current"
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
                                Saqlanmoqda...
                            </>
                        ) : (
                            "Saqlash"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}