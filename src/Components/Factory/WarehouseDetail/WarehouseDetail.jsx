import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WarehouseApi } from "../../../utils/Controllers/WarehouseApi";
import Loading from "../../UI/Loadings/Loading";
import { Alert } from "../../../utils/Alert";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { User, Mail, MapPin, Phone, CalendarDays, Building, IdCard } from "lucide-react";

export default function WarehouseDetail() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [warehouse, setWarehouse] = useState(null);
    const [dealers, setDealers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const GetDetail = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await WarehouseApi.WarehouseGetAll({ id, page: pageNumber });
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};

            if (records.length > 0) {
                const warehouseData = records[0];
                setWarehouse(warehouseData);
                setDealers(warehouseData.children || []);
                setPage(Number(pagination.currentPage) || 1);
                setTotalPages(Number(pagination.total_pages) || 1);
                setTotalCount(Number(pagination.total_count) || records.length);
            } else {
                setWarehouse(null);
                setDealers([]);
            }
        } catch (error) {
            console.log("Xatolik:", error);
            Alert("Ma'lumotlarni yuklashda xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetDetail(page);
    }, [id]);

    if (loading) return <Loading />;

    if (!warehouse) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Typography variant="h5" className="text-center text-gray-600">
                    Sklad ma'lumotlari topilmadi ❌
                </Typography>
            </div>
        );
    }

    return (
        <div className="space-y-6  mx-auto">
            {/* Основная информация о складе */}
            <Card className="shadow-lg rounded-2xl border border-gray-200">
                <CardBody className="space-y-6">
                    {/* Заголовок */}
                    <div className="flex items-center gap-3 mb-4">
                        <Building className="w-8 h-8 text-blue-600" />
                        <Typography variant="h4" className="font-bold text-gray-900">
                            Sklad Ma'lumotlari
                        </Typography>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Левая колонка - основная информация */}
                        <div className="space-y-4"> 
                            <div className="flex items-center gap-2 text-gray-700">
                                <Building className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Nomi
                                    </Typography>
                                    <Typography className="font-semibold">
                                        {warehouse.name}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <Building className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Turi
                                    </Typography>
                                    <Typography className="capitalize">
                                        {warehouse.type}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Manzil
                                    </Typography>
                                    <Typography>{warehouse.address || "—"}</Typography>
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка - контактная информация */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Telefon
                                    </Typography>
                                    <Typography>{warehouse.phone || "—"}</Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Email
                                    </Typography>
                                    <Typography>{warehouse.email || "—"}</Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarDays className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Yaratilgan sana
                                    </Typography>
                                    <Typography>
                                        {new Date(warehouse.createdAt).toLocaleDateString("uz-UZ", {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarDays className="w-5 h-5 text-blue-500" />
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Yangilangan sana
                                    </Typography>
                                    <Typography>
                                        {new Date(warehouse.updatedAt).toLocaleDateString("uz-UZ", {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Информация о родительском складе (если есть) */}
                    {warehouse.parent && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Typography variant="h6" className="font-semibold text-gray-800 mb-3">
                                Bog'langan Sklad
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Nomi
                                    </Typography>
                                    <Typography className="font-semibold">
                                        {warehouse.parent.name}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Turi
                                    </Typography>
                                    <Typography className="capitalize">
                                        {warehouse.parent.type}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Email
                                    </Typography>
                                    <Typography>{warehouse.parent.email}</Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-500">
                                        Telefon
                                    </Typography>
                                    <Typography>{warehouse.parent.phone}</Typography>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Информация о пользователях склада */}
            {warehouse.users && warehouse.users.length > 0 && (
                <Card className="shadow-lg rounded-2xl border border-gray-200">
                    <CardBody className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-6 h-6 text-green-600" />
                            <Typography variant="h5" className="font-bold text-gray-900">
                                Sklad Foydalanuvchilari ({warehouse.users.length})
                            </Typography>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {warehouse.users.map((user) => (
                                <Card key={user.id} className="shadow-sm border border-gray-100">
                                    <CardBody className="space-y-3">
                                        <Typography variant="h6" className="font-semibold text-gray-800">
                                            {user.full_name}
                                        </Typography>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <Typography variant="small">{user.email}</Typography>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-700">
                                                <IdCard className="w-4 h-4 text-gray-500" />
                                                <Typography variant="small" className="capitalize">
                                                    {user.role}
                                                </Typography>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-700">
                                                <CalendarDays className="w-4 h-4 text-gray-500" />
                                                <Typography variant="small">
                                                    {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

        </div>
    );
}