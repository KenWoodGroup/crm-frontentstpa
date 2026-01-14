import { useEffect, useState, useRef } from "react";
import { Card, Typography, Button, Input } from "@material-tailwind/react";
import { NavLink, useParams } from "react-router-dom";
import { Stock } from "../../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import { formatNumber } from "../../../utils/Helpers/Formater";
import { io } from "socket.io-client";
import { Info } from "lucide-react";
import Socket from "../../../utils/Socket";
import { useTranslation } from "react-i18next";
import { PriceType } from "../../../utils/Controllers/PriceType";
import { locationInfo } from "../../../utils/Controllers/locationInfo";

export default function PriceTypeStock() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [priceType, setPriceType] = useState(null);
    const [updatingPrices, setUpdatingPrices] = useState({});
    const [mainLocationId, setMainLocationId] = useState(null);
    const [editingValues, setEditingValues] = useState({});
    const { t } = useTranslation();

    const timeoutRefs = useRef({}); // Для хранения timeout'ов по stockId

    const locationCookie = Cookies.get("ul_nesw");

    const getMainWarehouse = async () => {
        try {
            setLoading(true);
            const response = await locationInfo.GetWarehouseMain(locationCookie);

            if (response?.data?.location?.id) {
                setMainLocationId(response.data.location.id);
                return response.data.location.id;
            } else {
                console.warn("Main warehouse ID NOT FOUND in response");
                return null;
            }
        } catch (error) {
            console.error("Main warehouse error:", error);
            return null;
        }
    };

    const initializeData = async () => {
        setLoading(true);
        try {
            const locationId = await getMainWarehouse();
            if (locationId) {
                await GetAllProduct(locationId, 1);
            }
        } catch (error) {
            console.error("Initialization error:", error);
        } finally {
            setLoading(false);
        }
    };

    const GetAllProduct = async (locationId, pageNum = 1, append = false) => {
        if (!locationId) {
            console.warn("Location ID is required");
            return;
        }

        if (pageNum === 1 && !append) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await Stock.StockGetByLocationId({
                id: locationId,
                page: pageNum,
            });

            const newProducts = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);
            setPage(pageNum);

            if (append) {
                setProducts((prev) => [...prev, ...newProducts]);
            } else {
                setProducts(newProducts);
            }
        } catch (error) {
            console.log("Mahsulotlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const getPriceTypeById = async () => {
        try {
            if (!id) return;
            const response = await PriceType.PriceTypeByIDGet(id);
            setPriceType(response?.data || null);
        } catch (error) {
            console.log("Price type olishda xatolik:", error);
        }
    };

    const getSalePriceForPriceType = (stock) => {
        if (!priceType || !stock.sale_price_type || !Array.isArray(stock.sale_price_type)) {
            return null;
        }

        const priceTypeData = stock.sale_price_type.find(
            item => item.price_type_id === priceType.id
        );

        return priceTypeData ? {
            price: priceTypeData.sale_price,
            salePriceTypeId: priceTypeData.id
        } : null;
    };

    // Форматирование числа с пробелами и пустая строка для 0
    const formatPriceInput = (value) => {
        if (value === null || value === undefined || value === "") return "";
        if (value === 0) return "";

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return "";

        return numValue.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).replace(/,/g, ' ');
    };

    // Преобразование форматированной строки в число
    const parseFormattedPrice = (formattedValue) => {
        if (!formattedValue || formattedValue === "") return null;

        const cleanValue = formattedValue.replace(/\s/g, '').replace(',', '.');
        const numValue = parseFloat(cleanValue);
        return isNaN(numValue) ? null : numValue;
    };

    // Преобразование строки ввода в числовой формат (удаление лишних символов)
    const cleanInputValue = (value) => {
        // Разрешаем цифры, точку и запятую
        const cleaned = value.replace(/[^\d.,]/g, '');

        // Заменяем запятую на точку
        return cleaned.replace(',', '.');
    };

    const handlePriceChange = async (stockId, newPrice, existingSalePriceType) => {
        const numericPrice = parseFormattedPrice(newPrice);

        // Если цена null или undefined, не отправляем запрос
        if (numericPrice === null) return;

        // Если цена 0, тоже не отправляем (пустая строка)
        if (numericPrice === 0) return;

        if (numericPrice < 0) {
            alert("Iltimos, to'g'ri narx kiriting");
            return;
        }

        if (!priceType || !priceType.id) {
            alert("Price type not found");
            return;
        }

        setUpdatingPrices(prev => ({ ...prev, [stockId]: true }));

        try {
            const data = {
                stock_id: stockId,
                price_type_id: priceType.id,
                sale_price: numericPrice
            };

            let response;
            if (existingSalePriceType?.salePriceTypeId) {
                response = await PriceType.SalePriceTypeEdit(existingSalePriceType.salePriceTypeId, data);
            } else {
                response = await PriceType.SalePriceTypeCreate(data);
            }

            if (response?.status === 200 || response?.status === 201) {
                if (mainLocationId) {
                    GetAllProduct(mainLocationId, page, false);
                }
            } else {
                alert("Narxni saqlashda xatolik yuz berdi");
            }
        } catch (error) {
            console.log("Narxni saqlashda xatolik:", error);
            alert("Narxni saqlashda xatolik yuz berdi");
        } finally {
            setUpdatingPrices(prev => ({ ...prev, [stockId]: false }));
        }
    };

    const handleInputChange = (stockId, value, existingSalePriceType) => {
        // Очищаем значение от форматирования при вводе
        const cleanedValue = cleanInputValue(value);

        // Сохраняем очищенное значение
        setEditingValues(prev => ({
            ...prev,
            [stockId]: cleanedValue
        }));

        // Очищаем предыдущий timeout для этого stockId
        if (timeoutRefs.current[stockId]) {
            clearTimeout(timeoutRefs.current[stockId]);
        }

        // Устанавливаем новый timeout с задержкой 1.5 секунды
        timeoutRefs.current[stockId] = setTimeout(() => {
            // Форматируем значение для отправки
            const formattedValue = formatPriceInput(cleanedValue);
            const numericPrice = parseFormattedPrice(formattedValue);

            // Проверяем, изменилась ли цена
            const currentSalePrice = existingSalePriceType?.price || null;

            // Отправляем только если цена изменилась и не пустая
            if (numericPrice !== currentSalePrice && numericPrice !== null) {
                handlePriceChange(stockId, formattedValue, existingSalePriceType);
            }

            // Очищаем timeout из ref
            delete timeoutRefs.current[stockId];
        }, 1500);
    };

    const handleFocus = (stockId, currentValue, existingSalePriceType) => {
        // При фокусе показываем числовое значение без форматирования
        let rawValue = "";

        if (currentValue !== undefined && currentValue !== "") {
            // Если есть текущее редактируемое значение
            rawValue = currentValue.toString();
        } else if (existingSalePriceType?.price) {
            // Если есть сохраненная цена
            rawValue = existingSalePriceType.price.toString();
        }

        // Очищаем от форматирования
        rawValue = cleanInputValue(rawValue);

        setEditingValues(prev => ({
            ...prev,
            [stockId]: rawValue
        }));
    };

    const handleBlur = (stockId, value, existingSalePriceType) => {
        // Очищаем timeout при потере фокуса
        if (timeoutRefs.current[stockId]) {
            clearTimeout(timeoutRefs.current[stockId]);
            delete timeoutRefs.current[stockId];
        }

        // Форматируем значение для отображения
        const cleanedValue = cleanInputValue(value);
        const formattedValue = formatPriceInput(cleanedValue);

        setEditingValues(prev => ({
            ...prev,
            [stockId]: formattedValue
        }));

        // Немедленно отправляем на сервер при потере фокуса
        const numericPrice = parseFormattedPrice(formattedValue);
        const currentSalePrice = existingSalePriceType?.price || null;

        if (numericPrice !== currentSalePrice && numericPrice !== null) {
            handlePriceChange(stockId, formattedValue, existingSalePriceType);
        }
    };

    // Очистка всех timeout'ов при размонтировании
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, []);

    useEffect(() => {
        initializeData();
        getPriceTypeById();

        return () => {
            Object.values(timeoutRefs.current).forEach(timeout => {
                clearTimeout(timeout);
            });
        };
    }, []);

    useEffect(() => {
        if (!mainLocationId) return;

        const socket = io(`${Socket}`, {
            path: "/socket.io",
            transports: ["websocket"],
        });

        socket.emit("joinLocation", mainLocationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === mainLocationId) {
                GetAllProduct(mainLocationId, 1, false);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [mainLocationId]);

    useEffect(() => {
        if (id) {
            getPriceTypeById();
        }
    }, [id]);

    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages && mainLocationId) {
            GetAllProduct(mainLocationId, nextPage, true);
        }
    };

    if (loading && products.length === 0) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark">
            <div className="flex items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    {priceType ? `${priceType.name} - ${t("warehouseTitle")}` : t("warehouseTitle")}
                </Typography>
            </div>
            {products?.length > 0 ? (
                <>
                    <div className="overflow-x-auto shadow-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        №
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnProductName")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnBatch")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {priceType ? `${priceType.name} ${t("columnSalePrice")}` : t("columnSalePrice")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnPurchasePrice")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnQuantity")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnDraftQuantity")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnBarcode")}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t("columnDate")}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((item, index) => {
                                    const date = item?.createdAt;
                                    const formattedDate = date ? new Date(date).toLocaleDateString("uz-UZ") : null;
                                    const salePriceData = getSalePriceForPriceType(item);
                                    const isUpdating = updatingPrices[item.id];
                                    const currentEditingValue = editingValues[item.id];

                                    // Определяем отображаемое значение
                                    const displayValue = currentEditingValue !== undefined
                                        ? currentEditingValue
                                        : salePriceData?.price
                                            ? formatPriceInput(salePriceData.price)
                                            : "";

                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className={`border-x border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${index === products.length - 1
                                                ? "border-b border-gray-300 dark:border-gray-700"
                                                : ""
                                                } ${index % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-50/50 dark:bg-gray-800/50"
                                                }`}
                                        >
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                <span className="font-medium">{item.product?.name}</span>
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.batch || (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <Info size={16} />
                                                        <span>{t("noData")}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                <div className="relative">
                                                    <div className="relative w-full max-w-[180px] mx-auto">
                                                        <input
                                                            type="text"
                                                            value={displayValue}
                                                            className={`
                                                                w-full px-3 py-2 text-sm 
                                                                border ${isUpdating ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'} 
                                                                rounded-lg 
                                                                bg-white dark:bg-gray-800 
                                                                text-gray-900 dark:text-white
                                                                text-right
                                                                font-medium
                                                                transition-all duration-200
                                                                focus:outline-none 
                                                                focus:ring-2 
                                                                focus:ring-blue-500 
                                                                focus:border-transparent
                                                                ${isUpdating ? 'opacity-80 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                                                                placeholder:text-gray-400 dark:placeholder:text-gray-500
                                                            `}
                                                            placeholder="0"
                                                            onChange={(e) => {
                                                                handleInputChange(item.id, e.target.value, salePriceData);
                                                            }}
                                                            onFocus={() => handleFocus(item.id, displayValue, salePriceData)}
                                                            onBlur={(e) => handleBlur(item.id, e.target.value, salePriceData)}
                                                            disabled={isUpdating}
                                                        />
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                                                            UZS
                                                        </div>
                                                        {isUpdating && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.purchase_price ? `${formatNumber(item.purchase_price)} UZS` : (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                                                        <Info size={16} />
                                                        <span>{t("noData")}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.quantity}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.draft_quantity}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {item.barcode}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {formattedDate || (
                                                    <span className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
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
                    </div>

                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore || !mainLocationId}
                                className="rounded-full border-gray-400 dark:border-card-dark text-gray-800 dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {loadingMore ? t("loadingMoreText") : t("loadMoreButton")}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={t("noProductsMessage")} />
            )}
        </div>
    );
}