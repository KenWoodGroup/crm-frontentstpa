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
import Socket from "../../../utils/Socket";
import { useTranslation } from "react-i18next";

export default function WarehouseProduct() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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

        const socket = io(`${Socket}`, {
            path: "/socket.io",
            transports: ["websocket"],
        });

        socket.emit("joinLocation", locationId);

        socket.on("stockUpdate", (data) => {
            if (data.location_id === locationId) GetAllProduct(1);
        });

        return () => socket.disconnect();  
    }, [locationId]);

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
            <div className="flex flex-col sm:flex-row items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    {t("warehouseTitle")}
                </Typography>

                <NavLink to={"/warehouse/barcode/create"}>
                    <Button className="bg-blue-600 dark:bg-blue-500 text-white dark:text-white hover:bg-blue-700 dark:hover:bg-blue-600">
                        {t("addBarcodeButton")}
                    </Button>
                </NavLink>
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
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnSalePrice")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnPurchasePrice")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnQuantity")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnDraftQuantity")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnBarcode")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnDate")}</th>
                                    <th className="p-4 font-semibold text-gray-700 dark:text-text-dark">{t("columnActions")}</th>
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
                                                {item.sale_price ? `${formatNumber(item.sale_price)} UZS` : t("noData")}
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
                                            <td className="p-4 text-center">
                                                <WarehouseEdit data={item} />
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
