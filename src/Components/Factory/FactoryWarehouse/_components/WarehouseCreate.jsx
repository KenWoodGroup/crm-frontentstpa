import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import { useTranslation } from "react-i18next";

export default function WarehouseCreate({ refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        type: "warehouse",
        name: "",
        full_name: "",
        address: "",
        phone: "+998",
        email: "",
        parent_id: Cookies.get("ul_nesw"),
        password: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.name.trim()) return Alert(t("enterWarehouseName"), "warning");
        if (!data.full_name.trim()) return Alert(t("enterFullName"), "warning");
        if (!data.address.trim()) return Alert(t("enterAddress"), "warning");
        if (!data.phone.trim()) return Alert(t("enterPhone"), "warning");
        if (!data.email.trim()) return Alert(t("enterEmail"), "warning");
        if (!data.password.trim()) return Alert(t("enterPassword"), "warning");
        return true;
    };

    const CreateWarehouse = async () => {
        if (validateFields() !== true) return;
        try {
            setLoading(true);
            await WarehouseApi.CreateWarehouse(data);
            Alert(t("warehouseCreated"), "success");
            setOpen(false);
            setData({
                type: "warehouse",
                name: "",
                full_name: "",
                address: "",
                phone: "+998",
                email: "",
                password: "",
            });
            refresh();
        } catch (error) {
            console.error("Ошибка:", error);
            Alert(`${t("errorOccurred")} ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Кнопка открытия */}
            <Button
                onClick={handleOpen}
                className="bg-black text-white normal-case hover:bg-gray-800 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            >
                + {t("newWarehouse")}
            </Button>

            {/* Модальное окно */}
            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl transition-colors duration-300"
            >
                {/* Заголовок */}
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
                    {t("warehouse_info")}
                </DialogHeader>

                {/* Тело */}
                <DialogBody divider className="space-y-4">
                    {[
                        { label: t("warehouseName"), name: "name" },
                        { label: t("managerName"), name: "full_name" },
                        { label: t("warehouseAddress"), name: "address" },
                        { label: t("managerPhone"), name: "phone" },
                        { label: t("email"), name: "email" },
                    ].map((field) => (
                        <Input
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            value={data[field.name]}
                            onChange={handleChange}
                            className="text-text-light dark:text-text-dark"
                            color="gray"
                        />
                    ))}
                    <Input
                        label={t("password")}
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        className="text-text-light dark:text-text-dark"
                        color="gray"
                    />
                </DialogBody>

                {/* Футер */}
                <DialogFooter className="border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2 text-text-light dark:text-text-dark"
                        disabled={loading}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={CreateWarehouse}
                        disabled={loading}
                        className={`bg-black text-white normal-case hover:bg-gray-800 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 flex items-center gap-2 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-current"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                        ) : (
                            t("save")
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
