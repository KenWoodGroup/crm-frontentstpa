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
import ClientCategoryCreate from "./_components/ClientCategoryCreate";
import ClientCategoryDelete from "./_components/ClientCategoryDelete";
import ClientCategoryEdit from "./_components/ClientCategoryEdit";
import { useTranslation } from "react-i18next";

export default function CategoryClient() {
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full md:w-auto mb-6">
                <Typography
                    variant="h5"
                    className="font-semibold text-blue-gray-700 dark:text-text-dark transition-colors duration-200"
                >
                    {t('Category_Client')}
                </Typography>
                <ClientCategoryCreate refresh={getAllCategoryClient} />
            </div>

            {/* 🔹 Таблица */}
            <div className="overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg flex-grow max-h-[600px] bg-card-light dark:bg-card-dark transition-colors duration-200">
                {data?.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#424242] text-sm sticky top-0 z-10 transition-colors duration-200">
                            <tr className="border-x border-t border-gray-300 dark:border-gray-700">
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                    №
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                    {t('Name')}
                                </th>
                                <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">
                                    {t('Comment')}
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
                            {data.map((item, i) => (
                                <tr
                                    key={item.id || i}
                                    className={`border-x border-gray-300 dark:border-gray-700 ${i === data.length - 1
                                            ? 'border-b border-gray-300 dark:border-gray-700'
                                            : ''
                                        } ${i % 2 === 0
                                            ? "bg-white dark:bg-gray-900"
                                            : "bg-gray-50/50 dark:bg-gray-800/50"
                                        } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200`}
                                >
                                    <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                        {i + 1}
                                    </td>
                                    <td className="p-1 text-center text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-300 dark:border-gray-700">
                                        {item.name || (
                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                        {item.note || (
                                            <span className="text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                        {new Date(item.createdAt).toLocaleString("ru-RU")}
                                    </td>
                                    <td className="p-1 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                        <div className="flex items-center justify-center gap-1">
                                            <ClientCategoryEdit data={item} id={item?.id} refresh={getAllCategoryClient} />
                                            <ClientCategoryDelete id={item?.id} refresh={getAllCategoryClient} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyData text={t('Empty_data')} />
                )}
            </div>
        </div>
    );
}
