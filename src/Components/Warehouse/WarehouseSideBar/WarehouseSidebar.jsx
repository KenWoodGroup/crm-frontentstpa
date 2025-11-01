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
    User,
    UsersRound,
    BanknoteArrowDown,
    ChevronsLeftRight,
    UserPen,
    CreditCard,
    Blocks,
    Truck,
    Settings,
} from "lucide-react";
import LogoutButton from "../../SuperAdminSidebar/sectionsSaSide/LogoutButton";
import Cookies from "js-cookie";

export default function WarehouseSidebar() {
    const access = Cookies.get("sedqwdqdqwd") === "terrwerwerw";

    const mainLinks = [
        { id: 1, label: "Home", path: "/warehouse/dashboard", icon: LayoutDashboard },
    ];

    const kassaSubLinks = [
        { id: 8, label: "Клиенты", path: "/warehouse/clients", icon: UsersRound, group: "clients" },
        { id: 7, label: "Дилеры", path: "/warehouse/dilers", icon: User, group: "clients" },
        { id: 1, label: "Оплата клиентов", path: "/warehouse/payment", icon: BanknoteArrowDown, group: "clients" },
        { id: 2, label: "Долги клиентов", path: "/warehouse/debtor", icon: UserPen, group: "clients" },
        { id: 3, label: "Сверка клиентов", path: "/warehouse/revisen", icon: ChevronsLeftRight, group: "clients" },
        { id: 4, label: "Доставщик", path: "/warehouse/carrier", icon: Truck, group: "suppliers" },
        { id: 6, label: "Расходы", path: "/warehouse/expenses", icon: Blocks, group: "others" },
        { id: 7, label: "Касса", path: "/warehouse/kassa", icon: CreditCard, group: "others" },
    ];

    const skladSubLinks = [
        { id: 1, label: "Склад", path: "/warehouse/product", icon: Package },
        { id: 3, label: "Приход", path: "/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: "Отгрузки", path: "/warehouse/stockout", icon: PackageMinus },
        { id: 2, label: "История", path: "/warehouse/history", icon: Move },
    ];

    return (
        <Card className="
            h-[100%] w-22 fixed top-0 left-0 bottom-0 z-50 shadow-xl 
            bg-card-light text-text-light border border-white/20 
            dark:bg-card-dark dark:text-text-dark dark:border-gray-700 
            px-2 py-5 flex flex-col justify-between
            transition-colors duration-300
        ">
            {/* === Верхняя часть === */}
            <div className="flex flex-col items-center gap-4">
                {mainLinks.map(({ id, label, path, icon: Icon }) => (
                    <NavLink
                        key={id}
                        to={path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                            ${isActive
                                ? "bg-white/80 text-[#4DA057] shadow-md scale-105 dark:bg-gray-800 dark:text-green-400"
                                : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057]"
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
                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                        transition-all duration-300">
                            <Package className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium text-center">Склад</span>
                        </div>
                    </MenuHandler>

                    <MenuList className="p-4 w-[220px] translate-x-3 bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-gray-700 rounded-xl flex flex-col gap-2 transition-colors duration-300">
                        <Typography variant="small" color="gray" className="mb-1 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400">
                            Операции склада
                        </Typography>
                        {skladSubLinks.map(({ id, label, path, icon: Icon }) => (
                            <NavLink key={id} to={path}>
                                <MenuItem className="flex items-center gap-2 rounded-md text-sm hover:bg-[#4DA057]/10 hover:text-[#4DA057] dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 transition-all">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </MenuItem>
                            </NavLink>
                        ))}
                    </MenuList>
                </Menu>

                {/* === Касса === */}
                <Menu placement="right-start" allowHover offset={15}>
                    <MenuHandler>
                        <div className="flex flex-col items-center justify-center w-full py-3 rounded-xl cursor-pointer 
                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                        transition-all duration-300">
                            <CreditCard className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-medium text-center">Касса</span>
                        </div>
                    </MenuHandler>
                    <MenuList className={`p-4 ${access ? "w-[650px] grid-cols-3" : "w-[430px] grid-cols-2"} translate-x-6 bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-gray-700 rounded-xl grid gap-4 transition-colors duration-300`}>
                        {access && (
                            <div>
                                <Typography variant="small" color="gray" className="mb-2 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400">
                                    Клиенты
                                </Typography>
                                <div className="flex flex-col gap-1">
                                    {kassaSubLinks
                                        .filter(item => item.group === "clients")
                                        .map(({ id, label, path, icon: Icon }) => (
                                            <NavLink key={id} to={path}>
                                                <MenuItem className="flex items-center gap-2 rounded-md text-sm hover:bg-[#4DA057]/10 hover:text-[#4DA057] dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 transition-all">
                                                    <Icon className="w-4 h-4" />
                                                    {label}
                                                </MenuItem>
                                            </NavLink>
                                        ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <Typography variant="small" color="gray" className="mb-2 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400">
                                Поставщики
                            </Typography>
                            <div className="flex flex-col gap-1">
                                {kassaSubLinks
                                    .filter(item => item.group === "suppliers")
                                    .map(({ id, label, path, icon: Icon }) => (
                                        <NavLink key={id} to={path}>
                                            <MenuItem className="flex items-center gap-2 rounded-md text-sm hover:bg-[#4DA057]/10 hover:text-[#4DA057] dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 transition-all">
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </MenuItem>
                                        </NavLink>
                                    ))}
                            </div>
                        </div>
                        <div>
                            <Typography variant="small" color="gray" className="mb-2 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400">
                                Прочие
                            </Typography>
                            <div className="flex flex-col gap-1">
                                {kassaSubLinks
                                    .filter(item => item.group === "others")
                                    .map(({ id, label, path, icon: Icon }) => (
                                        <NavLink key={id} to={path}>
                                            <MenuItem className="flex items-center gap-2 rounded-md text-sm hover:bg-[#4DA057]/10 hover:text-[#4DA057] dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 transition-all">
                                                <Icon className="w-4 h-4" />
                                                {label}
                                            </MenuItem>
                                        </NavLink>
                                    ))}
                            </div>
                        </div>
                    </MenuList>
                </Menu>

                {/* === Настройки === */}
                <NavLink
                    to="/warehouse/settings"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                        ${isActive
                            ? "bg-white/80 text-[#4DA057] shadow-md scale-105 dark:bg-gray-800 dark:text-green-400"
                            : "text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057]"
                        }`
                    }
                >
                    <Settings className="w-8 h-8 mb-1" />
                    <span className="text-[11px] font-medium text-center">Настройки</span>
                </NavLink>
            </div>

            <div className="flex justify-center mt-4">
                <LogoutButton />
            </div>
        </Card>
    );
}
