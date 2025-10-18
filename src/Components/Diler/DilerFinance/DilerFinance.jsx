import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";

const formatNumber = (num) => new Intl.NumberFormat("uz-UZ").format(num);

export default function DilerFinance() {
    const locationId = Cookies?.get("ul_nesw");
    const [loading, setLoading] = useState(true);
    const [finance, setFinance] = useState({
        totalTurnover: 0,
        monthlyIncome: 0,
        totalProducts: 0,
        chartData: [],
        warehouseStats: [],
    });

    const GetFinanceData = async () => {
        setLoading(true);
        try {
            // 🔹 Пример данных
            const mockData = {
                totalTurnover: 128_450_000,
                monthlyIncome: 18_900_000,
                totalProducts: 240,
                chartData: [
                    { month: "Yanvar", income: 10500000 },
                    { month: "Fevral", income: 11200000 },
                    { month: "Mart", income: 12600000 },
                    { month: "Aprel", income: 13800000 },
                    { month: "May", income: 14800000 },
                    { month: "Iyun", income: 15900000 },
                    { month: "Iyul", income: 17400000 },
                    { month: "Avgust", income: 18600000 },
                    { month: "Sentabr", income: 18900000 },
                    { month: "Oktabr", income: 19800000 },
                ],
                warehouseStats: [
                    { name: "Sklad 1", received: 520, sold: 470 },
                    { name: "Sklad 2", received: 460, sold: 430 },
                    { name: "Sklad 3", received: 510, sold: 490 },
                    { name: "Sklad 4", received: 480, sold: 450 },
                    { name: "Sklad 5", received: 500, sold: 480 },
                ],
            };
            setFinance(mockData);
        } catch (error) {
            console.error("Moliyaviy ma'lumotlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetFinanceData();
    }, [locationId]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen text-black ">
            <Typography variant="h4" className="font-bold mb-8 text-gray-900">
                Diler Moliya Analitikasi
            </Typography>

            {finance ? (
                <>
                    {/* 📊 Общие показатели */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                        <Card className="shadow-sm border border-gray-200 bg-white">
                            <CardBody>
                                <Typography className="text-gray-600 font-bold text-sm">Umumiy Obyorot</Typography>
                                <Typography variant="h5" className="font-bold text-gray-900 mt-2">
                                    {formatNumber(finance.totalTurnover)} so‘m
                                </Typography>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm border border-gray-200 bg-white">
                            <CardBody>
                                <Typography className="text-gray-600 font-bold text-sm">Oylik Daromad</Typography>
                                <Typography variant="h5" className="font-bold text-gray-900 mt-2">
                                    {formatNumber(finance.monthlyIncome)} so‘m
                                </Typography>
                            </CardBody>
                        </Card>

                        <Card className="shadow-sm border border-gray-200 bg-white">
                            <CardBody>
                                <Typography className="text-gray-600 font-bold text-sm">Mahsulotlar soni</Typography>
                                <Typography variant="h5" className="font-bold text-gray-900 mt-2">
                                    {finance.totalProducts}
                                </Typography>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 🏭 Статистика складов */}
                    <Card className="shadow-sm border border-gray-200 bg-white mb-10">
                        <CardBody>
                            <Typography variant="h6" className="font-semibold  mb-6 text-gray-900 text-center">
                                Skladlar bo‘yicha mahsulotlar harakati
                            </Typography>
                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={finance.warehouseStats}
                                        barGap={4}
                                 
                                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                    >
                                        <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#555" tickFormatter={formatNumber} />
                                        <Tooltip
                                            formatter={(val) => `${formatNumber(val)} dona`}
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                            }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="received" fill="#000000" name="Qabul qilingan" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="sold" fill="#9ca3af" name="Sotilgan" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 📈 Месячный доход */}
                    <Card className="shadow-sm border border-gray-200 bg-white">
                        <CardBody>
                            <Typography variant="h6" className="font-semibold mb-6 text-gray-900 text-center">
                                Oylik daromad dinamikasi
                            </Typography>
                            <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={finance.chartData}
                                        barCategoryGap="20%"
                                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                    >
                                        <XAxis dataKey="month" stroke="#555" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#555" tickFormatter={formatNumber} />
                                        <Tooltip
                                            formatter={(val) => `${formatNumber(val)} so‘m`}
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                            }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Bar dataKey="income" fill="#111" name="Oylik Daromad" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </>
            ) : (
                <EmptyData text="Moliyaviy ma'lumotlar topilmadi" />
            )}
        </div>
    );
}
