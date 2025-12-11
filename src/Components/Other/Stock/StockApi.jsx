import { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import { formatNumber } from "../../../utils/Helpers/Formater";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import socket from "../../../utils/Socket";
import { locationInfo } from "../../../utils/Controllers/locationInfo";

export default function StockApi() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [mainLocationId, setMainLocationId] = useState(null);
    const { t } = useTranslation();

    const locationCookie = Cookies?.get("ul_nesw");

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

            if (append) setProducts(prev => [...prev, ...newProducts]);
            else setProducts(newProducts);

        } catch (error) {
            console.log("Stock load error:", error);
        } finally {
            setLoading(false);
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
            }
        });

        return () => socket.off("stockUpdate");

    }, [mainLocationId]);

    // ------------------------------ LOAD NEXT PAGE ------------------------------
    const loadNextPage = () => {
        const next = page + 1;
        if (next <= totalPages) {
            setPage(next);
            GetAllProduct(next, true, mainLocationId);
        }
    };

    // ------------------------------ UI ------------------------------
    if (loading && products.length === 0) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    {t("warehouseTitle")}
                </Typography>
            </div>

            {products.length > 0 ? (
                <>
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
                                            key={item.id}
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
                                                {item.product?.name}
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
                                                {item.barcode}
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
                                disabled={loadingMore}
                                className="dark:border-white dark:text-white"
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
