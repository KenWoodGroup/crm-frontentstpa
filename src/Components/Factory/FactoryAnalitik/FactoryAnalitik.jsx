import { Card, CardBody, Typography, Progress } from "@material-tailwind/react";

export default function FactoryAnalitik() {
    const topSellingProducts = [
        { id: 1, name: "Smartphone X10", soldCount: 12500, revenue: 6250000, monthlySales: 1041, growth: 15.2 },
        { id: 2, name: "Laptop Pro 15", soldCount: 8900, revenue: 13350000, monthlySales: 741, growth: 22.8 },
        { id: 3, name: "Wireless Earbuds", soldCount: 21500, revenue: 3225000, monthlySales: 1791, growth: 8.5 },
        { id: 4, name: "Smart Watch S5", soldCount: 15600, revenue: 4680000, monthlySales: 1300, growth: 18.3 },
        { id: 5, name: "Tablet Mini", soldCount: 7200, revenue: 3600000, monthlySales: 600, growth: 12.7 }
    ];

    const worstSellingProducts = [
        { id: 6, name: "Old Model Phone", soldCount: 450, revenue: 135000, monthlySales: 37, decline: 45.2 },
        { id: 7, name: "Wired Headphones", soldCount: 680, revenue: 81600, monthlySales: 56, decline: 32.8 },
        { id: 8, name: "Digital Camera", soldCount: 890, revenue: 267000, monthlySales: 74, decline: 28.5 },
        { id: 9, name: "MP3 Player", soldCount: 320, revenue: 48000, monthlySales: 26, decline: 65.3 },
        { id: 10, name: "Fax Machine", soldCount: 150, revenue: 45000, monthlySales: 12, decline: 72.1 }
    ];

    const deadStockProducts = [
        { id: 11, name: "Old Keyboard", quantity: 500, monthsInStock: 14 },
        { id: 12, name: "CRT Monitor", quantity: 120, monthsInStock: 20 },
        { id: 13, name: "DVD Player", quantity: 350, monthsInStock: 18 },
        { id: 14, name: "Old Router", quantity: 260, monthsInStock: 10 },
        { id: 15, name: "Printer Cartridge", quantity: 90, monthsInStock: 22 },
    ];

    const inventoryStats = {
        totalProducts: 156000,
        soldProducts: 125000,
        remainingProducts: 31000,
        totalRevenue: 28750000,
        monthlyRevenue: 2395833,
        sellThroughRate: 80.1
    };

    return (
        <div className="min-h-screen ">
            {/* Заголовок */}
            <div className="mb-8">
                <Typography variant="h2" className="text-text-light dark:text-text-dark font-bold mb-2">
                    Mahsulot Tahlili
                </Typography>
                <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
                    Sotuv statistikasi, tovar qoldiqlari va daromad tahlili
                </Typography>
            </div>

            {/* Основные показатели */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Jami Mahsulotlar", value: inventoryStats.totalProducts },
                    { label: "Sotilganlar", value: inventoryStats.soldProducts },
                    { label: "Qolganlar", value: inventoryStats.remainingProducts },
                    { label: "Jami Daromad", value: `$${inventoryStats.totalRevenue.toLocaleString()}` },
                ].map((item, i) => (
                    <Card key={i} className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 transition-colors">
                        <CardBody className="text-center">
                            <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                                {item.value.toLocaleString()}
                            </Typography>
                            <Typography variant="h6" className="text-gray-700 dark:text-gray-400">
                                {item.label}
                            </Typography>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 Sotiladigan Mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        Top 5 Sotiladigan Mahsulotlar
                    </Typography>
                    <div className="space-y-4">
                        {topSellingProducts.map((product, index) => (
                            <Card key={product.id} className="bg-card-light dark:bg-card-dark shadow-md border border-gray-200 dark:border-gray-700 transition-all">
                                <CardBody>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                #{index + 1} {product.name}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                {product.soldCount.toLocaleString()} dona sotilgan
                                            </Typography>
                                        </div>
                                        <div className="text-right">
                                            <Typography variant="h6" className="text-green-500 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                            <Typography variant="small" className="text-green-400">
                                                ▲ {product.growth}%
                                            </Typography>
                                        </div>
                                    </div>
                                    <Progress value={product.growth} color="green" className="bg-gray-300 dark:bg-gray-700" />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Top 5 Kam Sotiladigan Mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        Top 5 Kam Sotiladigan Mahsulotlar
                    </Typography>
                    <div className="space-y-4">
                        {worstSellingProducts.map((product, index) => (
                            <Card key={product.id} className="bg-card-light dark:bg-card-dark shadow-md border border-gray-200 dark:border-gray-700 transition-all">
                                <CardBody>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                #{index + 1} {product.name}
                                            </Typography>
                                            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                {product.soldCount.toLocaleString()} dona sotilgan
                                            </Typography>
                                        </div>
                                        <div className="text-right">
                                            <Typography variant="h6" className="text-red-500 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                            <Typography variant="small" className="text-red-400">
                                                ▼ {product.decline}%
                                            </Typography>
                                        </div>
                                    </div>
                                    <Progress value={product.decline} color="red" className="bg-gray-300 dark:bg-gray-700" />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sotilmayotgan Mahsulotlar */}
            <div className="mt-12">
                <Typography variant="h3" className="text-text-light dark:text-text-dark font-bold mb-8">
                    Sotilmayotgan Mahsulotlar
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deadStockProducts.map((product) => (
                        <Card key={product.id} className="bg-card-light dark:bg-card-dark shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                            <CardBody>
                                <div className="flex items-center justify-between mb-3">
                                    <Typography variant="h5" className="text-text-light dark:text-text-dark font-bold">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        {product.monthsInStock} oy omborda
                                    </Typography>
                                </div>
                                <Typography variant="paragraph" className="text-text-light dark:text-text-dark">
                                    {product.quantity.toLocaleString()} dona omborda qolgan
                                </Typography>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
