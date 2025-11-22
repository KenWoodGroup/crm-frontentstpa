import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Progress, Input, Button } from "@material-tailwind/react";
import { Statistik } from "../../../utils/Controllers/Statistik";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Loading from "../../UI/Loadings/Loading";

export default function FactoryAnalitik() {
    const { t } = useTranslation();
    const [cardData, setCardData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [worstProducts, setWorstProducts] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);

    // Устанавливаем даты по умолчанию — текущий месяц
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];

        const today = now.toISOString().split("T")[0];
        setStartDate(firstDay);
        setEndDate(today);
    }, []);


    // функция загрузки всех данных
    const loadAllData = async () => {
        try {
            setLoading(true);

            const data = {
                id: Cookies.get("us_nesw"),
                startDate,
                endDate,
            };

            const [cardRes, topRes, worstRes] = await Promise.all([
                Statistik.GetStatistikTovarAnalitikCard(Cookies.get("ul_nesw")),
                Statistik.GetStatistikTovarAnalitikTop(data),
                Statistik.GetStatistikTovarAnalitikSeal(data),
            ]);

            setCardData(cardRes.data);
            setTopProducts(topRes.data);
            setWorstProducts(worstRes.data);

        } catch (error) {
            console.log("Loading Error:", error);
        } finally {
            setLoading(false);
        }
    };


    // Загружаем всё при изменении дат
    useEffect(() => {
        if (startDate && endDate) {
            loadAllData();
        }
    }, [startDate, endDate]);


    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen">
            {/* Заголовок */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <Typography variant="h2" className="text-text-light dark:text-text-dark font-bold mb-2">
                        {t('Product_analiz')}
                    </Typography>
                </div>

                {/* Фильтр по дате */}
                <div className="flex md:flex-row flex-col items-center gap-3 mt-4 md:mt-0">
                    <Input
                        type="date"
                        label={t('StartDate')}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="dark:text-white"
                    />
                    <Input
                        type="date"
                        label={t('EndDate')}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="dark:text-white"
                    />
                    <Button color="blue" className="w-[100%] px-[10px]" onClick={() => { getStatistikTop(); getStatistikSeal(); }}>
                        {t('Search')}
                    </Button>
                </div>
            </div>

            {/* Основные показатели */}
            {cardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: `${t('Total_products')}`, value: cardData.countProduct },
                        { label: `${t('table_col_sold')}`, value: cardData.selProduct },
                        { label: `${t('Dont_sells')}`, value: cardData.noSelProduct },
                        { label: `${t('Total_money')}`, value: `${cardData.income.toLocaleString()} uzs` },
                    ].map((item, i) => (
                        <Card
                            key={i}
                            className="bg-card-light dark:bg-card-dark shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
                        >
                            <CardBody className="text-center">
                                <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-2">
                                    {item.value}
                                </Typography>
                                <Typography variant="h6" className="text-gray-700 dark:text-gray-400">
                                    {item.label}
                                </Typography>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Top и Least selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 Sotiladigan Mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        {t('Top5')}
                    </Typography>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <Card
                                    key={product.id || index}
                                    className="bg-card-light dark:bg-card-dark shadow-md border border-gray-200 dark:border-gray-700 transition-all"
                                >
                                    <CardBody>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    #{index + 1} {product.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    {product.count} {t('table_col_sold')}
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography variant="h6" className="text-green-500 font-bold">
                                                    ${product.income?.toLocaleString()}
                                                </Typography>
                                                {product.percent && (
                                                    <Typography variant="small" className="text-green-400">
                                                        ▲ {product.percent}%
                                                    </Typography>
                                                )}
                                            </div>
                                        </div>
                                        <Progress value={product.percent || 0} color="green" className="bg-gray-300 dark:bg-gray-700" />
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center justify-center">
                                    <Typography className="text-gray-500 dark:text-gray-400">{t('Empty_data')}</Typography>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Top 5 Kam Sotiladigan Mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        {t('Bottom5')}
                    </Typography>
                    <div className="space-y-4">
                        {worstProducts.length > 0 ? (
                            worstProducts.map((product, index) => (
                                <Card
                                    key={product.id || index}
                                    className="bg-card-light dark:bg-card-dark shadow-md border border-gray-200 dark:border-gray-700 transition-all"
                                >
                                    <CardBody>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Typography variant="h6" className="text-text-light dark:text-text-dark font-bold">
                                                    #{index + 1} {product.name}
                                                </Typography>
                                                <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                                    {product.count} {t('table_col_sold')}
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography variant="h6" className="text-red-500 font-bold">
                                                    ${product.income?.toLocaleString()}
                                                </Typography>
                                                {product.percent && (
                                                    <Typography variant="small" className="text-red-400">
                                                        ▼ {product.percent}%
                                                    </Typography>
                                                )}
                                            </div>
                                        </div>
                                        <Progress value={product.percent || 0} color="red" className="bg-gray-300 dark:bg-gray-700" />
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center justify-center">
                                    <Typography className="text-gray-500 dark:text-gray-400">{t('Empty_data')}</Typography>
                                </div>
                            </>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
