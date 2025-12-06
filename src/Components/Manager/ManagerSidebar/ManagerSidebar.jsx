import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, Typography } from "@material-tailwind/react";
import Cookies from "js-cookie";

export default function ManagerSidebar({ onClose, active, open }) {
    const navigate = useNavigate();
    const location = useLocation();

    // DARK MODE STATE
    const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

    // APPLY THEME CLASS TO HTML
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    const toggleTheme = () => setDark(!dark);

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
            ],
        },
    ];

    const handleLogout = () => {
        Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
        navigate("/login");
    };

    return (
        <Card
            className={`h-[95%] fixed top-[15px] left-[15px] z-50 shadow-xl border px-4 py-6 overflow-y-auto flex flex-col justify-between transition-all duration-500
            ${open ? "w-[100px]" : "w-[280px]"}
            bg-card-light dark:bg-card-dark 
            text-text-light dark:text-text-dark
            border-white/20 dark:border-black/30
        `}
        >
            <div>
                {/* Top buttons */}
                <div className="flex items-center justify-between mb-6">
                    {/* THEME TOGGLE */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                        title="Dark mode"
                    >
                        {dark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 512 512"><path fill="currentColor" fillRule="evenodd" d="M277.333 405.333v85.333h-42.667v-85.333zm99.346-58.824l60.34 60.34l-30.17 30.17l-60.34-60.34zm-241.359 0l30.17 30.17l-60.34 60.34l-30.17-30.17zM256 139.353c64.422 0 116.647 52.224 116.647 116.647c0 64.422-52.225 116.647-116.647 116.647A116.427 116.427 0 0 1 139.352 256c0-64.423 52.225-116.647 116.648-116.647m0 42.666c-40.859 0-73.981 33.123-73.981 74.062a73.76 73.76 0 0 0 21.603 52.296c13.867 13.867 32.685 21.64 52.378 21.603zm234.666 52.647v42.667h-85.333v-42.667zm-384 0v42.667H21.333v-42.667zM105.15 74.98l60.34 60.34l-30.17 30.17l-60.34-60.34zm301.7 0l30.169 30.17l-60.34 60.34l-30.17-30.17zM277.332 21.333v85.333h-42.667V21.333z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><path fill="currentColor" d="M12.741 20.917a9.4 9.4 0 0 1-1.395-.105a9.141 9.141 0 0 1-1.465-17.7a1.18 1.18 0 0 1 1.21.281a1.27 1.27 0 0 1 .325 1.293a8.1 8.1 0 0 0-.353 2.68a8.27 8.27 0 0 0 4.366 6.857a7.6 7.6 0 0 0 3.711.993a1.242 1.242 0 0 1 .994 1.963a9.15 9.15 0 0 1-7.393 3.738M10.261 4.05a.2.2 0 0 0-.065.011a8.137 8.137 0 1 0 9.131 12.526a.22.22 0 0 0 .013-.235a.23.23 0 0 0-.206-.136a8.6 8.6 0 0 1-4.188-1.116a9.27 9.27 0 0 1-4.883-7.7a9.1 9.1 0 0 1 .4-3.008a.29.29 0 0 0-.069-.285a.18.18 0 0 0-.133-.057"></path></svg>
                        )}
                    </button>

                    {/* SIDEBAR TOGGLE */}
                    <button
                        onClick={active}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
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

                {/* MENU */}
                <div className="flex flex-col gap-6">
                    {groupedMenuItems.map((group) => (
                        <div key={group.section}>
                            {!open && (
                                <Typography
                                    variant="small"
                                    className="mb-2 uppercase font-medium text-xs tracking-widest text-gray-600 dark:text-gray-300"
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
                                            `flex items-center ${open && "justify-center"} gap-3 w-full px-4 py-3 rounded-lg transition
                                            ${isActive
                                                ? "bg-white/80 dark:bg-white/10 text-[#4DA057] dark:text-green-400 font-semibold shadow-md"
                                                : "text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10"
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

            {/* LOGOUT */}
            <div className="mt-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
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
