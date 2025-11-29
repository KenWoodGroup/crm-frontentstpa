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
import Cookies from "js-cookie";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";
import { Alert } from "../../../../utils/Alert";

export default function FactoryProductEdit({ oldData, refresh }) {
    const { t } = useTranslation();
    const location_id = Cookies.get("ul_nesw");

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");

    const units = ["to‘nna", "kg", "dona", "m.kub", "m.kv", "litr", "metr"];

    const handleOpen = () => setOpen(!open);

    useEffect(() => {
        if (open && oldData) {
            setName(oldData?.name || "");
            setUnit(oldData?.unit || "");
        }
    }, [open, oldData]);

    const updateProduct = async () => {
        try {
            const data = {
                name: name,
                unit: unit,
                location_id: location_id,
                product_id: oldData?.product_id
            }
            const response = await LocalProduct?.EditProduct(oldData?.id, data)
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
                    {t("Edit_product")}
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

                    {/* 🟩 Исправленный Select */}
                    <Select
                        label={t("Select_unit")}
                        value={unit || ""}   // не даём undefined
                        onChange={(val) => setUnit(val)}
                        className="text-gray-900 dark:text-text-dark outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark",
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark",
                        }}
                    >
                        {units.map((u) => (
                            <Option key={u} value={u}>
                                {u}
                            </Option>
                        ))}
                    </Select>
                </DialogBody>

                <DialogFooter className="justify-between">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        {t("Close")}
                    </Button>

                    <Button
                        color="green"
                        onClick={updateProduct}
                        disabled={!name || !unit}
                    >
                        {t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}