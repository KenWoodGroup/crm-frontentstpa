import {
    Card,
    CardBody,
    Typography,
    Select,
    Option,
    Button,
} from "@material-tailwind/react";
import {
    Users,
    Package,
    DollarSign,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Trash,
} from "lucide-react";
import { Statistik } from "../../../utils/Controllers/Statistik";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import WarehouseMonyChart from "../../Factory/FactoryDashboard/_components/WarehouseMonyChart";
import WarehouseProduct from "../../Factory/FactoryDashboard/_components/WarehouseProduct";
import { useTranslation } from "react-i18next";

export default function WarehouseDashboard() {
    const locationId = Cookies.get("ul_nesw");
    const { t } = useTranslation();
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, "0"));
    const [productSum, setProductSum] = useState([]);
    const [productCount, setProductCount] = useState([]);
    const [CardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [card, sum, count] = await Promise.all([
                Statistik.GetStatistik(locationId),
                Statistik.GetStatistikProductSum({ id: locationId, year, month }),
                Statistik.GetStatistikProductCount({ id: locationId, year, month }),
            ]);
            setCardData(card?.data || {});
            setProductSum(sum?.data || []);
            setProductCount(count?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [year, month]);

    const stats = [
        {
            title: t("dilers"),
            value: CardData ? CardData.countDealer : "...",
            icon: <Users className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: t("products"),
            value: CardData ? CardData.countProduct : "...",
            icon: <Package className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />,
        },
        {
            title: t("Total_Value"),
            value: CardData ? `${CardData.sumProduct?.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />,
        },
        {
            title: t("Receipts_in_month"),
            value: CardData ? `${CardData.transferIn?.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowDown className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: t('Sells_inMonth'),
            value: CardData ? `${CardData.income?.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: t("Output_in_mont"),
            value: CardData ? `${CardData.transferOut?.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />,
        },

        {
            title: t('Grin'),
            value: CardData ? `${CardData?.profit?.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
        },
    ];

    return (
        <div className="text-black dark:text-gray-100 min-h-screen transition-all duration-300 px-2 xs:px-3 sm:px-4">
            <Typography variant="h4" className="mb-4 xs:mb-5 sm:mb-6 font-semibold dark:text-gray-100 text-lg xs:text-xl sm:text-2xl lg:text-4xl">
                Dashboard
            </Typography>

            <div className="grid gap-3 xs:gap-4 sm:gap-6 grid-cols-1 min-[320px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 mb-6 xs:mb-8 sm:mb-10">
                {stats.map((item, index) => (
                    <Card
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1"
                    >
                        <CardBody className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-3 xs:p-4 sm:p-6">
                            <div className="p-2 xs:p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl xs:rounded-2xl shadow-sm">
                                {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 font-medium mb-1 truncate">
                                    {item.title}
                                </Typography>
                                <Typography variant="h5" className="font-bold text-gray-900 dark:text-gray-100 text-sm xs:text-base sm:text-lg truncate">
                                    {item.value}
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-4 xs:mb-5 sm:mb-6">
                <CardBody className="dashboard_wrapper flex items-end   gap-3 xs:gap-4 p-4 xs:p-6">
                    <Select
                        label={t("Select_yers")}
                        value={year.toString()}
                        onChange={(val) => setYear(val)}
                        className="text-gray-900 dark:text-text-dark outline-none text-sm"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark text-xs xs:text-sm"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark max-h-48 overflow-y-auto"
                        }}
                    >
                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                            <Option key={y} value={y.toString()} className="text-xs xs:text-sm">
                                {y}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label={t("Select_month")}
                        value={month}
                        onChange={(val) => setMonth(val)}
                        className="text-gray-900 dark:text-text-dark outline-none text-sm"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark text-xs xs:text-sm"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark max-h-48 overflow-y-auto"
                        }}
                    >
                        {[
                            { id: "01", name: "Yanvar" },
                            { id: "02", name: "Fevral" },
                            { id: "03", name: "Mart" },
                            { id: "04", name: "Aprel" },
                            { id: "05", name: "May" },
                            { id: "06", name: "Iyun" },
                            { id: "07", name: "Iyul" },
                            { id: "08", name: "Avgust" },
                            { id: "09", name: "Sentabr" },
                            { id: "10", name: "Oktabr" },
                            { id: "11", name: "Noyabr" },
                            { id: "12", name: "Dekabr" },
                        ].map((m) => (
                            <Option key={m.id} value={m.id} className="text-xs xs:text-sm">
                                {m.name}
                            </Option>
                        ))}
                    </Select>

                    <Button
                        color="green"
                        className="px-4 xs:px-6 normal-case text-xs xs:text-sm w-full xs:w-auto mt-2 xs:mt-0"
                        onClick={fetchAllData}
                    >
                        {t("Search")}
                    </Button>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 pb-6 xs:pb-8 sm:pb-10">
                <WarehouseMonyChart data={productSum} />
                <WarehouseProduct data={productCount} />
            </div>
        </div>
    );
}