import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Chip,
    Card,
} from "@material-tailwind/react";

export default function WarehouseClientPaymentDetail({ data }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(!open);

    const formatDate = (date) => {
        return new Date(date).toLocaleString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ✅ Форматирование числа: 50000 → 50 000
    const formatNumber = (num) => {
        if (num === null || num === undefined) return "—";
        return Math.floor(num).toLocaleString("ru-RU");
    };


    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "paid":
            case "confirmed":
                return "green";
            case "unpaid":
                return "red";
            case "partially_paid":
                return "amber";
            default:
                return "blue-gray";
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case "paid":
                return "Оплачено";
            case "unpaid":
                return "Не оплачено";
            case "partially_paid":
                return "Частично оплачено";
            case "confirmed":
                return "Подтверждено";
            default:
                return status;
        }
    };

    return (
        <>
            <Button variant="outlined" color="blue" size="sm" onClick={handleOpen}>
                Детали
            </Button>

            <Dialog open={open} handler={handleOpen} size="xl">
                <DialogHeader>Детали накладной</DialogHeader>

                <DialogBody divider className="space-y-6">
                    {/* Основная информация */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Номер накладной:
                            </Typography>
                            <Typography>{data?.invoice_number}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Статус оплаты:
                            </Typography>
                            <Chip
                                className="max-w-[200px]"
                                value={getPaymentStatusText(data?.payment_status)}
                                color={getPaymentStatusColor(data?.payment_status)}
                                size="sm"
                            />
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Общая сумма:
                            </Typography>
                            <Typography>{formatNumber(data?.total_sum)} UZS</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Статус накладной:
                            </Typography>
                            <Typography>{data?.status}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Отправитель:
                            </Typography>
                            <Typography>{data?.sender_name}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Получатель:
                            </Typography>
                            <Typography>{data?.receiver_name}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Примечание:
                            </Typography>
                            <Typography>{data?.note || "—"}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Тип:
                            </Typography>
                            <Typography>{data?.type}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Дата создания:
                            </Typography>
                            <Typography>{formatDate(data?.createdAt)}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Обновлено:
                            </Typography>
                            <Typography>{formatDate(data?.updatedAt)}</Typography>
                        </div>
                    </div>

                    {/* Платежи */}
                    {data?.payments?.length > 0 && (
                        <div className="mt-6">
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                                Платежи
                            </Typography>
                            <Card className="overflow-x-auto border border-blue-gray-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-blue-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">#</th>
                                            <th className="px-4 py-2">Сумма</th>
                                            <th className="px-4 py-2">Метод</th>
                                            <th className="px-4 py-2">Статус</th>
                                            <th className="px-4 py-2">Примечание</th>
                                            <th className="px-4 py-2">Дата</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.payments.map((p, i) => (
                                            <tr key={p.id} className="border-b hover:bg-blue-gray-50/50">
                                                <td className="px-4 py-2">{i + 1}</td>
                                                <td className="px-4 py-2">{formatNumber(p.amount)} UZS</td>
                                                <td className="px-4 py-2">{p.method}</td>
                                                <td className="px-4 py-2">
                                                    <Chip
                                                        value={getPaymentStatusText(p.status)}
                                                        color={getPaymentStatusColor(p.status)}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">{p.note || "—"}</td>
                                                <td className="px-4 py-2">{formatDate(p.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    )}

                    {/* Если нет платежей */}
                    {(!data?.payments || data?.payments?.length === 0) && (
                        <Typography className="italic text-blue-gray-400 text-sm">
                            Нет зарегистрированных платежей
                        </Typography>
                    )}
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Закрыть
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
