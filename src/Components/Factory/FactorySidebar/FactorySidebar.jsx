import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";

export default function FactorySidebar({ open }) {
    const [role] = useState("admin");
    const location = useLocation();

    const groupedMenuItems = [
        {
            section: "Asosiy",
            items: [
                {
                    id: 1,
                    title: "Bosh sahifa",
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
                    id: 1,
                    title: "Warehouse",
                    path: "/factory/warehouse",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M0 488V171.3c0-26.2 15.9-49.7 40.2-59.4L308.1 4.8c7.6-3.1 16.1-3.1 23.8 0l267.9 107.1c24.3 9.7 40.2 33.3 40.2 59.4V488c0 13.3-10.7 24-24 24h-48c-13.3 0-24-10.7-24-24V224c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32v264c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24m488 24H152c-13.3 0-24-10.7-24-24v-56h384v56c0 13.3-10.7 24-24 24M128 400v-64h384v64zm0-96v-80h384v80z"></path></svg>
                    ),
                },
                {
                    id: 1,
                    title: "Product",
                    path: "/factory/product",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 2048 2048"><path fill="currentColor" d="M896 1537V936L256 616v880l544 273l-31 127l-641-320V472L960 57l832 415v270q-70 11-128 45V616l-640 320v473zM754 302l584 334l247-124l-625-313zm206 523l240-120l-584-334l-281 141zm888 71q42 0 78 15t64 41t42 63t16 79q0 39-15 76t-43 65l-717 717l-377 94l94-377l717-716q29-29 65-43t76-14m51 249q21-21 21-51q0-31-20-50t-52-20q-14 0-27 4t-23 15l-692 692l-34 135l135-34z"></path></svg>
                    ),
                },
                {
                    id: 1,
                    title: "Hisobot",
                    path: "/factory/report",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 512 512"><path fill="currentColor" d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64v336c0 44.2 35.8 80 80 80h400c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l89.4-89.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"></path></svg>
                    ),
                },
                {
                    id: 1,
                    title: "Tovar analizi",
                    path: "/factory/produt-analiz",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24"><path fill="currentColor" d="M13 1.045V11h9.955A11 11 0 0 0 13 1.045"></path><path fill="currentColor" d="M11 1.045V13h11.955C22.45 18.607 17.738 23 12 23C5.925 23 1 18.075 1 12C1 6.262 5.394 1.55 11 1.045"></path></svg>
                    ),
                },

            ],
        },
    ];

    return (
        <Card
            className={`h-[95%] fixed top-[15px] left-[15px] z-50 shadow-xl bg-white/30 backdrop-blur-md border border-white/20 px-4 py-6 overflow-y-auto transition-all duration-500
        ${open ? "w-[100px]" : "w-[280px]"}`}
        >
            <div className="flex items-center justify-center mb-6">
            </div>

            {/* Меню */}
            <div className="flex flex-col gap-6">
                {groupedMenuItems.map((group) => (
                    <div key={group.section}>
                        {!open && (
                            <Typography
                                variant="small"
                                color="gray"
                                className="mb-2 uppercase font-medium text-xs tracking-widest"
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
                                        `flex items-center ${open && 'justify-center'} gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300
                      ${isActive
                                            ? "bg-white/80 text-[#4DA057] font-semibold shadow-md"
                                            : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3]"
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
        </Card>
    );
}
