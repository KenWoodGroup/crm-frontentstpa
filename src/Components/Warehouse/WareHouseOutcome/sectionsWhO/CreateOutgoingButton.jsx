import { Button } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { notify } from '../../../../utils/toast';
import Cookies from "js-cookie";
import { InvoicesApi } from '../../../../utils/Controllers/invoices';
import { locationInfo } from '../../../../utils/Controllers/locationInfo';
import { useInventory } from '../../../../context/InventoryContext';
import { useNavigate } from 'react-router-dom';
import { Layers, Package, Package2 } from 'lucide-react';



function CreateOutgoingButton({ client_id, client_name }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // context (per-mode)
    const {
        setInvoiceStarted,
        setInvoiceId,
        setInvoiceMeta,
        setIsDirty,
    } = useInventory();
    const mode = "out";
    // states and variables
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);
    const operationType = "outgoing";
    const operationStatus = "draft";
    const userLId = Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");

    const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
    const [warehousesLoading, setWarehousesLoading] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const WAREHOUSE_TYPE_META = {
        m_warehouse: {
            label: "Xomashyo ombori",
            icon: <Layers />,
        },
        warehouse: {
            label: "Tayyor mahsulot ombori",
            icon: <Package />,
        },
    };


    // get main warehouse data from API
    const [mainWarehouseData, setMainWarehouseData] = useState(null);
    const [mainWarehousesData, setMainWarehousesData] = useState([]);
    const getMainWarehouseData = async () => {
        try {
            const res = await locationInfo.GetMainWarehouse(userLId);
            if (res?.status === 200) {
                setMainWarehousesData(res?.data || []);
            }
        } catch (error) {
            console.error("Error fetching main warehouse data:", error);
        }
    };

    useEffect(() => {
        getMainWarehouseData();
    }, []);
    // start outgoing invoice
    const startInvoice = async () => {
        // for outgoing: user selects receiver (where items go)
        if (!client_id) {
            notify.warning(t("missing_receiver_warning"));
            return;
        };
        if (!mainWarehouseData?.id) {
            notify.warning("Ombor tanlanmadi");
            return;
        };

        try {
            setCreateInvoiceLoading(true);
            const payload = {
                type: operationType,
                sender_id: mainWarehouseData?.id, // outgoing: sender is main location
                receiver_id: client_id,
                created_by: createdBy,
                status: operationStatus,
                receiver_name: client_name || "",
                sender_name: mainWarehouseData?.name || "",
                note: "",
            };
            console.log(payload);

            const res = await InvoicesApi.CreateInvoice(payload);
            const invoice_id = res?.data?.invoice?.id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error(t("server_invoice_id_missing"));
                    throw new Error(t("server_invoice_id_missing"));
                }
                setInvoiceId(mode, invoice_id);
                setInvoiceStarted(mode, true);
                setInvoiceMeta(mode, {
                    sender: mainWarehouseData?.name || "",
                    receiver: client_name || "",
                    time: new Date(res.data?.invoice?.createdAt).toLocaleString("uz-UZ", {
                        timeZone: "Asia/Tashkent",
                    }),
                    operation_type: operationType,
                }
                );
                setIsDirty(mode, true);
                notify.success(t("start_invoice_success_outgoing"));
                if (true) {
                    Cookies.set("sedqwdqdqwd", "terrwerwerw")
                }
                navigate(`/factory/warehouse/stockout/${mainWarehouseData?.id}`);
            } else {
                throw new Error(t("invoice_creation_error"));
            }
        } catch (err) {
            notify.error(t("start_invoice_error", { msg: err?.message || err }));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };


    return (
        <div className='mt-4 md:mt-0'>

            <Button
                onClick={() => setWarehouseModalOpen(true)}
                color="blue"
                size="md"
            >
                {t("button.create_order")}
            </Button>

            {warehouseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setWarehouseModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl p-6 bg-card-light dark:bg-card-dark">
                        <h2 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">
                            Omborni tanlang
                        </h2>

                        {/* Loading */}
                        {warehousesLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 rounded-lg bg-gray-200 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {/* Empty */}
                        {!warehousesLoading && mainWarehousesData.length === 0 && (
                            <div className="text-center text-gray-500 py-8 text-text-light dark:text-text-dark">
                                Omborlar topilmadi
                            </div>
                        )}

                        {/* List */}
                        {!warehousesLoading && mainWarehousesData.length > 0 && (
                            <div className="space-y-2 max-h-[320px] overflow-y-auto">
                                {mainWarehousesData.map((wh) => {
                                    const meta = WAREHOUSE_TYPE_META[wh.type] || {};
                                    const selected = mainWarehouseData?.id === wh.id;

                                    return (
                                        <div
                                            key={wh.id}
                                            onClick={() => setMainWarehouseData(wh)}
                                            className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                  transition
                  ${selected
                                                    ? "border-blue-500 bg-blue-50  dark:text-text-light"
                                                    : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-text-dark"}
                `}
                                        >
                                            <div className="text-2xl">
                                                {meta.icon}
                                            </div>

                                            <div className="flex-1">
                                                <div className={`font-medium text-gray-900 ${selected ? "dark:text-text-light" : ""} text-text-light dark:text-text-dark`}>
                                                    {wh.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {meta.label}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="text"
                                className='bg-background-light dark:bg-background-dark dark:text-text-dark dark:hover:bg-gray-700'
                                onClick={() => setWarehouseModalOpen(false)}
                            >
                                {t("cancel")}
                            </Button>

                            <Button
                                color="blue"
                                disabled={!mainWarehouseData || createInvoiceLoading}
                                loading={createInvoiceLoading}
                                onClick={async () => {
                                    setWarehouseModalOpen(false);
                                    await startInvoice();
                                }}
                            >
                                {t("common.continue")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}

export default CreateOutgoingButton