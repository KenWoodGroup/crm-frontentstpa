import { Card } from "@material-tailwind/react";
import { Typography } from "@mui/material";
import { Users } from "lucide-react";
import { Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export default function AllDilerChart() {

    return (
        <div className="grid lg:grid-cols-2 gap-8 mb-[20px]">
            <Card className="bg-card-light dark:bg-card-dark border-0 shadow-lg p-8 col-span-2">
                <Typography
                    variant="h5"
                    className="mb-8 font-bold text-text-light dark:text-text-dark flex items-center gap-2"
                >
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
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: "14px" }}
                        />
                        <YAxis
                            stroke="#9ca3af"
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

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 text-center">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Eng ko‘p pul</p>
                        <p className="text-2xl font-bold text-green-600">$30,000</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Umumiy</p>
                        <p className="text-2xl font-bold text-blue-600">
                            ${(30000 + 25000 + 20000 + 15000 + 10000).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">O‘rtacha</p>
                        <p className="text-2xl font-bold text-purple-600">
                            ${((30000 + 25000 + 20000 + 15000 + 10000) / 5).toLocaleString()}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
