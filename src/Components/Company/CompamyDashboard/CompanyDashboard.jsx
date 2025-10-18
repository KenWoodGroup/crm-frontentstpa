import {
    Card,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    Warehouse,
    Users,
    Package,
    DollarSign,
    TrendingUp,
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
    LineChart,
    Line,
    Area,
    AreaChart,
} from "recharts";

export default function CompanyDashboard() {
    const stats = [
        { title: "Omborlar", value: "12", icon: <Warehouse className="w-6 h-6 text-blue-600" /> },
        { title: "Dilerlar", value: "58", icon: <Users className="w-6 h-6 text-green-600" /> },
        { title: "Mahsulotlar", value: "1,340", icon: <Package className="w-6 h-6 text-purple-600" /> },
        { title: "Umumiy", value: "$256,000", icon: <DollarSign className="w-6 h-6 text-yellow-600" /> },
    ];

    // Данные для складов - сколько денег есть и нет
    const omborMoneyData = [
        { name: "Ombor A", mavjud: 45000, yoq: 15000 },
        { name: "Ombor B", mavjud: 38000, yoq: 22000 },
        { name: "Ombor C", mavjud: 52000, yoq: 18000 },
        { name: "Ombor D", mavjud: 41000, yoq: 19000 },
        { name: "Ombor E", mavjud: 48000, yoq: 12000 },
    ];

    const mahsulotMoneyData = [
        { name: "Mahsulot A", qiymat: 58000 },
        { name: "Mahsulot B", qiymat: 45000 },
        { name: "Mahsulot C", qiymat: 67000 },
        { name: "Mahsulot D", qiymat: 39000 },
        { name: "Mahsulot E", qiymat: 47000 },
    ];

    const barData = [
        { name: "Ombor A", mahsulotlar: 300 },
        { name: "Ombor B", mahsulotlar: 450 },
        { name: "Ombor C", mahsulotlar: 520 },
        { name: "Ombor D", mahsulotlar: 380 },
        { name: "Ombor E", mahsulotlar: 610 },
    ];

    const pieData = [
        { name: "Diler A", value: 30 },
        { name: "Diler B", value: 25 },
        { name: "Diler C", value: 20 },
        { name: "Diler D", value: 15 },
        { name: "Diler E", value: 10 },
    ];

    // Данные для линейного графика - рост денег по месяцам
    const moneyGrowthData = [
        { oy: "Yanvar", pul: 45000, kirim: 42000 },
        { oy: "Fevral", pul: 58000, kirim: 55000 },
        { oy: "Mart", pul: 72000, kirim: 68000 },
        { oy: "Aprel", pul: 89000, kirim: 84000 },
        { oy: "May", pul: 105000, kirim: 98000 },
        { oy: "Iyun", pul: 128000, kirim: 118000 },
        { oy: "Iyul", pul: 152000, kirim: 142000 },
        { oy: "Avgust", pul: 178000, kirim: 165000 },
        { oy: "Sentabr", pul: 205000, kirim: 192000 },
        { oy: "Oktabr", pul: 235000, kirim: 218000 },
        { oy: "Noyabr", pul: 256000, kirim: 245000 },
    ];

    const COLORS_WAREHOUSE = ["#3b82f6", "#ef4444", "#8b5cf6", "#f59e0b"];
    const COLORS_PRODUCTS = ["#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
    const COLORS = ["#1e293b", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

    // Преобразуем данные складов для круговой диаграммы
    const omborPieData = [
        { name: "A ombor", value: 45000 },
        { name: "B ombor", value: 38000 },
        { name: "C ombor", value: 52000 },
        { name: "D ombor", value: 41000 },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const MoneyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border-2 border-green-500 rounded-lg shadow-xl">
                    <p className="text-base font-bold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-semibold">{entry.name}:</span> ${entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br">
            <div className="max-w-7xl mx-auto">
                <Typography variant="h3" className="mb-8 font-bold text-gray-800">
                    Zavod Boshqaruv Paneli
                </Typography>

                {/* Statistika Kartalari */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                    {stats.map((item, index) => (
                        <Card
                            key={index}
                            className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardBody className="flex items-center gap-4 p-6">
                                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm">
                                    {item.icon}
                                </div>
                                <div>
                                    <Typography className="text-sm text-gray-600 font-medium mb-1">
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

                {/* Круговые диаграммы */}
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    {/* Omborlar puli */}
                    <Card className="bg-white border-0 shadow-lg p-6">
                        <Typography variant="h5" className="mb-6 font-bold text-gray-800 flex items-center gap-2">
                            <Warehouse className="w-6 h-6 text-blue-600" />
                            Omborlardagi Pul Holati
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={omborPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={120}
                                    dataKey="value"
                                >
                                    {omborPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_WAREHOUSE[index]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Eng ko'p</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${Math.max(...omborPieData.map(o => o.value)).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Umumiy</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        ${omborPieData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Mahsulotlar qiymati */}
                    <Card className="bg-white border-0 shadow-lg p-6">
                        <Typography variant="h5" className="mb-6 font-bold text-gray-800 flex items-center gap-2">
                            <Package className="w-6 h-6 text-purple-600" />
                            Mahsulotlar Qiymati
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={mahsulotMoneyData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={120}
                                    dataKey="qiymat"
                                >
                                    {mahsulotMoneyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_PRODUCTS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600 mb-1">Umumiy qiymat</p>
                            <p className="text-3xl font-bold text-purple-600">
                                ${mahsulotMoneyData.reduce((sum, item) => sum + item.qiymat, 0).toLocaleString()}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* YANGI: Katta lineynyy grafik - Pul o'sishi */}
                <Card className="bg-white border-0 shadow-lg p-8 mb-10">
                    <div className="flex items-center justify-between mb-8">
                        <Typography variant="h4" className="font-bold text-gray-800 flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                            Oyma-Oy Pul Kiritish va O'sish
                        </Typography>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-sm font-medium text-gray-700">Umumiy pul</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-sm font-medium text-gray-700">Kirim</span>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={450}>
                        <AreaChart data={moneyGrowthData}>
                            <defs>
                                <linearGradient id="colorPul" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="oy"
                                stroke="#6b7280"
                                style={{ fontSize: '14px', fontWeight: '500' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '14px', fontWeight: '500' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip content={<MoneyTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="pul"
                                stroke="#10b981"
                                strokeWidth={3}
                                fill="url(#colorPul)"
                                name="Umumiy pul"
                            />
                            <Area
                                type="monotone"
                                dataKey="kirim"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorKirim)"
                                name="Kirim"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Joriy oy</p>
                            <p className="text-3xl font-bold text-green-600">
                                ${moneyGrowthData[moneyGrowthData.length - 1].pul.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">O'sish</p>
                            <p className="text-3xl font-bold text-blue-600">
                                +${(moneyGrowthData[moneyGrowthData.length - 1].pul - moneyGrowthData[0].pul).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">O'rtacha</p>
                            <p className="text-3xl font-bold text-purple-600">
                                ${Math.round(moneyGrowthData.reduce((sum, item) => sum + item.pul, 0) / moneyGrowthData.length).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Quyidagi chartlar: bar va pie */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Dilerlar Bar Chart */}
                    <Card className="bg-white border-0 shadow-lg p-8 col-span-2">
                        <Typography variant="h5" className="mb-8 font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-6 h-6 text-green-600" />
                            Dilerlar Bo‘yicha Pul Miqdori
                        </Typography>

                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={[
                                    { name: "Diler A", pul: 30000 },
                                    { name: "Diler B", pul: 25000 },
                                    { name: "Diler C", pul: 20000 },
                                    { name: "Diler D", pul: 15000 },
                                    { name: "Diler E", pul: 10000 },
                                ]}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "14px" }} />
                                <YAxis
                                    stroke="#6b7280"
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    style={{ fontSize: "14px" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, "Pul"]}
                                />
                                <Bar dataKey="pul" radius={[10, 10, 0, 0]}>
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 text-center">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Eng ko‘p pul</p>
                                <p className="text-2xl font-bold text-green-600">
                                    $30,000
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Umumiy</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ${(30000 + 25000 + 20000 + 15000 + 10000).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">O‘rtacha</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    ${((30000 + 25000 + 20000 + 15000 + 10000) / 5).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}