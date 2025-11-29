import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert } from "../../../utils/Alert";
import Edit from "../../UI/Icons/Edit";
import { UserApi } from "../../../utils/Controllers/UserApi";

export default function ProfileEdit({ user, refresh, info }) {
    const [open, setOpen] = useState(false);
    const { id } = useParams();
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState("");
    const [data, setData] = useState({
        full_name: "",
        email: "",
        username: "",
        new_password: "",
    });
    useEffect(() => {
        if (user) {
            setData({
                full_name: info.name || "",
                username: user.username || "",
                email: user.email || "",
                new_password: "",
            });
            setUserId(user.id);
        }
    }, [user]);

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.full_name.trim())
            return Alert("Iltimos, to‘liq ismni kiriting ❗", "warning");
        if (!data.username.trim())
            return Alert("Iltimos, username kiriting ❗", "warning");
        return true;
    };

    const EditUser = async () => {
        if (validateFields() !== true) return;

        try {
            setLoading(true);

            // 1️⃣ Обновляем основные данные пользователя
            await UserApi.UserEdit(
                {
                    full_name: data.full_name,
                    username: data.username,
                    email: data.email,
                },
                userId
            );

            // 2️⃣ Если поле пароля не пустое — отправляем запрос на смену пароля
            if (data.new_password.trim() !== "") {
                await UserApi.ResetPassword(
                    { new_password: data.new_password },
                    userId
                );
            }

            Alert(`${t('success')}`, "success");
            setOpen(false);
            refresh();
        } catch (error) {
            console.error(error);
            Alert(
                `${t('Error')} ${error?.response?.data?.message || ""}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 text-white hover:bg-yellow-700 normal-case p-[8px]"
            >
                <Edit size={20} />
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            >
                <DialogHeader className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark">
                    {t('Warehouse_user_Edit')}
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label={t(`Name`)}
                        color="blue-gray"
                        name="full_name"
                        value={data.full_name}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                    <Input
                        label={t('Login')}
                        color="blue-gray"
                        name="username"
                        value={data.username}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                    <Input
                        label={t('Email')}
                        color="blue-gray"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                    {/* Поле для изменения пароля */}
                    <Input
                        label={t('Password')}
                        type="password"
                        color="blue-gray"
                        name="new_password"
                        value={data.new_password}
                        onChange={handleChange}
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        className="text-text-light dark:text-text-dark"
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        className={`bg-blue-600 text-white normal-case hover:bg-blue-700 flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        onClick={EditUser}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
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
                            t('Save')
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
