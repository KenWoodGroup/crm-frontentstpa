import { NavLink } from "react-router-dom";
import { Card, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import {
    LayoutDashboard,
    Warehouse,
    Users,
    Factory,
    BarChart3,
    PieChart,
    Settings,
    Banknote,
    BanknoteArrowDown,
    DollarSign,
    ClipboardType,
    Blocks,
    ChartNoAxesGantt,
    Car
} from "lucide-react";

export default function FactorySidebar() {
    const { t } = useTranslation();

    // Верхнее меню
    const items = [
        {
            id: 1,
            title: t("dashboard"),
            path: "/factory/dashboard",
            icon: <LayoutDashboard className="w-7 h-7" />,
        },
        {
            id: 2,
            title: t("Warehouses"),
            path: "/factory/warehouse",
            icon: <Warehouse className="w-7 h-7" />,
        },
        {
            id: 5,
            title: t("Report"),
            path: "/factory/report",
            icon: <BarChart3 className="w-7 h-7" />,
        },
        {
            id: 6,
            title: t("Product_analysis"),
            path: "/factory/produt-analiz",
            icon: <PieChart className="w-7 h-7" />,
        }
    ];

    const settingsItems = [
        { id: 1, path: "/factory/clients", icon: <Users className="w-4 h-4" />, label: t("Clients") },
        { id: 2, path: "/factory/kassa", icon: <Banknote className="w-4 h-4" />, label: t("Kassa") },
        { id: 3, path: "/factory/debtor", icon: <Users className="w-4 h-4" />, label: t("Clients_debtor") },
        { id: 4, path: "/factory/expenses", icon: <BanknoteArrowDown className="w-4 h-4" />, label: t("expenses") },
        { id: 5, path: "/factory/partner", icon: <Users className="w-4 h-4" />, label: t("partner") },
        { id: 6, path: "/factory/product", icon: <Factory className="w-4 h-4" />, label: t("Production") },
        { id: 7, path: "/factory/payment", icon: <DollarSign className="w-4 h-4" />, label: t("Payment_History") },
        { id: 8, path: "/factory/payment-type", icon: <ClipboardType className="w-4 h-4" />, label: t("Payment_type") },
        { id: 8, path: "/factory/price-type", icon: <DollarSign className="w-4 h-4" />, label: t("Price_type") },
        { id: 8, path: "/factory/price-type-stock", icon: <Blocks className="w-4 h-4" />, label: t("warehouseTitle") },
        { id: 8, path: "/factory/clients-sverka", icon: <ChartNoAxesGantt className="w-4 h-4" />, label: t("Clients_sverka") },
        { id: 8, path: "/factory/carrier", icon: <Car className="w-4 h-4" />, label: t("Kurier") },
    ];

    return (
        <Card
            className="
                h-[98%] w-24 fixed top-[10px] left-[10px] z-50 shadow-xl 
                bg-card-light text-text-light border border-white/20 
                dark:bg-card-dark dark:text-text-dark dark:border-gray-700 
                px-2 py-5 flex flex-col justify-between transition-all duration-300
            "
        >
            {/* Верх */}
            <div className="flex flex-col items-center gap-4">

                {/* Обычные ссылки */}
                {items.map(({ id, title, path, icon }) => (
                    <NavLink
                        key={id}
                        to={path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                            ${isActive
                                ? "bg-white/80 text-[#4DA057] shadow-md scale-105 dark:bg-gray-800 dark:text-green-400"
                                : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057]"}`}
                    >
                        <span className="w-7 h-7 mb-1">{icon}</span>
                        <span className="text-[11px] font-medium text-center">{title}</span>
                    </NavLink>
                ))}

                <Menu placement="right-start" allowHover offset={15}>
                    <MenuHandler>
                        <div
                            className=" flex flex-col items-center justify-center w-full py-3 rounded-xl cursor-pointer
                            text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3]
                            dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057]
                            transition-all duration-300"
                        >
                            <Settings className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium text-center">{t("Settings")}</span>
                        </div>
                    </MenuHandler>

                    <MenuList
                        className={`
                        mt-[12px]
                        bg-transparent backdrop-blur-md 
                        p-4 w-[230px] translate-x-3  
                        shadow-2xl rounded-xl flex flex-col gap-2
                        border 
                        dark:border-gray-700 shadow-gray-900/20
                        border-gray-200
                        `}
                    >
                        <h3 className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            {t("Settings")}
                        </h3>

                        {/* Settings items через map */}
                        {settingsItems.map(({ id, path, icon, label }) => (
                            <NavLink key={id} to={path}>
                                <MenuItem
                                    className="flex items-center gap-2 rounded-md text-sm 
                                    hover:bg-[#4DA057]/10 hover:text-[#4DA057] 
                                    dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 
                                    transition-all"
                                >
                                    {icon}
                                    {label}
                                </MenuItem>
                            </NavLink>
                        ))}
                    </MenuList>
                </Menu>
            </div>
        </Card>
    );
}
