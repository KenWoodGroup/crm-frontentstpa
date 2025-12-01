import { useEffect, useState } from "react";
import {
    Typography,
    Input,
    Card,
    CardBody,
    Button,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { Search, ChevronLeft, ChevronRight, Trash2, Edit, DollarSign } from "lucide-react";
import { Clients } from "../../../utils/Controllers/Clients";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import Cookies from "js-cookie";
import { NavLink } from "react-router-dom";
import WarehouseSupplierCreate from "./_components/WarehouseSupplierCreate";
import WarehouseSupplierDelete from "./_components/WarehouseSupplierDelete";
import WarehouseSupplierEdit from "./_components/WarehouseSupplierEdit";
import WarehouseSupplierPayment from "./_components/WarehouseSupplierPayment";

export default function WarehouseSupplier() {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total_pages: 1 });

    const GetAllSupplier = async (searchValue = "all", currentPage = 1) => {
        setLoading(true);
        try {
            const data = {
                type: "supplier",
                page: currentPage,
                search: searchValue.trim() === "" ? "all" : searchValue,
                location_id: Cookies.get(`ul_nesw`)
            };
            const response = await Clients?.GetClients(data);
            setSuppliers(response?.data?.data?.records || []);
            setPagination(response?.data?.data?.pagination || { total_pages: 1 });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAllSupplier(search, page);
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        GetAllSupplier(search, 1);
    };


    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Поставшики
                </Typography>
                <WarehouseSupplierCreate refresh={() => GetAllSupplier(search, page)} />
            </div>

            <Card className="p-3 mb-[20px]">
                <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-3 w-full"
                >
                    <Input
                        label="Поиск по имени"
                        icon={<Search />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button color="blue" type="submit">
                        Поиск
                    </Button>
                </form>
            </Card>

            {/* Если нет поставщиков */}
            {suppliers.length <= 0 ? (
                <EmptyData text={'Поставщиков нет'} />
            ) : (
                <>
                    {/* Таблица клиентов */}
                    <Card className="overflow-hidden">
                        <CardBody className="p-0 overflow-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="bg-blue-gray-50 text-gray-700">
                                        <th className="p-3">Имя</th>
                                        <th className="p-3">Телефон</th>
                                        <th className="p-3">Адрес</th>
                                        {/* <th className="p-3">Баланс</th> */}
                                        <th className="p-3">Дата создания</th>
                                        <th className="p-3 text-center">Настройки</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((supplier, index) => (
                                        <tr
                                            key={supplier.id}
                                            className={`${index % 2 === 0
                                                ? "bg-white"
                                                : "bg-blue-gray-50/50"
                                                } hover:bg-blue-gray-100 transition`}
                                        >
                                            <td className="p-3 font-medium">
                                                {supplier.name}
                                            </td>
                                            <td className="p-3">{supplier.phone}</td>
                                            <td className="p-3">{supplier.address}</td>
                                            {/* <td className="p-3">
                                                {Number(supplier.balance).toLocaleString()} so'm
                                            </td> */}
                                            <td className="p-3">
                                                {new Date(supplier.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <WarehouseSupplierEdit id={supplier?.id} data={supplier} refresh={() => GetAllSupplier(search, page)} />
                                                <WarehouseSupplierDelete id={supplier?.id} refresh={() => GetAllSupplier(search, page)} />
                                                <WarehouseSupplierPayment refresh={() => GetAllSupplier(search, page)} supplier={supplier} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>

                    {/* Пагинация */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-5">
                            <IconButton
                                variant="text"
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft />
                            </IconButton>

                            <Typography color="gray" className="mx-2">
                                Страница {page} из {pagination.total_pages}
                            </Typography>

                            <IconButton
                                variant="text"
                                onClick={() =>
                                    setPage((p) => Math.min(p + 1, pagination.total_pages))
                                }
                                disabled={page === pagination.total_pages}
                            >
                                <ChevronRight />
                            </IconButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
