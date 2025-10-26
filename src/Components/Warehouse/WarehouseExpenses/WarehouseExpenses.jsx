import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Expenses } from "../../../utils/Controllers/Expenses";
import WarehouseExpensesCreate from "./_components/WarehouseExpensesCreate";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseExpensesDelete from "./_components/WarehouseExpensesDelete";
import WarehouseExpensesEdit from "./_components/WarehouseExpensesEdit";

// 🔹 функция получения первого и последнего дня текущего месяца
const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const first = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const last = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return { first, last };
};

export default function WarehouseExpenses() {
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

    // 🔹 форматирование чисел (пример: 50 000)
    const formatNumber = (num) =>
        num !== undefined && num !== null
            ? Number(num).toLocaleString("ru-RU").replace(/,/g, " ")
            : "0";

    // 🔹 загрузка расходов (сохранение фильтра)
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

    // 🔹 автоматическая загрузка при изменении фильтра
    useEffect(() => {
        GetAllExpenses();
    }, [GetAllExpenses]);

    // 🔹 изменение дат
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({
            ...prev,
            [name]: value,
            page: 1,
        }));
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            {/* 🔹 Заголовок + фильтры */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Расходы склада
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Фильтр дат */}
                    <div className="flex items-center gap-2">
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
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-[160px] bg-white text-sm"
                            />
                        </div>

                        <span className="text-gray-500 font-medium">—</span>

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
                                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-[160px] bg-white text-sm"
                            />
                        </div>

                        <button
                            onClick={GetAllExpenses}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm shadow-sm"
                        >
                            {loading ? "Загрузка..." : "Применить"}
                        </button>
                    </div>

                    {/* Кнопка добавления */}
                    <WarehouseExpensesCreate refresh={GetAllExpenses} />
                </div>
            </div>

            {/* 🔹 Таблица */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b w-[60px]">
                                            №
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                                            Дата
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                                            Метод оплаты
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase border-b">
                                            Сумма
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                                            Комментарий
                                        </th>
                                        <th className="px-1 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b w-[80px]">
                                            Действие
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            className="hover:bg-blue-50 transition-colors duration-150"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium">
                                                {(filter.page - 1) * 20 + index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString("ru-RU")
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                    {item.method || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                                {formatNumber(item.amount)}{" "}
                                                <span className="text-gray-500 font-normal">so'm</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.note || "-"}
                                            </td>
                                            <td className="px-1 py-3 text-sm text-gray-600">
                                                <div className="flex items-center">
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
                    <EmptyData text="Нет расходов" />
                )}
            </div>

            {/* 🔹 Пагинация */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-3">
                    <button
                        disabled={filter.page <= 1}
                        onClick={() =>
                            setFilter((prev) => ({
                                ...prev,
                                page: prev.page - 1,
                            }))
                        }
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Страница</span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold text-sm min-w-[40px] text-center">
                            {filter.page}
                        </span>
                        <span className="text-sm text-gray-600">из {totalPages}</span>
                    </div>

                    <button
                        disabled={filter.page >= totalPages}
                        onClick={() =>
                            setFilter((prev) => ({
                                ...prev,
                                page: prev.page + 1,
                            }))
                        }
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            )}
        </div>
    );
}
