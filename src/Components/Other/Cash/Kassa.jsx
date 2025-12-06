import { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardBody,
    Button,
} from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import CashCreate from "./_components/CashCreate";
import Cookies from "js-cookie";
import { Cash } from "../../../utils/Controllers/Cash";
import CashDelete from "./_components/CashDelete";
import CashEdit from "./_components/CashEdit";
import { useTranslation } from "react-i18next";

export default function Kassa() {
    const { t } = useTranslation()
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
                    {t("Kassa")}
                </Typography>
                <CashCreate refresh={GetAllCash} />
            </div>

            {/* Если нет касс */}
            {cashes.length <= 0 ? (
                <EmptyData text={t('Empty_data')} />
            ) : (
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark">
                    <CardBody className="p-0 overflow-auto">
                        <table className="w-full border-collapse min-w-max">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                    <th className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Name')}
                                    </th>
                                    <th className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Balance')}
                                    </th>
                                    <th className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Created')}
                                    </th>
                                    <th className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('columnActions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashes.map((cash, index) => {
                                    const balance = Number(cash.balance);
                                    const isPositive = balance > 0;
                                    const isNegative = balance < 0;

                                    return (
                                        <tr
                                            key={cash.id}
                                            className={`border-x border-gray-300 dark:border-gray-700 ${index === cashes.length - 1
                                                    ? 'border-b border-gray-300 dark:border-gray-700'
                                                    : ''
                                                } ${index % 2 === 0
                                                    ? "bg-white dark:bg-gray-900"
                                                    : "bg-gray-50/50 dark:bg-gray-800/50"
                                                } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                        >
                                            <td className="p-1 text-center text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-300 dark:border-gray-700">
                                                {cash.name}
                                            </td>
                                            <td className={`p-1 text-center text-sm font-semibold border-x border-gray-300 dark:border-gray-700 ${isPositive
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : isNegative
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {balance.toLocaleString()} so'm
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                {new Date(cash.createdAt).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CashEdit id={cash?.id} data={cash} refresh={GetAllCash} />
                                                    <CashDelete id={cash?.id} refresh={GetAllCash} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
