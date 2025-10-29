import { useState, useEffect } from "react";
import { Button, Card, CardBody, Typography, Chip } from "@material-tailwind/react";
import WarehouseClientDetailPayment from "./WarehouseClientDetailPayment";
import { CheckCircleIcon, ClockIcon, DocumentTextIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { InvoicesApi } from "../../../../utils/Controllers/invoices";
import Cookies from "js-cookie";
import { CheckCircle2Icon } from "lucide-react";
import WarehouseClientPaymentDetail from "./WarehouseClientPaymentDetail";

export default function WarehouseClientInvoices({ clientData }) {
    const [invoices, setInvoices] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

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
            case 'partially_paid': return 'Частично'
            case 'confirmed': return 'Подтверждено'
            default: return status
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircleIcon className="h-4 w-4" />
            case 'unpaid': return <XCircleIcon className="h-4 w-4" />
            case 'confirmed': return <CheckCircle2Icon className="h-4 w-4" />
            default: return <ClockIcon className="h-4 w-4" />
        }
    }


    const getAllInvoice = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const data = {
                page: pageNumber,
                id: clientData?.id,
            };
            const response = await InvoicesApi?.GetClientInvoice(data);
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
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.total_pages) {
            setPage(newPage);
        }
    };

    return (
        <>
            {loading ? (
                <div className="text-center py-10">Загрузка...</div>
            ) : invoices.length > 0 ? (
                <div className="space-y-4">
                    {invoices.map((invoice) => (
                        <Card
                            key={invoice.id}
                            className="border border-blue-gray-100 hover:shadow-md transition-shadow"
                        >
                            <CardBody className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Typography
                                                variant="h6"
                                                color="blue-gray"
                                                className="font-semibold"
                                            >
                                                Накладная #{invoice.invoice_number}
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
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    Общая сумма
                                                </Typography>
                                                <Typography variant="paragraph">
                                                    {formatNumber(invoice.total_sum)} UZS
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    Статус
                                                </Typography>
                                                <Typography variant="paragraph">
                                                    {invoice.status}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-semibold"
                                                >
                                                    Дата создания
                                                </Typography>
                                                <Typography variant="paragraph">
                                                    {formatInvoiceDate(invoice.createdAt)}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <WarehouseClientPaymentDetail data={invoice} />
                                        {invoice.payment_status === "unpaid" || invoice?.payment_status === 'partially_paid' ? (
                                            <WarehouseClientDetailPayment
                                                refresh={getAllInvoice}
                                                client={clientData}
                                                invoice={invoice}
                                            />
                                        ) : (<></>)}
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
                                className={`px-3 py-1 border rounded ${page === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                ←
                            </button>

                            <span>
                                {pagination.currentPage} / {pagination.total_pages}
                            </span>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.total_pages}
                                className={`px-3 py-1 border rounded ${page === pagination.total_pages
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <DocumentTextIcon className="h-16 w-16 text-blue-gray-300 mx-auto mb-4" />
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                        Нет полученных накладных
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="blue-gray"
                        className="opacity-70"
                    >
                        У этого клиента пока нет полученных накладных
                    </Typography>
                </div>
            )}
        </>
    );
}
