import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    IconButton,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "../../../../utils/Alert";
import { LocalCategory } from "../../../../utils/Controllers/LocalCategory";

export default function FactoryCategoryEdit({ oldData, refresh }) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    console.log(oldData)

    const handleOpen = () => setOpen(!open);

    useEffect(() => {
        if (open && oldData) {
            setName(oldData?.name || "");
        }
    }, [open, oldData]);

    const updateProduct = async () => {
        try {
            const data = {
                name: name,
                location_id: oldData?.location_id,
            }
            const response = await LocalCategory?.EditCategory(oldData?.id, data)
            Alert(t("success"), "success");
            refresh()
            handleOpen()
        } catch (error) {
            console.log(error)
            Alert(t("Error"), "error");
        }
    }

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 dark:bg-yellow-500 p-[8px] text-white dark:text-text-dark 
                hover:bg-yellow-700 dark:hover:bg-yellow-600 active:bg-yellow-800 transition-colors"
            >
                <PencilSquareIcon className="w-5 h-5" />
            </Button>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open} size="md" handler={handleOpen}>
                <DialogHeader
                    className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark"
                >
                    {t("Edit_Category")}
                    <IconButton
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="ml-auto"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </DialogHeader>

                <DialogBody divider className="space-y-4">
                    <Input
                        label={t("Name")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                </DialogBody>

                <DialogFooter className="justify-between">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        {t("Close")}
                    </Button>

                    <Button
                        color="green"
                        onClick={updateProduct}
                        disabled={!name}
                    >
                        {t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
