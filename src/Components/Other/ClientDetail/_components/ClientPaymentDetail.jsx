import { useEffect, useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Card,
} from "@material-tailwind/react";

export default function WarehouseClientPaymentDetail({ data }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("payments");
    const [animate, setAnimate] = useState(false);

    const handleOpen = () => setOpen((v) => !v);

    // трюк для анимации: при смене вкладки кратковременно перезапускаем анимацию
    useEffect(() => {
        setAnimate(false);
        const t = setTimeout(() => setAnimate(true), 10);
        return () => clearTimeout(t);
    }, [activeTab]);

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
        if (num === null || num === undefined || num === "") return "—";
        const n = Number(num);
        if (Number.isNaN(n)) return num;
        // показываем без копеек (как в примере пользователя)
        return Math.floor(n).toLocaleString("ru-RU");
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
                return status || "—";
        }
    };

    return (
        <>
            <Button variant="outlined" color="blue" size="sm" onClick={handleOpen}>
                Детали
            </Button>

            <Dialog open={open} handler={handleOpen} size="xl">
                <DialogHeader>Детали накладной</DialogHeader>

                <DialogBody divider className="space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Основная информация */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Номер накладной:
                            </Typography>
                            <Typography>{data?.invoice_number || "—"}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Статус оплаты:
                            </Typography>
                            <Typography>{getPaymentStatusText(data?.payment_status)}</Typography>
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
                            <Typography>{data?.status || "—"}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Отправитель:
                            </Typography>
                            <Typography>{data?.sender_name || "—"}</Typography>
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="font-semibold">
                                Получатель:
                            </Typography>
                            <Typography>{data?.receiver_name || "—"}</Typography>
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
                            <Typography>{data?.type || "—"}</Typography>
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

                    {/* Кнопки-вкладки (без сторонних таб-стикеров) */}
                    <div className="flex w-full gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab("payments")}
                            className={`px-4 py-2 rounded-lg text-sm w-full font-medium transition
                                ${activeTab === "payments" ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100"}
                            `}
                        >
                            Платежи
                        </button>

                        <button
                            onClick={() => setActiveTab("items")}
                            className={`px-4 py-2 rounded-lg text-sm w-full font-medium transition
                                ${activeTab === "items" ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100"}
                            `}
                        >
                            Продукты
                        </button>
                    </div>

                    {/* Контент вкладки с анимацией появления */}
                    <div
                        className={`mt-4 transition-all duration-250 ease-out transform origin-top
                            ${animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
                        `}
                        // ключ нужен, чтобы React заново отрисовал блок при смене вкладки — анимация сработает
                        key={activeTab}
                    >
                        {/* Платежи */}
                        {activeTab === "payments" && (
                            <>
                                {data?.payments?.length > 0 ? (
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
                                                        <td className="px-4 py-2">{p.method || "—"}</td>
                                                        <td className="px-4 py-2">{getPaymentStatusText(p.status)}</td>
                                                        <td className="px-4 py-2">{p.note || "—"}</td>
                                                        <td className="px-4 py-2">{formatDate(p.createdAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Card>
                                ) : (
                                    <Typography className="italic text-blue-gray-400 text-sm">
                                        Нет зарегистрированных платежей
                                    </Typography>
                                )}
                            </>
                        )}

                        {/* Продукты */}
                        {activeTab === "items" && (
                            <>
                                {data?.invoice_items?.length > 0 ? (
                                    <Card className="overflow-x-auto border border-blue-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-blue-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2">#</th>
                                                    <th className="px-4 py-2">Название</th>
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
                                                        <tr key={item.id} className="border-b hover:bg-blue-gray-50/50">
                                                            <td className="px-4 py-2">{i + 1}</td>
                                                            <td className="px-4 py-2">{item.product?.name || "—"}</td>
                                                            <td className="px-4 py-2">{item.barcode || "—"}</td>
                                                            <td className="px-4 py-2">{item.quantity}</td>
                                                            <td className="px-4 py-2">{formatNumber(item.price)} UZS</td>
                                                            <td className="px-4 py-2">{formatNumber(total)} UZS</td>
                                                            <td className="px-4 py-2">{item.product?.unit || "—"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        {/* Итог по товарам (под таблицей) */}
                                        <div className="p-4 text-right">
                                            <Typography variant="small" className="font-semibold">
                                                Итого по продуктам:{" "}
                                                {formatNumber(
                                                    (data?.invoice_items || []).reduce((sum, it) => {
                                                        const q = Number(it.quantity) || 0;
                                                        const p = Number(it.price) || 0;
                                                        return sum + q * p;
                                                    }, 0)
                                                )}{" "}
                                                UZS
                                            </Typography>
                                        </div>
                                    </Card>
                                ) : (
                                    <Typography className="italic text-blue-gray-400 text-sm">
                                        Нет добавленных продуктов
                                    </Typography>
                                )}
                            </>
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
