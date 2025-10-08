import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserApi } from "../../../utils/Controllers/UserApi";
import Loading from "../../UI/Loadings/Loading";
import { Alert } from "../../../utils/Alert";
import { Card, CardBody, Button } from "@material-tailwind/react";
import { User, Mail, CalendarDays, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import WarehouseUserCreate from "./_components/WarehouseUserCreate";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseUserDelete from "./_components/WarehouseUserDelete";
import WarehouseUserEdit from "./_components/WarehouseUserEdit";

export default function WarehouseUser() {
    const { id } = useParams(); 
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const GetUsers = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await UserApi.UserGet({ id, page: pageNumber });
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};

            setUsers(records);
            setPage(Number(pagination.currentPage) || pageNumber);
            setTotalPages(Number(pagination.total_pages) || 1);
            setTotalCount(Number(pagination.total_count) || records.length);
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetUsers(page);
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className="">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Ombor foydalanuvchilari</h1>
                <WarehouseUserCreate refresh={() => GetUsers(page)} />
            </div>
            {users?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((u) => (
                            <Card key={u.id} className="shadow-sm hover:shadow-md  transition rounded-2xl">
                                <CardBody className="space-y-3 pt-[5px]">
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-500" />
                                            <span className="font-medium text-gray-800">{u.full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4">
                                            <WarehouseUserEdit user={u} refresh={() => GetUsers(page)} />
                                            <WarehouseUserDelete id={u.id} refresh={() => GetUsers(page)} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-600">{u.email}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-600">{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</span>
                                    </div>

                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination только если больше 15 пользователей */}
                    {totalCount > 15 && (
                        <div className="flex justify-center mt-6 gap-4">
                            <Button
                                onClick={() => GetUsers(page - 1)}
                                disabled={page <= 1}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                <ChevronLeft size={18} /> Prev
                            </Button>
                            <span className="flex items-center px-2">
                                Page {page} / {totalPages}
                            </span>
                            <Button
                                onClick={() => GetUsers(page + 1)}
                                disabled={page >= totalPages}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next <ChevronRight size={18} />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={'Xodim mavjud emas'} />
            )}

        </div>
    );
}
