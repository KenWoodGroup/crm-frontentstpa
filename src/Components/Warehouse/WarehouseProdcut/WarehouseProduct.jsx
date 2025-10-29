import { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { Stock } from "../../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseEdit from "./_components/WarehouseProductPriceEdit";
import { formatNumber } from "../../../utils/Helpers/Formater";
import { io } from "socket.io-client";
import { Info } from "lucide-react";
import axios from "../../../utils/axios";
import Socket from "../../../utils/Socket";

export default function WarehouseProduct() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const locationId = Cookies?.get("ul_nesw");

    // 🔹 Получаем данные
    const GetAllProduct = async (pageNum = 1, append = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await Stock.StockGetByLocationId({
                id: locationId,
                page: pageNum,
            });

            const newProducts = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);

            if (append) {
                // Добавляем новые данные в конец (сохраняем старые)
                setProducts((prev) => [...prev, ...newProducts]);
            } else {
                // Первая загрузка - заменяем все данные
                setProducts(newProducts);
            }
        } catch (error) {
            console.log("Mahsulotlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // 🔁 Первичная загрузка + сокет
    useEffect(() => {
        if (!locationId) return;
        GetAllProduct(1);

        const socket = io(`${Socket}`, {
            path: "/socket.io",
            transports: ["websocket"],
        });

        socket.emit("joinLocation", locationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === locationId) {
                // При обновлении через сокет перезагружаем все с первой страницы
                GetAllProduct(1);
            }
        });

        return () => socket.disconnect();
    }, [locationId]);

    // 🔁 Подгрузка следующей страницы
    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages) {
            setPage(nextPage);
            GetAllProduct(nextPage, true);
        }
    };

    if (loading && products.length === 0) {
        return <Loading />;
    }

    return (
        <div className="text-black min-h-screen">
            <div className="flex items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    Ombordagi Mahsulotlar
                </Typography>

                <NavLink to={"/warehouse/barcode/create"}>
                    <Button>Barcode qo‘shish</Button>
                </NavLink>
            </div>

            {products?.length > 0 ? (
                <>
                    <Card className="overflow-x-auto shadow-sm border border-gray-200">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-4 font-semibold text-gray-700">№</th>
                                    <th className="p-4 font-semibold text-gray-700">Mahsulot nomi</th>
                                    <th className="p-4 font-semibold text-gray-700">Partiya</th>
                                    <th className="p-4 font-semibold text-gray-700">Sotuv narxi</th>
                                    <th className="p-4 font-semibold text-gray-700">Tan narxi</th>
                                    <th className="p-4 font-semibold text-gray-700">Soni</th>
                                    <th className="p-4 font-semibold text-gray-700">Barcode</th>
                                    <th className="p-4 font-semibold text-gray-700">Sana</th>
                                    <th className="p-4 font-semibold text-gray-700 text-center">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => {
                                    const date = item.product?.createdAt;
                                    const formattedDate = date
                                        ? new Date(date).toLocaleDateString("uz-UZ")
                                        : null;

                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className="border-b hover:bg-gray-50 transition"
                                        >
                                            <td className="p-4 text-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="p-4 text-gray-900 font-medium">
                                                {item.product?.name}
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {item.batch || (
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <Info size={16} />
                                                        <span>—</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {item.sale_price
                                                    ? `${formatNumber(item.sale_price)} so‘m`
                                                    : "—"}
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {item.purchase_price
                                                    ? `${formatNumber(item.purchase_price)} so‘m`
                                                    : "—"}
                                            </td>
                                            <td className="p-4 text-gray-700">{item.quantity}</td>
                                            <td className="p-4 text-gray-700">{item.barcode}</td>
                                            <td className="p-4 text-gray-700">
                                                {formattedDate ? (
                                                    formattedDate
                                                ) : (
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <Info size={16} />
                                                        <span>Дата отсутствует</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <WarehouseEdit data={item} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>

                    {/* 🔹 Кнопка подгрузки (только если есть следующая страница) */}
                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore}
                                className="rounded-full border-gray-400 text-gray-800 hover:bg-gray-100"
                            >
                                {loadingMore ? "Yuklanmoqda..." : "Yana ko‘rish"}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={"Omborda mahsulot mavjud emas"} />
            )}
        </div>
    );
}