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
import { useNavigate, useParams } from "react-router-dom";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";

export default function FactoryProductModal() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const { t } = useTranslation();
    const location_id = Cookies.get("ul_nesw");
    const navigate = useNavigate()

    const units = ["tonna", "kg", "dona", "m.kub", "m.kv", "litr", "metr"];

    const toggleOpen = () => setOpen(!open);

    const createProduct = async () => {
        if (!name || !unit) return;

        try {
            const data = {
                name,
                unit,
                location_id,
            };
            await LocalProduct?.CreateProduct(data)
            setName("");
            setUnit("");
            navigate(-1)
            toggleOpen();
            Alert(`${t("success")}`, "success");
        } catch (error) {
            console.error("Error creating product:", error);
            Alert(`${t("Error")}`, "error");
        }
    };

    return (
        <>
            <Button onClick={toggleOpen}>Yangi</Button>

            <Dialog open={open} size="md" handler={toggleOpen}>
                <DialogHeader>
                    {t("Create Product")}
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
                        label={t("Product name")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("Type product name")}
                    />
                    <Select
                        label={t("Select unit")}
                        value={unit}
                        onChange={(value) => setUnit(value)}
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
                        {t("Create")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
