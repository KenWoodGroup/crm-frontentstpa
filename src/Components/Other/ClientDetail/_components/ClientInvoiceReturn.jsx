import { useState, useEffect } from "react";
import { Button, Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import { CheckCircleIcon, ClockIcon, DocumentTextIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { InvoicesApi } from "../../../../utils/Controllers/invoices";
import WarehouseClientReturnInvoiceDetail from "./WarehouseClientReturnInvoiceDetail";
import { useTranslation } from "react-i18next";
import Loading from "../../../UI/Loadings/Loading";

export default function WarehousesClientInvoiceReturn({ clientData, refreshKey }) {
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { t } = useTranslation();



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

    // ✅ Цвет для каждого статуса
    const getInvoiceStatusColor = (status) => {
        switch (status) {
            case "draft":
                return "blue-gray";
            case "approved":
                return "blue";
            case "sent":
                return "amber";
            case "received":
                return "green";
            case "cancelled":
                return "red";
            case "returned":
                return "deep-orange";
            default:
                return "blue-gray";
        }
    };

    // ✅ Текст статуса на русском
    const getInvoiceStatusText = (status) => {
        switch (status) {
            case "draft":
                return "Черновик";
            case "approved":
                return "Одобрено";
            case "sent":
                return "Отправлено";
            case "received":
                return "Получено";
            case "cancelled":
                return "Отменено";
            case "returned":
                return "Возвращено";
            default:
                return status;
        }
    };



    const getAllInvoice = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const data = {
                page: pageNumber,
                id: clientData?.id,
            };
            const response = await InvoicesApi?.GetClientInvoiceReturn(data);
            const records = response?.data?.data?.records || [];
            const paginationInfo = response?.data?.data?.pagination || {};

            setInvoices(records);
            setPagination(paginationInfo);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllInvoice(page);
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
            ) : invoices.length > 0 ? (
                <div className="space-y-4">
                    {invoices.map((invoice) => (
                        <Card
                            key={invoice.id}
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
                                                {t('Invoice')} #{invoice.invoice_number}
                                            </Typography>
                                            {/* <Chip
                                        value={getPaymentStatusText(invoice.payment_status)}
                                        color={getPaymentStatusColor(invoice.payment_status)}
                                        size="sm"
                                        icon={getStatusIcon(invoice.payment_status)}
                                        className="dark:bg-opacity-80"
                                    /> */}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {t('Total_price')}
                                                </Typography>
                                                <Typography variant="paragraph" className="text-text-light dark:text-text-dark transition-colors duration-200">
                                                    {formatNumber(invoice.total_sum)} UZS
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold text-text-light dark:text-text-dark transition-colors duration-200"
                                                >
                                                    {t('Status')}:
                                                </Typography>
                                                <Chip
                                                    value={getInvoiceStatusText(invoice.status)}
                                                    color={getInvoiceStatusColor(invoice.status)}
                                                    size="sm"
                                                    className="max-w-[100px] dark:bg-opacity-80"
                                                />
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
                                                    {formatInvoiceDate(invoice.createdAt)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <WarehouseClientReturnInvoiceDetail data={invoice} />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}

                    {/* 👇 Пагинация — только если страниц больше 1 */}
                    {pagination?.total_pages > 1 && (
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
                    <DocumentTextIcon className="h-16 w-16 text-blue-gray-300 dark:text-gray-600 mx-auto mb-4 transition-colors duration-200" />
                    <Typography variant="h6" color="blue-gray" className="mb-2 text-text-light dark:text-text-dark transition-colors duration-200">
                        {t('Empty_invoice')}
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="blue-gray"
                        className="opacity-70 text-text-light dark:text-text-dark transition-colors duration-200"
                    >
                        {t('Empty_invoice_client')}
                    </Typography>
                </div>
            )}
        </>
    );
}
