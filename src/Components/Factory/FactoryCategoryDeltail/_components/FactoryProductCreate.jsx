import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    IconButton,
    Typography,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import { useState } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";
import { Alert } from "../../../../utils/Alert";

export default function FactoryProductCreate({ refresh }) {
    const { id } = useParams()
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const { t } = useTranslation();
    const location_id = Cookies.get("ul_nesw");

    const units = ["tonna", "kg", "dona", "m.kub", "m.kv", "litr", "metr"];

    const toggleOpen = () => setOpen(!open);

    const createProduct = async () => {
        if (!name || !unit) return;

        try {
            const data = {
                name,
                unit,
                location_id,
                category_id: id
            };
            await LocalProduct?.CreateProduct(data)
            setName("");
            setUnit("");
            refresh()
            toggleOpen();
            Alert(`${t("success")}`, "success");
        } catch (error) {
            console.error("Error creating product:", error);
            Alert(`${t("Error")}`, "error");
        }
    };

    return (
        <>
            <Button color="blue" onClick={toggleOpen}>{t('Add')}</Button>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open} size="md" handler={toggleOpen}>
                <DialogHeader
                    className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark"
                >
                    {t("Create_product")}
                    <IconButton
                        variant="text"
                        color="red"
                        onClick={toggleOpen}
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
                        placeholder={t("Type product name")}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Select
                        label={t("Select_unit")}
                        value={unit}
                        onChange={(value) => setUnit(value)}
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
                    <Button variant="text" color="red" onClick={toggleOpen}>
                        {t("Close")}
                    </Button>
                    <Button
                        color="green"
                        onClick={createProduct}
                        disabled={!name || !unit}
                    >
                        {t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}