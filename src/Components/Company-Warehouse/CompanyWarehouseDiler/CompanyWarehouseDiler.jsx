import { Building2, User, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";
// import WarehouseCreate from "./_components/WarehouseCreate";
import { WarehouseApi } from "../../../utils/Controllers/WarehouseApi";
import { Alert } from "../../../utils/Alert";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";

import { Button } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import EmptyData from "../../UI/NoData/EmptyData";
import CompanyWarehouseDilerCreate from "./_components/CompanyWarehouseDilerCreate";
import CompanyWarehouseEdit from "./_components/CompanyWarehouseEdit";
import CompanyWarehouseDilerDelete from "./_components/CompanyWarehouseDilerDelete";


export default function CompanyWarehouseDiler() {
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const parent_id = Cookies.get('ul_nesw');

    const GetAll = async (pageNumber = 1) => {
        if (!parent_id) return Alert("Parent ID topilmadi", "error");
        setLoading(true);
        try {
            const response = await WarehouseApi.WarehouseGetAll({ id: parent_id, page: pageNumber });
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};
            const filtered = records.filter(w => w.type !== "other" && w.type !== "disposal");
            setWarehouses(filtered);
            setTotalPages(Number(pagination.total_pages) || 1);
            setPage(Number(pagination.currentPage) || pageNumber);
            setTotalCount(Number(pagination.total_count) || filtered.length);
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        GetAll(page);
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Qurilish nuqtalari Maʼlumotlari
                </h1>
                <CompanyWarehouseDilerCreate refresh={() => GetAll(page)} />
            </div>
            {warehouses?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((w) => (
                            <div key={w.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <Building2 className="w-6 h-6 text-gray-700" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-800">{w.name}</h2>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <CompanyWarehouseEdit refresh={() => GetAll(page)} warehouse={w} />
                                        <CompanyWarehouseDilerDelete refresh={() => GetAll(page)} warehouseId={w?.id} />
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
                                    {/* <div className="flex flex-col md:flex-row gap-3">
                                        <NavLink to={`/company/warehouse/user/${w?.id}`} className="flex-1">
                                            <Button className="w-full flex items-center justify-center gap-2">
                                                <User size={18} />
                                                Users
                                            </Button>
                                        </NavLink>
                                        <NavLink to={`/company/warehouse/${w?.id}`} className="flex-1">
                                            <Button className="w-full flex items-center justify-center gap-2">
                                                <Building2 size={18} />
                                                Detail
                                            </Button>
                                        </NavLink>
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination только если больше 15 записей */}
                    {totalCount > 15 && (
                        <div className="flex justify-center mt-6 gap-4">
                            <button
                                onClick={() => GetAll(page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="flex items-center px-2"> {page} / {totalPages}</span>
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
                <EmptyData text={'Qurilish nuqtasi mavjud emas'} />
            )}
        </div>
    );
}
