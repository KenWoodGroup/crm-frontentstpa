import {
    Building2,
    User,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { Alert } from "../../../utils/Alert";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import { Button, Input } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseDilerCreate from "./_components/WarehouseDilerCreate";
import WarehouseDilerDelete from "./_components/WarehouseDilerDelete";
import WarehouseDilerEdit from "./_components/WarehouseDilerEdit";
import { Clients } from "../../../utils/Controllers/Clients";

export default function WarehouseDiler() {
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchValue, setSearchValue] = useState("");

    const parent_id = Cookies.get("ul_nesw");

    const GetAll = async (pageNumber = 1, searchTerm = searchValue) => {
        if (!parent_id) return Alert("Parent ID topilmadi", "error");
        setLoading(true);

        try {
            const data = {
                type: "dealer",
                page: pageNumber,
                search: searchTerm.trim() === "" ? "all" : searchTerm,
                location_id: parent_id,
                date: new Date().toISOString(), // <-- дата для backend
            };

            const response = await Clients?.GetClients(data);
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};

            setWarehouses(records);
            setTotalPages(Number(pagination.total_pages) || 1);
            setPage(Number(pagination.current_page) || pageNumber);
            setTotalCount(Number(pagination.total_count) || records.length);
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAll(1);
    }, []);

    // поиск при изменении
    useEffect(() => {
        const delay = setTimeout(() => {
            GetAll(1, searchValue);
        }, 500); // задержка для удобства
        return () => clearTimeout(delay);
    }, [searchValue]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Diler Maʼlumotlari
                </h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64 bg-[white]">
                        <Input
                            label="Qidiruv..."
                            icon={<Search className="text-gray-500" size={18} />}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    <WarehouseDilerCreate refresh={() => GetAll(page)} />
                </div>
            </div>

            {warehouses?.length > 0 ? (
                <>
                    {/* Warehouse Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((w) => (
                            <div
                                key={w.id}
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <Building2 className="w-6 h-6 text-gray-700" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {w.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <WarehouseDilerEdit
                                            refresh={() => GetAll(page)}
                                            diler={w}
                                        />
                                        <WarehouseDilerDelete
                                            refresh={() => GetAll(page)}
                                            dilerId={w?.id}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <span>{w.users?.[0]?.email || "—"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <span>{w.address}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        <span>{w.phone}</span>
                                    </div>

                                    {/* Дата создания */}
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <span className="font-medium">Yaratilgan sana:</span>
                                        <span>
                                            {new Date(w.createdAt).toLocaleDateString("uz-UZ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalCount > 15 && (
                        <div className="flex justify-center mt-6 gap-4">
                            <button
                                onClick={() => GetAll(page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="flex items-center px-2">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => GetAll(page + 1)}
                                disabled={page >= totalPages}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={"Diler mavjud emas"} />
            )}
        </div>
    );
}
