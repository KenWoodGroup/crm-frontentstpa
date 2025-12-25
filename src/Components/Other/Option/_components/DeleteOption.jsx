import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import Delete from "../../../UI/Icons/Delete";
import { Alert } from "../../../../utils/Alert";
import { OptionApi } from "../../../../utils/Controllers/OptionApi";

export default function DeleteOption({ id, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await OptionApi.DeleteOption(id);
            Alert("Muvaffaqiyatli o‘chirildi", "success");
            refresh && refresh();
            setOpen(false);
        } catch (error) {
            console.error(error);
            Alert("Xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip content="O‘chirish">
                <IconButton
                    onClick={handleOpen}
                    variant="text"
                    color="red"
                    className="text-red-600 hover:text-red-700 transition-colors"
                >
                    <Delete size={20} />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
            >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
                    Variantni o‘chirish
                </DialogHeader>

                <DialogBody
                    divider
                    className="text-gray-700 dark:text-text-dark dark:bg-card-dark"
                >
                    Siz ushbu variantni o‘chirmoqchimisiz?
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>

                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        color="red"
                        className={`bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 ${
                            loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
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
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                        ) : (
                            "O‘chirish"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
