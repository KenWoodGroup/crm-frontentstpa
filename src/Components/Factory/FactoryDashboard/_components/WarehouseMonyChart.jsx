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
        <Card className="bg-white border-0 shadow-lg p-6">
            <Typography
                variant="h5"
                className="mb-6 font-bold text-gray-800 flex items-center gap-2"
            >
                <Warehouse className="w-6 h-6 text-blue-600" />
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
                                    fill={
                                        COLORS_WAREHOUSE[
                                        index % COLORS_WAREHOUSE.length
                                        ]
                                    }
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>

                        {/* ✅ Встроенный Tooltip Recharts */}
                        <ReTooltip
                            formatter={(value, name) => [
                                `${value.toLocaleString()} so‘m`,
                                name,
                            ]}
                            contentStyle={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                color: "#333",
                                fontSize: "14px",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-gray-500">
                    <Package className="w-12 h-12 mb-3 text-gray-400" />
                    <Typography variant="h6" className="text-gray-600">
                        Ma'lumot yo‘q
                    </Typography>
                </div>
            )}

            {omborPieData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Eng ko'p</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {maxValue.toLocaleString()} so‘m
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Umumiy</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {totalSum.toLocaleString()} so‘m
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
