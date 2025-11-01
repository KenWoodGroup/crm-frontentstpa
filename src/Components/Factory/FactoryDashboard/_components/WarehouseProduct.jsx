import { Card, Typography } from "@material-tailwind/react";
import { Warehouse } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function WarehouseProduct({ data = [] }) {
    // Если данных нет
    if (!data || data.length === 0) {
        return (
            <Card className="bg-card-light dark:bg-card-dark border-0 shadow-lg p-8 flex flex-col items-center justify-center transition-colors duration-300">
                <Warehouse className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3" />
                <Typography variant="h6" className="text-text-light dark:text-text-dark">
                    Ma’lumot mavjud emas
                </Typography>
            </Card>
        );
    }

    const COLORS_WAREHOUSE = [
        "#10b981",
        "#8b5cf6",
        "#f59e0b",
        "#ec4899",
        "#06b6d4",
        "#3b82f6",
        "#f97316",
        "#22c55e",
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
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
        <Card className="bg-card-light dark:bg-card-dark border-0 shadow-lg p-6 transition-colors duration-300">
            <Typography
                variant="h5"
                className="mb-6 font-bold text-text-light dark:text-text-dark flex items-center gap-2"
            >
                <Warehouse className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS_WAREHOUSE[index % COLORS_WAREHOUSE.length]}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value) => [`${value} ta mahsulot`, "Mahsulotlar soni"]}
                        contentStyle={{
                            backgroundColor: "#181818",
                            borderRadius: "8px",
                            border: "1px solid #333",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            color: "#FAFAFA",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#FAFAFA" }}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Umumiy mahsulotlar soni</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {total.toLocaleString()} ta
                </p>
            </div>
        </Card>
    );
}
