import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Progress, Input, Button } from "@material-tailwind/react";
import { Statistik } from "../../../utils/Controllers/Statistik";
import Cookies from "js-cookie";

export default function FactoryAnalitik() {
    const [cardData, setCardData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [worstProducts, setWorstProducts] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

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

    const getStatistikCard = async () => {
        try {
            const response = await Statistik.GetStatistikTovarAnalitikCard(Cookies.get("ul_nesw"));
            setCardData(response.data);
        } catch (error) {
            console.log("Card Error:", error);
        }
    };

    const getStatistikTop = async () => {
        try {
            const data = {
                id: Cookies.get("us_nesw"),
                startDate,
                endDate,
            };
            const response = await Statistik.GetStatistikTovarAnalitikTop(data);
            setTopProducts(response.data);
        } catch (error) {
            console.log("Top Error:", error);
        }
    };

    const getStatistikSeal = async () => {
        try {
            const data = {
                id: Cookies.get("us_nesw"),
                startDate,
                endDate,
            };
            const response = await Statistik.GetStatistikTovarAnalitikSeal(data);
            setWorstProducts(response.data);
        } catch (error) {
            console.log("Seal Error:", error);
        }
    };

    // Загружаем всё при изменении диапазона дат
    useEffect(() => {
        if (startDate && endDate) {
            getStatistikCard();
            getStatistikTop();
            getStatistikSeal();
        }
    }, [startDate, endDate]);

    return (
        <div className="min-h-screen">
            {/* Заголовок */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <Typography variant="h2" className="text-text-light dark:text-text-dark font-bold mb-2">
                        Mahsulot Tahlili
                    </Typography>
                    <Typography variant="paragraph" className="text-gray-600 dark:text-gray-400">
                        Sotuv statistikasi, tovar qoldiqlari va daromad tahlili
                    </Typography>
                </div>

                {/* Фильтр по дате */}
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Input
                        type="date"
                        label="Boshlanish sanasi"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="dark:text-white"
                    />
                    <Input
                        type="date"
                        label="Tugash sanasi"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="dark:text-white"
                    />
                    <Button onClick={() => { getStatistikTop(); getStatistikSeal(); }}>
                        Yangilash
                    </Button>
                </div>
            </div>

            {/* Основные показатели */}
            {cardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Jami Mahsulotlar", value: cardData.countProduct },
                        { label: "Sotilganlar", value: cardData.selProduct },
                        { label: "Sotilmaganlar", value: cardData.noSelProduct },
                        { label: "Jami Daromad", value: `$${cardData.income.toLocaleString()}` },
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
                        Top 5 Sotiladigan Mahsulotlar
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
                                                    {product.count} dona sotilgan
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
                            <Typography className="text-gray-500 dark:text-gray-400">Ma'lumot yo‘q</Typography>
                        )}
                    </div>
                </div>

                {/* Top 5 Kam Sotiladigan Mahsulotlar */}
                <div>
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-bold mb-6">
                        Top 5 Kam Sotiladigan Mahsulotlar
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
                                                    {product.count} dona sotilgan
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
                            <Typography className="text-gray-500 dark:text-gray-400">Ma'lumot yo‘q</Typography>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
