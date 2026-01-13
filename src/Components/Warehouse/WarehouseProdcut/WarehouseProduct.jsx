import { useEffect, useState, useRef } from "react";
import { Card, Typography, Button, Input } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { Stock } from "../../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseEdit from "./_components/WarehouseProductPriceEdit";
import { formatNumber } from "../../../utils/Helpers/Formater";
import { Info, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import socket from "../../../utils/Socket";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";

export default function WarehouseProduct() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]); // Сохраняем оригинальные данные
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchTimeoutRef = useRef(null);
    const { t } = useTranslation();

    const locationId = Cookies?.get("ul_nesw");

    const GetAllProduct = async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await Stock.StockGetByLocationId({
                id: locationId,
                page: pageNum,
            });

            const newProducts = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);

            if (append) {
                setProducts((prev) => [...prev, ...newProducts]);
                setOriginalProducts((prev) => [...prev, ...newProducts]);
            } else {
                setProducts(newProducts);
                setOriginalProducts(newProducts);
            }
        } catch (error) {
            console.log("Mahsulotlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!locationId) return;
        GetAllProduct(1);

        socket.emit("joinLocation", locationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === locationId) GetAllProduct(1);
        });

        return () => socket.disconnect("stockUpdate");
    }, [locationId]);

    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages && !isSearchActive) {
            setPage(nextPage);
            GetAllProduct(nextPage, true);
        }
    };

    const searchProducts = async (query) => {
        if (!query.trim()) {
            // Если поле пустое, показываем все продукты
            setIsSearchActive(false);
            setProducts(originalProducts);
            return;
        }

        setIsSearchActive(true);
        setLoadingSearch(true);

        try {
            const response = await LocalProduct?.SearchProduct(query);

            // Обработка ответа - адаптируйте под ваш формат данных
            if (response?.data) {
                const searchData = response.data;

                // Преобразуем данные если нужно
                const formattedResults = Array.isArray(searchData)
                    ? searchData.map(item => ({
                        id: item.id,
                        product_id: item.product_id,
                        location_id: item.location_id,
                        quantity: item.quantity,
                        draft_quantity: item.draft_quantity,
                        purchase_price: item.purchase_price,
                        barcode: item.barcode,
                        batch: item.batch,
                        fixed_quantity: item.fixed_quantity,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        product: item.product || {
                            id: item.product?.id,
                            name: item.product?.name || item.name || "Nomsiz mahsulot",
                            unit: item.product?.unit || "dona",
                            location_id: item.product?.location_id,
                            category_id: item.product?.category_id,
                            createdAt: item.product?.createdAt,
                            updatedAt: item.product?.updatedAt
                        }
                    }))
                    : [];

                setProducts(formattedResults);
                setTotalPages(1);
                setPage(1);
            }
        } catch (error) {
            console.log("Qidiruvda xatolik:", error);
            setProducts(originalProducts);
            setIsSearchActive(false);
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Очищаем предыдущий таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Устанавливаем новый таймаут для отправки запроса через 500ms
        searchTimeoutRef.current = setTimeout(() => {
            searchProducts(value);
        }, 500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            // При нажатии Enter сразу отправляем запрос
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchProducts(searchQuery);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setIsSearchActive(false);
        setProducts(originalProducts);
    };

    // Очищаем таймаут при размонтировании компонента
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    if (loading && products.length === 0) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    {t("warehouseTitle")}
                </Typography>

                <div className="flex items-center gap-[10px] mt-3 sm:mt-0">
                    {/* Поле поиска */}
                    <div className="relative">
                        <Input
                            label={t('Search')}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark  placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark  `
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Кнопка добавления штрихкода */}
                    <NavLink to={"/warehouse/barcode/create"}>
                        <Button className="bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600">
                            {t("addBarcodeButton")}
                        </Button>
                    </NavLink>
                </div>
            </div>


            {/* Таблица */}
            {products?.length > 0 ? (
                <>
                    <Card className="overflow-x-auto border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#424242]  ">
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            №
                                        </th>
                                      
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnProductName")}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnBatch")}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnPurchasePrice")}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnQuantity")}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnDraftQuantity")}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                            {t("columnBarcode")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((item, index) => (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
                                                }`}
                                        >
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                {index + 1}
                                            </td>
                                         
                                            <td className="p-3 text-left  text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                                                {item.product?.name || "Nomsiz mahsulot"}
                                            </td>
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                {item.batch || (
                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                {item.purchase_price ? (
                                                    <span className=" font-medium">
                                                        {formatNumber(item.purchase_price)} UZS
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                <span className="font-medium">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                <span className="font-medium">
                                                    {item.draft_quantity}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                {item.barcode || (
                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Кнопка "Загрузить еще" показываем только если не идет поиск */}
                    {!isSearchActive && page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore}
                                className="rounded-full border-gray-400 dark:border-card-dark text-gray-800 dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {loadingMore ? t("loadingMoreText") : t("loadMoreButton")}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData
                    text={
                        loadingSearch ?
                            `${t("searchingText") || "Qidirilmoqda..."} "${searchQuery}"` :
                            searchQuery ?
                                (t("noSearchResults") || `"${searchQuery}" bo'yicha natijalar topilmadi`) :
                                t("noProductsMessage")
                    }
                />
            )}
        </div>
    );
}