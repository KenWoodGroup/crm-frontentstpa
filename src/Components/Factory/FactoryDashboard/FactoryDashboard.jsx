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
    Factory,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

export default function FactoryDashboard() {
    const stats = [
        { title: "Omborlar", value: "12", icon: <Warehouse className="w-6 h-6 text-gray-700" /> },
        { title: "Dilerlar", value: "58", icon: <Users className="w-6 h-6 text-gray-700" /> },
        { title: "Mahsulotlar", value: "1,340", icon: <Package className="w-6 h-6 text-gray-700" /> },
        { title: "Umumiy", value: "$256,000", icon: <DollarSign className="w-6 h-6 text-gray-700" /> },
        { title: "Ishlab Chiqarishi", value: "5,600 dona", icon: <Factory className="w-6 h-6 text-gray-700" /> },
    ];

    const lineData = [
        { oy: "Yan", ishlabChiqarish: 420 },
        { oy: "Fev", ishlabChiqarish: 510 },
        { oy: "Mar", ishlabChiqarish: 610 },
        { oy: "Apr", ishlabChiqarish: 700 },
        { oy: "May", ishlabChiqarish: 790 },
        { oy: "Iyun", ishlabChiqarish: 870 },
        { oy: "Iyul", ishlabChiqarish: 930 },
        { oy: "Avg", ishlabChiqarish: 1020 },
        { oy: "Sen", ishlabChiqarish: 980 },
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

    const COLORS = ["#000", "#555", "#888", "#bbb", "#ddd"];

    return (
        <div className=" text-gray-900">
            <Typography variant="h4" className="mb-6 font-semibold text-gray-800">
                Zavod Boshqaruv Paneli
            </Typography>

            {/* Statistika Kartalari */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
                {stats.map((item, index) => (
                    <Card
                        key={index}
                        className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <CardBody className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl">{item.icon}</div>
                            <div>
                                <Typography className="text-[14px] text-gray-500 font-[600]">{item.title}</Typography>
                                <Typography variant="h5" className="font-semibold text-gray-900">
                                    {item.value}
                                </Typography>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Chiziqli grafik */}
            <Card className="bg-white border border-gray-200 p-4 shadow-sm mb-8">
                <Typography variant="h6" className="mb-4 text-gray-700">
                    Oyma-Oy Ishlab Chiqarish Grafigi
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                        <XAxis dataKey="oy" stroke="#555" />
                        <YAxis stroke="#555" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                color: "#333",
                            }}
                            labelStyle={{ color: "#000" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="ishlabChiqarish"
                            stroke="#000"
                            strokeWidth={2}
                            dot={{ fill: "#000", r: 4 }}
                            activeDot={{ r: 6, fill: "#000" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Quyidagi chartlar: bar va pie */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <Typography variant="h6" className="mb-4 text-gray-700">
                        Omborlar Bo‘yicha Mahsulotlar
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis dataKey="name" stroke="#555" />
                            <YAxis stroke="#555" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #ccc",
                                    color: "#333",
                                }}
                            />
                            <Bar dataKey="mahsulotlar" fill="#000" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Pie Chart */}
                <Card className="bg-white border border-gray-200 p-4 shadow-sm">
                    <Typography variant="h6" className="mb-4 text-gray-700">
                        Dilerlar Ulushi
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #ccc",
                                    color: "#333",
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
