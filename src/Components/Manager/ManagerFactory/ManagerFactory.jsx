import { useEffect, useState, useCallback } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { location } from "../../../utils/Controllers/location";
import ManagerFactoryCreate from "./_components/ManagerFactoryCreate";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import ManagerFactoryDelete from "./_components/ManagerFactoryDelete";
import ManagerFactoryEdit from "./_components/ManagetFactoryEdit";
import ManagerDealerDelete from "../ManagerDealer/_components/ManagerDealerDelete";

export default function ManagerFactory() {
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [factories, setFactories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const GetAllFactory = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);
        try {
            const data = { type: "factory", page: pageNum };
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
        <div className="min-h-screen text-gray-900 dark:text-gray-100">
            {/* 🔹 Сарлавҳа */}
            <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-semibold">
                    Fabrikalar
                </Typography>
                <ManagerFactoryCreate refresh={refresh} />
            </div>
            {factories?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {factories.map((factory, index) => (
                            <Card
                                key={`${factory.id}-${index}`}
                                className="p-4 border border-gray-200 shadow-sm hover:shadow-md bg-[white] transition-all dark:bg-background-dark dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <Typography variant="h6" className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                        {factory.name}
                                    </Typography>
                                    <div className="flex items-center gap-[10px]">
                                        <ManagerDealerDelete id={factory.id} refresh={refresh} />
                                        <ManagerFactoryEdit data={factory} refresh={refresh} />
                                    </div>
                                </div>
                                <Typography className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                                    <span className="font-medium">Manzil:</span> {factory.address || "—"}
                                </Typography>
                                <Typography className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                                    <span className="font-medium">Telefon:</span> {factory.phone || "—"}
                                </Typography>
                                <Typography className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                                    <span className="font-medium">Login:</span> {factory?.users[0]?.username || "—"}
                                </Typography>
                            </Card>
                        ))}
                    </div>

                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="sm"
                                onClick={loadNextPage}
                                disabled={loadingMore}
                                className="rounded-full border-gray-400 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
