import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Tooltip, IconButton } from "@material-tailwind/react";
import Delete from "../../../UI/Icons/Delete";
import { Alert } from "../../../../utils/Alert";
import { Clients } from "../../../../utils/Controllers/Clients";
import { Cash } from "../../../../utils/Controllers/Cash";

export default function WarehouseCashDelete({ id, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await Cash.DeleteKassa(id);
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

            <Dialog open={open} handler={handleOpen} className="bg-white text-gray-900 rounded-xl">
                <DialogHeader className="text-lg font-semibold border-b border-gray-200">
                    Удаления Кассы
                </DialogHeader>
                <DialogBody divider className="text-gray-700">
                    Вы действительно хотите удалить кассу ?
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2"
                        disabled={loading}
                    >
                        Отменить
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
                            "Удалить"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
