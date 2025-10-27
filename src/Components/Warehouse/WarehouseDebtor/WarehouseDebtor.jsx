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
        <div className="">
            {/* 🔹 Заголовок + фильтры */}
            <div className="flex flex-wrap items-end justify-between mb-5 gap-4">
                <Typography
                    variant="h5"
                    className="font-semibold text-blue-gray-700 mb-2"
                >
                    Общая таблица долгов клиентов
                </Typography>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-3 text-gray-500"
                            size={18}
                        />
                        <Input
                            label="Фильтр по имени..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className=" bg-white min-w-[200px]"
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
            <div className="overflow-y-auto border rounded-lg flex-grow max-h-[600px]">
                {data?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-blue-50 text-gray-700 text-sm sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b text-center w-[5%]">№</th>
                                <th className="p-3 border-b">Имя клиента</th>
                                <th className="p-3 border-b">Фабрика</th>
                                <th className="p-3 border-b">Телефон</th>
                                <th className="p-3 border-b text-right">Долг (so‘m)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, i) => (
                                <tr
                                    key={item.id || i}
                                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-blue-50 transition-colors`}
                                >
                                    <td className="p-3 border-b text-center">{i + 1}</td>
                                    <td className="p-3 border-b font-medium text-blue-gray-700">
                                        {item.name}
                                    </td>
                                    <td className="p-3 border-b text-gray-700">
                                        {item.parent?.name || "-"}
                                    </td>
                                    <td className="p-3 border-b text-gray-700">
                                        {item.phone || "-"}
                                    </td>
                                    <td className="p-3 border-b text-right text-red-600 font-semibold">
                                        {formatNumber(item.balance)} so‘m
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-blue-50 sticky bottom-0">
                                <tr>
                                    <td colSpan={4} className="p-3 font-semibold text-right">
                                        Общий долг:
                                    </td>
                                    <td className="p-3 font-semibold text-red-600 text-right">
                                        {formatNumber(totalDebt)} so‘m
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
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </IconButton>

                    <Typography className="text-gray-700 font-medium">
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
                    >
                        <ChevronRight className="h-5 w-5" />
                    </IconButton>
                </div>
            )}
        </div>
    );
}
