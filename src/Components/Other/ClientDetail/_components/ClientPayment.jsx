import { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    Chip,
    Typography,
} from "@material-tailwind/react";
import { BanknotesIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, CurrencyDollarIcon, ReceiptRefundIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Payment } from "../../../../utils/Controllers/Payment";
import { useTranslation } from "react-i18next";
import Loading from "../../../UI/Loadings/Loading";


export default function ClientPayment({ clientData, refreshKey }) {
    const [payments, setPayments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();


    const CashIcon = (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    )


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


    const getPayment = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const data = {
                page: pageNumber,
                id: clientData?.id,
            };
            const response = await Payment?.PaymenClienttHistory(data);
            const records = response?.data?.data?.records || [];
            const paginationInfo = response?.data?.data?.pagination || {};

            setPayments(records);
            setPagination(paginationInfo);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPayment(page);
    }, [page, refreshKey]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.total_pages) {
            setPage(newPage);
        }
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : payments.length > 0 ? (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <Card
                            key={payment.id}
                            className="border border-blue-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 bg-card-light dark:bg-card-dark"
                        >
                            <CardBody className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Typography
                                                variant="h6"
                                                color="blue-gray"
                                                className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                            >
                                                {t("f_payment")} #{payment.id.slice(-8)}
                                            </Typography>
                                            <div className="flex gap-2">
                                                <Chip
                                                    value={getPaymentStatusText(payment.status)}
                                                    color={getPaymentStatusColor(payment.status)}
                                                    size="sm"
                                                    icon={getStatusIcon(payment.status)}
                                                    className="dark:bg-opacity-80"
                                                />
                                                <Chip
                                                    value={getPaymentMethodText(payment.method)}
                                                    color="blue"
                                                    size="sm"
                                                    icon={getPaymentMethodIcon(payment.method)}
                                                    className="dark:bg-opacity-80"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {t('Price_payment')}
                                                </Typography>
                                                <Typography
                                                    variant="paragraph"
                                                    className="text-green-600 dark:text-green-400 font-semibold transition-colors duration-200"
                                                >
                                                    {formatNumber(payment.amount)} UZS
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {t('Payment_method')}
                                                </Typography>
                                                <Typography
                                                    variant="paragraph"
                                                    className="flex items-center gap-1 text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {getPaymentMethodIcon(payment.method)}
                                                    {getPaymentMethodText(payment.method)}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {t('Created')}

                                                </Typography>
                                                <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                    {formatInvoiceDate(payment.createdAt)}
                                                </Typography>
                                            </div>
                                            {payment.note && (
                                                <div>
                                                    <Typography
                                                        variant="small"
                                                        color="blue-gray"
                                                        className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                    >
                                                        {t('Comment')}
                                                    </Typography>
                                                    <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                        {payment.note}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* <Button variant="outlined" color="blue" size="sm">
                                    Детали
                                </Button> */}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {/* 👇 Пагинация — показывается только если страниц больше 1 */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-4">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-1 border rounded transition-colors duration-200 ${page === 1
                                    ? "opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                    : "border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                ←
                            </button>

                            <span className="text-text-light dark:text-text-dark transition-colors duration-200">
                                {pagination.currentPage} / {pagination.total_pages}
                            </span>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.total_pages}
                                className={`px-3 py-1 border rounded transition-colors duration-200 ${page === pagination.total_pages
                                    ? "opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                    : "border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <ReceiptRefundIcon className="h-16 w-16 text-blue-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                    <Typography variant="h6" color="blue-gray" className="mb-2 text-text-light dark:text-text-dark transition-colors duration-200">
                        {t('Payment_EmtyData')}
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="blue-gray"
                        className="opacity-70 text-text-light dark:text-text-dark transition-colors duration-200"
                    >
                        {t('Payment_EmtyData_text')}
                    </Typography>
                </div>
            )}
        </>
    );
}
