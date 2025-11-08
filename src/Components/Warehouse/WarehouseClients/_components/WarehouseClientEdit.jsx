import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Tooltip,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import { Clients } from "../../../../utils/Controllers/Clients";
import { ClientCategory } from "../../../../utils/Controllers/ClientCategory";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Edit } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WarehouseClientEdit({ data, refresh, id }) {
    const [open, setOpen] = useState(false);
    const [clientCategories, setClientCategories] = useState([]);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);



    const [form, setForm] = useState({
        name: data?.name || "",
        address: data?.address || "",
        phone: data?.phone || "+998",
        parent_id: Cookies.get(`ul_nesw`),
        client_type_id: data?.client_type?.id || "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const getClientCategory = async () => {
        try {
            const response = await ClientCategory.GetClientCategory(Cookies.get(`ul_nesw`));
            const categories = response?.data || [];
            setClientCategories(categories);
        } catch (error) {
            console.log(error);
            setClientCategories([]);
        }
    }

    const handleSubmit = async () => {
        setLoading(true);

        if (!form.client_type_id) {
            Alert("Выберите категорию клиента!", "warning");
            return;
        }

        try {
            await Clients?.EditClient(id, form);
            Alert(`${t(`success`)}`, "success");
            setForm({
                name: "",
                address: "",
                phone: "+998",
                parent_id: Cookies.get(`ul_nesw`),
                client_type_id: "",
            });

            handleOpen();
            refresh();
        } catch (error) {
            Alert(`${t('Error_occurred')}`, "error");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            getClientCategory();
            // Устанавливаем данные при открытии диалога
            setForm({
                name: data?.name || "",
                address: data?.address || "",
                phone: data?.phone || "+998",
                parent_id: Cookies.get(`ul_nesw`),
                client_type_id: data?.client_type?.id || "",
            });
        }
    }, [open, data]);
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
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t('Client_Edit')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label={t('Firstname')}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Input
                        label={t('Address')}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
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
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    {/* Select для категории клиента */}
                    <div className="flex flex-col gap-1">
                        <select
                            value={form.client_type_id}
                            onChange={(e) => setForm((p) => ({ ...p, client_type_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">{t('select_type_client')}</option>
                            {clientCategories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading && <Spinner className="h-4 w-4" />}
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}