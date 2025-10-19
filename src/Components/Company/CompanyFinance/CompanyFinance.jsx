import { Card, CardBody, Typography, Progress } from "@material-tailwind/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    TrendingUp,
    Package,
    Warehouse,
    Building,
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle
} from 'lucide-react';

// Регистрируем компоненты Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function CompanyFinance() {
    // 🔹 Моковые данные для демонстрации
    const financeData = {
        totalIncome: 12500000,
        totalExpenses: 8500000,
        netProfit: 4000000,
        productsCount: 2450,
        warehousesCount: 8,
        constructionSites: 12,
        warehouseCash: 3200000,
        monthlyGrowth: 15.3,
    };

    // 🔹 Данные для графика доходов/расходов по месяцам
    const monthlyData = {
        labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
        datasets: [
            {
                label: 'Daromad',
                data: [8500000, 9200000, 9800000, 10500000, 11200000, 12500000, 11800000, 12200000, 13000000, 12800000, 13500000, 12500000],
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2,
                tension: 0.4,
            },
            {
                label: 'Xarajatlar',
                data: [6200000, 6800000, 7200000, 7800000, 8200000, 8500000, 7900000, 8100000, 8300000, 8000000, 8200000, 8500000],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                tension: 0.4,
            }
        ]
    };

    // 🔹 Данные для круговой диаграммы распределения расходов
    const expensesData = {
        labels: ['Materiallar', 'Ish haqi', 'Transport', 'Loyiha xarajatlari', 'Boshqalar'],
        datasets: [
            {
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(156, 163, 175, 1)',
                ],
                borderWidth: 2,
            }
        ]
    };

    // 🔹 Данные для столбчатой диаграммы складов
    const warehouseData = {
        labels: ['Ombor 1', 'Ombor 2', 'Ombor 3', 'Ombor 4', 'Ombor 5', 'Ombor 6'],
        datasets: [
            {
                label: 'Mahsulotlar soni',
                data: [450, 320, 280, 510, 390, 220],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
            }
        ]
    };

    // 🔹 Настройки для графиков
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Oylik Daromad va Xarajatlar',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value / 1000 + 'K';
                    }
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Xarajatlarning taqsimlanishi',
            },
        },
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Ombordagi mahsulotlar taqsimlanishi',
            },
        },
    };

    // 🔹 Форматирование чисел
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS'
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('uz-UZ').format(num);
    };

    return (
        <div className="min-h-screen">
            <div className="mb-8">
                <Typography variant="h3" className="font-bold text-gray-900">
                    Kompaniya Moliya Statistikalari
                </Typography>
                <Typography variant="paragraph" className="text-gray-600 mt-2">
                    Umumiy moliyaviy ko'rsatkichlar va tahlillar
                </Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Общий доход */}
                <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Umumiy Daromad
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {formatCurrency(financeData.totalIncome)}
                                </Typography>
                                <div className="flex items-center mt-2">
                                    <ArrowUpCircle size={16} className="mr-1" />
                                    <Typography variant="small">+{financeData.monthlyGrowth}% o'tgan oydan</Typography>
                                </div>
                            </div>
                            <TrendingUp size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Чистая прибыль */}
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Sof Foyda
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {formatCurrency(financeData.netProfit)}
                                </Typography>
                                <Progress
                                    value={68}
                                    color="white"
                                    className="mt-2 bg-white/20"
                                    size="sm"
                                />
                            </div>
                            <DollarSign size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Товары и склады */}
                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Mahsulotlar & Ombordor
                                </Typography>
                                <div className="space-y-1">
                                    <div className="flex items-center">
                                        <Package size={16} className="mr-2" />
                                        <Typography variant="paragraph">{formatNumber(financeData.productsCount)} ta mahsulot</Typography>
                                    </div>
                                    <div className="flex items-center">
                                        <Warehouse size={16} className="mr-2" />
                                        <Typography variant="paragraph">{financeData.warehousesCount} ta ombor</Typography>
                                    </div>
                                </div>
                            </div>
                            <Package size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Строительные точки */}
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Qurilish Ob'ektlari
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {financeData.constructionSites} ta
                                </Typography>
                                <div className="flex items-center mt-2">
                                    <Building size={16} className="mr-1" />
                                    <Typography variant="small">Faol loyihalar</Typography>
                                </div>
                            </div>
                            <Building size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 🔹 Графики и диаграммы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* График доходов/расходов */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <Line data={monthlyData} options={chartOptions} height={300} />
                    </CardBody>
                </Card>

                {/* Круговая диаграмма расходов */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={expensesData} options={doughnutOptions} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 🔹 Дополнительная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Распределение по складам */}
                <Card className="shadow-lg lg:col-span-2">
                    <CardBody className="p-6">
                        <Bar data={warehouseData} options={barOptions} height={200} />
                    </CardBody>
                </Card>

                {/* Детали финансов */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <Typography variant="h6" className="mb-4 text-gray-900">
                            Moliyaviy Tafsilotlar
                        </Typography>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Ombordagi Naqd Pul:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-green-600">
                                    {formatCurrency(financeData.warehouseCash)}
                                </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Umumiy Xarajatlar:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-red-600">
                                    {formatCurrency(financeData.totalExpenses)}
                                </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Daromad O'sishi:
                                </Typography>
                                <div className="flex items-center text-green-600">
                                    <ArrowUpCircle size={16} className="mr-1" />
                                    <Typography variant="paragraph" className="font-semibold">
                                        +{financeData.monthlyGrowth}%
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Foyda Darajasi:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-blue-600">
                                    {((financeData.netProfit / financeData.totalIncome) * 100).toFixed(1)}%
                                </Typography>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}