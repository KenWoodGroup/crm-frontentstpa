import { useState } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";

export default function FactoryReport() {
    const [selectedStorage, setSelectedStorage] = useState(null);

    // Ma'lumotlar
    const storages = [
        { id: 1, name: "Asosiy ombor", productCount: 25000, capacity: 50000 },
        { id: 2, name: "Hududiy ombor", productCount: 12000, capacity: 30000 },
        { id: 3, name: "Filial №1", productCount: 8000, capacity: 20000 },
    ];

    // Dilerlar ma'lumotlari - har bir ombor uchun alohida
    const dealersData = {
        1: [ // Asosiy ombor dilerlari
            { id: 1, name: "Diler Markaz", productsSold: 25000, moneyInTurnover: 2500000, productCount: 3000 },
            { id: 2, name: "Diler Shahar", productsSold: 18000, moneyInTurnover: 1800000, productCount: 2200 },
        ],
        2: [ // Hududiy ombor dilerlari
            { id: 3, name: "Diler Tuman", productsSold: 12000, moneyInTurnover: 1200000, productCount: 1500 },
            { id: 4, name: "Diler Qishloq", productsSold: 8000, moneyInTurnover: 800000, productCount: 1000 },
        ],
        3: [ // Filial dilerlari
            { id: 5, name: "Diler Filial", productsSold: 6000, moneyInTurnover: 600000, productCount: 800 },
            { id: 6, name: "Diler Novza", productsSold: 4000, moneyInTurnover: 400000, productCount: 500 },
        ]
    };

    const calculateStorageUsage = (storage) => {
        return (storage.productCount / storage.capacity) * 100;
    };

    const getDealersForStorage = (storageId) => {
        return dealersData[storageId] || [];
    };

    const getTotalStats = () => {
        let totalProductsSold = 0;
        let totalRevenue = 0;
        let totalProductsInStorage = 0;
        let totalStorageCapacity = 0;

        storages.forEach(storage => {
            totalProductsInStorage += storage.productCount;
            totalStorageCapacity += storage.capacity;
        });

        Object.values(dealersData).forEach(dealers => {
            dealers.forEach(dealer => {
                totalProductsSold += dealer.productsSold;
                totalRevenue += dealer.moneyInTurnover;
            });
        });

        return {
            totalProductsSold,
            totalRevenue,
            totalProductsInStorage,
            totalStorageCapacity,
            storageUtilization: (totalProductsInStorage / totalStorageCapacity) * 100
        };
    };

    const stats = getTotalStats();

    return (
        <div className="min-h-screen ">
            {/* Sarlavha */}
            <div className="mb-8">
                <Typography variant="h2" className="text-text-light dark:text-text-dark font-bold mb-2">
                    Sotuv va ombor hisoboti
                </Typography>
                <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
                    Umumiy statistika, ombor qoldiqlari va diler tarmog'i
                </Typography>
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Umumiy sotuv */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {stats.totalProductsSold.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            Mahsulot sotilgan
                        </Typography>
                    </CardBody>
                </Card>

                {/* Umumiy aylanma */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            ${stats.totalRevenue.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            Umumiy aylanma
                        </Typography>
                    </CardBody>
                </Card>

                {/* Ombordagi tovarlar */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {stats.totalProductsInStorage.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            Ombordagi tovarlar
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-medium">
                            {Math.round(stats.storageUtilization)}% to'ldirilgan
                        </Typography>
                    </CardBody>
                </Card>

                {/* Diler tarmog'i */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {Object.values(dealersData).flat().length}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            Faol dilerlar
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ombolar */}
                <div className="lg:col-span-1">
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        Omborxonalar
                    </Typography>
                    <div className="space-y-4">
                        {storages.map((storage) => (
                            <Card
                                key={storage.id}
                                className={`bg-card-light dark:bg-card-dark shadow-md border-2 cursor-pointer transition-all ${selectedStorage?.id === storage.id
                                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                                        : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                onClick={() => setSelectedStorage(storage)}
                            >
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                {storage.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            Umumiy hisob:
                                        </Typography>
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            5000 000 so`m
                                        </Typography>
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            Mahsulotlar:
                                        </Typography>
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            20 000
                                        </Typography>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tanlangan ombor dilerlari */}
                <div className="lg:col-span-2">
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        {selectedStorage ? `${selectedStorage.name} - Dilerlar` : "Dilerlarni ko'rish uchun ombor tanlang"}
                    </Typography>

                    {selectedStorage ? (
                        <div className="space-y-4">
                            {getDealersForStorage(selectedStorage.id).map((dealer) => (
                                <Card key={dealer.id} className="bg-card-light dark:bg-card-dark shadow-md border border-gray-300 dark:border-gray-700">
                                    <CardBody>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {dealer.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    Sotilgan: {dealer.productsSold.toLocaleString()} dona
                                                </Typography>
                                            </div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                ${dealer.moneyInTurnover.toLocaleString()}
                                            </Typography>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    Dilerdagi tovarlar
                                                </Typography>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {dealer.productCount.toLocaleString()} dona
                                                </Typography>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    Aylanma
                                                </Typography>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    ${dealer.moneyInTurnover.toLocaleString()}
                                                </Typography>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    Sotuv darajasi
                                                </Typography>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {Math.round((dealer.productsSold / (dealer.productsSold + dealer.productCount)) * 100)}%
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-card-light dark:bg-card-dark shadow-md border border-gray-300 dark:border-gray-700">
                            <CardBody className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                                    Dilerlarni ko'rish uchun ombor tanlang
                                </Typography>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Umumiy aylanma statistikasi */}
            {selectedStorage && (
                <div className="mt-8">
                    <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                        <CardBody>
                            <Typography variant="h5" className="text-text-light dark:text-text-dark font-bold mb-4">
                                {selectedStorage.name} - Umumiy aylanma
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        Jami aylanma
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        ${getDealersForStorage(selectedStorage.id).reduce((sum, dealer) => sum + dealer.moneyInTurnover, 0).toLocaleString()}
                                    </Typography>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        Jami sotuv
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        {getDealersForStorage(selectedStorage.id).reduce((sum, dealer) => sum + dealer.productsSold, 0).toLocaleString()} dona
                                    </Typography>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        O'rtacha aylanma
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        ${Math.round(getDealersForStorage(selectedStorage.id).reduce((sum, dealer) => sum + dealer.moneyInTurnover, 0) / getDealersForStorage(selectedStorage.id).length).toLocaleString()}
                                    </Typography>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}