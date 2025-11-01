import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import Loading from "../../../UI/Loadings/Loading";
import { Card, Typography, Switch } from "@material-tailwind/react";
import {
    Building2,
    Package,
    MapPin,
    Phone,
    Mail,
    Wallet,
    Calendar,
    RefreshCw,
    Shield,
} from "lucide-react";

// форматирование чисел 70000 → 70 000
const formatNumber = (num) => {
    if (!num) return "0";
    const [intPart, decimalPart] = String(num).split(".");
    return (
        intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ") +
        (decimalPart ? "." + decimalPart : "")
    );
};

export default function WarehouseAccess() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [warehouse, setWarehouse] = useState(null);
    const [access, setAccess] = useState(null);
    const [sellAccess, setSellAccess] = useState(false);

    const GetWarehouse = async () => {
        try {
            const response = await WarehouseApi.GetWarehouseDetail(id);
            if (response?.status === 200) setWarehouse(response.data);
        } catch (error) {
            console.log("Warehouse error:", error);
        }
    };

    const GetAccess = async () => {
        try {
            const response = await locationInfo.GetInfo(id);
            if (response?.status === 200) {
                setAccess(response.data);
                const found = response.data?.list?.find(
                    (item) => item.key === "sell_access"
                );
                if (found)
                    setSellAccess(found.value === true || found.value === "true");
            }
        } catch (error) {
            console.log("Access error:", error);
        }
    };

    const UpdateSellAccess = async (newValue) => {
        try {
            const data = {
                list: [
                    {
                        location_id: id,
                        key: "sell_access",
                        value: String(newValue),
                    },
                ],
            };
            const response = await locationInfo.Create(data);
            if (response?.status === 200 || response?.status === 201) {
                setSellAccess(newValue);
            }
        } catch (error) {
            console.log("Update sell_access error:", error);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            await Promise.all([GetWarehouse(), GetAccess()]);
            setLoading(false);
        };
        fetchAll();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="flex justify-start items-start py-10 px-4 bg-background-light dark:bg-background-dark transition-colors duration-300">
            <Card className="w-full max-w-2xl p-8 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-300">
                <Typography
                    variant="h5"
                    className="mb-6 font-semibold text-center text-text-light dark:text-text-dark"
                >
                    Информация о складе
                </Typography>

                {warehouse ? (
                    <div className="space-y-4">
                        <Info icon={<Building2 size={18} />} label="Название" value={warehouse.name} />
                        <Info icon={<Package size={18} />} label="Тип" value={warehouse.type} />
                        <Info icon={<MapPin size={18} />} label="Адрес" value={warehouse.address} />
                        <Info icon={<Phone size={18} />} label="Телефон" value={warehouse.phone} />
                        <Info icon={<Mail size={18} />} label="Email" value={warehouse.email} />
                        <Info
                            icon={<Wallet size={18} />}
                            label="Баланс"
                            value={`${formatNumber(warehouse.balance)} UZS`}
                            color={
                                parseFloat(warehouse.balance) < 0
                                    ? "text-red-500"
                                    : "text-green-500"
                            }
                        />
                        <Info
                            icon={<Calendar size={18} />}
                            label="Создано"
                            value={new Date(warehouse.createdAt).toLocaleString("ru-RU")}
                        />
                        <Info
                            icon={<RefreshCw size={18} />}
                            label="Обновлено"
                            value={new Date(warehouse.updatedAt).toLocaleString("ru-RU")}
                        />
                    </div>
                ) : (
                    <Typography className="text-center mt-4 text-gray-600 dark:text-gray-400">
                        Нет данных о складе
                    </Typography>
                )}

                {/* Раздел разрешений */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={18} className="text-gray-700 dark:text-gray-300" />
                        <Typography
                            variant="h6"
                            className="font-semibold text-text-light dark:text-text-dark"
                        >
                            Разрешения
                        </Typography>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <Typography className="font-medium text-gray-700 dark:text-gray-300">
                            Разрешение для продаж
                        </Typography>
                        <Switch
                            color="green"
                            checked={sellAccess}
                            onChange={(e) => UpdateSellAccess(e.target.checked)}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Компонент одной строки информации
function Info({ icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-300">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                {icon}
                <Typography
                    variant="small"
                    className="font-medium text-text-light dark:text-text-dark"
                >
                    {label}
                </Typography>
            </div>
            <Typography
                variant="small"
                className={`font-semibold ${color || "text-text-light dark:text-text-dark"
                    }`}
            >
                {value || "-"}
            </Typography>
        </div>
    );
}
