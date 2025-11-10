import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Expenses } from "../../../utils/Controllers/Expenses";
import WarehouseExpensesCreate from "./_components/WarehouseExpensesCreate";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseExpensesDelete from "./_components/WarehouseExpensesDelete";
import WarehouseExpensesEdit from "./_components/WarehouseExpensesEdit";
import { useTranslation } from "react-i18next";

const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        first: `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-01`,
        last: `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`,
    };
};

export default function WarehouseExpenses() {

    const { t } = useTranslation();
    const { first, last } = getDefaultDates();
    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        location_id: Cookies.get("ul_nesw"),
        startDate: first,
        endDate: last,
        page: 1,
    });

    const formatNumber = (num) =>
        num !== undefined && num !== null
            ? Number(num).toLocaleString("ru-RU").replace(/,/g, " ")
            : "0";

    const GetAllExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await Expenses.GetExpenses(filter);
            const records =
                response?.data?.data?.records ||
                response?.data?.records ||
                response?.data ||
                [];
            setData(Array.isArray(records) ? records : []);
            setTotalPages(
                response?.data?.data?.pagination?.total_pages ||
                response?.data?.pagination?.total_pages ||
                response?.data?.totalPages ||
                1
            );
        } catch (error) {
            console.error("Ошибка при загрузке расходов:", error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        GetAllExpenses();
    }, [GetAllExpenses]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            {/* Заголовок + фильтры */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold">
                    {t('Warehouse_Exp')}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        {/* Дата начала */}
                        <div className="relative">
                            <Calendar
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <input
                                type="date"
                                name="startDate"
                                value={filter.startDate}
                                onChange={handleDateChange}
                                className="pl-10 pr-3 py-2 rounded-lg outline-none transition-all w-[160px] 
                                           border border-gray-300 bg-card-light text-text-light 
                                           dark:border-gray-600 dark:bg-card-dark dark:text-text-dark focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <span className="text-gray-500 font-medium">—</span>

                        {/* Дата конца */}
                        <div className="relative">
                            <Calendar
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={filter.endDate}
                                onChange={handleDateChange}
                                className="pl-10 pr-3 py-2 rounded-lg outline-none transition-all w-[160px] 
                                           border border-gray-300 bg-card-light text-text-light 
                                           dark:border-gray-600 dark:bg-card-dark dark:text-text-dark focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={GetAllExpenses}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg font-medium text-sm shadow-sm
                                       bg-text-light text-card-light hover:bg-gray-800 
                                       dark:bg-text-dark dark:text-card-dark dark:hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? `${t('loadingMoreText')}` : `${t('Search')}`}
                        </button>
                    </div>

                    {/* Добавление */}
                    <WarehouseExpensesCreate refresh={GetAllExpenses} />
                </div>
            </div>

            {/* Таблица */}
            <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-card-light dark:bg-card-dark">
                {data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10 bg-gradient-to-r ">
                                    <tr className="bg-blue-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold border-b w-[60px]">
                                            №
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold border-b">
                                            {t('Date')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold border-b">
                                            {t('Payment_method')}
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold border-b">
                                            {t('Summ')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold border-b">
                                            {t('Comment')}
                                        </th>
                                        <th className="px-1 py-3 text-left text-xs font-semibold border-b w-[80px]">
                                            {t('columnActions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            className={`${index % 2 === 0
                                                ? "bg-white dark:bg-gray-900"
                                                : "bg-blue-gray-50/50 dark:bg-gray-800"
                                                } hover:bg-blue-gray-100 dark:hover:bg-gray-700 transition`}
                                        >
                                            <td className="px-4 py-3 text-sm text-center font-medium">
                                                {(filter.page - 1) * 20 + index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString("ru-RU")
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                    {item.method?.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">
                                                {formatNumber(item.amount)}{" "}
                                                <span className="text-gray-500 font-normal">so'm</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {item.note || "-"}
                                            </td>
                                            <td className="px-1 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <WarehouseExpensesEdit
                                                        data={item}
                                                        refresh={GetAllExpenses}
                                                    />
                                                    <WarehouseExpensesDelete
                                                        id={item?.id}
                                                        refresh={GetAllExpenses}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <EmptyData text={t('Empty_data')} />
                )}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-3">
                    <button
                        disabled={filter.page <= 1}
                        onClick={() => setFilter(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold text-sm min-w-[40px] text-center">
                            {filter.page}
                        </span>
                        <span className="text-sm">{totalPages}</span>
                    </div>

                    <button
                        disabled={filter.page >= totalPages}
                        onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
