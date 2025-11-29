import { Button, Typography, Card, CardBody } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";
import Eye from "../../UI/Icons/Eye";
import { NavLink, useParams } from "react-router-dom";
import FactoryProductCreate from "./_components/FactoryProductCreate";
import FactoryCategoryEdit from "../FactoryProduct/_component/FactoryCategoryEdit";
import FactoryCategoryDelete from "../FactoryProduct/_component/FactoryCategoryDelete";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";
import Cookies from "js-cookie";


export default function FactoryCategoryDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const location_id = Cookies.get("ul_nesw");

    const GetLocalCategory = async (page = 1) => {
        setLoading(true);
        try {
            // формируем объект data для запроса
            const data = {
                location_id,
                category_id: id,
                page
            };

            const response = await LocalProduct.GetProduct(data);
            const records = response?.data?.data?.records || [];
            const pagination = response?.data?.data?.pagination || {};

            setProducts(records);
            setCurrentPage(Number(pagination.currentPage) || 1);
            setTotalPages(Number(pagination.total_pages) || 1);
        } catch (error) {
            console.log(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetLocalCategory(currentPage);
    }, [currentPage, id]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center flex-wrap gap-[20px] justify-between mb-4">
                <Typography variant="h2" className="text-gray-900 dark:text-gray-100 font-bold">
                    {t('Product')}
                </Typography>
                <FactoryProductCreate refresh={GetLocalCategory} />
            </div>

            {loading ? (
                <Loading />
            ) : products.length > 0 ? (
                <Card className="bg-white dark:bg-gray-800 shadow">
                    <CardBody className="p-0">
                        <table className="w-full table-auto">
                            <thead className="bg-gray-100 dark:bg-gray-700 ">
                                <tr>
                                    <th className="px-4 py-3 text-left rounded rounded-tl-[10px] text-gray-900 dark:text-gray-100 font-semibold">
                                        {t("Name")}
                                    </th>
                                    <th className="px-4 py-3 rounded-tr-[10px] text-right text-gray-900 dark:text-gray-100 font-semibold">
                                        {t("Action")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            {product.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">

                                                <FactoryCategoryDelete
                                                    id={product?.id}
                                                    refresh={() => GetLocalCategory(currentPage)}
                                                />
                                                <FactoryCategoryEdit
                                                    oldData={product}
                                                    refresh={() => GetLocalCategory(currentPage)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            ) : (
                <EmptyData text={t(`Empty_data`)} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <Button
                        color="blue"
                        size="sm"
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button
                        color="blue"
                        size="sm"
                        variant="outlined"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
