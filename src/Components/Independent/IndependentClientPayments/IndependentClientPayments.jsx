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
import { Payment } from "../../../utils/Controllers/Payment";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";

export default function IndependentClientPayments() {
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
        <div className="bg-background-light dark:bg-background-dark min-h-screen p-4 transition-colors duration-200">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-5">
                <Typography
                    variant="h4"
                    className="font-semibold text-text-light dark:text-text-dark"
                >
                    Оплата клиентов
                </Typography>
            </div>

            {/* 🔍 Фильтры */}
            <Card className="p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-card-light dark:bg-card-dark transition-colors duration-200">
                <div className="flex items-center gap-[10px]">
                    <Input
                        label="Поиск по клиенту"

                        value={filters.searchName}
                        onChange={(e) => handleChange("searchName", e.target.value)}
                        placeholder="Введите имя клиента..."
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
                        label="Start Date"
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
                        label="End Date"
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
                        label="Способ оплаты"
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
                        label="Сумма оплаты (от)"
                        value={filters.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        placeholder="Введите сумму..."
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
                        {loading ? "Загрузка..." : "Применить фильтр"}
                    </Button>
                </div>
            </Card>

            {/* Таблица */}
            <Card className="shadow-lg border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-200">
                <CardBody className="overflow-x-auto p-0">
                    <table className="w-full text-left min-w-max">
                        <thead>
                            <tr className="bg-blue-50 dark:bg-blue-900/30 transition-colors duration-200">
                                {[
                                    "Дата оплаты",
                                    "Клиент",
                                    "Баланс",
                                    "Способ оплаты",
                                    "Сумма",
                                    "Касса",
                                    "Создал",
                                    "Примечание",
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="p-3 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {payments.length > 0 ? (
                                payments.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0
                                            ? "bg-white dark:bg-gray-800"
                                            : "bg-gray-50 dark:bg-gray-700/50"
                                            }`}
                                    >
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium text-text-light dark:text-text-dark transition-colors duration-200">
                                            {item?.payer?.name || "-"}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 font-medium transition-colors duration-200">
                                            {Number(item?.payer?.balance).toLocaleString()} so'm
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                            {item.method === "cash"
                                                ? "Наличный"
                                                : item.method === "card"
                                                    ? "Карта"
                                                    : "Перечисление"}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 font-semibold transition-colors duration-200">
                                            {Number(item.amount).toLocaleString()} so'm
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                            {item?.receiver?.name || "-"}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                            {item?.created?.full_name || "-"}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                            {item.note || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="10"
                                        className="text-center py-6 text-gray-500 dark:text-gray-400 transition-colors duration-200"
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
                        ← Пред
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
                        След →
                    </Button>
                </div>
            )}

            {/* 💰 Итоги */}
            <div className="flex justify-end mt-4">
                <Typography
                    variant="h6"
                    className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200"
                >
                    Итоги:{" "}
                    <span className="text-green-600 dark:text-green-400 transition-colors duration-200">
                        {payments
                            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
                            .toLocaleString()}{" "}
                        so'm
                    </span>
                </Typography>
            </div>
        </div>
    );
}