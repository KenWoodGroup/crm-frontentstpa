import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import Cookies from "js-cookie";

export default function ManagerSidebar({ onClose, active, open }) {
    const navigate = useNavigate();
    const location = useLocation();
    const groupedMenuItems = [
        {
            section: "Asosiy",
            items: [
                {
                    id: 1,
                    title: "Bosh sahifa",
                    path: "/manager/dashboard",
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
                    title: "Factory",
                    path: "/manager/factory",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 26 26"><path fill="currentColor" d="M24.469.993a1 1 0 0 0-.999-.95h-2.849a1 1 0 0 0-.996.91L18 19.268V12h-2V9a1.002 1.002 0 0 0-1.554-.832L8.697 12H8V9a1.002 1.002 0 0 0-1.554-.832l-6 4A1 1 0 0 0 0 13v12a1 1 0 0 0 1 1h24.02c.553 0 .949-.352.949-.904c0-.086-1.5-24.103-1.5-24.103M5 14v3H3v-3zm5 0v3H8v-3zm5 0v3h-2v-3zM5 19v3H3v-3zm5 0v3H8v-3zm5 0v3h-2v-3z"></path></svg>
                    ),
                },
                {
                    id: 3,
                    title: "Klient",
                    path: "/manager/dealer",
                    icon: (
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><path fill="currentColor" d="M21.987 18.73a2 2 0 0 1-.34.85a1.9 1.9 0 0 1-1.56.8h-1.651a.74.74 0 0 1-.6-.31a.76.76 0 0 1-.11-.67c.37-1.18.29-2.51-3.061-4.64a.77.77 0 0 1-.32-.85a.76.76 0 0 1 .72-.54a7.61 7.61 0 0 1 6.792 4.39a2 2 0 0 1 .13.97M19.486 7.7a4.43 4.43 0 0 1-4.421 4.42a.76.76 0 0 1-.65-1.13a6.16 6.16 0 0 0 0-6.53a.75.75 0 0 1 .61-1.18a4.3 4.3 0 0 1 3.13 1.34a4.46 4.46 0 0 1 1.291 3.12z"></path><path fill="currentColor" d="M16.675 18.7a2.65 2.65 0 0 1-1.26 2.48c-.418.257-.9.392-1.39.39H4.652a2.63 2.63 0 0 1-1.39-.39A2.62 2.62 0 0 1 2.01 18.7a2.6 2.6 0 0 1 .5-1.35a8.8 8.8 0 0 1 6.812-3.51a8.78 8.78 0 0 1 6.842 3.5a2.7 2.7 0 0 1 .51 1.36M14.245 7.32a4.92 4.92 0 0 1-4.902 4.91a4.903 4.903 0 0 1-4.797-5.858a4.9 4.9 0 0 1 6.678-3.57a4.9 4.9 0 0 1 3.03 4.518z"></path></svg>
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
            className={`h-[95%] fixed top-[15px] left-[15px] z-50 shadow-xl bg-white/30 backdrop-blur-md border border-white/20 px-4 py-6 overflow-y-auto flex flex-col justify-between transition-all duration-500
        ${open ? "w-[100px]" : "w-[280px]"}`}
        >
            <div>
                {/* Кнопка открытия/закрытия */}
                <div className="flex items-center justify-between mb-6">
                    <div>

                    </div>
                    <button
                        onClick={active}
                        className="p-2 rounded-lg hover:bg-white/40 transition"
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
                                            `flex items-center ${open && "justify-center"} gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300
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
            </div>

            {/* Logout */}
            <div className="mt-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 transition-all"
                >
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M377.9 105.9c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 221H192c-17.7 0-32 14.3-32 32s14.3 32 32 32h210.7l-70.1 69.8c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3zM96 64h128c17.7 0 32-14.3 32-32S241.7 0 224 0H96C43 0 0 43 0 96v320c0 53 43 96 96 96h128c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.6 0-32-14.4-32-32V96c0-17.6 14.4-32 32-32z" />
                    </svg>
                    {!open && <span>Logout</span>}
                </button>
            </div>
        </Card>
    );
}
