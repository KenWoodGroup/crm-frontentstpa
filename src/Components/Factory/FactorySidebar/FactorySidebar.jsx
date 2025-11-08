import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Card, Typography } from "@material-tailwind/react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

export default function FactorySidebar({ active, open }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();


    const groupedMenuItems = [
        {
            section: `${t(`main`)}`,
            items: [
                {
                    id: 1,
                    title: `${t("dashboard")}`,
                    path: "/factory/dashboard",
                    icon: (
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 9.75L12 3l9 6.75M4.5 10.5v9.75h5.25V15h4.5v5.25H19.5V10.5"
                            />
                        </svg>
                    ),
                },
                {
                    id: 2,
                    title: `${t(`Warehouses`)}`,
                    path: "/factory/warehouse",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path
                                fill="currentColor"
                                d="M0 488V171.3c0-26.2 15.9-49.7 40.2-59.4L308.1 4.8c7.6-3.1 16.1-3.1 23.8 0l267.9 107.1c24.3 9.7 40.2 33.3 40.2 59.4V488c0 13.3-10.7 24-24 24h-48c-13.3 0-24-10.7-24-24V224c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32v264c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24m488 24H152c-13.3 0-24-10.7-24-24v-56h384v56c0 13.3-10.7 24-24 24M128 400v-64h384v64zm0-96v-80h384v80z"
                            ></path>
                        </svg>
                    ),
                },
                {
                    id: 2,
                    title: `${t(`partner`)}`,
                    path: "/factory/partner",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16"><path fill="currentColor" fillRule="evenodd" d="M8.716.315a1 1 0 0 0-1.432 0L6.646.97a1 1 0 0 1-.988.265l-.88-.248a1 1 0 0 0-1.24.716l-.226.886a1 1 0 0 1-.723.723l-.886.225a1 1 0 0 0-.716 1.24l.248.881a1 1 0 0 1-.265.988l-.655.638a1 1 0 0 0 0 1.432l.655.639a1 1 0 0 1 .265.987l-.248.88a1 1 0 0 0 .716 1.24l.886.226a1 1 0 0 1 .723.723l.225.886a1 1 0 0 0 1.24.717l.881-.248a1 1 0 0 1 .988.264l.638.655a1 1 0 0 0 1.432 0l.639-.655a1 1 0 0 1 .987-.264l.88.248a1 1 0 0 0 1.24-.717l.226-.886a1 1 0 0 1 .723-.723l.886-.225a1 1 0 0 0 .717-1.24l-.248-.88a1 1 0 0 1 .264-.988l.655-.639a1 1 0 0 0 0-1.432l-.655-.638a1 1 0 0 1-.264-.988l.248-.88a1 1 0 0 0-.717-1.24l-.886-.226a1 1 0 0 1-.723-.723l-.225-.886a1 1 0 0 0-1.24-.716l-.88.248A1 1 0 0 1 9.354.97zm3.057 5.975a.75.75 0 0 0-1.042-1.08L6.597 9.202L5.28 7.887A.75.75 0 0 0 4.22 8.95l1.839 1.834a.75.75 0 0 0 1.05.01z" clipRule="evenodd"></path></svg>
                    ),
                },
                {
                    id: 3,
                    title: `${t(`Production`)}`,
                    path: "/factory/product",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                            <path
                                fill="currentColor"
                                d="M896 1537V936L256 616v880l544 273l-31 127l-641-320V472L960 57l832 415v270q-70 11-128 45V616l-640 320v473zM754 302l584 334l247-124l-625-313zm206 523l240-120l-584-334l-281 141zm888 71q42 0 78 15t64 41t42 63t16 79q0 39-15 76t-43 65l-717 717l-377 94l94-377l717-716q29-29 65-43t76-14m51 249q21-21 21-51q0-31-20-50t-52-20q-14 0-27 4t-23 15l-692 692l-34 135l135-34z"
                            ></path>
                        </svg>
                    ),
                },
                {
                    id: 4,
                    title: `${t(`Report`)}`,
                    path: "/factory/report",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                fill="currentColor"
                                d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64v336c0 44.2 35.8 80 80 80h400c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l89.4-89.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"
                            ></path>
                        </svg>
                    ),
                },
                {
                    id: 5,
                    title: `${t(`Product_analysis`)}`,
                    path: "/factory/produt-analiz",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M13 1.045V11h9.955A11 11 0 0 0 13 1.045"
                            ></path>
                            <path
                                fill="currentColor"
                                d="M11 1.045V13h11.955C22.45 18.607 17.738 23 12 23C5.925 23 1 18.075 1 12C1 6.262 5.394 1.55 11 1.045"
                            ></path>
                        </svg>
                    ),
                },
                {
                    id: 6,
                    title: `${t(`Settings`)}`,
                    path: "/factory/settings",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zm1.225-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
                            ></path>
                        </svg>
                    ),
                },
            ],
        },
    ];

    const handleLogout = () => {
        Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
        navigate("/login");
    };

    return (
        <Card
            className={`fixed top-[15px] left-[15px] h-[95%] z-50 shadow-xl border rounded-2xl overflow-y-auto flex flex-col justify-between transition-all duration-500
            bg-background-light dark:bg-card-dark border-gray-200 dark:border-gray-700 text-text-light dark:text-text-dark
            ${open ? "w-[100px]" : "w-[280px]"} px-4 py-6`}
        >
            <div>
                {/* Кнопка открытия/закрытия */}
                <div className="flex items-center justify-between mb-6">
                    <div></div>
                    <button
                        onClick={active}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Toggle sidebar"
                    >
                        {!open ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Меню */}
                <div className="flex flex-col gap-6">
                    {groupedMenuItems.map((group) => (
                        <div key={group.section}>
                            {!open && (
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="mb-2 uppercase font-medium text-xs tracking-widest text-gray-500 dark:text-gray-400"
                                >
                                    {group.section}
                                </Typography>
                            )}
                            <div className="flex flex-col gap-2">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center ${open && "justify-center"} gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300
                                            ${isActive
                                                ? "bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-400 font-semibold"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-green-500"
                                            }`
                                        }
                                    >
                                        <span className="w-6 h-6">{item.icon}</span>
                                        {!open && <span className="text-sm">{item.title}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
