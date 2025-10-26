import { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { location } from "../../../utils/Controllers/location";
import ManagerFactoryCreate from "./_components/ManagerFactoryCreate";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";

export default function ManagerFactory() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [factories, setFactories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const GetAllFactory = async (pageNum = 1, append = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = {
                type: "factory",
                page: pageNum,
            };
            const response = await location.GetFactory(data);

            const newFactories = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);

            if (append) {
                // 🔸 Янги саҳифани эскиларига қўшамиз
                setFactories((prev) => [...prev, ...newFactories]);
            } else {
       
                setFactories((prev) => {
                    const existingIds = new Set(prev.map((f) => f.id));
                    const uniqueNew = newFactories.filter((f) => !existingIds.has(f.id));
                    return [...prev, ...uniqueNew];
                });
            }
        } catch (error) {
            console.log("Fabrikalarni olishda xatolik:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        GetAllFactory(1);
    }, []);

    // 🔹 Кейинги саҳифани юклаш
    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages) {
            setPage(nextPage);
            GetAllFactory(nextPage, true);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen text-gray-900">
            {/* 🔹 Сарлавҳа */}
            <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-semibold">
                    Fabrikalar
                </Typography>
                {/* 🔹 Янги фабрика қўшиш */}
                <ManagerFactoryCreate refresh={() => GetAllFactory(page)} />
            </div>

            {factories?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {factories.map((factory, index) => (
                            <Card
                                key={`${factory.id}-${index}`}
                                className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                <Typography variant="h6" className="font-semibold text-gray-800 mb-2">
                                    {factory.name}
                                </Typography>
                                <Typography className="text-gray-600 text-sm mb-1">
                                    <span className="font-medium">Manzil:</span> {factory.address || "—"}
                                </Typography>
                                <Typography className="text-gray-600 text-sm mb-1">
                                    <span className="font-medium">Telefon:</span> {factory.phone || "—"}
                                </Typography>
                                <Typography className="text-gray-600 text-sm mb-1">
                                    <span className="font-medium">Email:</span> {factory.email || "—"}
                                </Typography>
                            </Card>
                        ))}
                    </div>

                    {/* 🔹 "Кўпроқ кўриш" тугмаси */}
                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore}
                                className="rounded-full border-gray-400 text-gray-800 hover:bg-gray-100"
                            >
                                {loadingMore ? "Yuklanmoqda..." : "Ko‘proq ko‘rsatish"}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text="Fabrikalar topilmadi" />
            )}
        </div>
    );
}
