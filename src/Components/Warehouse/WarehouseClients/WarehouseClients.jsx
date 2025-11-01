import { useEffect, useState } from "react";
import {
    Typography,
    Input,
    Card,
    CardBody,
    Button,
    IconButton,
} from "@material-tailwind/react";
import { Search, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import WarehouseClientsCreate from "./_components/WarehouseClientsCreate";
import { Clients } from "../../../utils/Controllers/Clients";
import Loading from "../../UI/Loadings/Loading";
import WarehouseClientDelete from "./_components/WarehouseClientDelete";
import WarehouseClientEdit from "./_components/WarehouseClientEdit";
import EmptyData from "../../UI/NoData/EmptyData";
import Cookies from "js-cookie";
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
                location_id: Cookies.get(`ul_nesw`)
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

    if (loading) return <Loading />;

    return (
        <div
            className={`min-h-screen transition-colors duration-300
            bg-background-light text-text-light
            dark:bg-background-dark dark:text-text-dark`}
        >
            {/* Заголовок и кнопки */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Клиенты
                </Typography>

                <div className="flex items-center gap-3">
                    <WarehouseClientsCreate refresh={() => GetAllClient(search, page)} />
                </div>
            </div>

            {/* Поиск */}
            <Card className="p-3 mb-5 bg-card-light dark:bg-card-dark transition-colors duration-300">
                <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
                    <Input
                        label="Поиск по имени"
                        icon={<Search />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Button color={'blue'} type="submit">
                        Поиск
                    </Button>
                </form>
            </Card>

            {/* Если нет клиентов */}
            {clients.length <= 0 ? (
                <EmptyData text="Клиентов нет" />
            ) : (
                <>
                    <Card className="overflow-hidden bg-card-light dark:bg-card-dark transition-colors duration-300">
                        <CardBody className="p-0 overflow-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="bg-blue-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
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
                                                ? "bg-white dark:bg-gray-900"
                                                : "bg-blue-gray-50/50 dark:bg-gray-800"
                                                } hover:bg-blue-gray-100 dark:hover:bg-gray-700 transition`}
                                        >
                                            <td className="p-3 font-medium">
                                                <NavLink
                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                    to={`/warehouse/client/${client?.id}`}
                                                >
                                                    {client.name}
                                                </NavLink>
                                            </td>
                                            <td className="p-3 dark:text-text-dark">{client.phone}</td>
                                            <td className="p-3 dark:text-text-dark">{client.address}</td>
                                            <td className="p-3 dark:text-text-dark">
                                                {Number(client.balance).toLocaleString()} so'm
                                            </td>
                                            <td className="p-3 dark:text-text-dark">
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <WarehouseClientEdit
                                                    id={client?.id}
                                                    data={client}
                                                    refresh={() => GetAllClient(search, page)}
                                                />
                                                <WarehouseClientDelete
                                                    id={client?.id}
                                                    refresh={() => GetAllClient(search, page)}
                                                />
                                                <WarehouseClientPayment
                                                    refresh={() => GetAllClient(search, page)}
                                                    client={client}
                                                />
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

                            <Typography color="gray" className="mx-2 dark:text-gray-300">
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
