import { useEffect, useState } from "react";
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
    const { t } = useTranslation();

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

    // Функция для получения цены по price type для конкретного stock
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

    const handlePriceChange = async (stockId, newPrice, existingSalePriceType) => {
        if (!newPrice || newPrice <= 0) {
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
                sale_price: parseFloat(newPrice)
            };

            let response;
            if (existingSalePriceType?.salePriceTypeId) {
                // Edit existing price
                response = await PriceType.SalePriceTypeEdit(existingSalePriceType.salePriceTypeId, data);
            } else {
                // Create new price
                response = await PriceType.SalePriceTypeCreate(data);
            }

            if (response?.status === 200 || response?.status === 201) {
                // Refresh the products list to get updated prices
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
        // Debounce implementation - wait 1 second after user stops typing
        clearTimeout(window.priceUpdateTimeout);

        window.priceUpdateTimeout = setTimeout(() => {
            if (value && value > 0) {
                handlePriceChange(stockId, value, existingSalePriceType);
            }
        }, 1000);
    };

    useEffect(() => {
        initializeData();
        getPriceTypeById();

        return () => {
            clearTimeout(window.priceUpdateTimeout);
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
                                    const salePrice = salePriceData?.price;
                                    const isUpdating = updatingPrices[item.id];

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
                                                    <Input
                                                        type="number"
                                                        defaultValue={salePrice || ""}
                                                        className={`!border !border-gray-300 dark:!border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-[150px] mx-auto ${isUpdating ? 'opacity-50' : ''
                                                            }`}
                                                        placeholder={salePrice ? t("enterPrice") : t("priceNotSet")}
                                                        onBlur={(e) => {
                                                            const value = e.target.value;
                                                            if (value && value > 0) {
                                                                handlePriceChange(item.id, value, salePriceData);
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleInputChange(item.id, value, salePriceData);
                                                        }}
                                                        disabled={isUpdating}
                                                    />
                                                    {isUpdating && (
                                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                                        </div>
                                                    )}
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