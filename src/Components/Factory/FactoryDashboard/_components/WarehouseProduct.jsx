import { Card, Typography } from "@material-tailwind/react";
import { Warehouse } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function WarehouseProduct({ data = [] }) {
    // Если данных нет
    if (!data || data.length === 0) {
        return (
            <Card className="bg-white border-0 shadow-lg p-8 flex flex-col items-center justify-center">
                <Warehouse className="w-10 h-10 text-gray-400 mb-3" />
                <Typography variant="h6" className="text-gray-500">
                    Ma’lumot mavjud emas
                </Typography>
            </Card>
        );
    }

    const COLORS_WAREHOUSE = ["#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#3b82f6", "#f97316", "#22c55e"];

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
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const total = data.reduce((sum, item) => sum + item.productCount, 0);

    return (
        <Card className="bg-white border-0 shadow-lg p-6">
            <Typography variant="h5" className="mb-6 font-bold text-gray-800 flex items-center gap-2">
                <Warehouse className="w-6 h-6 text-purple-600" />
                Omborlardagi Mahsulotlar
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={120}
                        dataKey="productCount"
                        nameKey="warehouseName"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_WAREHOUSE[index % COLORS_WAREHOUSE.length]} />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value) => [`${value} ta mahsulot`, "Mahsulotlar soni"]}
                        contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#333" }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Umumiy mahsulotlar soni</p>
                <p className="text-3xl font-bold text-purple-600">
                    {total.toLocaleString()} ta
                </p>
            </div>
        </Card>
    );
}
