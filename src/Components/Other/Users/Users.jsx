import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { UserApi } from "../../../utils/Controllers/UserApi";
import Loading from "../../UI/Loadings/Loading";
import { Alert } from "../../../utils/Alert";
import { Button, Card, CardBody } from "@material-tailwind/react";
import { User, Mail, CalendarDays, ShieldUser } from "lucide-react";
import UserCreate from "./_components/UserCreate";
import EmptyData from "../../UI/NoData/EmptyData";
import UserDelete from "./_components/UserDelete";
import UserEdit from "./_components/UserEdit";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import Eye from "../../UI/Icons/Eye";


export default function Users() {
    const {id} = useParams()
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const { t } = useTranslation()

    const roleMapper = {
        cashier: "Cashier",
        storekeeper: "Storekeeper",
        seller: "Seller",
        factory: "Factory"
    };

    const GetUsers = async () => {
        setLoading(true);
        try {
            const response = await UserApi.UserGet({ id });
            const records = response.data || [];
            setUsers(records);
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetUsers();
    }, [id]);

    if (loading) return <Loading />;

    return (
        <div className=" min-h-screen rounded-2xl">
            {/* Заголовок и кнопка */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark transition-colors duration-300">
                    {t('Warehouse_user')}
                </h1>
                <UserCreate refresh={() => GetUsers()} />
            </div>
            {/* Контент */}
            {users?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((u) => (
                        <Card
                            key={u.id}
                            className="shadow-sm hover:shadow-md  rounded-2xl border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark transition-colors duration-300"
                        >
                            <CardBody className="space-y-3 pt-[5px]">
                                {/* Имя и кнопки */}
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <span className="font-medium text-text-light dark:text-text-dark transition-colors duration-300">
                                            {u.full_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <UserEdit user={u} refresh={() => GetUsers()} />
                                        <UserDelete id={u.id} refresh={() => GetUsers()} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        {u.username}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        {roleMapper[u.role] || u.role}
                                    </span>
                                </div>

                                {/* Дата создания */}
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyData text={t('Empty_data')} />
            )}
        </div>
    );
}
