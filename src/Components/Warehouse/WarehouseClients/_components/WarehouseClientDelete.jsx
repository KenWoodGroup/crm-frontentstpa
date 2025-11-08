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
import { Clients } from "../../../../utils/Controllers/Clients";
import { useTranslation } from "react-i18next";

export default function WarehouseClientDelete({ id, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();


    const handleOpen = () => setOpen(!open);

    const handleDelete = async () => {
        try {
            setLoading(true);
            await Clients.DeleteClient(id);
            Alert(`${t(`success`)}`, "success");
            refresh();
            setOpen(false);
        } catch (error) {
            console.error(error);
            Alert(`${t('Error_occurred')}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip content={t("Delete")}>
                <IconButton
                    onClick={handleOpen}
                    variant="text"
                    color="red"
                    className="text-red-600 hover:text-red-700  transition-colors"
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
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 dark:text-text-dark">
                    {t('Delete_Client')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="text-gray-700 dark:text-text-dark dark:bg-card-dark"
                >
                    {t('Delete_Client_text')}
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                        disabled={loading}
                    >
                        {t('Cancel')}
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
                            t('Delete')
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
