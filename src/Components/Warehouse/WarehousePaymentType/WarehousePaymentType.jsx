import { useEffect, useState } from "react";
import { Typography, Card, CardBody, Button } from "@material-tailwind/react";
import { PaymentMethodApi } from "../../../utils/Controllers/PaymentMethodApi";
import Cookies from "js-cookie";
import PaymentTypeCreate from "./_components/PaymentTypeCreate";
import {
    CreditCard,
    FileText,
    Calendar,
    Info,
    PlusCircle,
} from "lucide-react";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";
import PaymentTypeDelete from "./_components/PaymentTypeDelete";
import PaymentTypeEdit from "./_components/PaymentTypeEdit";

export default function WarehousePaymentType() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    const GetAllPaymentMethod = async () => {
        setLoading(true)
        try {
            const response = await PaymentMethodApi?.PaymentTypeGet(
                Cookies.get("ul_nesw")
            );
            setData(response?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        GetAllPaymentMethod();
    }, []);

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div
            className={`min-h-screen transition-colors duration-300
            bg-background-light text-text-light
            dark:bg-background-dark dark:text-text-dark`}
        >
            <div className="flex items-center justify-between mb-6">
                <Typography variant="h4" className="font-semibold">
                    Типы оплат
                </Typography>
                <PaymentTypeCreate refresh={GetAllPaymentMethod} />
            </div>

            {/* Если данных нет */}
            {(!data || data.length === 0) ? (
                <EmptyData text={"Тип цены нет"} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((item) => (
                        <Card
                            key={item.id}
                            className="shadow-md rounded-2xl p-4 hover:shadow-lg transition-all duration-300
                            bg-white dark:bg-card-dark dark:text-text-dark"
                        >
                            <CardBody className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-blue-600 dark:text-blue-400" size={28} />
                                        <Typography variant="h6" className="font-semibold">
                                            {item.name}
                                        </Typography>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <PaymentTypeEdit item={item} refresh={GetAllPaymentMethod}/>
                                        <PaymentTypeDelete id={item?.id} refresh={GetAllPaymentMethod} />
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <FileText size={18} />
                                    <span>{item.note || "—"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar size={16} />
                                    <span>
                                        {new Date(item.createdAt).toLocaleString("ru-RU", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
