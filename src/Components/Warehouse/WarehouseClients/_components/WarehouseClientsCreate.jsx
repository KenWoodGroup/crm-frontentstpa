import React, { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Spinner,
} from "@material-tailwind/react";
import { Clients } from "../../../../utils/Controllers/Clients";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { ClientCategory } from "../../../../utils/Controllers/ClientCategory";
import { useTranslation } from "react-i18next";

export default function WarehouseClientsCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [clientCategories, setClientCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        type: "client",
        name: "",
        address: "",
        phone: "+998",
        parent_id: Cookies.get(`ul_nesw`),
        client_type_id: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const getClientCategory = async () => {
        setLoading(true);
        try {
            const response = await ClientCategory.GetClientCategory(Cookies.get(`ul_nesw`));
            const categories = response?.data || [];
            setClientCategories(categories);

            if (categories.length > 0 && !form.client_type_id) {
                setForm((prev) => ({
                    ...prev,
                    client_type_id: String(categories[0].id)
                }));
            }
        } catch (error) {
            console.log(error);
            setClientCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.client_type_id) {
            Alert("Выберите категорию клиента!", "warning");
            return;
        }

        setLoading(true);
        try {
            await Clients?.ClientsCreate(form);
            Alert(`${t(`success`)}`, "success");
            setForm({
                type: "client",
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
        } else {
            setForm({
                type: "client",
                name: "",
                address: "",
                phone: "+998",
                parent_id: Cookies.get(`ul_nesw`),
                client_type_id: "",
            });
        }
    }, [open]);

    return (
        <div>
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleOpen}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                >
                    + {t('Add_clients')}
                </Button>
            </div>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t('Add_clients')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <Spinner className="h-8 w-8 text-blue-500" />
                        </div>
                    ) : (
                        <>
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
                                    className: `!text-text-light dark:!text-text-dark `
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
                                    className: `!text-text-light dark:!text-text-dark `
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
                                    className: `!text-text-light dark:!text-text-dark `
                                }}
                            />

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
                        </>
                    )}
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                        disabled={loading}
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
