import {
    Button,
    Typography,
    Card,
    CardBody,
    Input,
    Select,
    Option,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import { Trash2, Edit, CreditCard } from "lucide-react";
import PaymentCreate from "./_components/PaymentCreate";
import { Payment } from "../../../utils/Controllers/Payment";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import { useTranslation } from "react-i18next";

export default function PaymentPage() {
    const { t } = useTranslation();

    // Получаем начало и конец текущего месяца
    const getDefaultDates = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const format = (date) => date.toISOString().split("T")[0];
        return { start: format(firstDay), end: format(lastDay) };
    };

    const defaultDates = getDefaultDates();

    const [filters, setFilters] = useState({
        location_id: Cookies.get("ul_nesw"),
        startDate: defaultDates.start,
        endDate: defaultDates.end,
        searchName: "",
        method: "",
        amount: "",
        page: 1,
    });

    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        total_pages: 1,
        total_count: 0,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Если фильтр пустой — ставим all
    const buildFilterData = () => ({
        location_id: Cookies.get("ul_nesw"),
        startDate: filters.startDate || "all",
        endDate: filters.endDate || "all",
        searchName: filters.searchName?.trim() || "all",
        method: filters.method || "all",
        amount: filters.amount || "all",
        page: filters.page || 1,
    });

    // Запрос данных
    const GetFilter = async () => {
        try {
            setLoading(true);
            const data = buildFilterData();
            const response = await Payment.PaymentHistory(data);
            const resData = response?.data?.data || {};

            setPayments(resData.records || []);
            setPagination(resData.pagination || {});
        } catch (error) {
            console.error("Ошибка при получении данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetFilter();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.total_pages) return;
        setFilters((prev) => ({ ...prev, page: newPage }));
        GetFilter();
    };

    if (loading) {
        return <Loading />
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen  transition-colors duration-200">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-5">
                <Typography
                    variant="h4"
                    className="font-semibold text-text-light dark:text-text-dark"
                >
                    {t('Clients_Payment')}
                </Typography>
                <PaymentCreate />
            </div>

            {/* 🔍 Фильтры */}
            <Card className="p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-card-light dark:bg-card-dark transition-colors duration-200">
                <div className="flex flex-col gap-[10px] lg:flex-row items-end justify-between">
                    <Input
                        label={t('Srearch_by_Clients')}

                        value={filters.searchName}
                        onChange={(e) => handleChange("searchName", e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />

                    <Input
                        type="date"
                        label={t('StartDate')}
                        value={filters.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />

                    <Input
                        type="date"
                        label={t('EndDate')}
                        value={filters.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />

                    <Select
                        label={t('Payment_type')}
                        value={filters.method}
                        onChange={(val) => handleChange("method", val)}
                        className="text-gray-900 dark:text-text-dark  outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
                        }}
                    >
                        <Option value="">Все</Option>
                        <Option value="cash">Наличный</Option>
                        <Option value="transfer">Перечисление (счёт)</Option>
                        <Option value="card">Карта</Option>
                    </Select>

                    <Input
                        type="number"
                        label={t('Payment_price')}
                        value={filters.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark `
                        }}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        color="blue"
                        variant="gradient"
                        onClick={GetFilter}
                        disabled={loading}
                    >
                        {loading ? `${t('loadingMoreText')}` : `${t('Search')}`}
                    </Button>
                </div>
            </Card>

            {/* Таблица */}
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-200">
                <CardBody className="overflow-x-auto p-0">
                    <table className="w-full border-collapse min-w-max">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('payment_date')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Clients')}
                                </th>
                              
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Payment_type')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Payment_price')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Kassa')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Creater')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b transition-colors duration-200">
                                    {t('Comment')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.length > 0 ? (
                                payments.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`border-x border-gray-300 dark:border-gray-700 ${index === payments.length - 1
                                                ? 'border-b border-gray-300 dark:border-gray-700'
                                                : ''
                                            } ${index % 2 === 0
                                                ? "bg-white dark:bg-gray-900"
                                                : "bg-gray-50/50 dark:bg-gray-800/50"
                                            } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200`}
                                    >
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-1 text-center text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {item?.payer?.name || (
                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                     
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                           {item?.method_id}
                                        </td>
                                        <td className="p-1 text-center text-sm font-semibold text-green-600 dark:text-green-400 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {Number(item.amount).toLocaleString()} so'm
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {item?.cash_id || (
                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {item?.created?.full_name || (
                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200">
                                            {item.note || (
                                                <span className="text-gray-400 dark:text-gray-500">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-x border-b border-gray-300 dark:border-gray-700">
                                    <td
                                        colSpan="8"
                                        className="p-2 text-center text-sm text-gray-500 dark:text-gray-400 border-x border-gray-300 dark:border-gray-700 transition-colors duration-200"
                                    >
                                        {loading ? "Загрузка данных..." : "Нет данных по фильтру"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* 📄 Пагинация */}
            {pagination.total_pages > 1 && (
                <div className="flex justify-center mt-5 gap-2">
                    <Button
                        color="blue"
                        variant="outlined"
                        size="sm"
                        disabled={filters.page === 1}
                        onClick={() => handlePageChange(filters.page - 1)}
                        className="dark:border-blue-400 dark:text-blue-400"
                    >
                        ←
                    </Button>
                    <Typography className="text-gray-700 dark:text-gray-300 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded transition-colors duration-200">
                        {pagination.currentPage} / {pagination.total_pages}
                    </Typography>
                    <Button
                        color="blue"
                        variant="outlined"
                        size="sm"
                        disabled={filters.page === pagination.total_pages}
                        onClick={() => handlePageChange(filters.page + 1)}
                        className="dark:border-blue-400 dark:text-blue-400"
                    >
                        →
                    </Button>
                </div>
            )}

            {/* 💰 Итоги */}
            <div className="flex justify-end mt-4">
                <Typography
                    variant="h6"
                    className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200"
                >
                    {t('Over')}:{" "}
                    <span className="text-green-600 dark:text-green-400 transition-colors duration-200">
                        {payments
                            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                            .toLocaleString()}{" "}
                        uzs
                    </span>
                </Typography>
            </div>
        </div>
    );
}