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
    const [errors, setErrors] = useState({});

    // Получаем parent_id из cookies при загрузке компонента
    const initialData = {
        type: "warehouse",
        name: "",
        full_name: "",
        address: "",
        phone: "+998",
        email: "",
        parent_id: Cookies.get("ul_nesw") || "", // Добавляем значение по умолчанию
        password: "",
        confirm_password: ""
    };

    const [data, setData] = useState(initialData);

    const handleOpen = () => {
        setOpen(!open);
        setErrors({});
        // При открытии/закрытии модального окна обновляем parent_id из cookies
        const currentParentId = Cookies.get("ul_nesw");
        setData({
            ...initialData,
            parent_id: currentParentId || ""
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\+998[0-9]{9}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateFields = () => {
        const newErrors = {};

        // Name validation
        if (!data.name.trim()) {
            newErrors.name = t("enterWarehouseName");
        } else if (data.name.trim().length < 2) {
            newErrors.name = t("warehouseNameMinLength");
        }

        // Full name validation
        if (!data.full_name.trim()) {
            newErrors.full_name = t("enterFullName");
        } else if (data.full_name.trim().length < 3) {
            newErrors.full_name = t("fullNameMinLength");
        }

        // Address validation
        if (!data.address.trim()) {
            newErrors.address = t("enterAddress");
        } else if (data.address.trim().length < 5) {
            newErrors.address = t("addressMinLength");
        }

        // Phone validation
        if (!data.phone.trim()) {
            newErrors.phone = t("enterPhone");
        } else if (!validatePhone(data.phone)) {
            newErrors.phone = t("invalidPhoneFormat");
        }

        // Email validation
        if (!data.email.trim()) {
            newErrors.email = t("enterEmail");
        } else if (!validateEmail(data.email)) {
            newErrors.email = t("invalidEmailFormat");
        }

        // Password validation
        if (!data.password.trim()) {
            newErrors.password = t("enterPassword");
        } else if (!validatePassword(data.password)) {
            newErrors.password = t("passwordMinLength");
        }

        // Confirm password validation
        if (!data.confirm_password.trim()) {
            newErrors.confirm_password = t("confirmPasswordRequired");
        } else if (data.password !== data.confirm_password) {
            newErrors.confirm_password = t("passwordsDoNotMatch");
        }

        // Parent ID validation (если требуется)
        if (!data.parent_id) {
            // Можно добавить обработку, если parent_id обязателен
            // newErrors.parent_id = "Parent ID is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const CreateWarehouse = async () => {
        if (!validateFields()) return;

        try {
            setLoading(true);

            // Обновляем parent_id перед отправкой
            const currentParentId = Cookies.get("ul_nesw");
            const finalData = {
                ...data,
                parent_id: currentParentId || data.parent_id
            };


            // Remove confirm_password from data before sending to API
            const { confirm_password, ...apiData } = finalData;

            await WarehouseApi.CreateWarehouse(apiData);
            Alert(t("warehouseCreated"), "success");
            setOpen(false);

            // Сбрасываем данные, но сохраняем актуальный parent_id
            setData({
                ...initialData,
                parent_id: currentParentId || ""
            });
            setErrors({});
            refresh();
        } catch (error) {
            console.error("Xatolik:", error);
            Alert(`${t("errorOccurred")} ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const inputFields = [
        { label: t("warehouseName"), name: "name", type: "text" },
        { label: t("managerName"), name: "full_name", type: "text" },
        { label: t("warehouseAddress"), name: "address", type: "text" },
        { label: t("managerPhone"), name: "phone", type: "tel" },
        { label: t("email"), name: "email", type: "email" },
        { label: t("password"), name: "password", type: "password" },
        { label: t("confirmPassword"), name: "confirm_password", type: "password" }
    ];

    return (
        <>
            {/* Ochish tugmasi */}
            <Button
                onClick={handleOpen}
                className="bg-black text-white normal-case hover:bg-gray-800 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            >
                + {t("newWarehouse")}
            </Button>

            {/* Modal oynasi */}
            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl transition-colors duration-300"
                size="md"
            >
                {/* Sarlavha */}
                <DialogHeader className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-4">
                    {t("warehouse_info")}
                </DialogHeader>

                {/* Tana */}
                <DialogBody divider className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
                    {inputFields.map((field) => (
                        <div key={field.name} className="space-y-1">
                            <Input
                                label={field.label}
                                name={field.name}
                                type={field.type}
                                value={data[field.name]}
                                onChange={handleChange}
                                className={`text-text-light dark:text-text-dark ${errors[field.name] ? "border-red-500 focus:border-red-500" : ""}`}
                                color={errors[field.name] ? "red" : "gray"}
                                error={!!errors[field.name]}
                            />
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1 ml-1">{errors[field.name]}</p>
                            )}
                        </div>
                    ))}
                </DialogBody>

                {/* Footer */}
                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                            <>
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
                                {t("saving")}
                            </>
                        ) : (
                            t("save")
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}