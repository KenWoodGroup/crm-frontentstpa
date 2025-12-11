import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Typography, Button, Input } from "@material-tailwind/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";
import { location } from "../../../utils/Controllers/location";
import { Payment } from "../../../utils/Controllers/Payment";

// Функция форматирования суммы
const formatNumber = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString("ru-RU");
};


export default function FactoryPartnerDetail() {
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { t } = useTranslation();

    const [Partner, setPartner] = useState(null);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, total_pages: 1 });

    // ====== ФИЛЬТРЫ ======

    // Получение детали кассы
    const GetPartner = async () => {
        try {
            const response = await location.Get(id);
            setPartner(response?.data);
        } catch (error) {
            console.log(error);
        }
    };

const GetHistory = async (page = 1) => {
    try {
        const data = {
            id,
            page,
        };

        const response = await Payment.PaymentPartnerHistory(data);

        setHistory(response?.data?.data?.records || []);
        setPagination(response?.data?.pagination || { currentPage: 1, total_pages: 1 });

    } catch (error) {
        console.log(error);
    }
};


    // Получаем данные
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([GetPartner(), GetHistory(1)]);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Обновление истории при смене дат
    useEffect(() => {
        GetHistory(1);
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* ==== КАРТОЧКА ПАРТНЕРА ==== */}
            <Card className="bg-card dark:bg-card-dark p-[15px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Typography className="text-[25px] dark:text-text-dark">
                    {Partner?.name}
                </Typography>

                <div className="mt-4 space-y-2 text-gray-800 dark:text-text-dark">
                    <p>
                        <b>{t("Balance")}:</b>
                        <span
                            className={`ml-1 font-semibold ${
                                Partner.balance < 0 ? "text-red-600" : "text-green-600"
                            }`}
                        >
                            {formatNumber(Partner.balance)} uzs
                        </span>
                    </p>
                    <p>
                        <b>{t("CreateAt")}:</b>{" "}
                        {new Date(Partner.createdAt).toLocaleString()}
                    </p>
                </div>
            </Card>

            {/* ==== ИСТОРИЯ ТРАНЗАКЦИЙ ==== */}
            <Card className="bg-card dark:bg-card-dark p-[15px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Typography className="mb-[20px] font-bold text-[25px] dark:text-text-dark">
                    {t("Payment_History")}
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
                                    {t("Price__sum")}: {formatNumber(item.amount)} uzs
                                </p>
                                <p className="text-sm">
                                    {new Date(item.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm mt-1">
                                    <b>{t("Comment")}:</b> {item.note || "-"}
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
