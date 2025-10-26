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
import WarehouseClientsCreate from "./_components/WarehouseClientsCreate";
import { Clients } from "../../../utils/Controllers/Clients";
import Loading from "../../UI/Loadings/Loading";
import WarehouseClientDelete from "./_components/WarehouseClientDelete";
import WarehouseClientEdit from "./_components/WarehouseClientEdit";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseClientPayment from "./_components/WarehouseClientPayment";
import { NavLink } from "react-router-dom";

export default function WarehouseClients() {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total_pages: 1 });

    const GetAllClient = async (searchValue = "all", currentPage = 1) => {
        setLoading(true);
        try {
            const data = {
                type: "client",
                page: currentPage,
                search: searchValue.trim() === "" ? "all" : searchValue,
            };
            const response = await Clients?.GetClients(data);
            setClients(response?.data?.data?.records || []);
            setPagination(response?.data?.data?.pagination || { total_pages: 1 });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAllClient(search, page);
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        GetAllClient(search, 1);
    };

    const handleDelete = (id) => {
        if (window.confirm("Вы уверены, что хотите удалить этого клиента?")) {
            console.log("Удаляем клиента с ID:", id);
            // await axios.delete(`/client/${id}`)
        }
    };

    const handleEdit = (client) => {
        console.log("Редактировать клиента:", client);
        // тут можно открыть модал для редактирования
    };

    const handlePayment = (client) => {
        console.log("Открыть окно оплаты клиента:", client);
        // можно открыть модал для внесения оплаты
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Клиенты
                </Typography>
                <WarehouseClientsCreate refresh={() => GetAllClient(search, page)} />
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

            {/* Если нет клиентов */}
            {clients.length <= 0 ? (
                <EmptyData text={'Клиентов нет'} />
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
                                        <th className="p-3">Баланс</th>
                                        <th className="p-3">Дата создания</th>
                                        <th className="p-3 text-center">Настройки</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client, index) => (
                                        <tr
                                            key={client.id}
                                            className={`${index % 2 === 0
                                                ? "bg-white"
                                                : "bg-blue-gray-50/50"
                                                } hover:bg-blue-gray-100 transition`}
                                        >
                                            <td className="p-3 font-medium">
                                                <NavLink className={`text-blue-600 hover:underline`} to={`/warehouse/client/${client?.id}`}>
                                                    {client.name}
                                                </NavLink>
                                            </td>
                                            <td className="p-3">{client.phone}</td>
                                            <td className="p-3">{client.address}</td>
                                            <td className="p-3">
                                                {Number(client.balance).toLocaleString()} so'm
                                            </td>
                                            <td className="p-3">
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <WarehouseClientEdit id={client?.id} data={client} refresh={() => GetAllClient(search, page)} />
                                                <WarehouseClientDelete id={client?.id} refresh={() => GetAllClient(search, page)} />
                                                <WarehouseClientPayment refresh={() => GetAllClient(search, page)} client={client} />
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
