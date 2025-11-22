import { Button, Typography, Card, CardBody } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";
import FactoryProductDelete from "./_component/FactoryProductDelete";
import FactoryProductEditModal from "./_component/FactoryProductEdit";

export default function FactoryLocalProduct() {
    const { t } = useTranslation();
    const location_id = Cookies.get("ul_nesw");

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const GetAllLocalProduct = async (page = 1) => {
        setLoading(true);
        try {
            const data = { id: location_id, page };
            const response = await LocalProduct?.GetProduct(data);
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
        GetAllLocalProduct(currentPage);
    }, [currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className=" bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex items-center flex-wrap gap-[20px] justify-between mb-4">
                <Typography variant="h2" className="text-gray-900 dark:text-gray-100 font-bold">
                    {t('Product')}
                </Typography>
                <NavLink to={`/factory/product/create`}>
                    <Button color="blue">{t('Add')}</Button>
                </NavLink>
            </div>
            {loading ? (
                <Loading />
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                        <Card
                            key={product.id}
                            className="bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow"
                        >
                            <CardBody>
                                <div className="flex items-start flex-wrap justify-between gap-[20px]">
                                    <Typography variant="h6" className="text-gray-900 max-w-[300px] dark:text-gray-100 font-semibold">
                                        {product.name}
                                    </Typography>
                                    <div className="flex items-center gap-[10px]">
                                        <FactoryProductDelete id={product?.id} refresh={() => GetAllLocalProduct(currentPage)} />
                                        <FactoryProductEditModal oldData={product} refresh={() => GetAllLocalProduct(currentPage)} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyData text={t(`Empty_data`)} />
            )}

            {/* Pagination с иконками */}
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
