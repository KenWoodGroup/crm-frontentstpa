import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Staff } from "../../../../utils/Controllers/Staff";
import Edit from "../../../UI/Icons/Edit";
import { useTranslation } from "react-i18next";

export default function СarrierEdit({ refresh, data, id }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get("ul_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    // когда модал открывается, загружаем старые данные
    useEffect(() => {
        if (open && data) {
            setForm({
                role: data?.role || "carrier",
                full_name: data?.full_name || "",
                phone: data?.phone || "+998",
                location_id: data?.location_id || Cookies.get("ul_nesw"),
            });
        }
    }, [open, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await Staff?.EditStaff(id, form);
            Alert("Поставщик успешно обновлён", "success");
            handleOpen();
            refresh();
        } catch (error) {
            Alert("Ошибка при обновлении поставщика", "error");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Tooltip content={t('Edit')}>
                <IconButton
                    variant="text"
                    color="blue"
                    onClick={handleOpen}
                >
                    <Edit size={18} />
                </IconButton>
            </Tooltip>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open}
                handler={handleOpen}
                size="sm"
            >
                <DialogHeader className="dark:text-text-dark">
                    {t('Edit_Kurier')}
                </DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label={t('Firstname')}
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            color="blue-gray"
                            disabled={loading}
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark",
                            }}
                        />
                    </div>

                    <div>
                        <Input
                            label={t('Phone')}
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            color="blue-gray"
                            disabled={loading}
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark",
                            }}
                        />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                        disabled={loading}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleSubmit} className="bg-text-light text-card-light normal-case hover:bg-gray-800
                                   dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300
                                   transition-colors" disabled={loading} >
                        {loading ? `${t('Saving')}` : `${t("Save")}`}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
