import { useEffect, useState, useCallback, useRef } from "react";
import { Card, Typography, Button, Input } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import { formatNumber } from "../../../utils/Helpers/Formater";
import { Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import socket from "../../../utils/Socket";
import { locationInfo } from "../../../utils/Controllers/locationInfo";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";

export default function StockApi() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mainLocationId, setMainLocationId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    
    const { t } = useTranslation();
    const locationCookie = Cookies?.get("ul_nesw");
    const searchTimeoutRef = useRef(null);

    // ------------------------------ GET MAIN WAREHOUSE ------------------------------
    const getMainWarehouse = async () => {
        try {
            setLoading(true);
            const response = await locationInfo.GetWarehouseMain(locationCookie);
            const locId = response?.data?.location?.id;
            if (locId) {
                setMainLocationId(locId);
            }
        } catch (error) {
            console.log("Main warehouse error:", error);
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------ GET STOCK ------------------------------
    const GetAllProduct = async (pageNum = 1, append = false, locId) => {
        if (!locId) return;

        if (pageNum === 1 && !append) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await Stock.StockGetByLocationId({
                id: locId,
                page: pageNum,
            });

            const newProducts = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);

            if (append) {
                setProducts(prev => [...prev, ...newProducts]);
                setOriginalProducts(prev => [...prev, ...newProducts]);
            } else {
                setProducts(newProducts);
                setOriginalProducts(newProducts);
            }

        } catch (error) {
            console.log("Stock load error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // ------------------------------ SEARCH HANDLERS ------------------------------
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounce
        searchTimeoutRef.current = setTimeout(() => {
            if (value.trim() && mainLocationId) {
                searchProducts(value);
            } else if (!value.trim()) {
                // Reset to original data
                resetSearch();
            }
        }, 500); // 500ms delay
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() && mainLocationId) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchProducts(searchQuery);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        resetSearch();
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    };

    const resetSearch = () => {
        setIsSearchActive(false);
        setProducts(originalProducts);
        setTotalPages(1);
        setPage(1);
    };

    // ------------------------------ SEARCH FUNCTION ------------------------------
    const searchProducts = async (query) => {
        if (!query.trim() || !mainLocationId) {
            resetSearch();
            return;
        }

        setIsSearchActive(true);
        setLoadingSearch(true);

        try {
            // Используем API поиска только по имени
            const response = await LocalProduct?.SearchProduct(query);

            // Обработка ответа в зависимости от структуры API
            let searchResults = [];
            
            if (response?.data?.data?.records) {
                // Если данные в формате с пагинацией
                searchResults = response.data.data.records;
                setTotalPages(response.data.data.pagination?.total_pages || 1);
            } else if (response?.data?.records) {
                // Если есть records в data
                searchResults = response.data.records;
                setTotalPages(response.data.pagination?.total_pages || 1);
            } else if (Array.isArray(response?.data)) {
                // Если массив данных
                searchResults = response.data;
                setTotalPages(1);
            } else if (response?.data) {
                // Если есть данные
                searchResults = [response.data];
                setTotalPages(1);
            } else if (Array.isArray(response)) {
                // Если сам response - массив
                searchResults = response;
                setTotalPages(1);
            }

            // Фильтруем результаты только для текущего склада
            const filteredResults = searchResults.filter(item => 
                item.location_id === mainLocationId || 
                item.product?.location_id === mainLocationId ||
                !item.location_id // Если нет location_id, показываем все
            );

            // Форматируем результаты для таблицы
            const formattedResults = filteredResults.map(item => ({
                id: item.id || item.product_id,
                product_id: item.product_id,
                location_id: item.location_id || mainLocationId,
                quantity: item.quantity || item.actual_quantity || 0,
                draft_quantity: item.draft_quantity || 0,
                purchase_price: item.purchase_price || item.price || 0,
                barcode: item.barcode || item.product?.barcode,
                batch: item.batch || item.lot_number,
                fixed_quantity: item.fixed_quantity || 0,
                createdAt: item.createdAt || item.updatedAt,
                product: {
                    id: item.product?.id || item.product_id,
                    name: item.product?.name || item.name || item.product_name || t("noProductName"),
                    unit: item.product?.unit || item.unit || "dona",
                    category_id: item.product?.category_id
                }
            }));

            setProducts(formattedResults);
            setPage(1);

            // Если после фильтрации нет результатов
            if (formattedResults.length === 0) {
                console.log("No products found for current warehouse");
            }

        } catch (error) {
            console.log("Search error:", error);
            // В случае ошибки возвращаемся к оригинальным данным
            resetSearch();
        } finally {
            setLoadingSearch(false);
        }
    };

    // ------------------------------ LOAD MORE SEARCH RESULTS ------------------------------
    const loadMoreSearchResults = async () => {
        if (!searchQuery.trim() || !mainLocationId || page >= totalPages) return;
        
        setLoadingMore(true);
        const nextPage = page + 1;

        try {
            // Для поиска по имени обычно нет пагинации, но если есть
            const response = await LocalProduct?.SearchProduct(searchQuery);

            let searchResults = [];
            
            if (response?.data?.data?.records) {
                searchResults = response.data.data.records;
            } else if (response?.data?.records) {
                searchResults = response.data.records;
            } else if (Array.isArray(response?.data)) {
                searchResults = response.data;
            }

            // Фильтруем результаты только для текущего склада
            const filteredResults = searchResults.filter(item => 
                item.location_id === mainLocationId || 
                item.product?.location_id === mainLocationId ||
                !item.location_id
            );

            // Форматируем новые результаты
            const formattedResults = filteredResults.map(item => ({
                id: item.id || item.product_id,
                product_id: item.product_id,
                location_id: item.location_id || mainLocationId,
                quantity: item.quantity || item.actual_quantity || 0,
                draft_quantity: item.draft_quantity || 0,
                purchase_price: item.purchase_price || item.price || 0,
                barcode: item.barcode || item.product?.barcode,
                batch: item.batch || item.lot_number,
                fixed_quantity: item.fixed_quantity || 0,
                createdAt: item.createdAt || item.updatedAt,
                product: {
                    id: item.product?.id || item.product_id,
                    name: item.product?.name || item.name || item.product_name || t("noProductName"),
                    unit: item.product?.unit || item.unit || "dona",
                    category_id: item.product?.category_id
                }
            }));

            setProducts(prev => [...prev, ...formattedResults]);
            setPage(nextPage);

        } catch (error) {
            console.log("Load more search error:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // ------------------------------ FIRST LOAD ------------------------------
    useEffect(() => {
        getMainWarehouse();
    }, [locationCookie]);

    // ------------------------------ WHEN WE GOT MAIN LOCATION ID ------------------------------
    useEffect(() => {
        if (!mainLocationId) return;

        setPage(1);
        GetAllProduct(1, false, mainLocationId);

        // join socket room
        socket.emit("joinLocation", mainLocationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === mainLocationId) {
                GetAllProduct(1, false, mainLocationId);
                // Если поиск активен, обновляем и поисковые результаты
                if (isSearchActive && searchQuery) {
                    searchProducts(searchQuery);
                }
            }
        });

        return () => {
            socket.off("stockUpdate");
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };

    }, [mainLocationId]);
    // fnjffefejferifjerijfierjf erifjerif jejfe ijfer

    // ------------------------------ LOAD NEXT PAGE ------------------------------
    const loadNextPage = () => {
        if (isSearchActive) {
            // Для поиска используем отдельную функцию
            loadMoreSearchResults();
            return;
        }
        
        const next = page + 1;
        if (next <= totalPages) {
            setPage(next);
            GetAllProduct(next, true, mainLocationId);
        }
    };

    // ------------------------------ UI ------------------------------
    if (loading && products.length === 0) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark ">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
                <Typography variant="h4" className="font-semibold">
                    {t("warehouseTitle")}
                </Typography>
                <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                    <Input
                        label={t('Search') || "Qidirish"}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400 pr-10"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`
                        }}
                        // edit 
                        disabled={!mainLocationId}
                    />
                    {loadingSearch ? (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                    ) : searchQuery ? (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                </div>
            </div>

            {!mainLocationId && !loading ? (
                <EmptyData text={t("loadingLocation") || "Ombor yuklanmoqda..."} />
            ) : products.length > 0 ? (
                <>
                    {isSearchActive && searchQuery && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Typography variant="small" className="text-blue-600 dark:text-blue-300">
                                {t("searchResultsFor") || "Qidiruv natijalari"}: "{searchQuery}" 
                                ({products.length} {t("results") || "natija"})
                                {totalPages > 1 && ` • ${t("page") || "sahifa"} ${page} / ${totalPages}`}
                            </Typography>
                        </div>
                    )}
                    
                    <Card className="overflow-x-auto shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        №
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnProductName")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnBatch")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnPurchasePrice")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnQuantity")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnDraftQuantity")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnBarcode")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-b border-gray-300 dark:border-gray-700">
                                        {t("columnDate")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((item, index) => {
                                    const date = item?.createdAt;
                                    const formattedDate = date
                                        ? new Date(date).toLocaleDateString("uz-UZ")
                                        : null;

                                    return (
                                        <tr
                                            key={item.id || `${item.product_id}_${index}`}
                                            className={`
                                                border-x border-gray-300 dark:border-gray-700
                                                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                                ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"}
                                                ${index === products.length - 1 ? "border-b border-gray-300 dark:border-gray-700" : ""}
                                            `}
                                        >
                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {index + 1}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.product?.name || t("noProductName")}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.batch || (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500">
                                                        <Info size={16} />
                                                        {t("noData")}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.purchase_price
                                                    ? `${formatNumber(item.purchase_price)} UZS`
                                                    : t("noData")}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.quantity}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.draft_quantity}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.barcode || (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500">
                                                        <Info size={16} />
                                                        {t("noData")}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {formattedDate || (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500">
                                                        <Info size={16} />
                                                        {t("dateMissingMessage")}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>

                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore || loadingSearch}
                                className="dark:border-white dark:text-white"
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
                            searchQuery && isSearchActive ?
                                (t("noSearchResults") || `"${searchQuery}" bo'yicha natijalar topilmadi`) :
                                t("noProductsMessage")
                    }
                />
            )}
        </div>
    );
}