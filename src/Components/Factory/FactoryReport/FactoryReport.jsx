import { useEffect, useState } from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { Statistik } from '../../../utils/Controllers/Statistik';
import Cookies from "js-cookie";
import Loading from '../../UI/Loadings/Loading';
import { useTranslation } from 'react-i18next';

export default function FactoryReport() {
    const [selectedStorage, setSelectedStorage] = useState(null);
    const [selectedCash, setSelectedCash] = useState(null);
    const location_id = Cookies.get("ul_nesw")
    const { t } = useTranslation();
    const [cardData, setCardData] = useState([])
    const [warehouseData, setWarehouseData] = useState([])
    const [Cardloading, setCardLoading] = useState(true)
    const [Warehouseloading, setWarehouseLoading] = useState(true)

    const getStatistikCard = async () => {
        setCardLoading(true)
        try {
            const response = await Statistik?.GetStatistikFinanceCard(location_id)
            setCardData(response?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setCardLoading(false)
        }
    }

    const getStatistikWarehouse = async () => {
        setWarehouseLoading(true)
        try {
            const response = await Statistik?.GetStatistikFinanceWarehouse(location_id)
            setWarehouseData(response?.data || [])
        } catch (error) {
            console.log(error)
        } finally {
            setWarehouseLoading(false)
        }
    }

    useEffect(() => {
        getStatistikCard()
        getStatistikWarehouse()
    }, [])

    // Format number with spaces for thousands
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return Number(num).toLocaleString('ru-RU').replace(/,/g, ' ');
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 сум';
        return `${formatNumber(amount)} сум`;
    };

    const handleStorageClick = (storage) => {
        setSelectedStorage(storage);
        setSelectedCash(null); // Reset selected cash when new storage is selected
    };

    const handleCashClick = (cash) => {
        setSelectedCash(cash);
    };

    if (Cardloading && Warehouseloading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen ">
            {/* Sarlavha */}
            <div className="mb-8">
                <Typography variant="h2" className="text-text-light dark:text-text-dark font-bold mb-2">
                    {t('Report_finance_title')}
                </Typography>
            </div>

            {/* Asosiy ko'rsatkichlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Umumiy sotuv */}
                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {formatNumber(cardData?.invOutCount)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('sell_product')}
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
                            {formatCurrency(cardData?.allSum)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('total_sum')}
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
                            {formatCurrency(cardData?.stockSum)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('Warehouse_prodcut')}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {formatCurrency(cardData?.invOutSum)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('Sotuv summasi')}
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
                            {formatNumber(cardData?.clientDealerCount)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('Klient_count')}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardBody className="text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-text-light dark:text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                            {formatNumber(cardData?.partnerCount)}
                        </Typography>
                        <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
                            {t('Partner_count')}
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Omborxonalar */}
                <div className="lg:col-span-1">
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        {t('Warehouses')}
                    </Typography>
                    <div className="space-y-4">
                        {warehouseData.map((warehouse, index) => (
                            <Card
                                key={index}
                                className={`bg-card-light dark:bg-card-dark shadow-md border-2 cursor-pointer transition-all ${selectedStorage?.name === warehouse.name
                                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                                    : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                onClick={() => handleStorageClick(warehouse)}
                            >
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                {warehouse.name}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            {t("Tottal_h")}:
                                        </Typography>
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            {formatCurrency(warehouse.productSum)}
                                        </Typography>
                                    </div>
                                    <div className="flex justify-between items-start mt-2">
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            {t('products')}:
                                        </Typography>
                                        <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                            {formatNumber(warehouse.productCount)}
                                        </Typography>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tanlangan ombor kassalari */}
                <div className="lg:col-span-2">
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        {selectedStorage ? `${selectedStorage.name} - ${t('Cashes')}` : `${t('select_warehouse')}`}
                    </Typography>

                    {selectedStorage ? (
                        <div className="space-y-4">
                            {selectedStorage.cash?.map((cash, index) => (
                                <Card
                                    key={index}
                                    className={`bg-card-light dark:bg-card-dark shadow-md border-2 cursor-pointer transition-all ${selectedCash?.name === cash.name
                                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                                        : 'border-gray-300 dark:border-gray-700'
                                        }`}
                                    onClick={() => handleCashClick(cash)}
                                >
                                    <CardBody>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {cash.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    {t('Balance')}: {formatCurrency(cash.balance)}
                                                </Typography>
                                            </div>
                                            <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                {formatCurrency(cash.balance)}
                                            </Typography>
                                        </div>

                                        <div className="flex  sm:flex-col items-center gap-[10px] w-full text-sm mb-4">
                                            <div className="bg-gray-100 w-full dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    {t('Exp_sum')}
                                                </Typography>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {formatCurrency(cash.expenseSum)}
                                                </Typography>
                                            </div>
                                            <div className="bg-gray-100 w-full dark:bg-gray-800 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    {t('Pay_sum')}
                                                </Typography>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    {formatCurrency(cash.paymentSum)}
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
                                    {t('select_warehouse')}
                                </Typography>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Tanlangan kassa uchun batafsil ma'lumot */}
            {selectedCash && (
                <div className="mt-8">
                    <Card className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-300 dark:border-gray-700">
                        <CardBody>
                            <Typography variant="h5" className="text-text-light dark:text-text-dark font-bold mb-4">
                                {selectedCash.name} - {t('More')}
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        {t('Tottal_h')}
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        {formatCurrency(selectedCash.balance)}
                                    </Typography>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        {t('expenses')}
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        {formatCurrency(selectedCash.expenseSum)}
                                    </Typography>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                        {t('Payment')}
                                    </Typography>
                                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold">
                                        {formatCurrency(selectedCash.paymentSum)}
                                    </Typography>
                                </div>
                            </div>

                            {/* Qo'shimcha statistika */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Typography variant="small" className="text-blue-600 dark:text-blue-400">
                                        {t('Grin')}
                                    </Typography>
                                    <Typography variant="h5" className="text-blue-700 dark:text-blue-300 font-bold">
                                        {formatCurrency(Number(selectedCash.paymentSum) - Number(selectedCash.expenseSum))}
                                    </Typography>
                                </div>
                                <div className={`p-4 rounded-lg border ${Number(selectedCash.paymentSum) > Number(selectedCash.expenseSum)
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}>
                                    <Typography variant="small" className={
                                        Number(selectedCash.paymentSum) > Number(selectedCash.expenseSum)
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }>
                                        {t('status_m')}
                                    </Typography>
                                    <Typography variant="h5" className={
                                        Number(selectedCash.paymentSum) > Number(selectedCash.expenseSum)
                                            ? 'text-green-700 dark:text-green-300 font-bold'
                                            : 'text-red-700 dark:text-red-300 font-bold'
                                    }>
                                        {Number(selectedCash.paymentSum) > Number(selectedCash.expenseSum) ? `${t('Grin2')}` : `${t('bad2')}`}
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