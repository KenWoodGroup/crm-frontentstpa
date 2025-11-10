import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    button,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Staff } from "../../../../utils/Controllers/Staff";
import { useTranslation } from "react-i18next";
import { Plus, PlusIcon } from "lucide-react";

export default function WarehouseCarrierCreate({ refresh, apperance = false }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get("ul_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await Staff.CreateStaff(form);
            Alert("Muvaffaqiyatli yaratildi", "success");
            setForm({
                role: "carrier",
                full_name: "",
                phone: "+998",
                location_id: Cookies.get("ul_nesw"),
            });
            handleOpen(); 
            refresh();
        } catch (error) {
            Alert("Xato", "error");
            console.log(error);
        }
    };

    return (
        <div>
            {apperance === false ? (
                <Button
                    onClick={handleOpen}
                    className="bg-text-light text-card-light normal-case hover:bg-gray-800
                           dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300
                           transition-colors"
                >
                    + {t('Add')}
                </Button>
            ) : (
                <>
                    <button className="flex items-center justify-center dark:text-text-dark text-text-light" onClick={handleOpen}>
                        <PlusIcon />
                    </button>
                </>
            )}

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="bg-card-light text-text-light dark:bg-card-dark dark:text-text-dark"
            >
                <DialogHeader className="text-text-light dark:text-text-dark">
                    {t('Create_Kurier')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 bg-background-light dark:bg-background-dark"
                >
                    <Input
                        label={t('Firstname')}
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Input
                        label={t('Phone')}
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
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

                <DialogFooter className="bg-card-light dark:bg-card-dark rounded-b-lg">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 normal-case text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-text-light text-card-light normal-case hover:bg-gray-800
                                   dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300
                                   transition-colors"
                    >
                        {t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
