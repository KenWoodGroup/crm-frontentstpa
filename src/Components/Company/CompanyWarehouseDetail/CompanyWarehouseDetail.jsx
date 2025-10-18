import { useEffect, useState } from "react";
import { WarehouseApi } from "../../../utils/Controllers/WarehouseApi";
import { NavLink, useParams } from "react-router-dom";
import {
    Card,
    CardBody,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import { Building2, User, MapPin, Phone, Mail, Users, Layers, BarChart3 } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function CompanyWarehouseDetail() {
    const { id } = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    // пример данных статистики
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        kirim: 0,
        chiqim: 0,
        chartData: [],
    });

    const GetWarehouseDetail = async () => {
        try {
            const response = await WarehouseApi.GetWarehouseDetail(id);
            setWarehouse(response?.data);

            // 🔹 имитация данных (сюда можно вставить реальные из backend)
            const mockStats = {
                totalProducts: 1240,
                totalValue: 54200000,
                kirim: 28500000,
                chiqim: 18200000,
                chartData: [
                    { name: "Yan", kirim: 5000, chiqim: 3500 },
                    { name: "Fev", kirim: 7000, chiqim: 5200 },
                    { name: "Mar", kirim: 8200, chiqim: 6100 },
                    { name: "Apr", kirim: 9000, chiqim: 7500 },
                    { name: "May", kirim: 6500, chiqim: 6200 },
                    { name: "Iyun", kirim: 7200, chiqim: 6800 },
                ],
            };
            setStats(mockStats);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetWarehouseDetail();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-80">
                <Spinner className="h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex justify-center items-center h-80">
                <Typography color="gray">Ombor topilmadi</Typography>
            </div>
        );
    }

    return (
        <div className="mt-10 space-y-6">
            {/* Sarlavha */}
            <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
                <Typography variant="h4" className="font-bold">
                    {warehouse.name}
                </Typography>
            </div>

            {/* Ombor haqida ma'lumot */}
            <Card className="shadow-md rounded-2xl">
                <CardBody>
                    <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        <Typography variant="h6" className="font-semibold">
                            Ombor haqida ma’lumot
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem icon={<MapPin />} label="Manzil" value={warehouse.address} />
                        <InfoItem icon={<Phone />} label="Telefon" value={warehouse.phone} />
                        <InfoItem icon={<Mail />} label="Email" value={warehouse.email} />
                        <InfoItem
                            icon={<Building2 />}
                            label="Turi"
                            value={warehouse.type?.toUpperCase()}
                        />
                        <InfoItem
                            icon={<User />}
                            label="Yaratilgan sana"
                            value={new Date(warehouse.createdAt).toLocaleString()}
                        />
                    </div>
                </CardBody>
            </Card>
            <Card className="shadow-md rounded-2xl mt-8">
                <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <Typography variant="h6" className="font-semibold">
                            Ombor statistikasi
                        </Typography>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <StatItem title="Mahsulotlar soni" value={stats.totalProducts} />
                        <StatItem
                            title="Umumiy qiymat"
                            value={stats.totalValue.toLocaleString() + " so‘m"}
                        />
                        <StatItem
                            title="Kirim"
                            value={stats.kirim.toLocaleString() + " so‘m"}
                        />
                        <StatItem
                            title="Chiqim"
                            value={stats.chiqim.toLocaleString() + " so‘m"}
                        />
                    </div>

                    {/* Bar Chart */}
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="kirim" name="Kirim" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="chiqim" name="Chiqim" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            {/* Ombor foydalanuvchilari */}
            {warehouse.users?.length > 0 && (
                <Card className="shadow-md rounded-2xl">
                    <CardBody>
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-blue-500" />
                            <Typography variant="h6" className="font-semibold">
                                Ombor foydalanuvchilari
                            </Typography>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {warehouse.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <Typography className="font-medium">
                                                {user.full_name}
                                            </Typography>
                                            <Typography color="gray" className="text-sm">
                                                {user.email}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Qurilish nuqtalari */}
            {warehouse.children?.length > 0 && (
                <Card className="shadow-md rounded-2xl">
                    <CardBody>
                        <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-5 h-5 text-blue-500" />
                            <Typography variant="h6" className="font-semibold">
                                Qurilish nuqtalari
                            </Typography>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {warehouse.children.map((child) => (
                                <NavLink to={`/company/diler/${child?.id}`}>
                                    <div
                                        key={child.id}
                                        className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                                    >
                                        <Typography className="font-medium text-blue-700">
                                            {child.name}
                                        </Typography>
                                        <Typography color="gray" className="text-sm">
                                            Manzil: {child.address}
                                        </Typography>
                                        <Typography color="gray" className="text-sm">
                                            Telefon: {child.phone}
                                        </Typography>
                                        <Typography color="gray" className="text-sm">
                                            Email: {child.email}
                                        </Typography>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* 📊 Statistika */}

        </div>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <div className="text-blue-500 mt-1">{icon}</div>
            <div>
                <Typography className="text-sm font-semibold text-gray-700">
                    {label}
                </Typography>
                <Typography className="text-sm text-gray-600 break-words">
                    {value || "—"}
                </Typography>
            </div>
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
