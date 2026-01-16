import { Button, Menu, MenuHandler, MenuItem, MenuList, Typography } from "@material-tailwind/react";
import CancelInvoiceButton from "../WareHouseOutcome/sectionsWhO/CancelInvoiceButton";
import { Home, Move, Package, PackageMinus, PackagePlus, SendIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function InventoryHeader({ type, prd_type, invoiceStarted, role, mode, deUlName, invoiceId, resetAllBaseForNewInvoice, deUlId, operation_type }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const basePath =
        prd_type === "material"
            ? "/factory/materials/warehouse"
            : "/factory/warehouse";

    const skladSubLinks = [
        { id: 1, label: t("Warehouse"), path: `${basePath}/stock/${deUlId}`, icon: Package },
        { id: 3, label: t("Coming"), path: `${basePath}/stockin/${deUlId}`, icon: PackagePlus },
        { id: 4, label: t("Shipment"), path: `${basePath}/stockout/${deUlId}`, icon: PackageMinus },
        // { id: 5, label: t("notifies"), path: `${basePath}/notifications/${deUlId}`, icon: SendIcon },
    ];

    const headerTitleMap = {
        out: {
            notStarted: "out_header_not_started",
            outgoing: "out_header_selling",
            transfer_out: "out_header_transfer",
            return_out: "out_header_return",
            disposal: "out_header_disposal",
        },
        in: {
            notStarted: "income_header_not_started",
            incoming: "income_header_incoming",
            transfer_in: "income_header_transfer",
            return_in: "income_header_return",
            return_dis: "income_header_return_disposal",
        },
        stock: {
            notStarted: "inventory_stock_header",
        }
    };

    return <div>
        <div
            className={`fixed transition-all duration-300 top-0 right-0 w-full h-[68px] backdrop-blur-[5px] bg-card-light dark:bg-card-dark text-[rgb(25_118_210)] shadow flex items-center pr-8 justify-center ${(invoiceStarted?.[mode] || role === "factory") && "justify-between pl-[190px]"} text-xl font-semibold z-30`}
        >
            {!invoiceStarted?.[mode] && role === "factory" && (
                <Button
                    onClick={() => navigate(-1)}
                    className={`backbtn px-4 py-[5px] rounded-xl transition-all duration-300 `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </Button>
            )}
            <h2 className="text-text-light dark:text-text-dark">
                {role === "factory" && deUlName + " | "}
                {!invoiceStarted?.[mode]
                    ? t(headerTitleMap[type].notStarted)
                    : t(headerTitleMap[type][operation_type] ??
                        (type === "incoming"
                            ? "income_header_unknown"
                            : "out_header_unknown"))}
            </h2>

            {invoiceStarted?.[mode] ? (
                <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} appearance={"btn"} id={invoiceId?.[mode]} />
            ) : (
                <span />
            )}

            {(!invoiceStarted?.[mode] && role === "factory") ? (
                <div className="flex items-center gap-[6px]">
                    {/* <div className="flex gap-2 cursor-pointer"><Move /> Operations</div> */}
                    <Menu placement="right-start" allowHover offset={15}>
                        <MenuHandler>
                            <div className="flex flex-col items-center justify-center w-full py-2 px-2 rounded-xl cursor-pointer 
                                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                                        transition-all duration-300">
                                <Move className="w-8 h-8 mb-0" />
                            </div>
                        </MenuHandler>

                        <MenuList className="p-4 w-[220px] translate-x-3 bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-gray-700 rounded-xl flex flex-col gap-2 transition-colors duration-300">
                            <Typography
                                variant="small"
                                color="gray"
                                className="mb-1 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400"
                            >
                                {t('Opt_warehouse')}
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
                    <div onClick={() => navigate(`/factory/warehouse-access/${deUlId}`)} className="flex flex-col items-center justify-center w-full py-2 px-2 rounded-xl cursor-pointer 
                                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                                        transition-all duration-300">
                        <Home className="w-8 h-8 mb-0" />
                    </div>
                </div>
            ) :
                <noscript></noscript>
            }
        </div>
    </div>;
}