import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import Swal from "sweetalert2";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Delete from "../../../UI/Icons/Delete";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseDilerDelete({ dilerId, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await WarehouseApi.WarehouseDelete(dilerId);
            Alert("Muvaffaqiyatli o‘chirildi ", "success");
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
                className="bg-red-600 text-white hover:bg-red-700 normal-case p-[8px]"
            >
                <Delete size={20} />
            </Button>

            <Dialog open={open} handler={handleOpen} className="bg-white text-gray-900 rounded-xl dark:bg-card-dark">
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Omborni o‘chirish
                </DialogHeader>
                <DialogBody divider className="text-gray-700 dark:text-text-dark dark:bg-card-dark"
                >
                    Siz haqiqatdan ham bu omborni o‘chirmoqchimisiz? Bu amalni qaytarib bo‘lmaydi!
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="dark:text-text-dark mr-2"
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button
                        className={`bg-red-600 text-white normal-case hover:bg-red-700 flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        onClick={handleDelete}
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
                            "O‘chirish"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog >
        </>
    );
}
