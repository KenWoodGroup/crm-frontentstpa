import React, { useEffect, useState } from "react";
import {
    Typography,
    Button,
    IconButton,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { ClientCategory } from "../../../utils/Controllers/ClientCategory";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseClientCategoryCreate from "./_components/WarehouseClientCategoryCreate";
import WarehouseClientCategoryDelete from "./_components/WarehouseClientCategoryDelete";
import WarehouseClientCategoryEdit from "./_components/WarehouseClientCategoryEdit";
import { useTranslation } from "react-i18next";

export default function WarehouseClientCategory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation()


    // 🔹 Получаем все категории клиентов
    const getAllCategoryClient = async () => {
        try {
            setLoading(true);
            const response = await ClientCategory.GetClientCategory(
                Cookies.get("ul_nesw")
            );

            if (response?.data) {
                setData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.log("Ошибка при получении категорий:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllCategoryClient();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-200">
            {/* 🔹 Заголовок */}
            <div className="flex items-center justify-between mb-8">
                <Typography
                    variant="h5"
                    className="font-semibold text-blue-gray-700 dark:text-text-dark transition-colors duration-200"
                >
                    {t('Category_Client')}
                </Typography>
                <WarehouseClientCategoryCreate refresh={getAllCategoryClient} />
            </div>

            {/* 🔹 Таблица */}
            <div className="overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg flex-grow max-h-[600px] bg-card-light dark:bg-card-dark transition-colors duration-200">
                {data?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-blue-50 dark:bg-card-dark text-gray-700 dark:text-gray-300 text-sm sticky top-0 z-10 transition-colors duration-200">
                            <tr>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-center w-[5%]">
                                    №
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    {t('Name')}
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    {t('Comment')}
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-right">
                                    {t('Created')}
                                </th>
                                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-right">
                                    {t('columnActions')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, i) => (
                                <tr
                                    key={item.id || i}
                                    className={`${i % 2 === 0
                                        ? "bg-white dark:bg-gray-800"
                                        : "bg-gray-50 dark:bg-gray-700/50"
                                        } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200`}
                                >
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-center text-text-light dark:text-text-dark">
                                        {i + 1}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium text-blue-gray-700 dark:text-text-dark">
                                        {item.name || "-"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                        {item.note || "-"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-right text-gray-700 dark:text-gray-300">
                                        {new Date(item.createdAt).toLocaleString("ru-RU")}
                                    </td>
                                    <td className="p-3 border-b border-gray-200 dark:border-gray-700 text-right text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center justify-end gap-[10px]">
                                            <WarehouseClientCategoryEdit data={item} id={item?.id} refresh={getAllCategoryClient} />
                                            <WarehouseClientCategoryDelete id={item?.id} refresh={getAllCategoryClient} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyData text={t('Empty_Data')} />
                )}
            </div>
        </div>
    );
}
