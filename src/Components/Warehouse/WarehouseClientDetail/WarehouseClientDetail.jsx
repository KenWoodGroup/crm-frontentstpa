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
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    BanknotesIcon,
    CreditCardIcon,
    ReceiptRefundIcon
} from "@heroicons/react/24/outline"
import Loading from "../../UI/Loadings/Loading"
import EmptyData from "../../UI/NoData/EmptyData"
import WarehouseClientDetailPayment from "./_components/WarehouseClientDetailPayment"

// Создаем кастомную иконку для наличных
const CashIcon = (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
)

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

    const formatNumber = (number) => {
        const amount = parseFloat(number)
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
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

    const formatInvoiceDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'green'
            case 'unpaid': return 'red'
            case 'partial': return 'amber'
            case 'confirmed': return 'green'
            default: return 'blue-gray'
        }
    }

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Оплачено'
            case 'unpaid': return 'Не оплачено'
            case 'partial': return 'Частично'
            case 'confirmed': return 'Подтверждено'
            default: return status
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircleIcon className="h-4 w-4" />
            case 'unpaid': return <XCircleIcon className="h-4 w-4" />
            case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />
            default: return <ClockIcon className="h-4 w-4" />
        }
    }

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'cash': return <CashIcon className="h-4 w-4" />
            case 'card': return <CreditCardIcon className="h-4 w-4" />
            case 'transfer': return <BanknotesIcon className="h-4 w-4" />
            default: return <CurrencyDollarIcon className="h-4 w-4" />
        }
    }

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cash': return 'Наличные'
            case 'card': return 'Карта'
            case 'transfer': return 'Перевод'
            default: return method
        }
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
                                    ({clientData.received_invoices?.length || 0})


                                </div>
                            </Tab>
                            <Tab value="payments" onClick={() => setActiveTab("payments")}>
                                <div className="flex items-center gap-2">
                                    <ReceiptRefundIcon className="h-5 w-5" />
                                    История оплаты
                                    {' '}
                                    ({clientData.payer_payments?.length || 0})


                                </div>
                            </Tab>
                        </TabsHeader>
                    </Tabs>

                    {/* Содержимое накладок */}
                    {activeTab === "invoices" && (
                        <>
                            {clientData.received_invoices && clientData.received_invoices.length > 0 ? (
                                <div className="space-y-4">
                                    {clientData.received_invoices.map((invoice) => (
                                        <Card key={invoice.id} className="border border-blue-gray-100 hover:shadow-md transition-shadow">
                                            <CardBody className="p-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                                                Накладная #{invoice.id.slice(-8)}
                                                            </Typography>
                                                            <Chip
                                                                value={getPaymentStatusText(invoice.payment_status)}
                                                                color={getPaymentStatusColor(invoice.payment_status)}
                                                                size="sm"
                                                                icon={getStatusIcon(invoice.payment_status)}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Общая сумма
                                                                </Typography>
                                                                <Typography variant="paragraph">
                                                                    {formatNumber(invoice.total_sum)} UZS
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Оплачено
                                                                </Typography>
                                                                <Typography variant="paragraph">
                                                                    {formatNumber(invoice.payment_sum)} UZS
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Дата создания
                                                                </Typography>
                                                                <Typography variant="paragraph">
                                                                    {formatInvoiceDate(invoice.createdAt)}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="outlined" color="blue" size="sm">
                                                            Детали
                                                        </Button>
                                                        {invoice.payment_status === 'unpaid' && (
                                                            <WarehouseClientDetailPayment refresh={getUser} client={clientData} invoice={invoice} />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <DocumentTextIcon className="h-16 w-16 text-blue-gray-300 mx-auto mb-4" />
                                    <Typography variant="h6" color="blue-gray" className="mb-2">
                                        Нет полученных накладных
                                    </Typography>
                                    <Typography variant="paragraph" color="blue-gray" className="opacity-70">
                                        У этого клиента пока нет полученных накладных
                                    </Typography>
                                </div>
                            )}
                        </>
                    )}

                    {/* Содержимое платежей */}
                    {activeTab === "payments" && (
                        <>
                            {clientData.payer_payments && clientData.payer_payments.length > 0 ? (
                                <div className="space-y-4">
                                    {clientData.payer_payments.map((payment) => (
                                        <Card key={payment.id} className="border border-blue-gray-100 hover:shadow-md transition-shadow">
                                            <CardBody className="p-4">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Typography variant="h6" color="blue-gray" className="font-semibold">
                                                                Платеж #{payment.id.slice(-8)}
                                                            </Typography>
                                                            <div className="flex gap-2">
                                                                <Chip
                                                                    value={getPaymentStatusText(payment.status)}
                                                                    color={getPaymentStatusColor(payment.status)}
                                                                    size="sm"
                                                                    icon={getStatusIcon(payment.status)}
                                                                />
                                                                <Chip
                                                                    value={getPaymentMethodText(payment.method)}
                                                                    color="blue"
                                                                    size="sm"
                                                                    icon={getPaymentMethodIcon(payment.method)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Сумма платежа
                                                                </Typography>
                                                                <Typography variant="paragraph" className="text-green-600 font-semibold">
                                                                    {formatNumber(payment.amount)} UZS
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Метод оплаты
                                                                </Typography>
                                                                <Typography variant="paragraph" className="flex items-center gap-1">
                                                                    {getPaymentMethodIcon(payment.method)}
                                                                    {getPaymentMethodText(payment.method)}
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                    Дата платежа
                                                                </Typography>
                                                                <Typography variant="paragraph">
                                                                    {formatInvoiceDate(payment.createdAt)}
                                                                </Typography>
                                                            </div>
                                                            {payment.note && (
                                                                <div>
                                                                    <Typography variant="small" color="blue-gray" className="font-semibold">
                                                                        Примечание
                                                                    </Typography>
                                                                    <Typography variant="paragraph">
                                                                        {payment.note}
                                                                    </Typography>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button variant="outlined" color="blue" size="sm">
                                                            Детали
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ReceiptRefundIcon className="h-16 w-16 text-blue-gray-300 mx-auto mb-4" />
                                    <Typography variant="h6" color="blue-gray" className="mb-2">
                                        Нет истории платежей
                                    </Typography>
                                    <Typography variant="paragraph" color="blue-gray" className="opacity-70">
                                        У этого клиента пока нет истории платежей
                                    </Typography>
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}