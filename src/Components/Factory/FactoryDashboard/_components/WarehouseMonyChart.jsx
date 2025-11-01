import { Card, Typography } from "@material-tailwind/react";
import { Warehouse, Package } from "lucide-react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as ReTooltip,
} from "recharts";

export default function WarehouseMonyChart({ data = [] }) {
    const COLORS_WAREHOUSE = [
        "#3b82f6", // blue
        "#ef4444", // red
        "#8b5cf6", // violet
        "#f59e0b", // amber
        "#10b981", // green
        "#f97316", // orange
    ];

    const omborPieData =
        data && data.length > 0
            ? data.map((item) => ({
                name: item.warehouseName,
                value: item.productSum,
            }))
            : [];

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }) => {
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

    const totalSum = omborPieData.reduce((sum, item) => sum + item.value, 0);
    const maxValue =
        omborPieData.length > 0
            ? Math.max(...omborPieData.map((o) => o.value))
            : 0;

    return (
        <Card className="bg-card-light dark:bg-card-dark border-0 shadow-lg p-6 transition-colors duration-300">
            <Typography
                variant="h5"
                className="mb-6 font-bold text-text-light dark:text-text-dark flex items-center gap-2"
            >
                <Warehouse className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Omborlardagi Pul Holati
            </Typography>

            {omborPieData.length > 0 ? (
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
                            isAnimationActive={true}
                        >
                            {omborPieData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS_WAREHOUSE[index % COLORS_WAREHOUSE.length]}
                                    stroke="transparent"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>

                        <ReTooltip
                            formatter={(value, name) => [
                                `${value.toLocaleString()} so‘m`,
                                name,
                            ]}
                            contentStyle={{
                                backgroundColor: "#181818",
                                borderRadius: "8px",
                                border: "1px solid #333",
                                color: "#FAFAFA",
                                fontSize: "14px",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-500" />
                    <Typography variant="h6" className="text-text-light dark:text-text-dark">
                        Ma'lumot yo‘q
                    </Typography>
                </div>
            )}

            {omborPieData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eng ko'p</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {maxValue.toLocaleString()} so‘m
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Umumiy</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {totalSum.toLocaleString()} so‘m
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>

    );
}
