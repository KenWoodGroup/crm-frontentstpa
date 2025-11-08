import {
    Card,
    CardBody,
    Typography,
    Select,
    Option,
    Button,
} from "@material-tailwind/react";
import {
    Warehouse,
    Users,
    Package,
    DollarSign,
    BanknoteArrowDown,
    BanknoteArrowUp,
} from "lucide-react";
import WarehouseMonyChart from "./_components/WarehouseMonyChart";
import WarehouseProduct from "./_components/WarehouseProduct";
import Cookies from "js-cookie";
import { Statistik } from "../../../utils/Controllers/Statistik";
import { useEffect, useState } from "react";
import Loading from "../../UI/Loadings/Loading";
import { useTranslation } from "react-i18next";

export default function FactoryDashboard() {
    const { t } = useTranslation();
    const locationId = Cookies.get("ul_nesw");
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, "0"));
    const [CardData, setCardData] = useState(null);
    const [productSum, setProductSum] = useState([]);
    const [productCount, setProductCount] = useState([]);
    const [sumYer, setSumYer] = useState(currentDate.getFullYear());
    const [sumData, setSumData] = useState([]);
    const [dilerData, setDilerData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [card, sum, count, product, diler] = await Promise.all([
                Statistik.GetStatistik(locationId),
                Statistik.GetStatistikSum({ id: locationId, year: sumYer }),
                Statistik.GetStatistikProductCount({ id: locationId, year, month }),
                Statistik.GetStatistikProductSum({ id: locationId, year, month }),
                Statistik.GetStatistikDiler({ id: locationId, year, month }),
            ]);

            setCardData(card?.data);
            setSumData(sum?.data || []);
            setProductCount(count?.data || []);
            setProductSum(product?.data || []);
            setDilerData(diler?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        Statistik.GetStatistikSum({ id: locationId, year: sumYer }).then((res) =>
            setSumData(res?.data || [])
        );
    }, [sumYer]);

    const stats = [
        {
            title: t("Warehouses"),
            value: CardData ? CardData.countWarehouse : "...",
            icon: <Warehouse className="w-6 h-6 text-blue-600" />,
        },
        {
            title: t("dilers"),
            value: CardData ? CardData.countDealer : "...",
            icon: <Users className="w-6 h-6 text-green-600" />,
        },
        {
            title: t("products"),
            value: CardData ? CardData.countProduct : "...",
            icon: <Package className="w-6 h-6 text-purple-600" />,
        },
        {
            title: t("Total_Value"),
            value: CardData ? `${CardData.sumProduct.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
        },
        {
            title: t("Receipts_in_month"),
            value: CardData ? `${CardData.income.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowDown className="w-6 h-6 text-green-600" />,
        },
        {
            title: t("Output_in_mont"),
            value: CardData ? `${CardData.sumDisposal.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowUp className="w-6 h-6 text-red-600" />,
        },
    ];

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Typography
                        variant="h3"
                        className="font-bold text-text dark:text-text-dark text-[black]"
                    >
                        {t("Dashboard_page")}
                    </Typography>
                </div>

                {/* === Statistik Cards === */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                    {stats.map((item, index) => (
                        <Card
                            key={index}
                            className="bg-card dark:bg-card-dark border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardBody className="flex items-center gap-4 p-6">
                                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-sm">
                                    {item.icon}
                                </div>
                                <div>
                                    <Typography className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        className="font-bold text-gray-900 dark:text-gray-100"
                                    >
                                        {item.value}
                                    </Typography>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* === Filter === */}
                <Card className="bg-card dark:bg-card-dark mb-[20px] transition-colors duration-300">
                    <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <Select
                                label={t("Select_yers")}
                                value={year.toString()}
                                onChange={(val) => setYear(val)}
                                className="text-gray-900 dark:text-text-dark outline-none"
                                labelProps={{
                                    className: "text-gray-700 dark:text-text-dark",
                                }}
                                menuProps={{
                                    className: "dark:bg-gray-800 dark:text-text-dark",
                                }}
                            >
                                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                    <Option key={y} value={y.toString()}>
                                        {y}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                label={t("Select_month")}
                                value={month}
                                className="text-gray-900 dark:text-text-dark outline-none"
                                labelProps={{
                                    className: "text-gray-700 dark:text-text-dark",
                                }}
                                menuProps={{
                                    className: "dark:bg-gray-800 dark:text-text-dark",
                                }}
                                onChange={(val) => setMonth(val)}
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
                                    <Option key={m.id} value={m.id}>
                                        {m.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <Button
                            color="green"
                            className="px-6"
                            onClick={() => {
                                setLoading(true);
                                fetchAllData().finally(() => setLoading(false));
                            }}
                        >
                            {t("Search")}
                        </Button>
                    </CardBody>
                </Card>

                {/* === Charts === */}
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    <WarehouseMonyChart data={productSum} />
                    <WarehouseProduct data={productCount} />
                </div>
{/* 
                <AllDilerChart data={dilerData} />
                <AllMinusPlusChart data={sumData} year={sumYer} filter={setSumYer} /> */}
            </div>
        </div>
    );
}
