import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { location } from "../../utils/Controllers/location";
import { MapPin, Phone, Package, Calendar, RefreshCw, Mail } from "lucide-react";
import Loading from "../UI/Loadings/Loading";
import { useTranslation } from "react-i18next";
import { UserApi } from "../../utils/Controllers/UserApi";
import ProfileEdit from "./_components/ProfileEdit";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState([])
    const { t } = useTranslation();


    const getProfiler = async () => {
        setLoading(true)
        try {
            const response = await location?.Get(Cookies.get("ul_nesw"));
            setProfile(response?.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const getUser = async () => {
        try {
            const response = await UserApi?.UserGet({ id: Cookies.get("ul_nesw") })
            setUser(response?.data[0])
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getUser()
        getProfiler();
    }, []);

    if (loading) {
        return (
            <Loading />
        )
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-background-light dark:bg-background-dark">
                <Typography
                    variant="h5"
                    className="text-text-light dark:text-text-dark"
                >
                    Профиль не найден
                </Typography>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatNumber = (number) => {
        return Number(number).toLocaleString("ru-RU");
    };

    return (
        <div className="flex bg-background-light dark:bg-background-dark transition-colors duration-300 ">
            <Card className="w-full max-w-xl shadow-lg rounded-2xl bg-card-light dark:bg-card-dark transition-colors duration-300">
                <CardHeader
                    floated={false}
                    shadow={false}
                    className="p-6 rounded-t-2xl bg-card-light dark:bg-background-dark flex items-center justify-between flex-wrap"
                >
                    <Typography variant="h4" className="text-text-light dark:text-text-dark font-semibold flex items-center gap-2">
                        <Package className="w-6 h-6" /> {profile.name}
                    </Typography>
                    <ProfileEdit />
                </CardHeader>

                <CardBody className="p-6 space-y-4">
                    <div className="flex flex-col gap-3">
                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <Package className="w-5 h-5" /> {t(`Type`)}: <span className="font-normal">{profile.type}</span>
                        </Typography>

                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <MapPin className="w-5 h-5" /> {t('Address')}: <span className="font-normal">{profile.address}</span>
                        </Typography>

                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <Phone className="w-5 h-5" /> {t('Phone')}: <span className="font-normal">{profile.phone}</span>
                        </Typography>
                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <Mail className="w-5 h-5" /> {t('Phone')}: <span className="font-normal">{user.email ? user?.email : 'Berilmagan'}</span>
                        </Typography>

                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <Package className="w-5 h-5" /> {t('Balance')}:{" "}
                            <span
                                className={`font-bold ${Number(profile.balance) < 0
                                    ? "text-red-500"
                                    : "text-green-500"
                                    }`}
                            >
                                {formatNumber(profile.balance)} UZS
                            </span>
                        </Typography>

                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <Calendar className="w-5 h-5" /> {t('Created')}: <span className="font-normal">{formatDate(profile.createdAt)}</span>
                        </Typography>

                        <Typography className="text-text-light dark:text-text-dark font-medium flex items-center flex-wrap gap-2">
                            <RefreshCw className="w-5 h-5" /> {t('Updated')}: <span className="font-normal">{formatDate(profile.updatedAt)}</span>
                        </Typography>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
