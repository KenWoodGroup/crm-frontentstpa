import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    CardBody,
    Typography,
    Switch,
    Button
} from "@material-tailwind/react";
import {
    Store,
    MapPin,
    Phone,
    Wallet,
    Package
} from "lucide-react";

import { location } from "../../../utils/Controllers/location";
import { LocationOptions } from "../../../utils/Controllers/LocationOptions";
import { OptionApi } from "../../../utils/Controllers/OptionApi";
import Loading from "../../UI/Loadings/Loading";
import WarehouseGet from "./_components/WarehouseGet";

export default function ManagerFactoryDetail() {
    const { id } = useParams();

    const [factory, setFactory] = useState(null);
    const [options, setOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [optimisticOptions, setOptimisticOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    /* ================= API ================= */

    const getFactory = async () => {
        const res = await location.Get(id);
        setFactory(res.data);
    };

    const getLocationOptions = async () => {
        const res = await LocationOptions.GetByLocationId(id);
        setLocationOptions(res.data);
    };

    const getOptions = async () => {
        const res = await OptionApi.GetAllOptions();
        setOptions(res.data);
    };

    /* ===== sync optimistic state ===== */
    useEffect(() => {
        setOptimisticOptions(locationOptions);
    }, [locationOptions]);

    /* ================= SWITCH HANDLER ================= */

    const handleToggle = async (optionId, checked) => {
        const prevState = [...optimisticOptions];

        // 🔥 1. МГНОВЕННЫЙ UI
        if (checked) {
            setOptimisticOptions((prev) => [
                ...prev,
                { option_id: optionId }
            ]);
        } else {
            setOptimisticOptions((prev) =>
                prev.filter((lo) => lo.option_id !== optionId)
            );
        }

        try {
            // 🕐 2. REQUEST В ФОНЕ
            if (checked) {
                await LocationOptions.CreateLocationOption({
                    location_id: id,
                    option_id: optionId
                });
            } else {
                const current = locationOptions.find(
                    (lo) => lo.option_id === optionId
                );
                if (current) {
                    await LocationOptions.DeleteLocationOption(current.id);
                }
            }

            // 🔄 3. СИНХРОНИЗАЦИЯ
            await getLocationOptions();
        } catch (error) {
            console.log(error);

            // ❌ 4. ROLLBACK
            setOptimisticOptions(prevState);
        }
    };

    /* ================= INIT ================= */

    useEffect(() => {
        Promise.all([
            getFactory(),
            getLocationOptions(),
            getOptions()
        ]).finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading />;

    /* ================= UI ================= */

    return (
        <div className="space-y-6 text-gray-900 dark:text-gray-100">

            {/* ===== Factory info ===== */}
            <Card className="dark:bg-card-dark">
                <CardBody className="space-y-4">
                    <div className="flex items-center gap-[5px]">
                        <Button onClick={() => navigate(-1)} className="p-[10px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </Button>
                        <Typography variant="h5" className="flex items-center gap-2 dark:text-text-dark">
                            <Store size={20} /> {factory.name}
                        </Typography>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{factory.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <span>{factory.phone}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Wallet size={16} />
                            <span>Баланс: {factory.balance}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Package size={16} />
                            <span>Тип: {factory.type}</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* ===== Options ===== */}
            <Card className="dark:bg-card-dark">
                <CardBody>
                    <Typography variant="h6" className="mb-4 dark:text-text-dark">
                        Опции фабрики
                    </Typography>

                    <div className="space-y-4">
                        {options.map((opt) => {
                            const checked = optimisticOptions.some(
                                (lo) => lo.option_id === opt.id
                            );

                            return (
                                <div
                                    key={opt.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all"
                                >
                                    <div>
                                        <Typography className="font-medium dark:text-text-dark">
                                            {opt.name}
                                        </Typography>
                                        {opt.note && (
                                            <Typography className="text-xs opacity-70 dark:text-text-dark">
                                                {opt.note}
                                            </Typography>
                                        )}
                                    </div>

                                    <Switch
                                        color="green"
                                        checked={checked}
                                        onChange={(e) =>
                                            handleToggle(
                                                opt.id,
                                                e.target.checked
                                            )
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
            <WarehouseGet />
        </div>
    );
}
