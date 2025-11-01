import { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardBody,
    Button,
} from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseCashCreate from "./_components/IndependentCashCreate";
import Cookies from "js-cookie";
import { Cash } from "../../../utils/Controllers/Cash";
import WarehouseCashDelete from "./_components/IndependentCashDelete";
import WarehouseCashEdit from "./_components/IndependentCashEdit";
import IndependentCashCreate from "./_components/IndependentCashCreate";
import IndependentCashDelete from "./_components/IndependentCashDelete";
import IndependentCashEdit from "./_components/IndependentCashEdit";

export default function IndependentCash() {
    const [loading, setLoading] = useState(true);
    const [cashes, setCashes] = useState([]);

    const GetAllCash = async () => {
        setLoading(true);
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];
            setCashes(data);
        } catch (error) {
            console.log(error);
            setCashes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAllCash();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
            {/* Заголовок + кнопка */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Кассы
                </Typography>
                <IndependentCashCreate refresh={GetAllCash} />
            </div>

            {/* Если нет касс */}
            {cashes.length <= 0 ? (
                <EmptyData text={"Касс нет"} />
            ) : (
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                    <CardBody className="p-0 overflow-auto">
                        <table className="w-full min-w-max text-left">
                            <thead className="bg-blue-gray-50 dark:bg-gray-700 text-gray-700 dark:text-text-dark">
                                <tr>
                                    <th className="p-3">Название</th>
                                    <th className="p-3">Баланс</th>
                                    <th className="p-3">Дата создания</th>
                                    <th className="p-3 text-center">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashes.map((cash, index) => (
                                    <tr
                                        key={cash.id}
                                        className={`${index % 2 === 0
                                            ? "bg-card-light dark:bg-card-dark"
                                            : "bg-card-light/50 dark:bg-card-dark/50"
                                            } hover:bg-blue-gray-100 dark:hover:bg-gray-600 transition-colors`}
                                    >
                                        <td className="p-3 font-medium text-text-light dark:text-text-dark">
                                            {cash.name}
                                        </td>
                                        <td className="p-3 text-blue-700 font-semibold">
                                            {Number(cash.balance).toLocaleString()} so'm
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-text-dark">
                                            {new Date(cash.createdAt).toLocaleDateString("ru-RU", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            <IndependentCashEdit id={cash?.id} data={cash} refresh={GetAllCash} />
                                            <IndependentCashDelete id={cash?.id} refresh={GetAllCash} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
