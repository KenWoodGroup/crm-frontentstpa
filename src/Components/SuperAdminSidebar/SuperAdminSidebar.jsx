import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import LogoutButton from "./sectionsSaSide/LogoutButton";

const SuperAdminSidebar = ({ links = [], onToggle, role }) => {
    const [isOpen, setIsOpen] = useState(
        sessionStorage.getItem("sidebar") === "true"
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        sessionStorage.setItem("sidebar", newState);
        onToggle?.(newState); // 👉 layoutga yuboramiz
    };

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    useEffect(() => {
        onToggle?.(isOpen); // dastlabki renderda ham yuboramiz
    }, []);

    const handleLogout = () => {
        Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
        navigate("/login");
    };


    return (
        <>
            {/* Mobile toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobile}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                    {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed top-0 left-0 h-full bg-white shadow-md border-r border-gray-200 z-40 flex flex-col justify-between transition-all duration-300",
                    isOpen ? "w-64" : "w-20",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                    <h1
                        className={clsx(
                            "text-xl font-bold text-blue-600 whitespace-nowrap transition-opacity duration-300",
                            !isOpen && "opacity-0 hidden"
                        )}
                    >
                        {role}
                    </h1>

                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                    {links.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 p-3 rounded-xl text-[rgb(2, 2, 59)] hover:bg-blue-50 hover:text-blue-600 transition-all",
                                    isActive && "bg-blue-100 text-blue-700 font-semibold"
                                )
                            }
                        >
                            {Icon && <Icon size={22} />}
                            <span
                                className={clsx(
                                    "whitespace-nowrap transition-opacity duration-300",
                                    !isOpen && "opacity-0 hidden"
                                )}
                            >
                                {label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100">
                    {/* <button
                        onClick={()=>handleLogout()}
                        className="flex items-center gap-3 p-3 w-full rounded-xl text-[rgb(2, 2, 59)] hover:bg-red-100 hover:text-red-700 transition">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h4a2 2 0 002-2v-1m-6-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1"
                            />
                        </svg>
                        <span
                            className={clsx(
                                "whitespace-nowrap transition-opacity duration-300",
                                !isOpen && "opacity-0 hidden"
                            )}
                        >
                            Logout
                        </span>
                    </button> */}
                    <LogoutButton
                        isOpen={isOpen}
                    />
                </div>
            </aside>
        </>
    );
};

export default SuperAdminSidebar;
