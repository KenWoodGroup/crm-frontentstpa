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
    DollarSign,
    ClipboardType,
    Blocks,
    ListChecks,
    Car,
    BanknoteArrowDown,
    FileUser,
    Move,
    ShoppingCart
} from "lucide-react";
import Logo from '../../../Images/photo_2025-12-20 11.17.15.jpeg'

export default function FactorySidebar({ data }) {
    const { t } = useTranslation();

    // Получаем права доступа из cookies
    const getUserAccessKeys = () => {
        const cookies = document.cookie.split(';');
        const accessCookie = cookies.find(cookie => cookie.trim().startsWith('user_access_keys='));

        if (!accessCookie) {
            return null; // Если cookie нет, возвращаем null (полный доступ)
        }

        const accessValue = accessCookie.split('=')[1];

        // Проверяем, пустая ли строка
        if (!accessValue || accessValue.trim() === '') {
            return null; // Пустое значение = полный доступ
        }

        const decodedValue = decodeURIComponent(accessValue);
        return decodedValue.split(',').map(key => key.trim().toLowerCase());
    };

    const userAccessKeys = getUserAccessKeys();

    // Если cookie нет или пустой - полный доступ
    const hasFullAccess = userAccessKeys === null || userAccessKeys.length === 0;

    // Проверяем наличие конкретных ролей
    const hasKassaAccess = userAccessKeys && userAccessKeys.includes('kassa');
    const hasSellerAccess = userAccessKeys && userAccessKeys.includes('seller');
    const hasSkladAccess = userAccessKeys && userAccessKeys.includes('sklad');
    const hasZayavkiAccess = userAccessKeys && userAccessKeys.includes('zayavki');

    // Определяем доступные пути для каждой роли
    const getAccessiblePaths = () => {
        if (hasFullAccess) return 'all';

        const paths = new Set();

        // Dashboard доступен всем
        paths.add('/factory/dashboard');

        // Кассир
        if (hasKassaAccess) {
            paths.add('/factory/debtor');
            paths.add('/factory/expenses');
            paths.add('/factory/kassa');
            paths.add('/factory/partner');
            paths.add('/factory/payment-type');
            paths.add('/factory/price-type');
            paths.add('/factory/payment');
        }

        // Продавец
        if (hasSellerAccess) {
            paths.add('/factory/clients');
            paths.add('/factory/debtor');
            paths.add('/factory/payment');
            paths.add('/factory/clients-sverka');
            paths.add('/factory/client-category');
            paths.add('/factory/carrier');
        }

        // Склад
        if (hasSkladAccess) {
            paths.add('/factory/stock');
            paths.add('/factory/warehouse');
        }

        // Заявки
        if (hasZayavkiAccess) {
            paths.add('/factory/stock');
        }

        return paths;
    };

    const accessiblePaths = getAccessiblePaths();

    // Проверка доступа к конкретному пути
    const hasAccessToPath = (path) => {
        if (accessiblePaths === 'all') return true;
        return accessiblePaths.has(path);
    };

    // Фильтрация меню в зависимости от прав доступа
    const filterMenuItems = (items) => {
        if (accessiblePaths === 'all') return items;

        // Фильтруем только те пункты, к которым есть доступ
        return items.filter(item => hasAccessToPath(item.path));
    };

    // Проверка, нужно ли показывать меню
    const shouldShowMenu = (menuId, filteredItems) => {
        // Dashboard всегда доступен всем
        if (menuId === 1) return true;

        if (accessiblePaths === 'all') return true;

        // Для меню показываем только если есть хотя бы один доступный пункт
        return filteredItems && filteredItems.length > 0;
    };
    const hasXomAshyo = Array.isArray(data)
        && data.some(item => item?.option?.name === "Xom ashyo");

    // Главные меню-кнопки
    const mainMenuItems = [
        {
            id: 1,
            title: t("dashboard"),
            path: "/factory/dashboard",
            icon: <LayoutDashboard className="w-7 h-7" />,
            isMenu: false
        },
        {
            id: 2,
            title: t('Order'),
            path: "/factory/orders",
            icon: <ShoppingCart className="w-7 h-7" />,
            isMenu: false
        },
        {
            id: 20,
            title: t("Warehouses"),
            icon: <Warehouse className="w-7 h-7" />,
            isMenu: true,
            items: [
                { id: 9, path: "/factory/stock", icon: <Blocks className="w-4 h-4" />, label: t("warehouseTitle") },
                { id: 17, path: "/factory/warehouse", icon: <Warehouse className="w-4 h-4" />, label: t("Warehouses") },
            ]
        },
        {
            id: 3,
            title: t("Report"),
            icon: <BarChart3 className="w-7 h-7" />,
            isMenu: true,
            items: [
                { id: 1, path: "/factory/report", icon: <BarChart3 className="w-4 h-4" />, label: t("Report") },
                { id: 2, path: "/factory/produt-analiz", icon: <PieChart className="w-4 h-4" />, label: t("Product_analysis") }
            ]
        },
        {
            id: 4,
            title: t("Kassa"),
            icon: <Banknote className="w-7 h-7" />,
            isMenu: true,
            items: [
                { id: 1, path: "/factory/clients", icon: <Users className="w-4 h-4" />, label: t("Clients") },
                { id: 3, path: "/factory/debtor", icon: <FileUser className="w-4 h-4" />, label: t("Clients_debtor") },
                { id: 4, path: "/factory/expenses", icon: <BanknoteArrowDown className="w-4 h-4" />, label: t("expenses") },
                { id: 6, path: "/factory/payment", icon: <DollarSign className="w-4 h-4" />, label: t("Payment_History") },
                { id: 10, path: "/factory/clients-sverka", icon: <ListChecks className="w-4 h-4" />, label: t("Clients_sverka") },
                { id: 2, path: "/factory/kassa", icon: <Banknote className="w-4 h-4" />, label: t("Kassa") },
                { id: 15, path: "/factory/history", icon: <Move />, label: t("operations") }
            ]
        },
        {
            id: 5,
            title: t("Settings"),
            icon: <Settings className="w-8 h-8" />,
            isMenu: true,
            items: [
                { id: 12, path: "/factory/product", icon: <Factory className="w-4 h-4" />, label: t("Production") },
                ...(hasXomAshyo
                    ? [{
                        id: 122,
                        path: "/factory/materials",
                        icon: <Factory className="w-4 h-4" />,
                        label: t("Material")
                    }]
                    : []),
                { id: 5, path: "/factory/partner", icon: <Users className="w-4 h-4" />, label: t("partner") },
                { id: 7, path: "/factory/payment-type", icon: <ClipboardType className="w-4 h-4" />, label: t("Payment_type") },
                { id: 14, path: "/factory/users", icon: <Users className="w-4 h-4" />, label: t("workers") },
                { id: 8, path: "/factory/price-type", icon: <DollarSign className="w-4 h-4" />, label: t("Price_type") },
                { id: 13, path: "/factory/client-category", icon: <Users className="w-4 h-4" />, label: t("Category_Client") },
                { id: 11, path: "/factory/carrier", icon: <Car className="w-4 h-4" />, label: t("Kurier") },
            ]
        }
    ];




    const menuListClass = `
        mt-[12px] bg-transparent backdrop-blur-md 
        p-4 w-[230px] translate-x-3  
        shadow-2xl rounded-xl flex flex-col gap-2
        border border-gray-200 dark:border-gray-700 shadow-gray-900/20
    `;

    const menuItemClass = `
        flex items-center gap-2 text-sm rounded-md
        hover:bg-[#4DA057]/10 hover:text-[#4DA057]
        dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400
        transition-all
    `;

    const renderMenuContent = (items, title) => {
        if (items.length === 0) {
            return (
                <p className="text-center text-gray-400 dark:text-gray-500 text-xs py-2">
                    {t("empty")}
                </p>
            );
        }

        return items.map(({ id, path, icon, label }) => (
            <NavLink key={id} to={path}>
                <MenuItem className={menuItemClass}>
                    {icon}
                    {label}
                </MenuItem>
            </NavLink>
        ));
    };

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
                <div className="flex items-center justify-center">
                    <img src={Logo} alt="Foto" className="w-[70%]  rounded-[8px]" />
                </div>
                {mainMenuItems.map(({ id, title, path, icon, isMenu, items }) => {
                    // Для обычных ссылок (не меню)
                    if (!isMenu) {
                        return (
                            <NavLink
                                key={id}
                                to={path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-300 
                                    ${isActive
                                        ? "bg-white/80 text-[black] shadow-md scale-105 dark:bg-gray-800 dark:text-card-light"
                                        : "text-gray-700 hover:bg-white/40 hover:text-[black] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[white]"}`}
                            >
                                <span className="w-7 h-7 mb-1">{icon}</span>
                                <span className="text-[11px] font-medium text-center">{title}</span>
                            </NavLink>
                        );
                    }

                    // Фильтруем пункты меню в зависимости от прав доступа
                    const filteredItems = filterMenuItems(items);

                    // Проверяем, нужно ли показывать это меню
                    if (!shouldShowMenu(id, filteredItems)) {
                        return null;
                    }

                    // Для меню
                    return (
                        <Menu key={id} placement="right-start" allowHover offset={15}>
                            <MenuHandler>
                                <div
                                    className="flex flex-col items-center justify-center w-full py-3 rounded-xl cursor-pointer
                                    text-gray-700 hover:bg-white/40 hover:text-[black]
                                    dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[white]
                                    transition-all duration-300"
                                >
                                    <span className="w-7 h-7 mb-1">{icon}</span>
                                    <span className="text-[11px] font-medium text-center">{title}</span>
                                </div>
                            </MenuHandler>

                            <MenuList className={menuListClass}>
                                <h3 className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                    {title}
                                </h3>
                                {renderMenuContent(filteredItems, title)}
                            </MenuList>
                        </Menu>
                    );
                })}
            </div>
        </Card>
    );
}