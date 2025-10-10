import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Typography,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ProductApi } from "../../../utils/Controllers/ProductAPi";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";

export default function WarehouseBarcodeCreate() {
    const [miniCategories, setMiniCategories] = useState([]);
    const [openAccordions, setOpenAccordions] = useState([]);
    const [productsData, setProductsData] = useState({});
    const [loading, setLoading] = useState(true)

    const GetMiniCategory = async () => {
        setLoading(true)
        try {
            const response = await ProductApi?.GetMiniCategoryById(
                Cookies.get("usd_nesw")
            );
            setMiniCategories(response?.data || []);
        } catch (error) {
            console.log("Mini kategoriyalarni yuklashda xato:", error);
        } finally {
            setLoading(false)
        }
    };

    const GetProductBySubCategory = async (subCategoryId) => {
        try {
            const response = await ProductApi?.GetProductBySubCategory(subCategoryId);
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

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className=" mx-auto">
                <Typography
                    variant="h2"
                    className="mb-6 text-gray-900 font-bold text-left"
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
                                className="bg-white  py-[10px] border border-gray-200 !border-b-none rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md"
                            >
                                <AccordionHeader
                                    onClick={() => handleAccordion(category.id)}
                                    className="flex justify-between items-center px-5 py-3 border-none cursor-pointer relative select-none"
                                >
                                    <Typography className="font-semibold text-gray-800">
                                        {category.name}
                                    </Typography>

                                    <ChevronDownIcon
                                        className={`h-5 w-5 text-gray-600 absolute right-[20px] transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : ""
                                            }`}
                                    />
                                </AccordionHeader>

                                <AccordionBody className="px-5 py-3 bg-gray-50  !border-b-none border-gray-200">
                                    {productsData[category.id] ? (
                                        productsData[category.id].length > 0 ? (
                                            <div className="space-y-2">
                                                {productsData[category.id].map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="px-3 py-[20px] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
                                                    >
                                                        <Typography
                                                            variant="small"
                                                            className="font-medium text-gray-900"
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Typography
                                                variant="small"
                                                className="text-gray-500 italic"
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
