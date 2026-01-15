import { NavLink } from "react-router-dom";
import {
    Card,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Typography,
} from "@material-tailwind/react";
import {
    LayoutDashboard,
    Package,
    PackagePlus,
    PackageMinus,
    Move,
    Settings,
    SendIcon,
} from "lucide-react";
import Logo from '../../../Images/2025-12-16 11.03.29.jpg'
import { useTranslation } from "react-i18next";
import { useNotifyStore } from "../../../store/useNotifyStore";

export default function WarehouseSidebar() {
    const { t } = useTranslation();

    const { unreadCount } = useNotifyStore()
    const mainLinks = [
        { id: 1, label: t('dashboard'), path: "/warehouse/dashboard", icon: LayoutDashboard },
        { id: 2, label: t('Order'), path: "/warehouse/history", icon: Move },
    ];
    const skladSubLinks = [
        { id: 1, label: t('Warehouse'), path: "/warehouse/product", icon: Package },
        { id: 3, label: t('Coming'), path: "/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: t('Shipment'), path: "/warehouse/stockout", icon: PackageMinus },
        { id: 5, label: t("notifies"), path: "/warehouse/notifications", icon: SendIcon }
    ];

    // Классы для стилизации
    const menuListClass = `
        mt-[12px] bg-white/95 dark:bg-gray-900 backdrop-blur-md 
        p-4 w-[230px] translate-x-3  
        shadow-2xl rounded-xl flex flex-col gap-2
        border border-gray-200 dark:border-gray-700 shadow-gray-900/20
    `;

    const menuItemClass = `
        flex items-center gap-2 text-sm rounded-md px-3 py-2
        text-gray-700 dark:text-gray-300
        hover:bg-[#4DA057]/10 hover:text-[#4DA057]
        dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400
        transition-all duration-200
    `;

    return (
        <Card
            className="WarehouseSidebar
                h-[98%] w-24 fixed top-[10px] left-[10px] bottom-0 z-50 shadow-xl 
                bg-card-light text-text-light border border-white/20 
                dark:bg-card-dark dark:text-text-dark dark:border-gray-700 
                px-2 py-5 flex flex-col justify-between
                transition-colors duration-300
            "
        >
            {/* === Верхняя часть === */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center">
                    <img src={Logo} alt="Foto" className="w-[70%]  rounded-[8px]" />
                </div>

                {mainLinks.map(({ id, label, path, icon: Icon }) => (
                    <NavLink
                        key={id}
                        to={path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                            ${isActive
                                ? "bg-white/80 text-[black] shadow-md scale-105 dark:bg-gray-800 dark:text-[white]"
                                : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[white]"
                            }`
                        }
                    >
                        <Icon className="w-8 h-8 mb-1 transition-transform duration-300" />
                        <span className="text-[11px] font-medium text-center">{label}</span>
                    </NavLink>
                ))}

                {/* === Склад === */}
                <Menu placement="right-start" allowHover offset={15}>
                    <MenuHandler>
                        <div className="flex flex-col items-center justify-center w-full py-3 rounded-xl cursor-pointer 
                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[white] 
                        transition-all duration-300">
                            <Package className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium text-center">{t(`Warehouse`)}</span>
                        </div>
                    </MenuHandler>

                    <MenuList className={menuListClass}>
                        <Typography
                            variant="small"
                            color="gray"
                            className="mb-1 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400"
                        >
                            {t('Opt_warehouse')}
                        </Typography>
                        {skladSubLinks.map(({ id, label, path, icon: Icon }) => (
                            <NavLink key={id} to={path}>
                                {({ isActive }) => (
                                    <MenuItem className={`
                                        ${id === 5 ? "relative" : ""}
                                        ${menuItemClass}
                                        ${isActive
                                            ? "bg-[#4DA057]/20 text-[#4DA057] dark:bg-[#4DA057]/30 dark:text-green-400"
                                            : ""
                                        }
                                    `}>
                                        <Icon className="w-4 h-4" />
                                        <span className="flex-1">{label}</span>

                                        {/* Faqat notifications uchun badge */}
                                        {id === 5 && unreadCount > 0 && (
                                            <span className="absolute right-2 top-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </MenuItem>
                                )}
                            </NavLink>
                        ))}
                    </MenuList>
                </Menu>

                {/* === Настройки === */}
                <NavLink
                    to={`/warehouse/settings`}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                        ${isActive
                            ? "bg-white/80 text-[#4DA057] shadow-md scale-105 dark:bg-gray-800 dark:text-[white]"
                            : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[white]"
                        }`
                    }
                >
                    <Settings className="w-8 h-8 mb-1" />
                    <span className="text-[11px] font-medium text-center">{t(`Settings`)}</span>
                </NavLink>
            </div>

            <div className="flex justify-center mt-4">
                {/* <LogoutButton /> */}
            </div>
        </Card>
    );
}