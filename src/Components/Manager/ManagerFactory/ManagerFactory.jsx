import { useEffect, useState, useCallback } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { location } from "../../../utils/Controllers/location";
import ManagerFactoryCreate from "./_components/ManagerFactoryCreate";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import ManagerFactoryEdit from "./_components/ManagetFactoryEdit";
import ManagerDealerDelete from "../ManagerDealer/_components/ManagerDealerDelete";
import { NavLink } from "react-router-dom";
import Eye from "../../UI/Icons/Eye";

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

            if (!append) {
                setFactories(newFactories);
            } else {
                setFactories((prev) => {
                    const existingIds = new Set(prev.map((f) => f.id));
                    const unique = newFactories.filter((f) => !existingIds.has(f.id));
                    return [...prev, ...unique];
                });
            }
        } catch (error) {
            console.log("Factory fetch error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        GetAllFactory(1);
    }, [GetAllFactory]);

    const loadNextPage = () => {
        const next = page + 1;
        if (next <= totalPages) {
            setPage(next);
            GetAllFactory(next, true);
        }
    };

    const refresh = useCallback(() => {
        setPage(1);
        GetAllFactory(1);
    }, [GetAllFactory]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between mb-8">
                <Typography variant="h4" className="font-semibold">
                    Fabrikalar
                </Typography>

                <ManagerFactoryCreate refresh={refresh} />
            </div>

            {factories?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                        {factories.map((factory, index) => (
                            <Card
                                key={`${factory.id}-${index}`}
                                className="p-4 shadow-md border border-gray-200 bg-white 
                                           dark:bg-[#1E1E22] dark:border-gray-700 
                                           hover:shadow-lg transition-all rounded-xl"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Typography
                                        variant="h6"
                                        className="font-semibold text-gray-800 dark:text-gray-100"
                                    >
                                        {factory.name}
                                    </Typography>

                                    <div className="flex items-center gap-2">
                                        <NavLink to={`/manager/factory/${factory.id}`}>
                                            <Button className="bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-lg shadow-sm">
                                                <Eye size={20} />
                                            </Button>
                                        </NavLink>

                                        <ManagerDealerDelete id={factory.id} refresh={refresh} />
                                        <ManagerFactoryEdit data={factory} refresh={refresh} />
                                    </div>
                                </div>

                                {/* Info (only real fields) */}
                                <div className="space-y-1">
                                    <Typography className="text-gray-700 dark:text-gray-300 text-sm">
                                        <span className="font-medium">Manzil:</span> {factory.address || "—"}
                                    </Typography>

                                    <Typography className="text-gray-700 dark:text-gray-300 text-sm">
                                        <span className="font-medium">Telefon:</span> {factory.phone || "—"}
                                    </Typography>

                                    <Typography className="text-gray-700 dark:text-gray-300 text-sm">
                                        <span className="font-medium">Balans:</span> {factory.balance} uzs
                                    </Typography>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {page < totalPages && (
                        <div className="flex justify-center mt-6">
                            <Button
                                color="gray"
                                variant="outlined"
                                size="md"
                                onClick={loadNextPage}
                                disabled={loadingMore}
                                className="rounded-full border-gray-400 text-gray-800 
                                           dark:text-gray-200 dark:border-gray-600 
                                           hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
