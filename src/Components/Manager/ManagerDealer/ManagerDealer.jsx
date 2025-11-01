import { useCallback, useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { location } from "../../../utils/Controllers/location";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import ManagerDealerCreate from "./_components/ManagerDealerCreate";
import ManagerFactoryDelete from "../ManagerFactory/_components/ManagerFactoryDelete";
import ManagerFactoryEdit from "../ManagerFactory/_components/ManagetFactoryEdit";
import ManagerDealerEdit from "./_components/ManagerDealerEdit";

export default function ManagerDealer() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [factories, setFactories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const GetAllFactory = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const data = { type: "independent", page: pageNum };
            const response = await location.GetFactory(data);

            const newFactories = response?.data?.data?.records || [];
            const total = Number(response?.data?.data?.pagination?.total_pages || 0);

            setTotalPages(total);

            // 🔹 Если append=false, просто заменяем старые данные (чистое обновление)
            if (!append) {
                setFactories(newFactories);
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
    }, []);

    // 🔹 При первом рендере
    useEffect(() => {
        GetAllFactory(1);
    }, [GetAllFactory]);

    // 🔹 Загрузка следующей страницы
    const loadNextPage = () => {
        const nextPage = page + 1;
        if (nextPage <= totalPages) {
            setPage(nextPage);
            GetAllFactory(nextPage, true);
        }
    };

    // 🔹 Функция refresh для передачи в дочерние компоненты
    const refresh = useCallback(() => {
        setPage(1);
        GetAllFactory(1);
    }, [GetAllFactory]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen text-gray-900">
            {/* 🔹 Сарлавҳа */}
            <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-semibold">
                    Dealer
                </Typography>
                <ManagerDealerCreate refresh={refresh} />
            </div>

            {factories?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {factories.map((factory, index) => (
                            <Card
                                key={`${factory.id}-${index}`}
                                className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <Typography variant="h6" className="font-semibold text-gray-800 mb-2">
                                        {factory.name}
                                    </Typography>
                                    <div className="flex items-center gap-[10px]">
                                        <ManagerFactoryDelete id={factory.id} refresh={refresh} />
                                        <ManagerDealerEdit data={factory} refresh={refresh} />
                                    </div>
                                </div>
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
