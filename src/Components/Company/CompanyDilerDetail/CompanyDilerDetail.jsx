import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import { Layers, BarChart3 } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { WarehouseApi } from "../../../utils/Controllers/WarehouseApi";
import { useParams } from "react-router-dom";

export default function CompanyDilerDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [dilerData, setDilerData] = useState(null);

    const GetDilerDetail = async () => {
        try {
            const response = await WarehouseApi.GetWarehouseDetail(id);
            // 🧩 Имитация данных Qurilish nuqtalari с продуктами
            const mockPoints = [
                {
                    id: 1,
                    name: "Chilonzor Qurilish",
                    products: [
                        { name: "Tsement", qty: 120, price: 45000 },
                        { name: "G‘isht", qty: 200, price: 1200 },
                        { name: "Armatura", qty: 50, price: 80000 },
                    ],
                },
                {
                    id: 2,
                    name: "Yunusobod Qurilish",
                    products: [
                        { name: "Tsement", qty: 80, price: 45000 },
                        { name: "G‘isht", qty: 180, price: 1300 },
                        { name: "Shifer", qty: 60, price: 20000 },
                    ],
                },
                {
                    id: 3,
                    name: "Sergeli Qurilish",
                    products: [
                        { name: "Tsement", qty: 140, price: 46000 },
                        { name: "G‘isht", qty: 220, price: 1100 },
                        { name: "Qum", qty: 300, price: 5000 },
                    ],
                },
            ];

            // 🧮 Считаем общие значения для каждой точки
            const pointsWithTotals = mockPoints.map((p) => ({
                ...p,
                totalQty: p.products.reduce((a, b) => a + b.qty, 0),
                totalPrice: p.products.reduce((a, b) => a + b.qty * b.price, 0),
            }));

            // 📊 Общая статистика
            const totalAll = {
                qty: pointsWithTotals.reduce((a, b) => a + b.totalQty, 0),
                value: pointsWithTotals.reduce((a, b) => a + b.totalPrice, 0),
            };

            setDilerData({
                ...response?.data,
                points: pointsWithTotals,
                total: totalAll,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetDilerDetail();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-80">
                <Spinner className="h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!dilerData) {
        return (
            <div className="flex justify-center items-center h-80">
                <Typography color="gray">Diler topilmadi</Typography>
            </div>
        );
    }

    const { points, total } = dilerData;

    return (
        <div className="mt-10 space-y-6">
            {/* Заголовок */}
            <div className="flex items-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-blue-500" />
                <Typography variant="h4" className="font-bold">
                    Qurilish nuqtalari statistikasi
                </Typography>
            </div>

            {/* Общая статистика */}
            <Card className="shadow-md rounded-2xl">
                <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <Typography variant="h6" className="font-semibold">
                            Umumiy ma’lumotlar
                        </Typography>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                        <StatItem title="Umumiy mahsulot soni" value={total.qty + " dona"} />
                        <StatItem title="Umumiy qiymat" value={total.value.toLocaleString() + " so‘m"} />
                    </div>

                    {/* Bar Chart */}
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={points}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v) => v.toLocaleString() + " so‘m"} />
                                <Bar dataKey="totalPrice" name="Umumiy qiymat" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            {/* Qurilish nuqtalari детализация */}
            {points?.length > 0 && (
                <Card className="shadow-md rounded-2xl">
                    <CardBody>
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-blue-500" />
                            <Typography variant="h6" className="font-semibold">
                                Qurilish nuqtalari tafsilotlari
                            </Typography>
                        </div>

                        {points.map((point) => (
                            <div key={point.id} className="mb-6">
                                <Typography className="font-semibold text-blue-700 mb-2">
                                    {point.name}
                                </Typography>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border text-sm text-gray-700">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left border">Mahsulot nomi</th>
                                                <th className="p-2 text-center border">Miqdori</th>
                                                <th className="p-2 text-center border">Narxi (so‘m)</th>
                                                <th className="p-2 text-center border">Umumiy (so‘m)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {point.products.map((prod, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 border">{prod.name}</td>
                                                    <td className="p-2 text-center border">{prod.qty}</td>
                                                    <td className="p-2 text-center border">{prod.price.toLocaleString()}</td>
                                                    <td className="p-2 text-center border">
                                                        {(prod.qty * prod.price).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 font-semibold">
                                                <td className="p-2 border text-right" colSpan={3}>
                                                    Jami:
                                                </td>
                                                <td className="p-2 text-center border">
                                                    {point.totalPrice.toLocaleString()} so‘m
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

function StatItem({ title, value }) {
    return (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
            <Typography className="text-sm text-gray-600">{title}</Typography>
            <Typography className="text-lg font-semibold text-blue-700 mt-1">
                {value}
            </Typography>
        </div>
    );
}
