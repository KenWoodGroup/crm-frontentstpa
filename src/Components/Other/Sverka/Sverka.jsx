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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { location } from "../../../utils/Controllers/location";
import Cookies from "js-cookie";
import { Payment } from "../../../utils/Controllers/Payment";
import { useTranslation } from "react-i18next";

export default function Sverka() {
    const { t } = useTranslation();
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
            const response = await location.GetAllClients(Cookies?.get("ul_nesw"));
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
        <div className="Analiz  flex min-h-screen pb-[30px] gap-4 bg-background-light dark:bg-background-dark transition-colors duration-200">
            {/* 🔹 Левая часть — список клиентов с поиском */}
            <Card className="Analiz_1 w-[30%] border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden flex flex-col bg-card-light dark:bg-card-dark transition-colors duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
                    <Typography variant="h5" className="font-semibold text-blue-gray-700 dark:text-text-dark transition-colors duration-200">
                        {t("Clients")}
                    </Typography>
                    <div className="relative mt-3">
                        <Input
                            label={t('Search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
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
                                            className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 ${selectedClient?.id === client.id
                                                ? "bg-blue-100 dark:bg-blue-900/40 font-semibold text-text-light dark:text-text-dark"
                                                : "bg-white dark:bg-gray-800 text-text-light dark:text-text-dark"
                                                }`}
                                        >
                                            {client.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-[400px] flex items-center justify-center">
                                        <Typography className="p-4 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                            {t('Empty_data')}
                                        </Typography>
                                    </div>
                                )}
                            </>
                        )
                    }
                </CardBody>
            </Card>

            {/* 🔹 Правая часть — история клиента */}
            <Card className="Analiz_2 w-[70%] border border-gray-200 dark:border-gray-700 shadow-md flex flex-col bg-card-light dark:bg-card-dark transition-colors duration-200">
                <CardBody className="flex flex-col flex-grow overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                        <Typography variant="h5" className="font-semibold text-blue-gray-700 dark:text-text-dark transition-colors duration-200">
                            {selectedClient
                                ? `${t('History_Clients')} ${selectedClient.name}`
                                : `${t('Select_clients')}`}
                        </Typography>

                        <div className="flex flex-col sm:flex-row items-end justify-between gap-3 w-full md:w-auto">
                            <Input
                                type="date"
                                label={t('StartDate')}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark `
                                }}
                                containerProps={{ className: "w-[150px] !min-w-0" }}
                            />
                            <Input
                                type="date"
                                label={t('EndDate')}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                color="blue-gray"
                                className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                labelProps={{
                                    className: `!text-text-light dark:!text-text-dark `
                                }}
                                containerProps={{ className: "w-[150px] !min-w-0" }}
                            />
                            <Button
                                color="blue"
                                onClick={handleApplyFilter}
                                className="w-[200px]! flex items-center justify-center"
                            >
                                {t('Search')}
                            </Button>
                        </div>
                    </div>

                    {history?.length > 0 ? (
                        <div className="overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg flex-grow bg-white dark:bg-gray-800 transition-colors duration-200">
                            {loading ? (
                                <div className="h-[400px] flex items-center justify-center">
                                    <Spinner className="h-12 w-12" />
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-max">
                                    <thead className="bg-blue-50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 text-sm sticky top-0 z-10 transition-colors duration-200">
                                        <tr>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Date')}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Paymenter')}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Taker')}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Price__sum')}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Method')}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t("Status")}</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold transition-colors duration-200">{t('Comment')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            history.map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className={`${index % 2 === 0
                                                        ? "bg-white dark:bg-gray-800"
                                                        : "bg-gray-50 dark:bg-gray-700/50"
                                                        } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
                                                >
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {item.payer?.name || '-'}
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {item.receiver?.name || '-'}
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-green-600 dark:text-green-400 font-semibold transition-colors duration-200">
                                                        {parseFloat(item.amount).toLocaleString('ru-RU')} uzs
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {item.method?.name || '-'}

                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'confirmed'
                                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                                            : item.status === 'pending'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            } transition-colors duration-200`}>
                                                            {item.status === 'confirmed' ? 'Подтверждено' :
                                                                item.status === 'pending' ? 'В ожидании' : item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 transition-colors duration-200">
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
                        <Card className="flex items-center justify-center h-[300px] border-[2px] border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-200">
                            <h2 className="text-text-light dark:text-text-dark transition-colors duration-200">
                                {t('Empty_data')}
                            </h2>
                        </Card>
                    )}

                    {/* 🔹 Пагинация */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                            <IconButton
                                variant="outlined"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="dark:border-blue-400 dark:text-blue-400 transition-colors duration-200"
                            >
                                <ChevronLeft size={18} />
                            </IconButton>

                            <Typography className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                Страница {currentPage} из {totalPages}
                            </Typography>

                            <IconButton
                                variant="outlined"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="dark:border-blue-400 dark:text-blue-400 transition-colors duration-200"
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