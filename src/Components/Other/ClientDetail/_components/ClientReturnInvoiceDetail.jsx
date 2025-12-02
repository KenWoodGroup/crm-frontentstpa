import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Card,
} from "@material-tailwind/react";

export default function ClientReturnInvoiceDetail({ data }) {
    const [open, setOpen] = useState(false);
    const [animate, setAnimate] = useState(false);

    const handleOpen = () => setOpen((v) => !v);

    useEffect(() => {
        if (open) {
            setAnimate(false);
            const timer = setTimeout(() => setAnimate(true), 10);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatNumber = (num) => {
        if (!num) return "—";
        const n = Number(num);
        if (Number.isNaN(n)) return num;
        return Math.floor(n).toLocaleString("ru-RU");
    };

    const getStatusText = (status) => {
        switch (status) {
            case "draft":
                return "Черновик";
            case "sent":
                return "Отправлено";
            case "received":
                return "Получено";
            case "cancelled":
                return "Отменено";
            default:
                return status || "—";
        }
    };

    const getTypeText = (type) => {
        switch (type) {
            case "return_in":
                return "Возврат (приход)";
            case "return_out":
                return "Возврат (расход)";
            default:
                return type || "—";
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                color="blue"
                size="sm"
                onClick={handleOpen}
            >
                Детали
            </Button>

            <Dialog open={open} handler={handleOpen} size="xl">
                <DialogHeader>
                    Детали возвратной накладной
                </DialogHeader>

                <DialogBody divider className="space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Основная информация */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Номер накладной:
                            </Typography>
                            <Typography>{data?.invoice_number || "—"}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Тип:
                            </Typography>
                            <Typography>{getTypeText(data?.type)}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Отправитель:
                            </Typography>
                            <Typography>{data?.sender_name || "—"}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Получатель:
                            </Typography>
                            <Typography>{data?.receiver_name || "—"}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Статус:
                            </Typography>
                            <Typography>{getStatusText(data?.status)}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Статус оплаты:
                            </Typography>
                            <Typography>{data?.payment_status || "—"}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Общая сумма:
                            </Typography>
                            <Typography>{formatNumber(data?.total_sum)} UZS</Typography>
                        </div>

                        {data?.note && (
                            <div className="md:col-span-2">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-semibold"
                                >
                                    Примечание:
                                </Typography>
                                <Typography>{data.note}</Typography>
                            </div>
                        )}

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Создано:
                            </Typography>
                            <Typography>{formatDate(data?.createdAt)}</Typography>
                        </div>

                        <div>
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                            >
                                Обновлено:
                            </Typography>
                            <Typography>{formatDate(data?.updatedAt)}</Typography>
                        </div>
                    </div>

                    {/* Таблица товаров */}
                    <div
                        className={`transition-all duration-300 ease-out transform origin-top
                            ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
                        `}
                    >
                        <Typography
                            variant="h6"
                            color="blue-gray"
                            className="mt-6 mb-2 font-semibold"
                        >
                            Список товаров
                        </Typography>

                        {data?.invoice_items?.length > 0 ? (
                            <Card className="overflow-x-auto border border-blue-gray-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-blue-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">#</th>
                                            <th className="px-4 py-2">Наименование</th>
                                            <th className="px-4 py-2">Штрихкод</th>
                                            <th className="px-4 py-2">Количество</th>
                                            <th className="px-4 py-2">Цена</th>
                                            <th className="px-4 py-2">Итого</th>
                                            <th className="px-4 py-2">Ед. изм.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.invoice_items.map((item, i) => {
                                            const qty = Number(item.quantity) || 0;
                                            const price = Number(item.price) || 0;
                                            const total = qty * price;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b hover:bg-blue-gray-50/50"
                                                >
                                                    <td className="px-4 py-2">{i + 1}</td>
                                                    <td className="px-4 py-2">
                                                        {item.product?.name || "—"}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.barcode || "—"}
                                                    </td>
                                                    <td className="px-4 py-2">{qty}</td>
                                                    <td className="px-4 py-2">
                                                        {formatNumber(price)} UZS
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {formatNumber(total)} UZS
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {item.product?.unit || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Итог по товарам */}
                                <div className="p-4 text-right">
                                    <Typography variant="small" className="font-semibold">
                                        Общая сумма возврата:{" "}
                                        {formatNumber(
                                            (data?.invoice_items || []).reduce(
                                                (sum, it) =>
                                                    sum +
                                                    (Number(it.quantity) || 0) *
                                                    (Number(it.price) || 0),
                                                0
                                            )
                                        )}{" "}
                                        UZS
                                    </Typography>
                                </div>
                            </Card>
                        ) : (
                            <Typography className="italic text-blue-gray-400 text-sm">
                                Нет товаров в накладной
                            </Typography>
                        )}
                    </div>
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
