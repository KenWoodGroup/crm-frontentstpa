import { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardBody,
    Button,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { ChevronLeft, ChevronRight, Trash2, Edit, DollarSign } from "lucide-react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseCashCreate from "./_components/WarehouseCashCreate";
import Cookies from "js-cookie";
import { Cash } from "../../../utils/Controllers/Cash";
import WarehouseCashDelete from "./_components/WarehouseCashDelete";
import WarehouseCashEdit from "./_components/WarehouseCashEdit";

export default function WarehouseCash() {
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
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Кассы
                </Typography>
                <WarehouseCashCreate refresh={GetAllCash} />
            </div>

            {cashes.length <= 0 ? (
                <EmptyData text={"Касс нет"} />
            ) : (
                <>
                    <Card className="overflow-hidden">
                        <CardBody className="p-0 overflow-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="bg-blue-gray-50 text-gray-700">
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
                                                ? "bg-white"
                                                : "bg-blue-gray-50/50"
                                                } hover:bg-blue-gray-100 transition`}
                                        >
                                            <td className="p-3 font-medium text-gray-800">
                                                {cash.name}
                                            </td>
                                            <td className="p-3 text-blue-700 font-semibold">
                                                {Number(cash.balance).toLocaleString()} so'm
                                            </td>
                                            <td className="p-3 text-gray-600">
                                                {new Date(cash.createdAt).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <WarehouseCashEdit id={cash?.id} data={cash} refresh={GetAllCash} />
                                                <WarehouseCashDelete id={cash?.id} refresh={GetAllCash} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                </>
            )}
        </div>
    );
}
