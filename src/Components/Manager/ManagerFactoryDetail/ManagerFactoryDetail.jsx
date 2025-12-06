import { useEffect, useState } from "react";
import { location } from "../../../utils/Controllers/location";
import { NavLink, useParams } from "react-router-dom";
import {
    Store,
    MapPin,
    Phone,
    Wallet,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@material-tailwind/react";
import Eye from "../../UI/Icons/Eye";
import Loading from "../../UI/Loadings/Loading";

export default function ManagerFactoryDetail() {
    const { id } = useParams();
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const getWarehouse = async () => {
        try {
            setLoading(true);
            const data = {
                parent_id: id,
                type: "warehouse",
                searchName: "all",
                page,
            };
            const response = await location.GetLocationByType(data);

            setWarehouses(response.data.data?.records);
            setTotalPages(response.data.data?.pagination.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getWarehouse();
    }, [page]);

    if (loading) return <Loading />;

    // функция для форматирования чисел через пробелы
    const formatNumber = (num) => {
        if (num === null || num === undefined) return "—";
        return Number(num).toLocaleString("ru-RU"); // 60000 -> 60 000
    };

    return (
        <div className="w-full text-gray-900 dark:text-gray-100">
            {/* Title */}
            <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-gray-100">
                Складлар
            </h1>

            {/* LIST */}
            <div className="flex flex-col gap-4">
                {warehouses.map((item) => (
                    <div
                        key={item.id}
                        className="w-full bg-white dark:bg-[#1E1E22] shadow-md 
                        dark:shadow-none border border-gray-200 dark:border-gray-700 
                        rounded-xl p-5 hover:shadow-lg dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]
                        transition"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-1">
                                <Store className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {item.name}
                                </h2>
                            </div>

                            <NavLink to={`/manager/factory/warehouse/${item?.parent?.id}/${item?.id}`}>
                                <Button className="bg-blue-600 text-white hover:bg-blue-700 p-[8px] rounded-lg">
                                    <Eye size={20} />
                                </Button>
                            </NavLink>
                        </div>

                        {/* Information */}
                        <div className="space-y-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                <p>{item.address}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <p>{item.phone}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <p>{formatNumber(item.balance)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="
                        flex items-center gap-1 px-4 py-2 border rounded-lg 
                        border-gray-300 dark:border-gray-600
                        bg-gray-50 dark:bg-[#2A2A2F]
                        hover:bg-gray-100 dark:hover:bg-[#333338]
                        disabled:opacity-35
                        transition
                    "
                >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                </button>

                <span className="font-semibold text-lg text-gray-900 dark:text-gray-200">
                    {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="
                        flex items-center gap-1 px-4 py-2 border rounded-lg 
                        border-gray-300 dark:border-gray-600
                        bg-gray-50 dark:bg-[#2A2A2F]
                        hover:bg-gray-100 dark:hover:bg-[#333338]
                        disabled:opacity-35
                        transition
                    "
                >
                    Далее
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
