import {
    Building2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    MapPin,
    Phone,
} from "lucide-react";
import { Alert } from "../../../utils/Alert";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "../../UI/Loadings/Loading";

import EmptyData from "../../UI/NoData/EmptyData";
import { useTranslation } from "react-i18next";
import PartnerCreate from "./_components/PartnerCreate";
import { Partner } from "../../../utils/Controllers/Partner";
import PartnerEdit from "./_components/PartnerEdit";
import PartnerDelete from "./_components/PartnerDelete";
import PartnerPayment from "./_components/PartnerPayment";
import { Card, CardBody } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export default function FactoryPartner() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const parent_id = Cookies.get("ul_nesw");

    const GetAll = async (pageNumber = 1) => {
        if (!parent_id) return Alert(t("no_parent_id"), "error");
        setLoading(true);
        try {
            const response = await Partner.ParentGet({
                id: parent_id,
                page: pageNumber,
                type: 'partner'
            });

            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};
            setPartners(records);

            setTotalPages(Number(pagination.total_pages) || 1);
            setPage(Number(pagination.currentPage) || pageNumber);
            setTotalCount(Number(pagination.total_count) || records.length);
        } catch (error) {
            console.log(error);
            Alert(t("error_occurred"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAll(page);
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen text-text-light dark:text-text-dark transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center flex-wrap gap-[20px] justify-between mb-8">
                <h1 className="text-2xl font-semibold">{t('partner')}</h1>
                <PartnerCreate refresh={() => GetAll(page)} />
            </div>

            {partners?.length > 0 ? (
                <Card className="overflow-hidden bg-card-light dark:bg-card-dark transition-colors duration-300">
                    <CardBody className="p-0 overflow-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#424242] border-x border-t border-gray-300 dark:border-gray-700">
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">{t('Name')}</th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">{t('Phone')}</th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">{t('Address')}</th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">{t('Balance')}</th>
                                    <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700 border-b">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.map((p, index) => (
                                    <tr
                                        onClick={()=>navigate(`/factory/partner/${p?.id}`)}
                                        key={p.id}
                                        className={`cursor-pointer border-x border-gray-300 dark:border-gray-700 ${index === partners.length - 1 ? "border-b border-gray-300 dark:border-gray-700" : ""} ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"}`}
                                    >
                                        <td className="p-2 text-left text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">{p.name}</td>
                                        <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">{p.phone}</td>
                                        <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">{p.address}</td>
                                        <td className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                            <span className={`${p.balance < 0 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                                                {Number(p.balance).toLocaleString()} UZS
                                            </span>
                                        </td>
                                        <td onClick={(e)=>stopPropagation(e.target.value)} className="p-2 text-center text-sm text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-700">
                                            <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                                                <PartnerPayment refresh={() => GetAll(page)} partner={p} />
                                                <PartnerEdit refresh={() => GetAll(page)} partner={p} />
                                                <PartnerDelete refresh={() => GetAll(page)} warehouseId={p.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>

                    {/* Pagination */}
                    {totalCount > 15 && (
                        <div className="flex justify-center mt-4 gap-4 p-3">
                            <button
                                onClick={() => GetAll(page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft />
                            </button>
                            <span className="flex items-center px-2">{page} / {totalPages}</span>
                            <button
                                onClick={() => GetAll(page + 1)}
                                disabled={page >= totalPages}
                                className="px-4 py-2 bg-gray-200  rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    )}
                </Card>
            ) : (
                <EmptyData text={t("Empty_data")} />
            )}
        </div>
    );
}
