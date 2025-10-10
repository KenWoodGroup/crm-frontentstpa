import { useEffect, useState } from "react";
import { ProductApi } from "../../utils/Controllers/ProductAPi";
import Loading from "../UI/Loadings/Loading";
import { Card, Typography, Button } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";

export default function WarehouseProduct() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const GetAllProduct = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await ProductApi.GetAllProduct(pageNumber);
            const newProducts = response?.data?.data?.records || [];

            setTotalPages(Number(response?.pagination?.total_pages || 1));

            // Yangi mahsulotlarni eski ro‘yxatga qo‘shish (Yana ko‘rish uchun)
            setProducts((prev) => [...prev, ...newProducts]);
        } catch (error) {
            console.log("Mahsulotlarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAllProduct(page);
    }, [page]);

    if (loading && products.length === 0) {
        return <Loading />;
    }

    return (
        <div className="text-black min-h-screen">
            <div className="flex items-center justify-between mb-[20px]">
                <Typography variant="h4" className="font-semibold ">
                    Ombordagi Mahsulotlar
                </Typography>

                <NavLink to={'/warehouse/barcode/create'}>
                    <Button>
                        Barcode qoshish
                    </Button>
                </NavLink>
            </div>

            {/* Jadval */}
            <Card className="overflow-x-auto shadow-sm border border-gray-200">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-4 font-semibold text-gray-700">№</th>
                            <th className="p-4 font-semibold text-gray-700">Mahsulot nomi</th>
                            <th className="p-4 font-semibold text-gray-700">Barcode</th>
                            <th className="p-4 font-semibold text-gray-700">Ammalar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item, index) => (
                            <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50 transition"
                            >
                                <td className="p-4 text-gray-700">{index + 1}</td>
                                <td className="p-4 text-gray-900 font-medium">{item.name}</td>
                                <td className="p-4 text-gray-700">{item.unit}</td>
                                <td className="p-4 text-gray-700">
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Pagination */}
            {page > totalPages && (
                <div className="flex justify-center mt-6">
                    <Button
                        color="gray"
                        variant="outlined"
                        size="sm"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={loading}
                        className="rounded-full border-gray-400 text-gray-800 hover:bg-gray-100"
                    >
                        {loading ? "Yuklanmoqda..." : "Yana ko‘rish"}
                    </Button>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
                <p>© 2025 Ombor tizimi. Barcha huquqlar himoyalangan.</p>
            </div>
        </div>
    );
}
