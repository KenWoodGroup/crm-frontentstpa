import { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import { Stock } from "../../utils/Controllers/Stock";
import Cookies from "js-cookie";
import Loading from "../UI/Loadings/Loading";
import EmptyData from "../UI/NoData/EmptyData";

export default function WarehouseProduct() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const GetAllProduct = async (page = 1) => {
        setLoading(true);
        try {
            const response = await Stock.StockGetByLocationId({
                id: Cookies?.get("ul_nesw"),
                page: page,
            });


            setTotalPages(Number(response?.data?.pagination?.total_pages || 1));
            setProducts(response?.data?.data?.records || []);
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
            <div className="flex items-center justify-between mb-5">
                <Typography variant="h4" className="font-semibold">
                    Ombordagi Mahsulotlar
                </Typography>

                <NavLink to={"/warehouse/barcode/create"}>
                    <Button>Barcode qo‘shish</Button>
                </NavLink>
            </div>

            {products?.length > 0 ? (
                <>
                    <Card className="overflow-x-auto shadow-sm border border-gray-200">
                        <table className="w-full min-w-max table-auto text-left">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-4 font-semibold text-gray-700">№</th>
                                    <th className="p-4 font-semibold text-gray-700">Mahsulot nomi</th>
                                    <th className="p-4 font-semibold text-gray-700">Narxi</th>
                                    <th className="p-4 font-semibold text-gray-700">Soni</th>
                                    <th className="p-4 font-semibold text-gray-700">Barcode</th>
                                    <th className="p-4 font-semibold text-gray-700 text-center">
                                        Amallar
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="p-4 text-gray-700">{index + 1}</td>
                                        <td className="p-4 text-gray-900 font-medium">
                                            {item.product?.name}
                                        </td>
                                        <td className="p-4 text-gray-700">
                                            {item.price ? `${item.price} so‘m` : "—"}
                                        </td>
                                        <td className="p-4 text-gray-700">{item.quantity}</td>
                                        <td className="p-4 text-gray-700">{item.barcode}</td>
                                        <td className="p-4 text-center">
                                            <Button
                                                size="sm"
                                                variant="outlined"
                                                color="blue"
                                                className="rounded-lg"
                                                onClick={() => console.log("Narx o‘zgartirish:", item.id)}
                                            >
                                                Narx o‘zgartirish
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    {page < totalPages && (
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
                </>
            ) : (
                <EmptyData text={"Omborda mahsulot mavjud emas"} />
            )}
        </div>
    );
}
