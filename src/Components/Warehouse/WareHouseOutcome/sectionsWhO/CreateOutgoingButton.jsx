import { Button } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { notify } from '../../../../utils/toast';
import Cookies from "js-cookie";
import { InvoicesApi } from '../../../../utils/Controllers/invoices';
import { locationInfo } from '../../../../utils/Controllers/locationInfo';
import { useInventory } from '../../../../context/InventoryContext';
import { useNavigate } from 'react-router-dom';



function CreateOutgoingButton({ client_id, client_name }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // context (per-mode)
    const {
        mixData,
        addItem,
        updateQty,
        updateDiscount,
        updatePrice,
        removeItem,
        resetMode,
        invoiceStarted,
        setInvoiceStarted,
        invoiceId,
        setInvoiceId,
        invoiceMeta,
        setInvoiceMeta,
        selectedSalePriceType,
        setSelectedSalePriceType,
        isDirty,
        setIsDirty,
        saveSuccess,
        setSaveSuccess,
    } = useInventory();
    const mode = "out";
    // states and variables
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);
    const operationType = "outgoing";
    const operationStatus = "draft";
    const userLId = Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");


    // get main warehouse data from API
    const [mainWarehouseData, setMainWarehouseData] = useState(null);
    const getMainWarehouseData = async () => {
        try {
            const res = await locationInfo.GetMainWarehouse(userLId);
            if (res?.status === 200) {
                setMainWarehouseData(res?.data?.location);
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
        }
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

                sessionStorage.setItem("de_ul_name", mainWarehouseData?.name)
                Cookies.set('de_ul_nesw', mainWarehouseData?.id);
                if (true) {
                    Cookies.set("sedqwdqdqwd", "terrwerwerw")
                }
                navigate(`/factory/warehouse/stockout`);
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

            <Button onClick={startInvoice} color="blue" variant="filled" size="md">
                {t("button.create_order")}
            </Button>
        </div>
    )
}

export default CreateOutgoingButton