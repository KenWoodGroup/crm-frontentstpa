import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function WarehouseDashboard() {
    const data = [
        { name: "Televizorlar", quantity: 120 },
        { name: "Noutbuklar", quantity: 80 },
        { name: "Telefonlar", quantity: 200 },
        { name: "Muzlatkichlar", quantity: 45 },
        { name: "Pechlar", quantity: 60 },
    ];

    const COLORS = ["#1C1C1C", "#3F3F3F", "#6B6B6B", "#A1A1A1", "#D4D4D4"];

    const totalItems = data.reduce((acc, item) => acc + item.quantity, 0);
    const topProduct = data.reduce((max, item) =>
        item.quantity > max.quantity ? item : max
    );

    return (
        <div className=" text-black min-h-screen transition-all duration-300">
            <Typography variant="h4" className="mb-6 font-semibold ">
                Ombor Paneli
            </Typography>

            {/* Statistika kartalar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-sm bg-white border border-gray-200 hover:shadow-md transition">
                    <CardBody>
                        <Typography variant="h6" className="text-gray-800">
                            Umumiy mahsulotlar soni
                        </Typography>
                        <Typography variant="h3" className="mt-2 font-bold text-gray-900">
                            {totalItems}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="shadow-sm bg-white border border-gray-200 hover:shadow-md transition">
                    <CardBody>
                        <Typography variant="h6" className="text-gray-800">
                            Eng ko‘p mavjud mahsulot
                        </Typography>
                        <Typography variant="h4" className="mt-2 font-bold text-gray-900">
                            {topProduct.name}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="shadow-sm bg-white border border-gray-200 hover:shadow-md transition">
                    <CardBody>
                        <Typography variant="h6" className="text-gray-800">
                            Mahsulot turlari
                        </Typography>
                        <Typography variant="h3" className="mt-2 font-bold text-gray-900">
                            {data.length}
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            {/* Diagrammalar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card className="shadow-sm bg-white border border-gray-200">
                    <CardHeader floated={false} shadow={false} className="bg-transparent">
                        <Typography variant="h6" className="text-gray-800">
                            Mahsulotlar ulushi (Pie Chart)
                        </Typography>
                    </CardHeader>
                    <CardBody className="flex justify-center items-center h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="quantity"
                                    nameKey="name"
                                    outerRadius={110}
                                    fill="#8884d8"
                                    label={({ name }) => name}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid #E5E7EB",
                                        color: "#111111",
                                        borderRadius: "8px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* Bar Chart */}
                <Card className="shadow-sm bg-white border border-gray-200">
                    <CardHeader floated={false} shadow={false} className="bg-transparent">
                        <Typography variant="h6" className="text-gray-800">
                            Mahsulot soni (Bar Chart)
                        </Typography>
                    </CardHeader>
                    <CardBody className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" tick={{ fill: "#111" }} />
                                <YAxis tick={{ fill: "#111" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid #E5E7EB",
                                        color: "#111111",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Bar dataKey="quantity" fill="#111111" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
                <p>© 2025 Ombor tizimi. Barcha huquqlar himoyalangan.</p>
            </div>
        </div>
    );
}
