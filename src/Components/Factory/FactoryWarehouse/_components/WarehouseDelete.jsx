import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Delete from "../../../UI/Icons/Delete";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseDelete({ warehouseId, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await WarehouseApi.WarehouseDelete(warehouseId);
            Alert("Ombor muvaffaqiyatli o'chirildi ", "success");
            refresh();
            setOpen(false);
        } catch (error) {
            console.error(error);
            Alert("Xatolik yuz berdi ", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-red-600 text-white hover:bg-red-700 active:bg-red-800 normal-case p-[8px] transition-colors duration-200"
            >
                <Delete size={20} />
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
            >
                <DialogHeader className="text-lg dark:text-text-dark font-semibold border-b border-gray-200 dark:border-gray-700 pb-4 bg-card-light dark:bg-card-dark rounded-t-xl">
                    Omborni o'chirish
                </DialogHeader>
                <DialogBody divider className="text-text-light dark:text-text-dark py-6">
                    Siz haqiqatdan ham bu omborni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!
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
                        variant="gradient"
                        color="red"
                        className="flex items-center gap-[10px]"
                        onClick={handleDelete}
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
                                O'chirilmoqda...
                            </>
                        ) : (
                            "O'chirish"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}