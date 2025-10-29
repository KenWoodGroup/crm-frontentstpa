import {
    Building2,
    User,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import WarehouseCreate from "./_components/WarehouseCreate";
import { WarehouseApi } from "../../../utils/Controllers/WarehouseApi";
import { Alert } from "../../../utils/Alert";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";
import WarehouseDelete from "./_components/WarehouseDelete";
import WarehouseEdit from "./_components/WarehouseEdit";
import { Button } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";
import EmptyData from "../../UI/NoData/EmptyData";
import { useTranslation } from "react-i18next";

export default function FactoryWarehouse() {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const parent_id = Cookies.get("ul_nesw");

    const GetAll = async (pageNumber = 1) => {
        if (!parent_id) return Alert(t("no_parent_id"), "error");
        setLoading(true);
        try {
            const response = await WarehouseApi.WarehouseGetAll({
                id: parent_id,
                page: pageNumber,
            });
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};

            const filtered = records.filter(
                (w) => w.type !== "other" && w.type !== "disposal"
            );

            setWarehouses(filtered);
            setTotalPages(Number(pagination.total_pages) || 1);
            setPage(Number(pagination.currentPage) || pageNumber);
            setTotalCount(Number(pagination.total_count) || filtered.length);
        } catch (error) {
            console.log(error);
            Alert(t("error_occurred"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAll(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen k text-text-light dark:text-text-dark transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold">
                    {t("warehouse_info")}
                </h1>
                <WarehouseCreate refresh={() => GetAll(page)} />
            </div>

            {warehouses?.length > 0 ? (
                <>
                    {/* Warehouse Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((w) => (
                            <div
                                key={w.id}
                                className="bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 hover:shadow-md transition-colors duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                            <Building2 className="w-6 h-6 text-text-light dark:text-text-dark" />
                                        </div>
                                        <h2 className="text-xl font-semibold">
                                            {w.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <WarehouseEdit
                                            refresh={() => GetAll(page)}
                                            warehouse={w}
                                        />
                                        <WarehouseDelete
                                            refresh={() => GetAll(page)}
                                            warehouseId={w?.id}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 opacity-70" />
                                        <span>{w?.email || "—"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 opacity-70" />
                                        <span>{w.address}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 opacity-70" />
                                        <span>{w.phone}</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3">
                                        <NavLink
                                            to={`/factory/warehouse/user/${w?.id}`}
                                            className="flex-1"
                                        >
                                            <Button className="w-full flex items-center justify-center gap-2 bg-background-dark dark:bg-background-light  dark:text-text-light  text-white transition-colors">
                                                <User size={18} />
                                                {t("users")}
                                            </Button>
                                        </NavLink>
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
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="flex items-center px-2">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => GetAll(page + 1)}
                                disabled={page >= totalPages}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={t("no_warehouses")} />
            )}
        </div>
    );
}
