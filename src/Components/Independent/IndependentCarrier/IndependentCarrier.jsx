import { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardBody,
} from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import { Staff } from "../../../utils/Controllers/Staff";
import Cookies from "js-cookie";
import IndependentCarrierCreate from "./_components/IndependentCarrierCreate";
import IndependentСarrierDelete from "./_components/IndependentСarrierDelete";
import IndependentСarrierEdit from "./_components/IndependentСarrierEdit";

export default function IndependentCarrier() {
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
                    Доставшики
                </Typography>
                <IndependentCarrierCreate refresh={GetStaff} />
            </div>

            {clients.length <= 0 ? (
                <EmptyData text={"Доставшиков нет"} />
            ) : (
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark shadow-md transition-colors">
                    <CardBody className="p-0 overflow-auto">
                        <table className="w-full min-w-max text-left">
                            <thead>
                                <tr className="bg-blue-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                    <th className="p-3">Имя</th>
                                    <th className="p-3">Телефон</th>
                                    <th className="p-3">Дата создания</th>
                                    <th className="p-3 text-center">Настройки</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, index) => (
                                    <tr
                                        key={client.id}
                                        className={`${index % 2 === 0
                                            ? "bg-white dark:bg-gray-900"
                                            : "bg-blue-gray-50/50 dark:bg-gray-800"
                                            } hover:bg-blue-gray-100 dark:hover:bg-gray-700 transition`}
                                    >
                                        <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                                            {client.full_name}
                                        </td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                            {client.phone}
                                        </td>
                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                            {new Date(client.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            <IndependentСarrierEdit
                                                id={client?.id}
                                                data={client}
                                                refresh={GetStaff}
                                            />
                                            <IndependentСarrierDelete
                                                id={client?.id}
                                                refresh={GetStaff}
                                            />
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
