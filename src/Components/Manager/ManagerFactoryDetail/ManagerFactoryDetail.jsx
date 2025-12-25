import { useEffect, useState } from "react";
import { location } from "../../../utils/Controllers/location";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
    Store,
    MapPin,
    Phone,
    Wallet,
    ChevronLeft,
    ChevronRight,
    Package,
    Layers
} from "lucide-react";
import { Button } from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import WarehouseCreate from "./_components/WarehouseCreate";
import WarehouseDelete from "./_components/WarehouseDelete";
import WarehouseEdit from "./_components/WarehouseEdit";

export default function ManagerFactoryDetail() {
    const { id } = useParams();
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

            setWarehouses(response.data.data?.records || []);
            setTotalPages(response.data.data?.pagination?.total_pages || 1);
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

    const formatNumber = (num) => {
        if (num === null || num === undefined) return "—";
        return Number(num).toLocaleString("ru-RU");
    };

    return (
        <div className="w-full text-gray-900 dark:text-gray-100">
            {/* TITLE */}
            <div className="flex items-center mb-5 justify-between">
                <div className="flex items-center gap-2">
                   <Button onClick={() => navigate(-1)} className="p-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </Button>
                    <h1 className="text-2xl font-bold">Складлар</h1>
                </div>
                <WarehouseCreate refresh={getWarehouse} />
            </div>

            {/* LIST */}
            <div className="flex flex-col gap-4">
                {warehouses.map((item) => {
                    const isMain = item.location_data?.some(
                        (loc) => loc.key === "main"
                    );

                    return (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-[#1E1E22]
                            border border-gray-200 dark:border-gray-700
                            rounded-xl p-5 shadow-sm hover:shadow-md transition"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Store className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-lg font-semibold">
                                            {item.name}
                                        </h2>
                                    </div>

                                    {isMain && (
                                        <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-600 text-white">
                                            Основной склад
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <WarehouseDelete
                                        warehouseId={item.id}
                                        refresh={getWarehouse}
                                    />
                                    <WarehouseEdit
                                        warehouse={item}
                                        refresh={getWarehouse}
                                    />
                                </div>
                            </div>

                            {/* INFO */}
                            <div className="space-y-2 mt-4 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{item.address || "—"}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{item.phone || "—"}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Wallet className="w-4 h-4" />
                                    <span>{formatNumber(item.balance)} uzs</span>
                                </div>
                            </div>

                            {/* ACTIONS BOTTOM */}
                            <div className="flex justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <NavLink to={`/manager/factory/warehouse/${id}/${item?.id}`}
                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <Package size={18} />
                                    Mahsulot
                                </NavLink>
{/* 
                                <NavLink
                                    to={`/manager/factory/warehouse-material/${id}/${item?.id}`}
                                    className="flex items-center gap-2 text-green-600 hover:underline"
                                >
                                    <Layers size={18} />
                                    Materialar
                                </NavLink> */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                    <ChevronLeft size={16} /> Назад
                </button>

                <span className="font-semibold">
                    {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                    Далее <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
