import { Card, CardBody, Typography, Progress } from "@material-tailwind/react";

export default function FactoryAnalitik() {
    // Ma'lumotlar
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

    const inventoryStats = {
        totalProducts: 156000,
        soldProducts: 125000,
        remainingProducts: 31000,
        totalRevenue: 28750000,
        monthlyRevenue: 2395833,
        sellThroughRate: 80.1
    };

    const calculateUsage = (value, total) => {
        return (value / total) * 100;
    };

    return (
        <div className="min-h-screen ">
            {/* Sarlavha */}
            <div className="mb-8">
                <Typography variant="h2" className="text-gray-900 font-bold mb-2">
                    Mahsulot Tahlili
                </Typography>
                <Typography variant="paragraph" className="text-gray-600">
                    Sotuv statistikasi, tovar qoldiqlari va daromad tahlili
                </Typography>
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Jami mahsulotlar */}
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-[#00000020] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-gray-900 font-bold mb-2">
                            {inventoryStats.totalProducts.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600">
                            Jami Mahsulotlar
                        </Typography>
                    </CardBody>
                </Card>

                {/* Sotilgan mahsulotlar */}
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-[#00000020] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-[black]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-gray-900 font-bold mb-2">
                            {inventoryStats.soldProducts.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600">
                            Sotilganlar
                        </Typography>
                    </CardBody>
                </Card>

                {/* Qolgan mahsulotlar */}
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-[#00000020] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-[black]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-gray-900 font-bold mb-2">
                            {inventoryStats.remainingProducts.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600">
                            Qolganlar
                        </Typography>
                    </CardBody>
                </Card>

                {/* Jami daromad */}
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-[#00000020] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-[black]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-gray-900 font-bold mb-2">
                            ${inventoryStats.totalRevenue.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600">
                            Jami Daromad
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            {/* Sotuv progressi */}
            <Card className="bg-white shadow-lg border border-gray-200 mb-8">
                <CardBody>
                    <Typography variant="h5" className="text-gray-900 font-bold mb-6">
                        Sotuv Ko'rsatkichlari
                    </Typography>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <Typography variant="small" className="text-gray-600">
                                    Sotilgan mahsulotlar
                                </Typography>
                                <Typography variant="small" className="text-gray-900 font-bold">
                                    {inventoryStats.soldProducts.toLocaleString()} ({inventoryStats.sellThroughRate}%)
                                </Typography>
                            </div>
                            <Progress
                                value={inventoryStats.sellThroughRate}
                                color=""
                                className="bg-gray-200"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <Typography variant="small" className="text-gray-600">
                                    Qolgan mahsulotlar
                                </Typography>
                                <Typography variant="small" className="text-gray-900 font-bold">
                                    {inventoryStats.remainingProducts.toLocaleString()} ({100 - inventoryStats.sellThroughRate}%)
                                </Typography>
                            </div>
                            <Progress
                                value={100 - inventoryStats.sellThroughRate}
                                color=""
                                className="bg-gray-200"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 sotiladigan mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-gray-900 font-bold mb-6">
                        Top 5 Sotiladigan Mahsulotlar
                    </Typography>
                    <div className="space-y-4">
                        {topSellingProducts.map((product, index) => (
                            <Card key={product.id} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <CardBody>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                                            </div>
                                            <div>
                                                <Typography variant="h6" className="text-gray-900 font-bold">
                                                    {product.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600">
                                                    {product.soldCount.toLocaleString()} dona sotilgan
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Typography variant="h6" className="text-green-600 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                            <Typography variant="small" className="text-green-500">
                                                ▲ {product.growth}%
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <Typography variant="small" className="text-green-600">
                                                Oylik sotuv
                                            </Typography>
                                            <Typography variant="h6" className="text-green-700 font-bold">
                                                {product.monthlySales.toLocaleString()} dona
                                            </Typography>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <Typography variant="small" className="text-blue-600">
                                                Daromad
                                            </Typography>
                                            <Typography variant="h6" className="text-blue-700 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <Typography variant="small" className="text-gray-600">
                                            Sotuv o'sishi o`tkan oyga qaraganda
                                        </Typography>
                                        <Typography variant="small" className="text-green-600 font-bold">
                                            +{product.growth}%
                                        </Typography>
                                    </div>
                                    <Progress
                                        value={product.growth}
                                        color="green"
                                        className="bg-gray-200 mt-1"
                                    />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Top 5 kam sotiladigan mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-gray-900 font-bold mb-6">
                        Top 5 Kam Sotiladigan Mahsulotlar
                    </Typography>
                    <div className="space-y-4">
                        {worstSellingProducts.map((product, index) => (
                            <Card key={product.id} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <CardBody>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-red-600 font-bold text-sm">#{index + 1}</span>
                                            </div>
                                            <div>
                                                <Typography variant="h6" className="text-gray-900 font-bold">
                                                    {product.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600">
                                                    {product.soldCount.toLocaleString()} dona sotilgan
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Typography variant="h6" className="text-red-600 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                            <Typography variant="small" className="text-red-500">
                                                ▼ {product.decline}%
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <Typography variant="small" className="text-red-600">
                                                Oylik sotuv
                                            </Typography>
                                            <Typography variant="h6" className="text-red-700 font-bold">
                                                {product.monthlySales.toLocaleString()} dona
                                            </Typography>
                                        </div>
                                        <div className="bg-orange-50 p-3 rounded-lg">
                                            <Typography variant="small" className="text-orange-600">
                                                Daromad
                                            </Typography>
                                            <Typography variant="h6" className="text-orange-700 font-bold">
                                                ${product.revenue.toLocaleString()}
                                            </Typography>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <Typography variant="small" className="text-gray-600">
                                            Sotuv pasayishi o`tkan oyga qaraganda
                                        </Typography>
                                        <Typography variant="small" className="text-red-600 font-bold">
                                            -{product.decline}%
                                        </Typography>
                                    </div>
                                    <Progress
                                        value={product.decline}
                                        color="red"
                                        className="bg-gray-200 mt-1"
                                    />
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Qo'shimcha statistikalar */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <Typography variant="h6" className="text-gray-600 mb-2">
                            O'rtacha oylik daromad
                        </Typography>
                        <Typography variant="h4" className="text-gray-900 font-bold">
                            ${inventoryStats.monthlyRevenue.toLocaleString()}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <Typography variant="h6" className="text-gray-600 mb-2">
                            Sotuv samaradorligi
                        </Typography>
                        <Typography variant="h4" className="text-green-600 font-bold">
                            {inventoryStats.sellThroughRate}%
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="bg-white shadow-lg border border-gray-200">
                    <CardBody className="text-center">
                        <Typography variant="h6" className="text-gray-600 mb-2">
                            O'rtacha mahsulot narxi
                        </Typography>
                        <Typography variant="h4" className="text-blue-600 font-bold">
                            ${Math.round(inventoryStats.totalRevenue / inventoryStats.soldProducts)}
                        </Typography>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}