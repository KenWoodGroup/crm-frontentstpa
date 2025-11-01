import React, { useEffect, useState } from "react";
import {
    Typography,
    Button,
    Input,
    IconButton,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { FileDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { location } from "../../../utils/Controllers/location";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";

export default function WarehouseDebtor() {
    const [data, setData] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ безопасное форматирование чисел
    const formatNumber = (num) =>
        num !== undefined && num !== null
            ? Number(num).toLocaleString("ru-RU").replace(/,/g, " ")
            : "0";

    // 🔹 получить данные
    const getDebtor = async (customPage = page) => {
        try {
            setLoading(true);
            const params = {
                parent_id: Cookies.get("ul_nesw"),
                type: "client",
                searchName: filterName || "all",
                page: customPage,
            };

            const response = await location.GetDebtor(params);

            if (response?.data?.data) {
                const serverData = response.data.data.records || [];
                setData(Array.isArray(serverData) ? serverData : []);
                setPagination(response.data.data.pagination || null);
            }
        } catch (error) {
            console.error("Ошибка при получении данных:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDebtor()
    }, [])

    const totalDebt = data.reduce(
        (sum, i) => sum + (Number(i.balance) || 0),
        0
    );

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen p-4 transition-colors duration-200">
            {/* 🔹 Заголовок + фильтры */}
            <div className="flex flex-wrap items-end justify-between mb-5 gap-4">
                <Typography
                    variant="h5"
                    className="font-semibold text-blue-gray-700 dark:text-text-dark mb-2 transition-colors duration-200"
                >
                    Общая таблица долгов клиентов
                </Typography>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">

                        <Input
                            label="Фильтр по имени..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
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

                    <Button
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setPage(1);
                            getDebtor(1);
                        }}
                        disabled={loading}
                    >
                        {loading ? "Поиск..." : "Поиск"}
                    </Button>
                </div>
            </div>

            {/* 🔹 Таблица */}
            <div className="overflow-y-auto  border-gray-200 dark:border-gray-700 rounded-lg flex-grow max-h-[600px] bg-card-light dark:bg-card-dark transition-colors duration-200">
                {data?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-blue-50 dark:bg-card-dark text-gray-700 dark:text-gray-300 text-sm sticky top-0 z-10 transition-colors duration-200">
                            <tr>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-center w-[5%] transition-colors duration-200">
                                    №
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    Имя клиента
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    Фабрика
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    Телефон
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-right transition-colors duration-200">
                                    Долг (so'm)
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, i) => (
                                <tr
                                    key={item.id || i}
                                    className={`${i % 2 === 0
                                        ? "bg-white dark:bg-gray-800"
                                        : "bg-gray-50 dark:bg-gray-700/50"
                                        } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
                                >
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center text-text-light dark:text-text-dark transition-colors duration-200">
                                        {i + 1}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium text-blue-gray-700 dark:text-text-dark transition-colors duration-200">
                                        {item.name}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                        {item.parent?.name || "-"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                        {item.phone || "-"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-right text-red-600 dark:text-red-400 font-semibold transition-colors duration-200">
                                        {formatNumber(item.balance)} so'm
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-blue-50 dark:bg-card-dark sticky bottom-0 transition-colors duration-200">
                                <tr>
                                    <td colSpan={4} className="p-3 font-semibold text-right text-text-light dark:text-text-dark transition-colors duration-200">
                                        Общий долг:
                                    </td>
                                    <td className="p-3 font-semibold text-red-600 dark:text-red-400 text-right transition-colors duration-200">
                                        {formatNumber(totalDebt)} so'm
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                ) : (
                    <EmptyData text={'Нет данных'} />
                )}
            </div>

            {/* 🔹 Пагинация (скрыта, пока не нужна) */}
            {pagination && pagination.total_pages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3 hidden">
                    <IconButton
                        variant="outlined"
                        disabled={Number(pagination.currentPage) <= 1}
                        onClick={() => {
                            const prevPage = Number(pagination.currentPage) - 1;
                            setPage(prevPage);
                            getDebtor(prevPage);
                        }}
                        className="dark:border-blue-400 dark:text-blue-400 transition-colors duration-200"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </IconButton>

                    <Typography className="text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">
                        Страница {pagination.currentPage} из {pagination.total_pages}
                    </Typography>

                    <IconButton
                        variant="outlined"
                        disabled={
                            Number(pagination.currentPage) >=
                            Number(pagination.total_pages)
                        }
                        onClick={() => {
                            const nextPage = Number(pagination.currentPage) + 1;
                            setPage(nextPage);
                            getDebtor(nextPage);
                        }}
                        className="dark:border-blue-400 dark:text-blue-400 transition-colors duration-200"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </IconButton>
                </div>
            )}
        </div>
    );
}