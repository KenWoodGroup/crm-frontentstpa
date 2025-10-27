import { useParams } from "react-router-dom"
import { location } from "../../../utils/Controllers/location"
import { useEffect, useState } from "react"
import {
    Card,
    CardBody,
    Typography,
    Avatar,
    Chip,
    Button,
    Badge,
    Tabs,
    TabsHeader,
    Tab
} from "@material-tailwind/react"
import {
    UserCircleIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    ReceiptRefundIcon
} from "@heroicons/react/24/outline"
import Loading from "../../UI/Loadings/Loading"
import EmptyData from "../../UI/NoData/EmptyData"
import WarehouseClientDetailPayment from "./_components/WarehouseClientDetailPayment"
import WarehouseClientInvoices from "./_components/WarehouseClientInvoices"
import WarehouseClientPayment from "./_components/WarehouseClientPayment"



export default function WarehouseClientDetail() {
    const { id } = useParams()
    const [clientData, setClientData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("invoices")

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

    useEffect(() => {
        getUser()
    }, [])

    if (loading) {
        return (
            <Loading />
        )
    }

    if (!clientData) {
        return (
            <EmptyData text={'Нет такого клиента'} />
        )
    }

    const formatBalance = (balance) => {
        const amount = parseFloat(balance)
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' UZS'
    }
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'C'
    }

    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500',
            'bg-amber-500', 'bg-red-500', 'bg-indigo-500'
        ]
        const index = name ? name.charCodeAt(0) % colors.length : 0
        return colors[index]
    }

    return (
        <div className="mx-auto space-y-6">
            {/* Основная карточка профиля */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardBody className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Левая часть - Аватар и основная информация */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center  gap-6 mb-6">
                                    <div className={`relative ${getAvatarColor(clientData.name)} rounded-lg w-24 h-24 flex items-center justify-center border-4 border-blue-500 shadow-lg`}>
                                        <Typography variant="h2" color="white" className="font-bold">
                                            {getInitials(clientData.name)}
                                        </Typography>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Typography variant="h3" color="blue-gray" className="font-bold">
                                                {clientData.name}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-[30px]">
                                    <WarehouseClientDetailPayment client={clientData} refresh={getUser} />
                                </div>
                            </div>

                            {/* Информационные карточки */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {/* Контактная информация */}
                                <Card className="bg-blue-gray-50/50">
                                    <CardBody className="p-4">
                                        <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                            <UserCircleIcon className="h-5 w-5" />
                                            Контактная информация
                                        </Typography>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <PhoneIcon className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        Телефон
                                                    </Typography>
                                                    <Typography variant="paragraph" className="text-blue-gray-700">
                                                        {clientData.phone}
                                                    </Typography>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <MapPinIcon className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        Адрес
                                                    </Typography>
                                                    <Typography variant="paragraph" className="text-blue-gray-700">
                                                        {clientData.address}
                                                    </Typography>
                                                </div>
                                            </div>

                                            {clientData.email && (
                                                <div className="flex items-center gap-3">
                                                    <EnvelopeIcon className="h-4 w-4 text-purple-500" />
                                                    <div>
                                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                                            Email
                                                        </Typography>
                                                        <Typography variant="paragraph" className="text-blue-gray-700">
                                                            {clientData.email}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Финансовая информация */}
                                <Card className="bg-blue-gray-50/50">
                                    <CardBody className="p-4">
                                        <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                            <CurrencyDollarIcon className="h-5 w-5" />
                                            Финансы
                                        </Typography>

                                        <div className="space-y-4">
                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    Баланс
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    className={parseFloat(clientData.balance) < 0 ? 'text-red-600' : 'text-green-600'}
                                                >
                                                    {formatBalance(clientData.balance)}
                                                </Typography>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        Накладные
                                                    </Typography>
                                                    <Typography variant="h6" color="blue-gray">
                                                        {clientData.received_invoices?.length || 0} шт.
                                                    </Typography>
                                                </div>
                                                <div>
                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                        Платежи
                                                    </Typography>
                                                    <Typography variant="h6" color="blue-gray">
                                                        {clientData.payer_payments?.length || 0} шт.
                                                    </Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Статистика */}
                                <Card className="bg-blue-gray-50/50 md:col-span-2">
                                    <CardBody className="p-4">
                                        <Typography variant="h6" color="blue-gray" className="mb-4 flex items-center gap-2">
                                            <CalendarDaysIcon className="h-5 w-5" />
                                            Статистика
                                        </Typography>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    Дата регистрации
                                                </Typography>
                                                <Typography variant="paragraph" className="text-blue-gray-700">
                                                    {formatDate(clientData.createdAt)}
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    Последнее обновление
                                                </Typography>
                                                <Typography variant="paragraph" className="text-blue-gray-700">
                                                    {formatDate(clientData.updatedAt)}
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                    ID клиента
                                                </Typography>
                                                <Typography variant="small" className="text-blue-gray-600 font-mono">
                                                    {clientData.id.slice(0, 8)}...
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
            {/* Табы для накладок и платежей */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardBody className="p-6">
                    <Tabs value={activeTab} className="mb-6">
                        <TabsHeader>
                            <Tab value="invoices" onClick={() => setActiveTab("invoices")}>
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-5 w-5" />
                                    Полученные накладные {' '}
                                </div>
                            </Tab>
                            <Tab value="payments" onClick={() => setActiveTab("payments")}>
                                <div className="flex items-center gap-2">
                                    <ReceiptRefundIcon className="h-5 w-5" />
                                    История оплаты
                                    {' '}
                                </div>
                            </Tab>
                        </TabsHeader>
                    </Tabs>

                    {/* Содержимое накладок */}
                    {activeTab === "invoices" && (
                        <WarehouseClientInvoices clientData={clientData} />
                    )}


                    {/* Содержимое платежей */}
                    {activeTab === "payments" && (
                        <WarehouseClientPayment clientData={clientData} />
                    )}
                </CardBody>
            </Card>
        </div>
    )
}