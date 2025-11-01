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

export default function IndependentDashboard() {
    const locationId = Cookies.get("ul_nesw");
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
            title: "Dilerlar",
            value: CardData ? CardData.countDealer : "...",
            icon: <Users className="w-6 h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: "Mahsulotlar",
            value: CardData ? CardData.countProduct : "...",
            icon: <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
        },
        {
            title: "Umumiy Qiymat",
            value: CardData ? `${CardData.sumProduct?.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
        },
        {
            title: "Kirim (joriy oy uchun)",
            value: CardData ? `${CardData.transferIn?.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowDown className="w-6 h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: "Chiqim (joriy oy uchun)",
            value: CardData ? `${CardData.transferOut?.toLocaleString()} so'm` : "...",
            icon: <BanknoteArrowUp className="w-6 h-6 text-red-600 dark:text-red-400" />,
        },
        {
            title: "Sotuv (joriy oy uchun)",
            value: CardData ? `${CardData.income?.toLocaleString()} so'm` : "...",
            icon: <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />,
        },
        {
            title: "Utilizatsiya (joriy oy uchun)",
            value: CardData ? `${CardData.sumDisposal?.toLocaleString()} so'm` : "...",
            icon: <Trash className="w-6 h-6 text-red-600 dark:text-red-400" />,
        },
    ];

    return (
        <div className="text-black dark:text-gray-100 min-h-screen transition-all duration-300">
            <Typography variant="h4" className="mb-6 font-semibold dark:text-gray-100">
                Ombor Dashboard
            </Typography>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {stats.map((item, index) => (
                    <Card
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <CardBody className="flex items-center gap-4 p-6">
                            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-sm">
                                {item.icon}
                            </div>
                            <div>
                                <Typography className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                                    {item.title}
                                </Typography>
                                <Typography variant="h5" className="font-bold text-gray-900 dark:text-gray-100">
                                    {item.value}
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-6">
                <CardBody className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Select
                            label="Yilni tanlang"
                            value={year.toString()}
                            onChange={(val) => setYear(val)}
                            className="text-gray-900 dark:text-text-dark  outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark"
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark"
                            }}
                        >
                            {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                                <Option key={y} value={y.toString()}>
                                    {y}
                                </Option>
                            ))}
                        </Select>

                        <Select
                            label="Oyni tanlang"
                            value={month}
                            onChange={(val) => setMonth(val)}
                            className="text-gray-900 dark:text-text-dark  outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark"
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark"
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
                                <Option key={m.id} value={m.id}>
                                    {m.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        color="green"
                        className="px-6 normal-case"
                        onClick={fetchAllData}
                    >
                        Filtrlash
                    </Button>
                </CardBody>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8 pb-10">
                <WarehouseMonyChart data={productSum} />
                <WarehouseProduct data={productCount} />
            </div>
        </div>
    );
}
