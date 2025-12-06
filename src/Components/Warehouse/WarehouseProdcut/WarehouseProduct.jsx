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
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]); // Результаты поиска для выпадающего списка
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // Выбранный продукт из поиска
    const searchTimeoutRef = useRef(null);
    const searchRef = useRef(null);
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

            if (append) setProducts((prev) => [...prev, ...newProducts]);
            else setProducts(newProducts);
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
        if (nextPage <= totalPages) {
            setPage(nextPage);
            GetAllProduct(nextPage, true);
        }
    };

    const searchProducts = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            setSelectedProduct(null);
            return;
        }

        try {
            const response = await LocalProduct?.SearchProduct(query);

            if (response?.data) {
                setSearchResults(response.data);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.log("Qidiruvda xatolik:", error);
            setSearchResults([]);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Очищаем предыдущий таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Устанавливаем новый таймаут для отправки запроса через 300ms
        searchTimeoutRef.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearchQuery(product.name || "");
        setSearchResults([]);
        setShowSearchResults(false);

        // Если нужно отобразить только выбранный продукт в таблице
        setProducts([product]);
        setTotalPages(1);
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedProduct(null);
        GetAllProduct(1);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim() && !selectedProduct) {
            // Если есть запрос, но не выбран продукт, ищем и показываем все результаты
            setLoading(true);
            searchProducts(searchQuery);
        } else if (!searchQuery.trim()) {
            handleClearSearch();
        }
    };

    // Закрытие выпадающего списка при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

                <div className="flex items-center gap-[10px] mt-3 sm:mt-0 relative" ref={searchRef}>
                    {/* Поле поиска с выпадающим списком */}
                    <div className="relative">
                        <Input
                            label={t("Search")}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => searchQuery && setShowSearchResults(true)}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark w-[300px] placeholder-gray-500 dark:placeholder-gray-400"
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

                        {/* Выпадающий список результатов поиска */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                {searchResults.map((product, index) => (
                                    <div
                                        key={`search-${product.id}-${index}`}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {product.product?.name || product.name || "Nomsiz mahsulot"}
                                                </p>
                                                {product.barcode && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Barkod: {product.barcode}
                                                    </p>
                                                )}
                                                {product.batch && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Partiya: {product.batch}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {product.quantity !== undefined && (
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {product.quantity} dona
                                                    </p>
                                                )}
                                                {product.purchase_price && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatNumber(product.purchase_price)} UZS
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showSearchResults && searchResults.length === 0 && searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                                <p className="text-gray-500 dark:text-gray-400 text-center">
                                    "{searchQuery}" bo'yicha natijalar topilmadi
                                </p>
                            </div>
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

            {/* Основная таблица */}
            {products?.length > 0 ? (
                <>
                    {/* Индикатор поиска */}
                    {selectedProduct && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-blue-800 dark:text-blue-300">
                                        Tanlangan mahsulot: {selectedProduct.product?.name || selectedProduct.name}
                                    </p>
                                    {selectedProduct.barcode && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Barkod: {selectedProduct.barcode}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="text"
                                    onClick={handleClearSearch}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Hamma mahsulotlarni ko'rish
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card className="overflow-x-auto shadow-sm border border-gray-200 dark:border-card-dark bg-card-light dark:bg-card-dark">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead className="bg-gray-100 dark:bg-card-dark">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">№</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnProductName")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnBatch")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnPurchasePrice")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnQuantity")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnDraftQuantity")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnBarcode")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnDate")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => {
                                    const date = item?.createdAt;
                                    const formattedDate = date ? new Date(date).toLocaleDateString("uz-UZ") : null;
                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className="border-b border-gray-200 dark:border-card-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                        >
                                            <td className="p-4 text-gray-700 dark:text-text-dark">{index + 1}</td>
                                            <td className="p-4 text-gray-900 font-medium dark:text-text-dark">{item.product?.name}</td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">
                                                {item.batch || (
                                                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <Info size={16} />
                                                        <span>{t("noData")}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">
                                                {item.purchase_price ? `${formatNumber(item.purchase_price)} UZS` : t("noData")}
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">{item.quantity}</td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">{item.draft_quantity}</td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">{item.barcode}</td>
                                            <td className="p-4 text-gray-700 dark:text-text-dark">
                                                {formattedDate || (
                                                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <Info size={16} />
                                                        <span>{t("dateMissingMessage")}</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>

                    {/* Показываем кнопку "Загрузить еще" только если не выбран конкретный продукт */}
                    {!selectedProduct && page < totalPages && (
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
                    text={searchQuery ?
                        (t("noSearchResults") || `"${searchQuery}" bo'yicha natijalar topilmadi`) :
                        t("noProductsMessage")
                    }
                />
            )}
        </div>
    );
}