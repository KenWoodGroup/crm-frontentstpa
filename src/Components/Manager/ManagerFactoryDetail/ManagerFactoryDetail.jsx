import { useEffect, useState } from "react";
import { location } from "../../../utils/Controllers/location";
import { NavLink, useParams } from "react-router-dom";
import {
    Store,
    MapPin,
    Phone,
    Wallet,
    Building2,
    Users,
    User,
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

    if (loading) {
        return (
            <Loading />
        )
    }
    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-5 text-black">Склады</h1>

            <div className="flex flex-col gap-4">
                {warehouses.map((item) => (
                    <div
                        key={item.id}
                        className="w-full bg-white shadow-md border rounded-xl p-5 hover:shadow-lg transition"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-1">
                                <Store className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-black">{item.name}</h2>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <NavLink to={`/manager/factory/warehouse/${item?.parent?.id}/${item?.id}`}>
                                    <Button
                                        className="bg-blue-600 text-white hover:bg-blue-700 normal-case p-[8px]"
                                    >
                                        <Eye size={20} />
                                    </Button>
                                </NavLink>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mt-3 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                                <p>{item.address}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <p>{item.phone}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-gray-500" />
                                <p>{item.balance}</p>
                            </div>
                        </div>



                        {/* Users */}
                        {item.users?.length > 0 && (
                            <div className="mt-4 border-t pt-3">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    <p className="font-medium">Пользователи</p>
                                </div>

                                <div className="space-y-1 ml-6">
                                    {item.users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >
                                            <User className="w-4 h-4 text-gray-500" />
                                            <p>{user.full_name} — {user.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                </button>

                <span className="font-semibold text-lg">
                    {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                >
                    Далее
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
