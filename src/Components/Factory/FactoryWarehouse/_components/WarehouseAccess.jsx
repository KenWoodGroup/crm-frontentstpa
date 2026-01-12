import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import Loading from "../../../UI/Loadings/Loading";
import { Card, Typography, Switch, Button } from "@material-tailwind/react";
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
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie"
import { notify } from "../../../../utils/toast";

// форматирование чисел 70000 → 70 000
const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "0";
    const [intPart, decimalPart] = String(num).split(".");
    return (
        intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ") +
        (decimalPart ? "." + decimalPart : "")
    );
};

// надёжный парсер "булева" из разных представлений
const parseBoolean = (v) => {
    if (v === true || v === false) return v;
    if (v === 1 || v === "1") return true;
    if (v === 0 || v === "0") return false;
    if (typeof v === "string") {
        const low = v.toLowerCase().trim();
        if (low === "true") return true;
        if (low === "false") return false;
    }
    return false;
};

// Приводим ответ к единому массиву записей
const normalizeList = (responseData) => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (responseData.list && Array.isArray(responseData.list)) return responseData.list;
    // Если пришёл одиночный объект (как в вашем примере)
    return [responseData];
};

export default function WarehouseAccess() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [warehouse, setWarehouse] = useState(null);
    const [access, setAccess] = useState([]);
    const [sellAccess, setSellAccess] = useState(false);

    // warehouse type is detected before starting operations
    const [warehouseType, setWarehouseType] = useState("");

    const navigate = useNavigate()

    const GetWarehouse = async () => {
        try {
            const response = await WarehouseApi.GetWarehouseDetail(id);
            if (response?.status === 200) setWarehouse(response.data);
            if (response?.data?.type) setWarehouseType(response.data.type);
        } catch (error) {
            console.log("Warehouse error:", error);
        }
    };

    const GetAccess = async () => {
        try {
            const response = await locationInfo.GetLocationInfo(id);
            if (response?.status === 200) {
                // Приводим ответ к массиву элементов
                const list = normalizeList(response.data);
                setAccess(list);
                const found = list.find((item) => item.key === "sell_access");
                if (found) {
                    setSellAccess(parseBoolean(found.value));
                } else {
                    setSellAccess(false);
                }
            }
        } catch (error) {
            console.log("Access error:", error);
        }
    };



    useEffect(() => {
        let mounted = true;
        const fetchAll = async () => {
            if (!id) return;
            setLoading(true);
            await Promise.all([GetWarehouse(), GetAccess()]);
            if (mounted) setLoading(false);
        };
        fetchAll();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className="flex justify-start items-start pb-[30px] bg-background-light dark:bg-background-dark transition-colors duration-300">
            <Card className="w-full max-w-2xl p-8 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-300">
                <div className="flex items-center justify-between mb-6 ">
                    <Typography
                        variant="h5"
                        className="font-semibold text-center text-text-light dark:text-text-dark"
                    >
                        {t("Warehouse_Info")}
                    </Typography>
                    <Button onClick={() => {
                        if (!warehouseType) {
                            notify.warning(t("warehouse_type_missing"));
                            return;
                        } else {
                            sessionStorage.setItem("de_ul_name", warehouse?.name)
                            Cookies.set('de_ul_nesw', warehouse?.id);
                            if (true) {
                                Cookies.set("sedqwdqdqwd", "terrwerwerw")
                            };
                            if (warehouseType === "material") {
                                navigate('/factory/materials/warehouse/stockin')
                            } else if (warehouseType === "product" || "main") {
                                navigate('/factory/warehouse/stockin');
                            }
                        }
                    }}>
                        {t("operations")}
                    </Button>
                </div>

                {warehouse ? (
                    <div className="space-y-4">
                        <Info icon={<Building2 size={18} />} label={t("Name")} value={warehouse.name} />
                        <Info icon={<Package size={18} />} label={t("Type")} value={warehouse.type} />
                        <Info icon={<MapPin size={18} />} label={t("Address")} value={warehouse.address} />
                        <Info icon={<Phone size={18} />} label={t("Phone")} value={warehouse.phone} />
                        <Info icon={<Mail size={18} />} label={t("Email")} value={warehouse?.users?.[0]?.username} />
                        <Info
                            icon={<Wallet size={18} />}
                            label={t("Balance")}
                            value={`${formatNumber(warehouse.balance)} UZS`}
                            color={
                                parseFloat(warehouse.balance) < 0
                                    ? "text-red-500"
                                    : "text-green-500"
                            }
                        />
                        <Info
                            icon={<Calendar size={18} />}
                            label={t("Created")}
                            value={warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleString() : "-"}
                        />
                        <Info
                            icon={<RefreshCw size={18} />}
                            label={t("Updated")}
                            value={warehouse.updatedAt ? new Date(warehouse.updatedAt).toLocaleString() : "-"}
                        />
                    </div>
                ) : (
                    <Typography className="text-center mt-4 text-gray-600 dark:text-gray-400">
                        {t("No_Warehouse_Data")}
                    </Typography>
                )}


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
                className={`font-semibold ${color || "text-text-light dark:text-text-dark"}`}
            >
                {value || "-"}
            </Typography>
        </div>
    );
}
