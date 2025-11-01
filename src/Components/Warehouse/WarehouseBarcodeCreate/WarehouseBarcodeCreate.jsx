import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Typography,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import WarehouseBarcodeModal from "./_components/WarehouseBarcodeCreateModal";

export default function WarehouseBarcodeCreate() {
    const [miniCategories, setMiniCategories] = useState([]);
    const [openAccordions, setOpenAccordions] = useState([]);
    const [productsData, setProductsData] = useState({});
    const [loading, setLoading] = useState(true);

    const GetMiniCategory = async () => {
        setLoading(true);
        try {
            const response = await ProductApi?.GetMiniCategoryById(
                Cookies.get("usd_nesw")
            );
            setMiniCategories(response?.data || []);
        } catch (error) {
            console.log("Mini kategoriyalarni yuklashda xato:", error);
        } finally {
            setLoading(false);
        }
    };

    const GetProductBySubCategory = async (subCategoryId) => {
        try {
            const data = {
                subcategory_id: subCategoryId,
                location_id: Cookies?.get('ul_nesw')
            }
            const response = await ProductApi?.GetProductByLocationIdBySubCategory(data)
            setProductsData((prev) => ({
                ...prev,
                [subCategoryId]: response?.data || [],
            }));
        } catch (error) {
            console.log(`Mahsulotlarni yuklashda xato:`, error);
        }
    };

    const handleAccordion = (subCategoryId) => {
        setOpenAccordions((prev) => {
            const isOpen = prev.includes(subCategoryId);
            if (isOpen) {
                return prev.filter((id) => id !== subCategoryId);
            } else {
                if (!productsData[subCategoryId]) {
                    GetProductBySubCategory(subCategoryId);
                }
                return [...prev, subCategoryId];
            }
        });
    };

    useEffect(() => {
        GetMiniCategory();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark">
            <div className="mx-auto">
                <Typography
                    variant="h2"
                    className="mb-6 font-bold text-left text-gray-900 dark:text-text-dark"
                >
                    Mahsulotlar ro'yxati
                </Typography>

                <div className="space-y-4">
                    {miniCategories.map((category) => {
                        const isOpen = openAccordions.includes(category.id);
                        return (
                            <Accordion
                                key={category.id}
                                open={isOpen}
                                className="py-[10px] border border-card-light dark:border-card-dark rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md bg-card-light dark:bg-card-dark"
                            >
                                <AccordionHeader
                                    onClick={() => handleAccordion(category.id)}
                                    className="flex justify-between items-center px-5 py-3 border-none cursor-pointer relative select-none"
                                >
                                    <Typography className="font-semibold text-gray-800 dark:text-text-dark">
                                        {category.name}
                                    </Typography>

                                    <ChevronDownIcon
                                        className={`h-5 w-5 text-gray-600 dark:text-gray-400 absolute right-[20px] transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""}`}
                                    />
                                </AccordionHeader>

                                <AccordionBody className="px-5 py-3 bg-gray-50 dark:bg-background-dark !border-b-none border-card-light dark:border-card-dark">
                                    {productsData[category.id] ? (
                                        productsData[category.id].length > 0 ? (
                                            <div className="space-y-2">
                                                {productsData[category.id].map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="px-3 py-[10px] bg-card-light dark:bg-card-dark border border-card-light dark:border-card-dark flex items-center justify-between rounded-lg shadow-sm hover:shadow transition"
                                                    >
                                                        <Typography
                                                            variant="small"
                                                            className="font-medium text-gray-900 dark:text-text-dark"
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        <WarehouseBarcodeModal
                                                            refresh={() => GetProductBySubCategory(category.id)}
                                                            data={product}
                                                            productId={product?.id}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Typography
                                                variant="small"
                                                className="text-gray-500 dark:text-gray-400 italic"
                                            >
                                                Hozircha mahsulotlar yo‘q.
                                            </Typography>
                                        )
                                    ) : (
                                        <Loading />
                                    )}
                                </AccordionBody>
                            </Accordion>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
