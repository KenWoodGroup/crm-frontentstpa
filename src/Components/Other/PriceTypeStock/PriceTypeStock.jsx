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

export default function PriceTypeStock() {
    const { id } = useParams()
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [priceType, setPriceType] = useState(null);
    const [updatingPrices, setUpdatingPrices] = useState({});
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

    const getPriceTypeById = async () => {
        try {
            const response = await PriceType.PriceTypeByIDGet(id);
            setPriceType(response?.data || null);
        } catch (error) {
            console.log("Price type olishda xatolik:", error);
        }
    }

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

        setUpdatingPrices(prev => ({ ...prev, [stockId]: true }));

        try {
            const data = {
                stock_id: stockId,
                price_type_id: priceType.id,
                sale_price: parseFloat(newPrice)
            };

            let response;
            if (existingSalePriceType) {
                // Edit existing price
                response = await PriceType.SalePriceTypeEdit(existingSalePriceType.salePriceTypeId, data);
            } else {
                // Create new price
                response = await PriceType.SalePriceTypeCreate(data);
            }

            if (response?.status === 200 || response?.status === 201) {
                // Refresh the products list to get updated prices
                GetAllProduct(page, false);
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
        if (!locationId) return;
        GetAllProduct(1);

        const socket = io(`${Socket}`, {
            path: "/socket.io",
            transports: ["websocket"],
        });

        socket.emit("joinLocation", locationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === locationId) GetAllProduct(1);
        });

        return () => {
            socket.disconnect();
            clearTimeout(window.priceUpdateTimeout);
        };
    }, [locationId]);

    useEffect(() => {
        if (id) {
            getPriceTypeById();
        }
    }, [id]);

    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages) {
            setPage(nextPage);
            GetAllProduct(nextPage, true);
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
                    <Card className="overflow-x-auto shadow-sm border border-gray-200 dark:border-card-dark bg-card-light dark:bg-card-dark">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead className="bg-gray-100 dark:bg-card-dark">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">№</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnProductName")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnBatch")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">
                                        {priceType ? `${priceType.name} ${t("columnSalePrice")}` : t("columnSalePrice")}
                                    </th>
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
                                    const salePriceData = getSalePriceForPriceType(item);
                                    const salePrice = salePriceData?.price;
                                    const isUpdating = updatingPrices[item.id];

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
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        defaultValue={salePrice || ""}
                                                        className={`!border !border-gray-300 dark:!border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${isUpdating ? 'opacity-50' : ''
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

                    {page < totalPages && (
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
                <EmptyData text={t("noProductsMessage")} />
            )}
        </div>
    );
}