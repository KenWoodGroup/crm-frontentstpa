import { useParams } from "react-router-dom"
import { location } from "../../../utils/Controllers/location"
import { useEffect, useState } from "react"
import io from "socket.io-client"
import {
    Card,
    CardBody,
    Typography,
    Tabs,
    TabsHeader,
    Tab,
} from "@material-tailwind/react"
import {
    UserCircleIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    ReceiptRefundIcon,
} from "@heroicons/react/24/outline"
import Loading from "../../UI/Loadings/Loading"
import EmptyData from "../../UI/NoData/EmptyData"
import ClientDetailPayment from "./_components/ClientDetailPayment"
import ClientInvoices from "./_components/ClientInvoices"
import ClientPayment from "./_components/ClientPayment"
import Socket from "../../../utils/Socket"
import { useTranslation } from "react-i18next"

export default function ClientDetail() {
    const { id } = useParams()
    const { t } = useTranslation();
    const [clientData, setClientData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("invoices")
    const [refreshKey, setRefreshKey] = useState(false) // ✅ добавлено

    // === Получение данных клиента ===
    const getUser = async () => {
        try {
            const response = await location.Get(id)
            setClientData(response?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    // === Загрузка при открытии страницы ===
    useEffect(() => {
        getUser()
    }, [])

    // === Подключение socket.io ===
    useEffect(() => {
        if (!id) return

        const socket = io(`${Socket}`, {
            path: "/socket.io",
            transports: ["websocket"],
        })

        socket.emit("joinLocation", id)

        // === Обновление накладной ===
        socket.on("invoiceUpdate", (data) => {
            console.log("📦 Обновление накладной:", data)
            if (data?.location_id === id || data?.client_id === id) {
                console.log("🔄 Обновляем все данные клиента...")
                getUser()
                setRefreshKey((prev) => !prev) // ✅ триггер обновления дочерних компонентов
            }
        })

        // === Обновление платежа ===
        socket.on("paymentUpdate", (data) => {
            console.log("💰 Обновление платежа:", data)
            if (data?.location_id === id || data?.client_id === id) {
                getUser()
                setRefreshKey((prev) => !prev) // ✅ триггер обновления дочерних компонентов
            }
        })

        // Очистка при размонтировании
        return () => {
            socket.disconnect()
        }
    }, [id])

    // === Визуализация ===
    if (loading) return <Loading />
    if (!clientData) return <EmptyData text="Нет такого клиента" />

    const formatBalance = (balance) =>
        new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(parseFloat(balance)) + " UZS"

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "C")

    const getAvatarColor = (name) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-amber-500",
            "bg-red-500",
            "bg-indigo-500",
        ]
        const index = name ? name.charCodeAt(0) % colors.length : 0
        return colors[index]
    }

    return (
        <div className="mx-auto space-y-6 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-200">
            {/* Основная информация о клиенте */}
            <Card className="shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-200">
                <CardBody className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6 mb-6">
                                    <div
                                        className={`relative ${getAvatarColor(
                                            clientData.name
                                        )} rounded-lg w-24 h-24 flex items-center justify-center border-4 border-blue-500 dark:border-blue-400 shadow-lg transition-colors duration-200`}
                                    >
                                        <Typography
                                            variant="h2"
                                            color="white"
                                            className="font-bold"
                                        >
                                            {getInitials(clientData.name)}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography
                                            variant="h3"
                                            color="blue-gray"
                                            className="font-bold text-text-light dark:text-text-dark transition-colors duration-200"
                                        >
                                            {clientData.name}
                                        </Typography>
                                    </div>
                                </div>
                                <ClientDetailPayment
                                    client={clientData}
                                    refresh={getUser}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {/* Контактная информация */}
                                <Card className="bg-blue-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    <CardBody className="p-4">
                                        <Typography
                                            variant="h6"
                                            color="blue-gray"
                                            className="mb-4 flex items-center gap-2 text-text-light dark:text-text-dark transition-colors duration-200"
                                        >
                                            <UserCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
                                            {t('Contact_info')}
                                        </Typography>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <PhoneIcon className="h-4 w-4 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
                                                <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                    {clientData.phone}
                                                </Typography>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPinIcon className="h-4 w-4 text-green-500 dark:text-green-400 transition-colors duration-200" />
                                                <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                    {clientData.address}
                                                </Typography>
                                            </div>
                                            {clientData.email && (
                                                <div className="flex items-center gap-3">
                                                    <EnvelopeIcon className="h-4 w-4 text-purple-500 dark:text-purple-400 transition-colors duration-200" />
                                                    <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {clientData.email}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Финансы */}
                                <Card className="bg-blue-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    <CardBody className="p-4">
                                        <Typography
                                            variant="h6"
                                            color="blue-gray"
                                            className="mb-4 flex items-center gap-2 text-text-light dark:text-text-dark transition-colors duration-200"
                                        >
                                            <CurrencyDollarIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
                                            {t('Finance')}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            className={
                                                parseFloat(clientData.balance) < 0
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-green-600 dark:text-green-400"
                                            }
                                        >
                                            {formatBalance(clientData.balance)}
                                        </Typography>
                                    </CardBody>
                                </Card>

                                {/* Статистика */}
                                <Card className="bg-blue-gray-50/50 dark:bg-gray-800/50 md:col-span-2 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                                    <CardBody className="p-4">
                                        <Typography
                                            variant="h6"
                                            color="blue-gray"
                                            className="mb-4 flex items-center gap-2 text-text-light dark:text-text-dark transition-colors duration-200"
                                        >
                                            <CalendarDaysIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 transition-colors duration-200" />
                                            {t('Statictik')}
                                        </Typography>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                {t('Register')}:{" "}
                                                {formatDate(clientData.createdAt)}
                                            </Typography>
                                            <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                {t('Updated')}:{" "}
                                                {formatDate(clientData.updatedAt)}
                                            </Typography>
                                            <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                ID: {clientData.id.slice(0, 8)}...
                                            </Typography>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* === Таб меню === */}
            <Card className="shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-200">
                <CardBody className="p-6">
                    <Tabs value={activeTab} className="mb-6">
                        <TabsHeader
                            className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                            indicatorProps={{
                                className: "bg-blue-500 dark:bg-blue-600 shadow-lg"
                            }}
                        >
                            <Tab
                                value="invoices"
                                onClick={() => setActiveTab("invoices")}
                                className={`font-medium transition-all duration-200 ${activeTab === "invoices"
                                    ? "text-white"
                                    : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                                    }`}
                            >
                                <div className="flex items-center gap-[10px]">
                                    <DocumentTextIcon className="h-5 w-5" />
                                    {t('inVoice')}
                                </div>
                            </Tab>
                            <Tab
                                value="returns"
                                onClick={() => setActiveTab("returns")}
                                className={`font-medium transition-all duration-200 ${activeTab === "returns"
                                    ? "text-white"
                                    : "text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                                    }`}
                            >
                                <div className="flex items-center gap-[10px]">
                                    <ReceiptRefundIcon className="h-5 w-5" />
                                    {t('Return')}
                                </div>
                            </Tab>
                            <Tab
                                value="payments"
                                onClick={() => setActiveTab("payments")}
                                className={`font-medium transition-all duration-200 ${activeTab === "payments"
                                    ? "text-white"
                                    : "text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400"
                                    }`}
                            >
                                <div className="flex items-center gap-[10px]">
                                    <ReceiptRefundIcon className="h-5 w-5" />
                                    {t('Payment_History')}
                                </div>
                            </Tab>
                        </TabsHeader>
                    </Tabs>

                    {activeTab === "invoices" && (
                        <ClientInvoices
                            clientData={clientData}
                            refreshKey={refreshKey} // ✅ передаём ключ
                        />
                    )}
                    {activeTab === "returns" && (
                        <sClientInvoiceReturn
                            clientData={clientData}
                            refreshKey={refreshKey}
                        />
                    )}
                    {activeTab === "payments" && (
                        <ClientPayment
                            clientData={clientData}
                            refreshKey={refreshKey}
                        />
                    )}
                </CardBody>
            </Card>
        </div>
    )
}