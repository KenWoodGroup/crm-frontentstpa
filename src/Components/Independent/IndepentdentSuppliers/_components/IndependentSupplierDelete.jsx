import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, IconButton } from "@material-tailwind/react";
import Delete from "../../../UI/Icons/Delete";
import { Alert } from "../../../../utils/Alert";
import { Clients } from "../../../../utils/Controllers/Clients";

export default function IndependentSupplierDelete({ id, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await Clients.DeleteClient(id);
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
            <Tooltip content="Удалить">
                <IconButton
                    onClick={handleOpen}

                    variant="text"
                    color="red"
                >
                    <Delete size={20} />
                </IconButton>
            </Tooltip>

            <Dialog className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
                open={open} handler={handleOpen}>
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    Удаления поставшика
                </DialogHeader>
                <DialogBody divider className="text-gray-700 dark:text-text-dark dark:bg-card-dark">
                    Вы действительно хотите удалить поставшика ?
                </DialogBody>
                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                        disabled={loading}
                    >
                        Отмена
                    </Button>

                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        color="red"
                        className={`bg-red-600 text-white hover:bg-red-700  flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white dark:text-black"
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
                            "Удалить"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
