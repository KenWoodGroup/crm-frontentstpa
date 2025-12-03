import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserApi } from "../../../utils/Controllers/UserApi";
import { Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import { AccessApi } from "../../../utils/Controllers/Access";
import { useTranslation } from "react-i18next";

export default function FactoryUserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation()
    const [updating, setUpdating] = useState(false);

    const GetUser = async () => {
        try {
            const response = await UserApi.UserById(id);
            setUser(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const updateAccess = async (key, isActive) => {
        setUpdating(true);
        try {
            const accessPayload = {
                access: [{
                    user_id: id,
                    key: key,
                    value: isActive ? "true" : "false"
                }]
            };

            await AccessApi.CreateAccess(accessPayload);

            // Локально обновляем данные пользователя
            setUser(prev => {
                if (!prev) return prev;

                const updatedAccess = [...(prev.access || [])];
                const existingIndex = updatedAccess.findIndex(item => item.key === key);

                if (isActive) {
                    if (existingIndex === -1) {
                        // Добавляем новый доступ
                        updatedAccess.push({
                            user_id: id,
                            key: key,
                            value: "true",
                            id: `temp-${Date.now()}` // временный id
                        });
                    } else {
                        // Обновляем существующий
                        updatedAccess[existingIndex] = {
                            ...updatedAccess[existingIndex],
                            value: "true"
                        };
                    }
                } else {
                    // Удаляем доступ если он существует
                    if (existingIndex !== -1) {
                        updatedAccess.splice(existingIndex, 1);
                    }
                }

                return {
                    ...prev,
                    access: updatedAccess
                };
            });
        } catch (error) {
            console.error("Error updating access:", error);
            // В случае ошибки возвращаем исходное состояние
            GetUser();
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        GetUser();
    }, []);

    const fmt = (d) => {
        if (!d) return "—";
        try {
            return new Date(d).toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch {
            return d;
        }
    };

    const isAccessActive = (key) => {
        if (!user?.access) return false;
        const foundAccess = user.access.find(item => item.key === key);
        return foundAccess && foundAccess.value === "true";
    };

    if (loading) return <Loading />;

    return (
        <div className=" min-h-screen">
            <Card className="shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardBody className="space-y-4">

                    {/* NAME + ROLE */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
                                {user.full_name}
                            </Typography>
                            <Typography className="text-gray-600 dark:text-gray-300">
                                @{user.username}
                            </Typography>
                            <Chip
                                value={user.role}
                                size="sm"
                                className="mt-2 w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            />
                        </div>
                    </div>

                    {/* INFO */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                        <Item label={t('Email')} value={user.email ?? `${t('No_choise')}`} />
                        <Item label={t('CreateAt')} value={fmt(user.createdAt)} />
                    </div>

                    {/* ACCESS */}
                    <div className="dark:border-gray-700 pt-4 space-y-2">
                        <Typography variant="h6" className="text-gray-900 dark:text-white">
                            {t('Access')}
                        </Typography>
                        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">

                            <div className="space-y-3">
                                <PermissionItem
                                    label={t('Kassa')}
                                    keyName="kassa"
                                    isActive={isAccessActive("kassa")}
                                    onChange={updateAccess}
                                    disabled={updating}
                                />

                                <PermissionItem
                                    label={t('Sells')}
                                    keyName="seller"
                                    isActive={isAccessActive("seller")}
                                    onChange={updateAccess}
                                    disabled={updating}
                                />

                                <PermissionItem
                                    label={t('Warehouse')}
                                    keyName="sklad"
                                    isActive={isAccessActive("sklad")}
                                    onChange={updateAccess}
                                    disabled={updating}
                                />

                                <PermissionItem
                                    label={t('invoise')}
                                    keyName="zayavki"
                                    isActive={isAccessActive("zayavki")}
                                    onChange={updateAccess}
                                    disabled={updating}
                                />
                            </div>

                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

function Item({ label, value }) {
    return (
        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
            <Typography className="text-gray-700 dark:text-gray-300">{label}</Typography>
            <Typography className="text-gray-900 dark:text-white font-medium">{value ?? "—"}</Typography>
        </div>
    );
}

function PermissionItem({ label, keyName, isActive, onChange, disabled }) {
    const handleChange = () => {
        if (!disabled) {
            onChange(keyName, !isActive);
        }
    };

    return (
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0">
            <Typography className="text-gray-800 dark:text-gray-200">{label}</Typography>
            <div className="flex items-center gap-2">
                <div className={`relative inline-block w-12 h-6 rounded-full transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={handleChange}
                        disabled={disabled}
                        className="sr-only"
                    />
                    <div
                        className={`block w-12 h-6 rounded-full transition-all duration-300 ${isActive
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        onClick={handleChange}
                    >
                        <div
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isActive ? 'transform translate-x-6' : ''
                                }`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
// Kassa: тип оплаты
// тип цена
// Расход
// История оплаты
// Касса
//Партнеры