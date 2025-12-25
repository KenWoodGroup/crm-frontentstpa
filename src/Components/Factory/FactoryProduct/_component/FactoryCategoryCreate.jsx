import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input } from "@material-tailwind/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalCategory } from "../../../../utils/Controllers/LocalCategory";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";


export default function FactoryCategoryCreate({ refresh }) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(!open);

    const [data, setData] = useState({
        location_id: Cookies.get("ul_nesw"),
        type:'product',
        name: ""
    });

    const CreateCategory = async () => {
        try {
            await LocalCategory.CreateCategory(data);
            handleOpen();
            Alert(`${t('success')}`, "success");
            setData({
                location_id: Cookies.get("ul_nesw"),
                name: "",
        type:'product',

            })
            refresh()
        } catch (error) {
            console.log(error);
            Alert(`${t('Error')}`, "error");
        }
    };

    return (
        <>
            <Button color="blue" onClick={handleOpen}>{t("Add")}</Button>

            <Dialog className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open} handler={handleOpen}>
                <DialogHeader className="bg-card-light rounded-t-[10px] dark:bg-card-dark text-text-light dark:text-text-dark"
                >{t("Creaete_Category")}</DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label={t('Name')}
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
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

                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleOpen} className="mr-2">
                        {t("Cancel")}
                    </Button>

                    <Button color="blue" onClick={CreateCategory}>
                        {t("Add")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
