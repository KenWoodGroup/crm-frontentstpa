import { useEffect, useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Notification } from "../../../utils/Controllers/Notification";
import EmptyData from "../../UI/NoData/EmptyData";
import Loading from "../../UI/Loadings/Loading";
import { NavLink } from "react-router-dom";
import { io } from "socket.io-client";

export default function DilerNotification() {
    const locationId = Cookies?.get("ul_nesw");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const GetNotification = async () => {
        try {
            const response = await Notification?.GetNotification({
                id: locationId,
                page: 1,
            });
            if (response?.data?.data?.records) {
                setNotifications(response.data?.data?.records);
            }
        } catch (error) {
            console.log("Bildirishnomalarni olishda xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!locationId) return;

        GetNotification();

        const socket = io("https://test.edu-devosoft.uz", {
            path: "/socket.io",
            transports: ["websocket"],
        });

        socket.emit("joinLocation", locationId);

        socket.on("invoiceUpdate", (data) => {
            console.log("Invoice yangilandi:", data);
            if (data.location_id === locationId) {
                GetNotification();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [locationId]);

    return (
        <div className="w-full min-h-screen">
            <Typography
                variant="h4"
                className="text-left font-bold text-black mb-8"
            >
                So‘nggi bildirishnomalar
            </Typography>

            {loading ? (
                <Loading />
            ) : notifications.length === 0 ? (
                <EmptyData text={"Bildirishnomalar mavjud emas"} />
            ) : (
                <div className="flex flex-col gap-5">
                    {notifications.map((item) => (
                        <NavLink to={`/diler/notification/${item?.id}`} key={item.id}>
                            <Card className="w-full bg-white text-black border border-gray-200 shadow-md hover:shadow-lg transition-all">
                                <CardBody>
                                    <Typography
                                        variant="h6"
                                        className="text-black font-semibold"
                                    >
                                        {item.type.toUpperCase()}
                                    </Typography>

                                    <Typography className="text-gray-700 text-sm mt-2">
                                        Sana:{" "}
                                        {new Date(item.createdAt).toLocaleString()}
                                    </Typography>

                                    <div className="mt-2 border-t border-gray-200 pt-2">
                                        <Typography className="text-gray-600 text-sm">
                                            Status:{" "}
                                            <span className="text-black font-medium">
                                                {item.status}
                                            </span>
                                        </Typography>
                                        <Typography className="text-gray-600 text-sm mt-1">
                                            Yuboruvchi:{" "}
                                            <span className="text-black">
                                                {item.sender?.name}
                                            </span>
                                        </Typography>
                                    </div>
                                </CardBody>
                            </Card>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
