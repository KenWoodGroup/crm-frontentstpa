import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Typography,
    Input,
    IconButton,
    Button,
    Tooltip,
} from "@material-tailwind/react";
import { Alert } from "../../../utils/Alert";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import WarehouseDilerCreate from "./_components/WarehouseDilerCreate";
import WarehouseDilerDelete from "./_components/WarehouseDilerDelete";
import WarehouseDilerEdit from "./_components/WarehouseDilerEdit";
import { Clients } from "../../../utils/Controllers/Clients";
import { useTranslation } from "react-i18next";

export default function WarehouseDiler() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchValue, setSearchValue] = useState("");

    const parent_id = Cookies.get("ul_nesw");

    const GetAll = async (pageNumber = 1, searchTerm = searchValue) => {
        if (!parent_id) return Alert("Parent ID topilmadi", "error");
        setLoading(true);

        try {
            const data = {
                type: "dealer",
                page: pageNumber,
                search: searchTerm.trim() === "" ? "all" : searchTerm,
                location_id: parent_id,
                date: new Date().toISOString(),
            };

            const response = await Clients?.GetClients(data);
            const records = response.data?.data?.records || [];
            const pagination = response.data?.data?.pagination || {};

            setWarehouses(records);
            setTotalPages(Number(pagination.total_pages) || 1);
            setPage(Number(pagination.current_page) || pageNumber);
            setTotalCount(Number(pagination.total_count) || records.length);
        } catch (error) {
            console.error(error);
            Alert("Xatolik yuz berdi ❌", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetAll(1);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            GetAll(1, searchValue);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchValue]);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <Typography variant="h4" className="dark:text-text-dark text-black" >
                    {t('dilers')}
                </Typography>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Input
                            label={t('Search_name')}
                            icon={<Search size={18} />}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            color="blue-gray"
                            crossOrigin=""
                        />
                    </div>
                    <WarehouseDilerCreate refresh={() => GetAll(page)} />
                </div>
            </div>

            {/* Контент */}
            {warehouses?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((w) => (
                            <Card
                                key={w.id}
                                className="shadow-sm border  dark:bg-card-dark hover:shadow-md transition-all"
                            >
                                <CardHeader
                                    floated={false}
                                    shadow={false}
                                    className="bg-blue-gray-50 flex items-center justify-between p-4 dark:bg-background-dark "
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Building2 className="w-6 h-6 text-blue-gray-700" />
                                        </div>
                                        <Typography
                                            variant="h6"
                                            color="blue-gray"
                                            className="font-semibold dark:text-text-dark"
                                        >
                                            {w.name}
                                        </Typography>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Tooltip content="Tahrirlash">
                                            <WarehouseDilerEdit
                                                refresh={() => GetAll(page)}
                                                diler={w}
                                            />
                                        </Tooltip>
                                        <Tooltip content="O'chirish">
                                            <WarehouseDilerDelete
                                                refresh={() => GetAll(page)}
                                                dilerId={w?.id}
                                            />
                                        </Tooltip>
                                    </div>
                                </CardHeader>

                                <CardBody className="text-blue-gray-700 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <Typography className=" dark:text-text-dark"
                                            variant="small">
                                            {w.users?.[0]?.email || "—"}
                                        </Typography>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <Typography className=" dark:text-text-dark" variant="small">
                                            {w.address || "Manzil kiritilmagan"}
                                        </Typography>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        <Typography className=" dark:text-text-dark" variant="small">
                                            {w.phone || "Telefon mavjud emas"}
                                        </Typography>
                                    </div>
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="flex items-center gap-1  dark:text-text-dark"
                                    >
                                        <span className="font-medium text-blue-gray-700 dark:text-text-dark">
                                            Yaratilgan sana:
                                        </span>
                                        {new Date(w.createdAt).toLocaleDateString("uz-UZ")}
                                    </Typography>
                                </CardBody>

                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalCount > 15 && (
                        <div className="flex justify-center mt-6 gap-4">
                            <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={() => GetAll(page - 1)}
                                disabled={page <= 1}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </IconButton>

                            <Typography variant="small" color="blue-gray" className="flex items-center">
                                {page} / {totalPages}
                            </Typography>

                            <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={() => GetAll(page + 1)}
                                disabled={page >= totalPages}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </IconButton>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text={"Diler mavjud emas"} />
            )}
        </div>
    );
}
