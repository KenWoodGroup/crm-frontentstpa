import { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardBody,
} from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import SupplierCreate from "./_components/CarrierCreate";
import { Staff } from "../../../utils/Controllers/Staff";
import Cookies from "js-cookie";
import SupplierDelete from "./_components/CarrierDelete";
import SupplierEdit from "./_components/CarrierEdit";
import { useTranslation } from "react-i18next";

export default function Carrier() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const GetStaff = async () => {
        setLoading(true);
        try {
            const response = await Staff?.StaffGet(Cookies.get("ul_nesw"));
            setClients(response?.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetStaff();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen transition-colors duration-300 bg-background-light dark:bg-background-dark">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography
                    variant="h4"
                    className="font-semibold text-text-light dark:text-text-dark"
                >
                    {t('Kurier')}
                </Typography>
                <SupplierCreate refresh={GetStaff} />
            </div>

            {clients.length <= 0 ? (
                <EmptyData text={"Доставшиков нет"} />
            ) : (
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark shadow-md transition-colors">
                    <CardBody className="p-0 overflow-auto">
                        <table className="w-full border-collapse min-w-max">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Firstname')}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Phone')}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('Created')}
                                    </th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                        {t('columnActions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, index) => (
                                    <tr
                                        key={client.id}
                                        className={`border-x border-gray-300 dark:border-gray-700 ${index === clients.length - 1
                                                ? 'border-b border-gray-300 dark:border-gray-700'
                                                : ''
                                            } ${index % 2 === 0
                                                ? "bg-white dark:bg-gray-900"
                                                : "bg-gray-50/50 dark:bg-gray-800/50"
                                            } hover:bg-gray-100 dark:hover:bg-gray-800 transition`}
                                    >
                                        <td className="p-1 text-center text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-300 dark:border-gray-700">
                                            {client.full_name}
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                            {client.phone}
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-1">
                                                <SupplierEdit
                                                    id={client?.id}
                                                    data={client}
                                                    refresh={GetStaff}
                                                />
                                                <SupplierDelete
                                                    id={client?.id}
                                                    refresh={GetStaff}
                                                />
                                            </div>
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
