import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    IconButton,
    Spinner,
} from "@material-tailwind/react";
import { FileDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { location } from "../../../utils/Controllers/location";
import Cookies from "js-cookie";
import { Payment } from "../../../utils/Controllers/Payment";
import Loading from "../../UI/Loadings/Loading";

export default function WarehouseSverka() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [history, setHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clientLoading, setClientLoading] = useState(true)

    // 🔹 Получаем первый и последний день текущего месяца
    const getCurrentMonthDates = () => {
        const now = new Date();
        // Добавляем смещение часового пояса для корректной даты
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Форматируем даты с учетом локального времени
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            start: formatDate(firstDay),
            end: formatDate(lastDay)
        };
    };

    // 🔹 Получаем клиентов из backend
    const getAllClient = async () => {
        setClientLoading(true)
        try {
            const response = await location.GetAllClients(Cookies?.get("usd_nesw"));
            if (response?.data) {
                setClients(response.data);
                if (response.data.length > 0) {
                    setSelectedClient(response.data[0]);
                    const dates = getCurrentMonthDates();
                    setStartDate(dates.start);
                    setEndDate(dates.end);
                }
            }
        } catch (error) {
            console.log("Ошибка при получении клиентов:", error);
        } finally {
            setClientLoading(false)
        }
    };

    useEffect(() => {
        getAllClient();
    }, []);

    // 🔹 Получаем сверку при выборе клиента или изменении страницы
    useEffect(() => {
        if (selectedClient && startDate && endDate) {
            getSverka(currentPage);
        }
    }, [selectedClient, currentPage]);

    const getSverka = async (page = 1) => {
        if (!selectedClient) return;

        try {
            setLoading(true);
            const data = {
                location_id: selectedClient.id,
                startDate: startDate,
                endDate: endDate,
                page: page
            };
            const response = await Payment.SverkaGet(data);

            if (response?.data) {
                setHistory(response.data.data?.records || []);
                setTotalPages(response.data.pagination?.total_pages || 1);
            }
        } catch (error) {
            console.log("Ошибка при получении сверки:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Обработчик изменения клиента
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setCurrentPage(1);
        const dates = getCurrentMonthDates();
        setStartDate(dates.start);
        setEndDate(dates.end);
    };

    // 🔹 Обработчик применения фильтра по датам
    const handleApplyFilter = () => {
        setCurrentPage(1);
        getSverka(1);
    };

    // 🔹 Фильтрация по имени клиента
    const filteredClients = clients.filter((client) =>
        client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">
            {/* 🔹 Левая часть — список клиентов с поиском */}
            <Card className="w-[30%] border border-gray-200 shadow-md overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <Typography variant="h5" className="font-semibold text-blue-gray-700">
                        Клиенты
                    </Typography>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <Input
                            label="Поиск"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>

                <CardBody className="p-0 overflow-y-auto">
                    {
                        clientLoading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <Spinner className="h-12 w-12" />
                            </div>
                        ) : (
                            <>
                                {filteredClients.length ? (
                                    filteredClients.map((client) => (
                                        <div
                                            key={client.id}
                                            onClick={() => handleClientSelect(client)}
                                            className={`p-3 cursor-pointer border-b hover:bg-blue-50 transition-all ${selectedClient?.id === client.id
                                                ? "bg-blue-100 font-semibold"
                                                : "bg-white"
                                                }`}
                                        >
                                            {client.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <Typography className="p-4 text-center text-gray-500">
                                            Не найдено
                                        </Typography>
                                    </div>
                                )}
                            </>
                        )
                    }

                </CardBody>
            </Card>
            <Card className="w-[70%] border border-gray-200 shadow-md flex flex-col">
                <CardBody className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                        <Typography variant="h5" className="font-semibold text-blue-gray-700">
                            {selectedClient
                                ? `История клиента: ${selectedClient.name}`
                                : "Выберите клиента"}
                        </Typography>

                        <div className="flex items-center gap-3">
                            <Input
                                type="date"
                                label="C даты"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white"
                                containerProps={{ className: "w-[150px]" }}
                            />
                            <Input
                                type="date"
                                label="По дату"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white"
                                containerProps={{ className: "w-[150px]" }}
                            />
                            <Button
                                color="blue"
                                onClick={handleApplyFilter}
                                className="w-[200px]! flex items-center justify-center"
                            >
                                Применить
                            </Button>
                            <Button color="green" className="w-[200px]! flex items-center justify-center">
                                <FileDown size={18} />
                                Excel
                            </Button>
                        </div>
                    </div>
                    {history?.length > 0 ? (
                        <div className="overflow-y-auto border rounded-lg flex-grow">
                            {loading ? (
                                <div className="h-[400px] flex items-center justify-center">
                                    <Spinner className="h-12 w-12" />
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-max">
                                    <thead className="bg-blue-50 text-gray-700 text-sm sticky top-0 z-10">
                                        <tr>
                                            <th className="p-3 border-b font-semibold">Дата</th>
                                            <th className="p-3 border-b font-semibold">Плательщик</th>
                                            <th className="p-3 border-b font-semibold">Получатель</th>
                                            <th className="p-3 border-b font-semibold">Сумма</th>
                                            <th className="p-3 border-b font-semibold">Метод</th>
                                            <th className="p-3 border-b font-semibold">Статус</th>
                                            <th className="p-3 border-b font-semibold">Комментарий</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            history.map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                        } hover:bg-blue-50 transition-colors`}
                                                >
                                                    <td className="p-3 border-b">
                                                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                                                    </td>
                                                    <td className="p-3 border-b">{item.payer?.name || '-'}</td>
                                                    <td className="p-3 border-b">{item.receiver?.name || '-'}</td>
                                                    <td className="p-3 border-b text-green-600 font-semibold">
                                                        {parseFloat(item.amount).toLocaleString('ru-RU')} сум
                                                    </td>
                                                    <td className="p-3 border-b">
                                                        {item.method === 'cash' ? 'Наличные' :
                                                            item.method === 'card' ? 'Карта' :
                                                                item.method === 'transfer' ? 'Перевод' : item.method}
                                                    </td>
                                                    <td className="p-3 border-b">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {item.status === 'confirmed' ? 'Подтверждено' :
                                                                item.status === 'pending' ? 'В ожидании' : item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 border-b text-gray-600">
                                                        {item.note || "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (

                        <Card className="flex items-center justify-center h-[300px] border-[2px]">
                            <h2>
                                Нет данных
                            </h2>
                        </Card>
                    )}

                    {/* 🔹 Пагинация */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                            <IconButton
                                variant="outlined"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} />
                            </IconButton>

                            <Typography className="text-gray-700">
                                Страница {currentPage} из {totalPages}
                            </Typography>

                            <IconButton
                                variant="outlined"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={18} />
                            </IconButton>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}