import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    Warehouse,
    Package,
    DollarSign,
    Truck,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    AreaChart,
    Area,
} from "recharts";

export default function CompanyWarehouseDashboard() {
    const stats = [
        { title: "Umumiy Omborlar", value: "8", icon: <Warehouse className="w-6 h-6 text-blue-600" /> },
        { title: "Mahsulotlar", value: "4,230", icon: <Package className="w-6 h-6 text-purple-600" /> },
        { title: "Tashuvlar", value: "312", icon: <Truck className="w-6 h-6 text-orange-600" /> },
        { title: "Umumiy Foyda", value: "$512,000", icon: <DollarSign className="w-6 h-6 text-green-600" /> },
    ];

    // Omborlar boyicha mahsulot qiymati
    const warehouseData = [
        { name: "Ombor A", mavjud: 52000, yoq: 8000 },
        { name: "Ombor B", mavjud: 48000, yoq: 12000 },
        { name: "Ombor C", mavjud: 62000, yoq: 9000 },
        { name: "Ombor D", mavjud: 57000, yoq: 7000 },
    ];

    // Oyma-oy pul oqimi
    const moneyGrowthData = [
        { oy: "Yanvar", kirim: 42000, chiqim: 38000 },
        { oy: "Fevral", kirim: 48000, chiqim: 44000 },
        { oy: "Mart", kirim: 52000, chiqim: 47000 },
        { oy: "Aprel", kirim: 60000, chiqim: 53000 },
        { oy: "May", kirim: 67000, chiqim: 59000 },
        { oy: "Iyun", kirim: 72000, chiqim: 66000 },
        { oy: "Iyul", kirim: 85000, chiqim: 77000 },
        { oy: "Avgust", kirim: 91000, chiqim: 84000 },
        { oy: "Sentabr", kirim: 97000, chiqim: 89000 },
        { oy: "Oktabr", kirim: 105000, chiqim: 96000 },
    ];

    const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
                    <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">${payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Typography variant="h3" className="mb-8 font-bold text-gray-800">
                    Ombor Boshqaruv Paneli
                </Typography>

                {/* Statistika */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((item, index) => (
                        <Card
                            key={index}
                            className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardBody className="flex items-center gap-4 p-6">
                                <div className="p-4 bg-gray-50 rounded-2xl">{item.icon}</div>
                                <div>
                                    <Typography className="text-sm text-gray-600 font-medium">
                                        {item.title}
                                    </Typography>
                                    <Typography variant="h5" className="font-bold text-gray-900">
                                        {item.value}
                                    </Typography>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Diagrammalar */}
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    {/* Omborlar boyicha mahsulot qiymati */}
                    <Card className="bg-white shadow-lg p-6">
                        <Typography variant="h5" className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Warehouse className="w-6 h-6 text-blue-600" />
                            Omborlar Boyicha Mahsulot Qiymati
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={warehouseData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="mavjud" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="yoq" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Omborlar bo‘yicha ulush */}
                    <Card className="bg-white shadow-lg p-6">
                        <Typography variant="h5" className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6 text-purple-600" />
                            Omborlar Ulushi (%)
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={warehouseData}
                                    dataKey="mavjud"
                                    nameKey="name"
                                    outerRadius={120}
                                    label
                                >
                                    {warehouseData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Pul oqimi chart */}
                <Card className="bg-white shadow-lg p-8">
                    <Typography variant="h5" className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                        Oyma-Oy Pul Oqimi
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={moneyGrowthData}>
                            <defs>
                                <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorChiqim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="oy" stroke="#6b7280" />
                            <YAxis
                                stroke="#6b7280"
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="kirim"
                                stroke="#10b981"
                                fill="url(#colorKirim)"
                                strokeWidth={3}
                                name="Kirim"
                            />
                            <Area
                                type="monotone"
                                dataKey="chiqim"
                                stroke="#ef4444"
                                fill="url(#colorChiqim)"
                                strokeWidth={3}
                                name="Chiqim"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 text-center">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Joriy oy</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${moneyGrowthData[moneyGrowthData.length - 1].kirim.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">O'sish</p>
                            <p className="text-2xl font-bold text-blue-600">
                                +${(moneyGrowthData[moneyGrowthData.length - 1].kirim - moneyGrowthData[0].kirim).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">O‘rtacha</p>
                            <p className="text-2xl font-bold text-purple-600">
                                ${Math.round(moneyGrowthData.reduce((sum, d) => sum + d.kirim, 0) / moneyGrowthData.length).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
