import { useEffect, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    Switch,
} from "@material-tailwind/react";
import { Stock } from "../../../../utils/Controllers/Stock";
import { Alert } from "../../../../utils/Alert";
import { formatNumber, unformatNumber } from "../../../../utils/Helpers/Formater";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { PriceType } from "../../../../utils/Controllers/PriceType";


export default function WarehouseEdit({ data }) {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(formatNumber(data?.sale_price || 0));
    const [fixedQuantity, setFixedQuantity] = useState(!!data?.fixed_quantity);
    const { t } = useTranslation();


    const handleOpen = () => setOpen(!open);


    const getAllPriceType = async () => {
        try {
            const response = await PriceType?.PriceTypeGet(
                Cookies.get("ul_nesw")
            );
            setData(response?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSave = async () => {
        try {
            const form = {
                fixed_quantity: fixedQuantity,
                barcode: data.barcode,
                sale_price: unformatNumber(price),
            };

            const response = await Stock.EditStock({
                id: data?.id,
                form: form,
            });

            handleOpen();
            Alert("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message}`, "error");
        }
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\s/g, "");
        if (!/^\d*$/.test(rawValue)) return;
        setPrice(formatNumber(rawValue));
    };

    useEffect(() => {
        if (open) {
            getAllPriceType()
        }
    }, [open])


    return (
        <>
            <Button
                size="sm"
                variant="outlined"
                color="blue"
                className="rounded-lg"
                onClick={handleOpen}

            >
                {t('Edit_Price')}
            </Button>

            <Dialog className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark" open={open} handler={handleOpen} size="xs">
                <DialogHeader>
                    <Typography variant="h6" className="dark:text-text-dark" color="blue-gray">
                        {t('Edit_Product')}
                    </Typography>
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label={t('New_price')}
                        type="text"
                        value={price}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                        color="blue-gray"
                    />

                    <div className="flex items-center justify-between">
                        <Typography variant="small" className="dark:text-text-dark" color="blue-gray">
                            {t('dixed')}
                        </Typography>
                        <Switch
                            className="dark:text-text-dark"
                            color="blue-gray"
                            checked={fixedQuantity}
                            onChange={(e) => setFixedQuantity(e.target.checked)}
                            label={fixedQuantity ? `${t('dixed')}` : `${t('dixed_of')}`}
                        />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 rounded-lg"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={handleSave}
                        className="rounded-lg"
                    >
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
