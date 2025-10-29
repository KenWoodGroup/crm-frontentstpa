import { useEffect, useState } from "react";
import {
    Typography,
    Input,
    Card,
    CardBody,
    Button,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseSupplierCreate from "./_components/WarehouseСarrierCreate";
import { Staff } from "../../../utils/Controllers/Staff";
import Cookies from "js-cookie";
import WarehouseSupplierDelete from "./_components/WarehouseСarrierDelete";
import WarehouseSupplierEdit from "./_components/WarehouseСarrierEdit";


export default function WarehouseСarrier() {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    const GetStaff = async () => {
        setLoading(true);
        try {
            const response = await Staff?.StaffGet(Cookies.get(`ul_nesw`));
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
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <Typography variant="h4" className="font-semibold">
                    Поставшики
                </Typography>
                <WarehouseSupplierCreate refresh={GetStaff} />
            </div>

            {/* Если нет клиентов */}
            {clients.length <= 0 ? (
                <EmptyData text={'Поставшиков нет'} />
            ) : (
                <>
                    {/* Таблица клиентов */}
                    <Card className="overflow-hidden">
                        <CardBody className="p-0 overflow-auto">
                            <table className="w-full min-w-max text-left">
                                <thead>
                                    <tr className="bg-blue-gray-50 text-gray-700">
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
                                                ? "bg-white"
                                                : "bg-blue-gray-50/50"
                                                } hover:bg-blue-gray-100 transition`}
                                        >
                                            <td className="p-3 font-medium">
                                                {client.full_name}
                                            </td>
                                            <td className="p-3">{client.phone}</td>

                                            <td className="p-3">
                                                {new Date(client.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <WarehouseSupplierEdit id={client?.id} data={client} refresh={GetStaff} />
                                                <WarehouseSupplierDelete id={client?.id} refresh={GetStaff} />
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
