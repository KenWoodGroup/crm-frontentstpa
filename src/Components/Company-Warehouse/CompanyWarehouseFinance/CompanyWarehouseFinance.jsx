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
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
    Building,
    Hammer,
    Trash2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    Clock,
    CheckCircle,
    AlertTriangle
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

export default function CompanyWarehouseFinance() {
    // 🔹 Моковые данные для строительных объектов
    const constructionData = {
        totalSites: 8,
        activeSites: 6,
        completedSites: 2,
        totalExpenses: 24500000,
        materialCosts: 15600000,
        laborCosts: 6200000,
        equipmentCosts: 2700000,
        wasteCosts: 1200000,
        totalRevenue: 32500000,
        netProfit: 8000000,
        wastePercentage: 4.9,
        completionRate: 75
    };

    // 🔹 Данные по каждому строительному объекту
    const sitesData = [
        {
            id: 1,
            name: "Yangi Shahar Loyihasi",
            status: "active",
            budget: 8500000,
            spent: 6200000,
            waste: 450000,
            progress: 73,
            startDate: "2024-01-15",
            deadline: "2024-08-30"
        },
        {
            id: 2,
            name: "Biznes Markaz Qurilishi",
            status: "active",
            budget: 12000000,
            spent: 7800000,
            waste: 320000,
            progress: 65,
            startDate: "2024-02-10",
            deadline: "2024-10-15"
        },
        {
            id: 3,
            name: "Turar-joy Majmuasi",
            status: "active",
            budget: 9500000,
            spent: 5200000,
            waste: 280000,
            progress: 55,
            startDate: "2024-03-01",
            deadline: "2024-11-20"
        },
        {
            id: 4,
            name: "Sport Kompleksi",
            status: "completed",
            budget: 6800000,
            spent: 6500000,
            waste: 150000,
            progress: 100,
            startDate: "2023-11-01",
            deadline: "2024-05-30"
        },
        {
            id: 5,
            name: "Maktab Binosi",
            status: "active",
            budget: 7200000,
            spent: 3800000,
            waste: 190000,
            progress: 53,
            startDate: "2024-04-15",
            deadline: "2024-12-10"
        }
    ];

    // 🔹 Данные для графика расходов по объектам
    const expensesBySiteData = {
        labels: sitesData.map(site => site.name),
        datasets: [
            {
                label: 'Byudjet',
                data: sitesData.map(site => site.budget),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2,
            },
            {
                label: 'Sarflangan',
                data: sitesData.map(site => site.spent),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
            },
            {
                label: 'Isrof',
                data: sitesData.map(site => site.waste),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
            }
        ]
    };

    // 🔹 Данные для круговой диаграммы распределения расходов
    const expensesDistributionData = {
        labels: ['Materiallar', 'Ish haqi', 'Texnika', 'Isrof', 'Boshqalar'],
        datasets: [
            {
                data: [64, 25, 11, 5, 3],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(156, 163, 175, 1)',
                ],
                borderWidth: 2,
            }
        ]
    };

    // 🔹 Данные для прогресса объектов
    const progressData = {
        labels: sitesData.map(site => site.name),
        datasets: [
            {
                label: 'Progress %',
                data: sitesData.map(site => site.progress),
                backgroundColor: sitesData.map(site =>
                    site.status === 'completed' ? 'rgba(34, 197, 94, 0.8)' :
                        site.progress > 70 ? 'rgba(16, 185, 129, 0.8)' :
                            site.progress > 40 ? 'rgba(245, 158, 11, 0.8)' :
                                'rgba(239, 68, 68, 0.8)'
                ),
                borderColor: sitesData.map(site =>
                    site.status === 'completed' ? 'rgba(34, 197, 94, 1)' :
                        site.progress > 70 ? 'rgba(16, 185, 129, 1)' :
                            site.progress > 40 ? 'rgba(245, 158, 11, 1)' :
                                'rgba(239, 68, 68, 1)'
                ),
                borderWidth: 2,
            }
        ]
    };

    // 🔹 Настройки для графиков
    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Loyihalar bo\'yicha byudjet va xarajatlar',
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

    const progressBarOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Loyihalarning progressi',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    // 🔹 Форматирование чисел
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('uz-UZ').format(num);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'active': return 'text-blue-600';
            case 'on-hold': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} className="text-green-600" />;
            case 'active': return <Clock size={16} className="text-blue-600" />;
            default: return <AlertTriangle size={16} className="text-orange-600" />;
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mb-8">
                <Typography variant="h3" className="font-bold text-gray-900">
                    Qurilish Ob'ektlari Moliya Statistikalari
                </Typography>
                <Typography variant="paragraph" className="text-gray-600 mt-2">
                    Barcha qurilish loyihalari xarajatlari va progressi
                </Typography>
            </div>

            {/* 🔹 Основные метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Общее количество объектов */}
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Qurilish Ob'ektlari
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {constructionData.totalSites} ta
                                </Typography>
                                <div className="flex items-center mt-2 space-x-2">
                                    <div className="flex items-center">
                                        <CheckCircle size={14} className="mr-1" />
                                        <Typography variant="small">{constructionData.completedSites} tugatilgan</Typography>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-1" />
                                        <Typography variant="small">{constructionData.activeSites} faol</Typography>
                                    </div>
                                </div>
                            </div>
                            <Building size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Общие расходы */}
                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Umumiy Xarajatlar
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {formatCurrency(constructionData.totalExpenses)}
                                </Typography>
                                <Progress
                                    value={constructionData.completionRate}
                                    color="white"
                                    className="mt-2 bg-white/20"
                                    size="sm"
                                />
                                <Typography variant="small" className="mt-1">
                                    {constructionData.completionRate}% loyiha bajarildi
                                </Typography>
                            </div>
                            <DollarSign size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Отходы/Издержки */}
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Material Isrofi
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {formatCurrency(constructionData.wasteCosts)}
                                </Typography>
                                <div className="flex items-center mt-2">
                                    <Trash2 size={16} className="mr-1" />
                                    <Typography variant="small">
                                        {constructionData.wastePercentage}% umumiy xarajatlardan
                                    </Typography>
                                </div>
                            </div>
                            <Trash2 size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>

                {/* Чистая прибыль */}
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Typography variant="h6" className="mb-2 opacity-80">
                                    Sof Foyda
                                </Typography>
                                <Typography variant="h4" className="font-bold">
                                    {formatCurrency(constructionData.netProfit)}
                                </Typography>
                                <div className="flex items-center mt-2">
                                    <TrendingUp size={16} className="mr-1" />
                                    <Typography variant="small">
                                        {((constructionData.netProfit / constructionData.totalRevenue) * 100).toFixed(1)}% rentabellik
                                    </Typography>
                                </div>
                            </div>
                            <TrendingUp size={48} className="opacity-80" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 🔹 Графики и диаграммы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* График расходов по объектам */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <Bar data={expensesBySiteData} options={barOptions} height={300} />
                    </CardBody>
                </Card>

                {/* Круговая диаграмма распределения расходов */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={expensesDistributionData} options={doughnutOptions} />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 🔹 Прогресс объектов и детальная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Прогресс объектов */}
                <Card className="shadow-lg lg:col-span-2">
                    <CardBody className="p-6">
                        <Typography variant="h5" className="mb-4 text-gray-900">
                            Loyihalar Progressi
                        </Typography>
                        <Bar data={progressData} options={progressBarOptions} height={200} />
                    </CardBody>
                </Card>

                {/* Детали по издержкам */}
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <Typography variant="h6" className="mb-4 text-gray-900">
                            Xarajatlar Tafsilotlari
                        </Typography>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Material Xarajatlari:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-blue-600">
                                    {formatCurrency(constructionData.materialCosts)}
                                </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Ish Haqi:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-green-600">
                                    {formatCurrency(constructionData.laborCosts)}
                                </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Texnika Xarajatlari:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-orange-600">
                                    {formatCurrency(constructionData.equipmentCosts)}
                                </Typography>
                            </div>
                            <div className="flex justify-between items-center">
                                <Typography variant="small" className="text-gray-600">
                                    Isrof Miqdori:
                                </Typography>
                                <Typography variant="paragraph" className="font-semibold text-red-600">
                                    {formatCurrency(constructionData.wasteCosts)}
                                </Typography>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <Typography variant="small" className="text-gray-600">
                                        Isrof Foizi:
                                    </Typography>
                                    <Typography variant="paragraph" className="font-semibold text-red-600">
                                        {constructionData.wastePercentage}%
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* 🔹 Детальный список объектов */}
            <Card className="shadow-lg mt-6">
                <CardBody className="p-6">
                    <Typography variant="h5" className="mb-4 text-gray-900">
                        Loyihalar Ro'yxati
                    </Typography>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-4 text-left">Loyiha Nomi</th>
                                    <th className="p-4 text-left">Holati</th>
                                    <th className="p-4 text-right">Byudjet</th>
                                    <th className="p-4 text-right">Sarflangan</th>
                                    <th className="p-4 text-right">Isrof</th>
                                    <th className="p-4 text-right">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sitesData.map((site) => (
                                    <tr key={site.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <Typography variant="paragraph" className="font-medium">
                                                {site.name}
                                            </Typography>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                {getStatusIcon(site.status)}
                                                <Typography variant="small" className={`ml-2 ${getStatusColor(site.status)}`}>
                                                    {site.status === 'completed' ? 'Tugatilgan' :
                                                        site.status === 'active' ? 'Faol' : 'To\'xtatilgan'}
                                                </Typography>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Typography variant="paragraph" className="font-semibold">
                                                {formatCurrency(site.budget)}
                                            </Typography>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Typography variant="paragraph" className="font-semibold text-blue-600">
                                                {formatCurrency(site.spent)}
                                            </Typography>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Typography variant="paragraph" className="font-semibold text-red-600">
                                                {formatCurrency(site.waste)}
                                            </Typography>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Progress value={site.progress} size="sm" color={
                                                    site.progress === 100 ? 'green' :
                                                        site.progress > 70 ? 'light-green' :
                                                            site.progress > 40 ? 'amber' : 'red'
                                                } />
                                                <Typography variant="small" className="font-semibold min-w-12">
                                                    {site.progress}%
                                                </Typography>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}