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
import ClientsCreate from "./_components/ClientsCreate";
import { ClientsApi } from "../../../utils/Controllers/ClientsApi";
import Loading from "../../UI/Loadings/Loading";
import ClientDelete from "./_components/ClientDelete";
import ClientEdit from "./_components/ClientEdit";
import EmptyData from "../../UI/NoData/EmptyData";
import Cookies from "js-cookie";
import ClientPayment from "./_components/ClientPayment";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExelLocation from "../Import/ExelLocation";

export default function Clients() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total_pages: 1 });
    const navigate = useNavigate()


    const GetAllClient = async (searchValue = "all", currentPage = 1) => {
        setLoading(true);
        try {
            const data = {
                type: "client",
                page: currentPage,
                search: searchValue.trim() === "" ? "all" : searchValue,
                location_id: Cookies.get(`ul_nesw`)
            };
            const response = await ClientsApi?.GetClients(data);
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
                    {t('Clients')}
                </Typography>

                <div className="flex items-center gap-3">
                    <ExelLocation type="client"/>
                    <ClientsCreate refresh={() => GetAllClient(search, page)} />
                </div>
            </div>

            {/* Поиск */}
            <Card className="p-3 mb-5 bg-card-light dark:bg-card-dark transition-colors duration-300">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end justify-between gap-3">
                    <Input
                        label={t('Search_name')}
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
                        {t('Search')}
                    </Button>
                </form>
            </Card>

            {/* Если нет клиентов */}
            {clients.length <= 0 ? (
                <EmptyData text={t('Empty_data')} />
            ) : (
                <>
                    <Card className="overflow-hidden bg-card-light dark:bg-card-dark transition-colors duration-300">
                        <CardBody className="p-0 overflow-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Name')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Phone')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Address')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Client_type')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Balance')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('Created')}
                                        </th>
                                        <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                            {t('columnActions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client, index) => (
                                        <tr
                                            key={client.id}
                                            onClick={() => navigate(`/factory/client/${client.id}`)}
                                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-x border-gray-300 dark:border-gray-700 ${index === clients.length - 1
                                                ? "border-b border-gray-300 dark:border-gray-700"
                                                : ""
                                                } ${index % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-50/50 dark:bg-gray-800/50"
                                                }`}
                                        >
                                            <td
                                                className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700"
                                            >
                                                <span className=" font-medium ">
                                                    {client.name}
                                                </span>
                                            </td>

                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {client.phone}
                                            </td>

                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {client.address}
                                            </td>

                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {client.client_type?.name}
                                            </td>

                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                <span className="font-medium">
                                                    {Number(client.balance).toLocaleString()} UZS
                                                </span>
                                            </td>

                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>

                                            <td
                                                className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* ВАЖНО — останавливаем всплытие чтобы не срабатывал onClick TR */}
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <ClientEdit
                                                            id={client?.id}
                                                            data={client}
                                                            refresh={() => GetAllClient(search, page)}
                                                        />
                                                    </div>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <ClientDelete
                                                            id={client?.id}
                                                            refresh={() => GetAllClient(search, page)}
                                                        />
                                                    </div>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <ClientPayment
                                                            refresh={() => GetAllClient(search, page)}
                                                            client={client}
                                                        />
                                                    </div>
                                                </div>
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
