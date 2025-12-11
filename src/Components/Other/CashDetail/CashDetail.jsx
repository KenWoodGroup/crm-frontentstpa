import { useParams } from "react-router-dom";
import { Cash } from "../../../utils/Controllers/Cash";
import { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";

// Функция форматирования суммы
const formatNumber = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("ru-RU");
};

export default function CashDetail() {
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { t } = useTranslation();
    const [cash, setCash] = useState(null);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, total_pages: 1 });

    // Получение детали кассы
    const GetCash = async () => {
        try {
            const response = await Cash.GetById(id);
            setCash(response?.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Получение истории кассы
    const GetHistory = async (page = 1) => {
        try {
            const response = await Cash.GetKassaById({ id, page });
            setHistory(response?.data?.data?.records || []);
            setPagination(response?.data?.pagination || { currentPage: 1, total_pages: 1 });
        } catch (error) {
            console.log(error);
        }
    };

    // Получаем данные и снимаем loading только когда оба запроса выполнены
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([GetCash(), GetHistory(1)]);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* ==== КАРТОЧКА КАССЫ ==== */}
            <Card className="bg-card dark:bg-card-dark p-[15px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Typography className="text-[25px] dark:text-text-dark">
                    {cash?.name}
                </Typography>

                <div className="mt-4 space-y-2 text-gray-800 dark:text-text-dark">
                    <p>
                        <b>{t("Balance")}:</b>
                        <span
                            className={`ml-1 font-semibold ${cash.balance < 0 ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {formatNumber(cash.balance)} uzs
                        </span>
                    </p>
                    <p>
                        <b>{t("CreateAt")}:</b>{" "}
                        {new Date(cash.createdAt).toLocaleString()}
                    </p>
                </div>
            </Card>

            {/* ==== ИСТОРИЯ ТРАНЗАКЦИЙ ==== */}
            <Card className="bg-card dark:bg-card-dark p-[15px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Typography className="mb-[20px] font-bold text-[25px] dark:text-text-dark">
                    {t('Payment_History')}
                </Typography>

                {history.length === 0 ? (
                    <EmptyData text={t("Empty_data")} />
                ) : (
                    <div className="space-y-4">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="border rounded-xl p-4 transition text-gray-800 dark:text-text-dark"
                            >
                                <p className="font-semibold">
                                    {t('Price__sum')}: {formatNumber(item.amount)} uzs
                                </p>
                                <p className="text-sm">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm mt-1">
                                    <b>{t('Comment')}:</b> {item.note || "-"}
                                </p>
                            </div>
                        ))}

                        {/* PAGINATION */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Button
                                size="sm"
                                disabled={pagination.currentPage <= 1}
                                onClick={() => GetHistory(pagination.currentPage - 1)}
                            >
                                <ChevronLeft />
                            </Button>

                            <div className="px-3 py-2 border rounded-lg text-gray-800 dark:text-text-dark">
                                {pagination.currentPage} / {pagination.total_pages}
                            </div>

                            <Button
                                size="sm"
                                disabled={pagination.currentPage >= pagination.total_pages}
                                onClick={() => GetHistory(pagination.currentPage + 1)}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
