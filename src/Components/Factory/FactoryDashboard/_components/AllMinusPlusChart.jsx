import { Card, Tooltip, Typography, Select, Option } from "@material-tailwind/react";
import { TrendingUp, Info } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartTooltip } from "recharts";

export default function AllMinusPlusChart({ data = [], filter, year }) {
    // Названия месяцев
    const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];

    // Преобразуем входящие данные
    const moneyGrowthData = data.map((item) => ({
        oy: months[item.month - 1],
        pul: item.outgoing || 0,
        kirim: item.incoming || 0,
    }));

    // Подсчёты
    const last = moneyGrowthData[moneyGrowthData.length - 1] || { pul: 0, kirim: 0 };
    const first = moneyGrowthData[0] || { pul: 0, kirim: 0 };
    const average =
        moneyGrowthData.length > 0
            ? Math.round(
                moneyGrowthData.reduce((sum, i) => sum + i.pul, 0) / moneyGrowthData.length
            )
            : 0;

    // Кастомный Tooltip для графика
    const CustomMoneyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const kirim = payload.find((p) => p.dataKey === "kirim")?.value || 0;
            const pul = payload.find((p) => p.dataKey === "pul")?.value || 0;

            return (
                <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-gray-800 mb-1">{label}</p>
                    <p className="text-blue-600">Kirim: {kirim.toLocaleString()} so‘m</p>
                    <p className="text-green-600">Chiqim: {pul.toLocaleString()} so‘m</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-white border-0 shadow-lg p-8 mb-10">
            <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-bold text-gray-800 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    Oyma-Oy Pul Kiritish va O'sish
                </Typography>
                <div className="flex gap-6">
                    <Select
                        label="Yilni tanlang"
                        value={year?.toString() || ""}
                        onChange={(val) => filter(val)}
                    >
                        {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                            <Option key={y} value={y.toString()}>
                                {y}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* График */}
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
                        style={{ fontSize: "14px", fontWeight: "500" }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k so‘m`}
                    />
                    <RechartTooltip content={<CustomMoneyTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="pul"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorPul)"
                        name="Chiqim (pul)"
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

            {/* Нижняя статистика с hover */}
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200">
                <Tooltip content="So‘nggi oydagi chiqim miqdori">
                    <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                        <p className="text-sm text-gray-600 mb-2 flex items-center justify-center gap-1">
                            Joriy oy <Info size={14} className="text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                            {last.pul.toLocaleString()} so‘m
                        </p>
                    </div>
                </Tooltip>

                <Tooltip content="Birinchi oyga nisbatan o‘sish summasi">
                    <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                        <p className="text-sm text-gray-600 mb-2 flex items-center justify-center gap-1">
                            O‘sish <Info size={14} className="text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                            +{(last.pul - first.pul).toLocaleString()} so‘m
                        </p>
                    </div>
                </Tooltip>

                <Tooltip content="Oyma-oy chiqimning o‘rtacha qiymati">
                    <div className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
                        <p className="text-sm text-gray-600 mb-2 flex items-center justify-center gap-1">
                            O‘rtacha <Info size={14} className="text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-purple-600">
                            {average.toLocaleString()} so‘m
                        </p>
                    </div>
                </Tooltip>
            </div>
        </Card>
    );
}
