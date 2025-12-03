// src/Components/Warehouse/WareHousePages/WareHouseOutcome.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
    Tags,
    Package,
    PackageSearch,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    FolderOpen,
    Download,
    Search as SearchIcon,
    Barcode as BarcodeIcon,
    Eraser,
    MinusCircle,
    CheckSquare,
    InfinityIcon,
    PackagePlus,
    PackageMinus,
    SendIcon,
    Move
} from "lucide-react";
import { notify } from "../../../utils/toast";
// import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import Spinner from "../../UI/spinner/Spinner";
import { Stock } from "../../../utils/Controllers/Stock";
import FreeData from "../../UI/NoData/FreeData";
import SelectBatchModal from "../WareHouseModals/SelectBatchModal";
import FolderOpenMessage from "../../UI/NoData/FolderOpen";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { InvoiceItems } from "../../../utils/Controllers/invoiceItems";
import { location } from "../../../utils/Controllers/location";

import OutgoingPanel from "./sectionsWhO/OutgoingPanel";
import { Staff } from "../../../utils/Controllers/Staff";
import CancelInvoiceButton from "./sectionsWhO/CancelInvoiceButton";
import { useInventory } from "../../../context/InventoryContext";
import { PriceType } from "../../../utils/Controllers/PriceType";
import { customSelectStyles } from "../WareHouseModals/ThemedReactTagsStyles";
import Select, { components } from "react-select";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";
import { LocalCategory } from "../../../utils/Controllers/LocalCategory"
import { Menu, MenuHandler, MenuItem, MenuList, Typography } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";

// small helper id
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

// debounce hook
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function WareHouseOutcome({ role = "factory" }) {
    // (Place this inside your component function scope)
    const { t } = useTranslation();
    const skladSubLinks = [
        { id: 1, label: t('Warehouse'), path: "/factory/warehouse/product", icon: Package },
        { id: 3, label: t('Coming'), path: "/factory/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: t('Shipment'), path: "/factory/warehouse/stockout", icon: PackageMinus },
        { id: 5, label: t("notifies"), path: "/factory/warehouse/notifications", icon: SendIcon }
    ];
    // user / location
    const userLId = role === "factory" ? Cookies.get("de_ul_nesw") : Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");
    const deUlName = sessionStorage.getItem("de_ul_name")

    // context (per-mode)
    const {
        mode, // should be "out" from WarehouseLayout
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

    // local UI
    const [sidebarMode, setSidebarMode] = useState(0);
    const [viewMode, setViewMode] = useState("category");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [saleTypes, setSaleTypes] = useState([]);
    const [saleTypesLoading, setSaleTypesLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [showApplyAll, setShowApplyAll] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const getSidebarWidth = () => {
        if (sidebarMode === 0) return "w-[70px]";
        if (sidebarMode === 1) return "w-1/4";
        return "w-1/3";
    };
    const toggleSidebar = () => {
        if (!invoiceStarted?.[mode]) {
            notify.info(t("notify_categories_panel_open_info"));
            return;
        }
        setSidebarMode((p) => (p + 1) % 3);
    };
    const isWide = sidebarMode === 2;
    const isMedium = sidebarMode === 1;

    const [locations, setLocations] = useState([{ id: 0, name: t("loading") }]);
    const [staffs, setStaffs] = useState([])
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [otherLocationName, setOtherLocationName] = useState("");
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);

    const [operationType, setOperationType] = useState("outgoing");
    const [operationStatus, setOperationStatus] = useState("draft");

    // search & barcode
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 600);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [barcodeEnabled, setBarcodeEnabled] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState("");
    const debouncedBarcode = useDebounce(barcodeInput, 450);
    const [barcodeLoading, setBarcodeLoading] = useState(false);
    const barcodeRef = useRef(null);

    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [batchProducts, setBatchProducts] = useState([]);

    // modal / print / saving local
    const [modalOpen, setModalOpen] = useState(false);
    const modalContentRef = useRef(null);
    const [printing, setPrinting] = useState(false);
    const [saving, setSaving] = useState(false);
    const lastFocusedRef = useRef(null);

    // fetch categories & locations
    const fetchCategories = async () => {
        try {
            setGroupLoading(true);
            const LocationId = role === "factory" ? Cookies.get("ul_nesw") : Cookies.get("usd_nesw");
            const res = await LocalCategory.GetAll(LocationId);
            if (res?.status === 200) setCategories(res.data || []);
            else setCategories(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_categories_error", { msg: err?.message || err }));
        } finally {
            setGroupLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            setLocationsLoading(true);
            const res = await location.getAllGroupLocalLocations(userLId);
            if (res?.status === 200 || res?.status === 201) setLocations(res.data || []);
            else setLocations(res || []);
        } catch (err) {
            notify.error(t("fetch_locations_error", { msg: err?.message || err }));
        } finally {
            setLocationsLoading(false);
        }
    };

    // ---------- Fetch staffs ----------
    const fetchStaffs = async (id = 0, isNewCreated = false) => {
        try {
            setLocationsLoading(true);
            const locId = role === "factory" ? Cookies.get("ul_nesw") : Cookies.get("usd_nesw")
            const res = await Staff.StaffGet(locId);
            if (res?.status === 200 || res?.status === 201) {
                setStaffs(res.data || []);
                if (isNewCreated && id) {
                    const newCreatedOption = (res.data || []).find((st) => st.id === id);
                    setSelectedStaff(newCreatedOption.id)
                }
            }
            else setStaffs(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_staffs_error", { msg: err?.message || err }));
        } finally {
            setLocationsLoading(false);
        }
    };
    // -------fetch Sale Price Types
    const fetchSalePriceTypes = async () => {
        try {
            setSaleTypesLoading(true);
            const res = await PriceType.PriceTypeGet(userLId);
            if (res.status === 200 || res.status === 201) {
                const options = res.data?.map((op) => ({ value: op.id, label: op.name })) || []
                setSaleTypes(options);
                if (!selectedSalePriceType?.[mode]) {
                    setSelectedSalePriceType(mode, options[1])
                }
            }
        } catch (err) {
            notify.error(t("get_sale_price_types_error", { msg: err }));
        } finally {
            setSaleTypesLoading(false)
        }
    }
    useEffect(() => {
        fetchSalePriceTypes()
    }, []);
    useEffect(() => {
        if (invoiceStarted?.[mode]) {
            fetchCategories();
        } else {
            fetchLocations();
            fetchStaffs();
        }
    }, [invoiceStarted]);

    // update invoiceMeta receiver for outgoing: receiver is selectedLocation, sender is current location
    useEffect(() => {
        const senderName = getLocationNameById(userLId) || t("me_label", { defaultValue: "Me" });
        setInvoiceMeta(mode, { ...invoiceMeta?.[mode], sender: senderName });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations]);

    const handleCategoryClick = async (catId) => {
        setSelectedCategory(catId);
        setViewMode("product");
        const type = invoiceMeta?.[mode]?.operation_type
        try {
            setProductLoading(true);
            // for outgoing, we fetch stocks of current location (we will take from this location)
            const res = await Stock.getLocationStocksByChildId(userLId, catId, type);
            if (res?.status === 200) setProducts(res.data || []);
            else setProducts(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_stock_error", { msg: err?.message || err }));
        } finally {
            setProductLoading(false);
        }
    };

    // start outgoing invoice
    const startInvoice = async () => {
        // for outgoing: user selects receiver (where items go)
        if (!selectedLocation) {
            notify.warning(t("missing_receiver_warning"));
            return;
        } else if (!selectedStaff) {
            notify.warning(t("missing_staff_warning"));
        }
        try {
            setCreateInvoiceLoading(true);
            const payload = {
                type: operationType,
                sender_id: userLId, // outgoing: sender is current location
                receiver_id: selectedLocation,
                created_by: createdBy,
                status: operationStatus,
                receiver_name: getLocationNameById(selectedLocation),
                sender_name: getLocationNameById(userLId),
                carrier_id: selectedStaff,
                note: "ok",
            };
            if (!selectedStaff) {
                delete payload.carrier_id
            }
            const res = await InvoicesApi.CreateInvoice(payload);
            const invoice_id = res?.data?.invoice?.id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error(t("server_invoice_id_missing"));
                    throw new Error(t("server_invoice_id_missing"));
                }
                setSidebarMode(1);
                setInvoiceId(mode, invoice_id);
                setInvoiceStarted(mode, true);
                setInvoiceMeta(mode, {
                    sender: getLocationNameById(userLId),
                    receiver: selectedLocation !== "other" ? getLocationNameById(selectedLocation) : (otherLocationName || t("other_label", { defaultValue: "Other" })),
                    time: new Date(res.data?.invoice?.createdAt).toLocaleString("uz-UZ", {
                        timeZone: "Asia/Tashkent",
                    }),
                    operation_type: operationType,
                }
                );
                setIsDirty(mode, true);
                notify.success(t("start_invoice_success_outgoing"));
            } else {
                throw new Error(t("invoice_creation_error"));
            }
        } catch (err) {
            notify.error(t("start_invoice_error", { msg: err?.message || err }));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };

    function getLocationNameById(id) {
        if (!id) return "";
        if (id === "other") return otherLocationName || t("other_label", { defaultValue: "Other" });
        const f = locations.find((l) => String(l.id) === String(id));
        return f ? f.name || f.address || t("location_label", { defaultValue: "Location" }) : "";
    };

    // search
    useEffect(() => {
        const doSearch = async () => {
            if (!debouncedSearch?.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                setSearchLoading(true);
                const data = { locationId: userLId, search: debouncedSearch.trim(), fac_id: Cookies.get("usd_nesw"), operation_type: invoiceMeta?.[mode]?.operation_type };
                const res = await Stock.getLocationStocksBySearch({ data });
                if (res?.status === 200 || res?.status === 201) setSearchResults(res.data || []);
            } catch (err) {
                notify.error(t("search_error", { msg: err?.message || err }));
            } finally {
                setSearchLoading(false);
            }
        };
        doSearch();
    }, [debouncedSearch, userLId]);

    // barcode
    const handleClickOutside = useCallback((e) => {
        if (barcodeRef.current && !barcodeRef.current.contains(e.target)) {
            setBarcodeEnabled(false);
        }
    }, []);
    useEffect(() => {
        if (barcodeEnabled && barcodeRef.current) barcodeRef.current.focus();
    }, [barcodeEnabled]);

    useEffect(() => {
        if (barcodeEnabled) document.addEventListener("mousedown", handleClickOutside);
        else document.removeEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [barcodeEnabled, handleClickOutside]);

    useEffect(() => {
        const val = debouncedBarcode?.replace?.(/\D/g, "") || "";
        if (!barcodeEnabled || !val) return;
        if (val.length === 13) fetchByBarcode(val);
    }, [debouncedBarcode, barcodeEnabled]);

    const addItemToMixDataByBatchModal = (item) => {
        addItemToMixData(item);
        notify.success(t("product_added", { name: item.product?.name || item.name }));
    };

    const fetchByBarcode = async (code) => {
        const barcodeMode = localStorage.getItem("barcodeMode");
        const operation_type = invoiceMeta?.[mode]?.operation_type
        const payload = {
            code,
            operation_type,
        }
        try {
            setBarcodeLoading(true);
            let res = await Stock.getByBarcode({ payload });
            if (res?.status === 200 || res?.status === 201) {
                const data = res.data;
                if (!data || data.length === 0) {
                    notify.error(t("barcode_not_found"));
                } else if (data.length === 1) {
                    const readyData = data[0];
                    addItemToMixData(readyData);
                    notify.success(t("product_added", { name: readyData.product?.name || readyData.name }));
                    setBarcodeInput("");
                } else {
                    if (barcodeMode === "auto") {
                        const lastBatch = data[0];
                        addItemToMixData(lastBatch);
                        notify.success(t("product_added", { name: lastBatch.product?.name || lastBatch.name }));
                        setBarcodeInput("");
                    } else {
                        setBatchProducts(data);
                        setBarcodeInput("");
                        setBatchModalOpen(true);
                    }
                }
            } else {
                notify.error(t("barcode_fetch_error"));
            }
        } catch (err) {
            notify.error(t("barcode_error_detail", { msg: err?.message || err }));
        } finally {
            setBarcodeLoading(false);
        }
    };

    // normalize (ensure stock_quantity available for outgoing)
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined;
        const fixed_qty = raw?.fixed_quantity;
        const sspt_id = selectedSalePriceType?.[mode]?.value;
        const spts = raw.sale_price_type || [];

        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: false,
            name: is_raw_stock ? productObj.name : raw.name || "-",
            price: (invoiceMeta?.[mode]?.operation_type === "transfer_out" || invoiceMeta?.[mode]?.operation_type === "disposal") ? (Number(raw.purchase_price) || 0) : (spts.find((t) => t.price_type_id === sspt_id)?.sale_price || 0),
            origin_price: invoiceMeta?.[mode]?.operation_type === "transfer_out" ? Number(raw.purchase_price || 0) : Number(raw.sale_price || 0),
            quantity: 1,
            stock_quantity: invoiceMeta?.[mode]?.operation_type === "disposal" ? raw?.quantity : raw?.draft_quantity,
            unit: is_raw_stock ? productObj.unit : raw.unit || "-",
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id,
            barcode: raw.barcode || null,
            batch: raw.batch ?? null,
            fixed_quantity: raw.fixed_quantity,
            discount: 0,
            purchase_price: Number(raw.purchase_price || 0),
            s_price_types: spts
        };
    }

    function addItemToMixData(raw) {
        const item = normalizeIncomingItem(raw);
        const res = addItem(item);
        if (res && res.ok === false) notify.error(res.message || t("item_not_added", { defaultValue: "Item not added" }));
    };

    // ---------- recalcTotal ----------
    const total = useMemo(() => {
        const safeNum = (v) =>
            v === "" || v == null || isNaN(Number(v)) || !v ? 0 : Number(v);
        return mixData.reduce(
            (sum, it) => sum + safeNum(it.price) * safeNum(it.quantity),
            0
        );
    }, [mixData]);
    const disTotal = useMemo(() => {
        const safeNum = (v) =>
            v === "" || v == null || isNaN(Number(v)) ? 0 : Number(v);
        return mixData.reduce(
            (sum, it) => sum + safeNum(it.price) * safeNum(it.quantity) * (100 - safeNum(it.discount)) / 100,
            0
        );
    })

    // handlers
    const onSidebarProductClick = (prodStock) => addItemToMixData(prodStock);
    const onSelectSearchResult = (r) => addItemToMixData(r);

    function handleUpdateQuantity(index, value) {
        if (value === "" || Number(value) > 0 || value === "0") {
            updateQty(index, value); // provider will clamp based on stock_quantity
        }
    }
    function changeSalePriceType(op, index) {
        setSelectedSalePriceType(mode, op);
        mixData?.map((ch, ix) => {
            let orgVal = ch?.s_price_types?.find((sp) => sp?.price_type_id === op?.value)?.sale_price || 0
            return updatePrice(ix, orgVal || 0)
        });
    }
    const handleDiscountChange = (index, value) => {
        const num = Math.min(20, Math.max(0, Number(value))); // min:0, max:20\
        value = num
        updateDiscount(index, value);
    };

    const handleApplyAll = (currentValue) => {
        mixData?.map((prd, ix) => {
            return updateDiscount(ix, currentValue)
        })
    }
    function handleRemoveItem(index) {
        removeItem(index);
    }

    // save items
    const saveInvoiceItems = async () => {
        const currentInvoiceId = invoiceId?.[mode];
        if (!currentInvoiceId) {
            notify.error(t("missing_invoice_id_error"));
            return false;
        }
        if (!mixData || mixData.length === 0) {
            notify.error(t("no_products_added_error"));
            return false;
        }

        const invalid = mixData.some((it) => Number(it.quantity) <= 0);
        if (invalid) {
            notify.error(t("qty_must_be_positive_error"));
            return false;
        }

        try {
            setSaving(true);
            const payload = {
                list: mixData.map((it) => ({
                    invoice_id: currentInvoiceId,
                    product_id: it.product_id || null,
                    quantity: Number(it.quantity || 0),
                    sale_price: Number(it.price || 0),
                    price_type_id: selectedSalePriceType?.[mode]?.value,
                    barcode: it.barcode || "",
                    is_new_batch: false,
                    batch: it.batch || null,
                    discount: it.discount || 0,
                    purchase_price: Number(it.purchase_price || 0)
                })),
            };

            const res = await InvoiceItems.createInvoiceItems(payload);

            if (res?.status === 200 || res?.status === 201) {
                setSaveSuccess(mode, true);
                setIsDirty(mode, false);
                notify.success(t("save_success"));
                return true;
            } else {
                throw new Error(t("save_error"));
            }
        } catch (err) {
            notify.error(t("save_error_detail", { msg: err?.message || err }));
            return false;
        } finally {
            setSaving(false);
        }
    };

    // useEffect for Escape key, modal open/close, print etc. remain unchanged (you already had them)
    // openModal / closeModal (messages) -> replace hardcoded messages where present:
    const openModal = () => {
        if (!invoiceStarted?.[mode]) {
            notify.error(t("invoice_not_started_error"));
            return;
        } else if (!mixData || mixData.length === 0) {
            notify.error(t("no_products_added_error"));
            return;
        }
        const value_spaces = mixData.filter((item) => !item.price || (item.quantity === "" || item.quantity === 0));
        if (value_spaces.length > 0) {
            value_spaces.forEach((err) => {
                const fieldKey = err.price === "" ? t("enter_price") : t("enter_quantity");
                notify.warning(t("product_missing_field", { name: err?.name || t("product_no_name"), field: fieldKey }));
            });
            return;
        }
        lastFocusedRef.current = document.activeElement;
        setModalOpen(true);
        setTimeout(() => {
            const el = modalContentRef.current?.querySelector("button, [href], input, select, textarea, [tabindex]");
            if (el) el.focus();
        }, 100);
    };

    const closeModal = () => {
        setModalOpen(false);
        setTimeout(() => {
            try { lastFocusedRef.current?.focus?.(); } catch (e) { }
        }, 50);
    };

    const handleModalSave = async () => {
        const ok = await saveInvoiceItems();
        if (ok) {
            resetAllBaseForNewInvoice();
            setModalOpen(false);
        }
    };

    // print
    const handlePrint = async () => {
        if (!modalContentRef.current) {
            notify.warning(t("print_no_content_warning"));
            return;
        }
        setPrinting(true);
        try {
            const content = modalContentRef.current.innerHTML;
            const printWindow = window.open("", "_blank", "width=900,height=900");
            if (!printWindow) {
                notify.error(t("print_window_failed_error"));
                setPrinting(false);
                return;
            }
            const style = `...`; // keep your existing style
            printWindow.document.open();
            printWindow.document.write(`<html><head><title>${t("print_document_title", { defaultValue: "PRINT DOCUMENT" })}</title>${style}</head><body>${content}</body></html>`);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                setPrinting(false);
            };
            setTimeout(() => { try { printWindow.focus(); printWindow.print(); } catch (e) { } setPrinting(false); }, 1500);
        } catch (err) {
            notify.error(t("print_error", { msg: err?.message || err }));
            setPrinting(false);
        }
    };

    const touchBtn = "min-h-[44px] px-4 py-3";

    function resetAllBaseForNewInvoice() {
        resetMode(mode)
        setSelectedLocation("");
        setOtherLocationName("");
        setSearchResults([]);
        setSearchQuery("");
        setSidebarMode(0);
        setSelectedCategory(null);
        setViewMode("category");
        setProducts([])
    }



    // Use this JSX to replace your current return(...)
    return (
        <section className="relative w-full min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark overflow-hidden transition-colors duration-300">
            <div
                className={`fixed transition-all duration-300 top-0 right-0 w-full h-[68px] backdrop-blur-[5px] bg-card-light dark:bg-card-dark text-[rgb(25_118_210)] shadow flex items-center pr-8 justify-center ${(invoiceStarted?.[mode] || role === "factory") && "justify-between pl-[190px]"} text-xl font-semibold z-30`}
            >
                <h2 className="text-text-light dark:text-text-dark">
                    {role === "factory" && deUlName + " | "}
                    {!invoiceStarted?.out && t("out_header_not_started")}
                    {invoiceStarted?.out &&
                        (invoiceMeta?.out?.operation_type === "outgoing"
                            ? t("out_header_selling")
                            : invoiceMeta?.out?.operation_type === "transfer_out"
                                ? t("out_header_transfer")
                                : invoiceMeta?.out?.operation_type === "return_out"
                                    ? t("out_header_return")
                                    : invoiceMeta?.out?.operation_type === "disposal"
                                        ? t("out_header_disposal")
                                        : t("out_header_unknown"))}
                </h2>

                {invoiceStarted?.[mode] ? (
                    <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} appearance={"btn"} id={invoiceId?.[mode]} />
                ) : (
                    <span />
                )}
                {(!invoiceStarted?.[mode] && role === "factory") ? (
                    <div>
                        {/* <div className="flex gap-2 cursor-pointer"><Move /> Operations</div> */}
                        <Menu placement="right-start" allowHover offset={15}>
                            <MenuHandler>
                                <div className="flex flex-col items-center justify-center w-full py-3 rounded-xl cursor-pointer 
                                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                                        transition-all duration-300">
                                    <Move className="w-8 h-8 mb-1" />
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
                    </div>
                ) :
                    <span />
                }
            </div>

            {/* Sidebar */}
            {invoiceStarted?.out && (
                <div
                    className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)]
          bg-card-light dark:bg-card-dark shadow-lg transition-all duration-500 ease-in-out flex flex-col border-r border-gray-200 dark:border-gray-700`}
                >
                    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title={t("toggle_sidebar_size_title")}
                            aria-label={t("aria_toggle_sidebar")}
                        >
                            {sidebarMode === 0 ? <ChevronRight size={22} /> : sidebarMode === 1 ? <ChevronsRight size={22} /> : <ChevronLeft size={22} />}
                        </button>

                        {(isMedium || isWide) && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode("category")}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition
                  ${viewMode === "category"
                                            ? "bg-blue-50 dark:bg-blue-900 dark:text-white border-blue-500 text-blue-700 shadow"
                                            : "border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-[#2b2b2b] text-gray-700 dark:text-text-dark hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"}`}
                                    aria-pressed={viewMode === "category"}
                                    aria-label={t("aria_view_category")}
                                >
                                    <Tags size={18} />
                                    {isWide && <span className="text-sm">{t("sidebar_category")}</span>}
                                </button>

                                <button
                                    onClick={() => setViewMode("product")}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition
                  ${viewMode === "product"
                                            ? "bg-blue-50 dark:bg-blue-900 dark:text-white border-blue-500 text-blue-700 shadow"
                                            : "border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-[#2b2b2b] text-gray-700 dark:text-text-dark hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"}`}
                                    aria-pressed={viewMode === "product"}
                                    aria-label={t("aria_view_product")}
                                >
                                    <Package size={18} />
                                    {isWide && <span className="text-sm">{t("sidebar_product")}</span>}
                                </button>
                            </div>
                        )}
                    </div>

                    {(isMedium || isWide) && (
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 dark:scrollbar-thumb-black dark:scrollbar-track-gray-600 p-3 grid gap-3 overflow-x-scroll grid-cols-[repeat(auto-fill,minmax(auto,1fr))]">
                            {viewMode === "category" ? (
                                groupLoading ? (
                                    <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                                        <Spinner /> {t("loading")}
                                    </p>
                                ) : categories.length === 0 ? (
                                    <div className="text-gray-500 p-3 dark:text-gray-400">{t("no_categories_found")}</div>
                                ) : (
                                    categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={`cursor-pointer border rounded-xl shadow-sm hover:shadow-md p-3 text-left
                      ${selectedCategory === cat.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-white" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-card-dark dark:text-text-dark"}`}
                                        >
                                            <div className="text-sm font-medium">{cat.name}</div>
                                        </button>
                                    ))
                                )
                            ) : productLoading ? (
                                <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                                    <Spinner /> {t("loading")}
                                </p>
                            ) : products.length === 0 ? selectedCategory ? (
                                <FreeData text={t("no_products_in_category")} icon={<PackageSearch className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400" />} />
                            ) : (
                                <FolderOpenMessage text={t("select_category_prompt")} icon={<FolderOpen className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400" />} />
                            ) : (
                                products
                                    .sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: "base" }))
                                    .map((prod, index) => (
                                        <button key={index} onClick={() => onSidebarProductClick(prod)} className="active:scale-[0.99]">
                                            <div className="flex items-center gap-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition">
                                                <div className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-gray-900 dark:text-text-dark font-medium whitespace-nowrap">{prod.product?.name || prod.name || t("product_no_name")}</span>
                                                    <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-300 font-medium whitespace-nowrap">
                                                        <span>{t("product_batch_label")} {prod.batch === null ? t("default_label") : prod.batch}</span>
                                                        <span>{t("product_barcode_label")} {prod.barcode || t("undefined_label")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main content */}
            <div className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0 ? "ml-[70px]" : sidebarMode === 1 ? "ml-[25%]" : "ml-[33.3%]"} p-6`}>
                <div className="bg-background-light dark:bg-background-dark rounded-2xl min-h-[calc(100vh-68px)] p-4 flex flex-col gap-4 transition-colors duration-300">
                    {/* HEAD */}
                    {!invoiceStarted?.[mode] ? (
                        <OutgoingPanel
                            receiverLocations={locationsLoading ? [{ id: 0, name: t("loading") }] : locations?.filter((item) => item.id !== userLId)}
                            selectedReceiver={selectedLocation}
                            selectReceiver={setSelectedLocation}
                            isLoading={createInvoiceLoading}
                            selectOprType={setOperationType}
                            selectStatus={setOperationStatus}
                            startOperation={startInvoice}
                            staffs={locationsLoading ? [{ id: 0, full_name: t("loading") }] : staffs}
                            selectedStaff={selectedStaff}
                            selectStaff={setSelectedStaff}
                            getStaffs={fetchStaffs}
                            role={role}
                        />
                    ) : (
                        <div className="h-[65px] bg-card-light dark:bg-card-dark rounded-lg flex items-center gap-3 px-3 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t("product_search_placeholder")}
                                    className="border rounded px-3 py-2 w-[420px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                                    aria-label={t("aria_search")}
                                />
                                <button onClick={() => setSearchQuery((s) => s.trim())} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 dark:bg-[#2b2b2b] hover:bg-gray-300 dark:hover:bg-[#3a3a3a]" aria-label={t("aria_search")}>
                                    <SearchIcon size={16} /> {t("search_button")}
                                </button>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setBarcodeEnabled((s) => !s);
                                        setBarcodeInput("");
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-green-600 text-white animate-[pulse_1.5s_infinite]" : "bg-gray-200 dark:bg-[#2b2b2b] text-gray-800 dark:text-text-dark"}`}
                                    aria-pressed={barcodeEnabled}
                                    aria-label={t("barcode_button")}
                                >
                                    <BarcodeIcon size={16} /> {t("barcode_button")}
                                </button>
                                {barcodeEnabled && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={barcodeRef}
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            placeholder={t("barcode_input_placeholder")}
                                            className="border rounded px-3 py-2 w-[200px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                                            inputMode="numeric"
                                            aria-label={t("barcode_input_aria")}
                                        />
                                        {barcodeLoading && <Spinner size="sm" />}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice info & body */}
                    {invoiceStarted?.[mode] && (
                        <>
                            <div className="bg-card-light dark:bg-card-dark rounded-lg p-3 shadow-sm flex flex-col gap-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_sender")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.sender || getLocationNameById(userLId)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_receiver")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.receiver}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_time")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.time}</div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_total_sum")}</div>
                                        <div className="font-semibold text-lg text-text-light dark:text-text-dark">{Number(total || 0).toLocaleString()} {t("currency")}</div>
                                    </div>
                                    {invoiceMeta?.[mode]?.operation_type === "outgoing" &&
                                        <div className="flex items-center gap-6">
                                            <div className="ml-auto text-right">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_total_discount_value")}</div>
                                                <div className="font-semibold text-lg text-text-light dark:text-text-dark">{(Number(total || 0) - Number(disTotal || 0)).toLocaleString()} {t("currency")}</div>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{t("label_total_with_discount")}</div>
                                                <div className="font-semibold text-lg text-text-light dark:text-text-dark">{Number(disTotal || 0).toLocaleString()} {t("currency")}</div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {invoiceMeta?.[mode]?.operation_type === "outgoing" &&
                                    <div className="max-w-80">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:bg-card-dark mb-2">{t("sale_price_type_label")}</div>
                                        <Select
                                            options={saleTypes}
                                            value={selectedSalePriceType?.[mode]}
                                            onChange={(op) => changeSalePriceType(op)}
                                            placeholder={t("sale_price_type_label")}
                                            isSearchable
                                            isLoading={saleTypesLoading}
                                            styles={customSelectStyles()}
                                        />
                                    </div>
                                }
                            </div>

                            <div className="bg-card-light dark:bg-card-dark rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                    <h4 className="text-text-light dark:text-text-dark">{t("search_results_title")}</h4>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSearchResults([])}
                                            className="p-2 rounded-full border border-gray-600 text-gray-900 dark:text-gray-200 hover:text-red-500 hover:border-red-800 transition-all duration-200"
                                            title={t("clear_results_title")}
                                            aria-label={t("clear_results_title")}
                                        >
                                            <Eraser size={18} />
                                        </button>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{t("results_count_label", { count: searchResults.length })}</div>
                                    </div>
                                </div>

                                {searchLoading ? (
                                    <div className="p-4 flex items-center gap-2 text-gray-500 dark:text-gray-400"><Spinner /> {t("search_loading_text")}</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-gray-500 dark:text-gray-400">{t("no_search_results")}</div>
                                ) : (
                                    <div className="flex gap-3 flex-wrap">
                                        {searchResults
                                            .sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: "base" }))
                                            .map((r) => (
                                                <button key={r.id || r.stock_id || generateId()} onClick={() => onSelectSearchResult(r)} className="bg-white dark:bg-card-dark border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
                                                    <div className="text-sm font-medium text-text-light dark:text-text-dark">{r.product?.name || r.name}</div>
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">{t("product_barcode_label")} {r.barcode || ""}</div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">{t("product_batch_label")} {r.batch === null ? t("default_label") : r.batch}</div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-card-light dark:bg-card-dark rounded-lg p-3 shadow-sm overflow-auto max-w-[100%] overflow-x-scroll border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 dark:text-gray-400 border-b">
                                        <tr>
                                            <th className="p-2">{t("table_col_index")}</th>
                                            <th>{t("table_col_batch")}</th>
                                            <th className="p-2">{t("table_col_name")}</th>
                                            <th className="p-2">{t("table_col_price")}</th>
                                            <th className="p-2">{t("table_col_qty")}</th>
                                            <th className="p-2">{t("table_col_stock")}</th>
                                            <th className="p-2">{t("table_col_unit")}</th>
                                            {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <th className="p-2">{t("table_col_discount")}</th>}
                                            <th className="p-2">{t("table_col_total")}</th>
                                            {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <th className="p-2">{t("table_col_total_discount")}</th>}
                                            <th className="p-2">{t("table_col_action")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!mixData || mixData.length === 0) ? (
                                            <tr>
                                                <td colSpan={11} className="p-4 text-center text-gray-400 dark:text-gray-400">{t("no_products_message")}</td>
                                            </tr>
                                        ) : mixData.map((it, idx) => {
                                            const stockAvail = Number(it.stock_quantity ?? Infinity);
                                            const qty = Number(it.quantity ?? 0);
                                            const qtyError = Number.isFinite(stockAvail) && qty > stockAvail;
                                            return (
                                                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                                                    <td className="p-2 align-center">{idx + 1}</td>
                                                    <td className="p-2 align-center">
                                                        <div className="text-[14px] text-gray-700 dark:text-gray-300">{it.batch ?? t("default_label")}</div>
                                                    </td>
                                                    <td className="p-2 align-center min-w-[300px]">
                                                        <div className="font-medium text-text-light dark:text-text-dark">{it.name || "—"}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{it.barcode}</div>
                                                    </td>
                                                    <td className="p-2 align-center w-[140px]">
                                                        {it.price || "-"}
                                                    </td>
                                                    <td className="p-2 align-center w-[120px]">
                                                        <input type="number" step="any" value={it.quantity} onChange={(e) => handleUpdateQuantity(idx, e.target.value)} className={`border rounded px-2 py-1 w-full min-w-[90px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${qtyError ? "ring-2 ring-red-400" : ""}`} aria-label={`${t("aria_quantity_for")} ${it.product?.name || idx + 1}`} />
                                                    </td>
                                                    <td className="p-2 aligin-center text-green-900">
                                                        {Number.isFinite(stockAvail) && (
                                                            <div className="flex align-center">
                                                                <span>{stockAvail}</span>
                                                                {!it.fixed_qty && (
                                                                    <span className="ml-1 flex items-center text-blue-500 text-xs">
                                                                        {" ("}
                                                                        <InfinityIcon size={18} className="mr-1" />
                                                                        {")"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-2 align-center w-[120px]">{it?.unit || "-"}</td>

                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && (
                                                        <td className="p-2 relative">
                                                            <input
                                                                type="number"
                                                                value={it.discount}
                                                                min={0}
                                                                max={20}
                                                                onFocus={() => {
                                                                    if (mixData?.length > 1) {
                                                                        setShowApplyAll(true);
                                                                        setFocusedInput(idx);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    setTimeout(() => setShowApplyAll(false), 200);
                                                                }}
                                                                onChange={(e) => handleDiscountChange(idx, e.target.value)}
                                                                className="w-16 px-2 py-1 border rounded bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                            />

                                                            {showApplyAll && focusedInput === idx && (
                                                                <button
                                                                    onMouseDown={() => handleApplyAll(it.discount)}
                                                                    className="absolute right-[-140px] top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded shadow transition-all"
                                                                >
                                                                    {t("apply_all_button")}
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}

                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <td className="p-2 align-center">{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>}
                                                    <td className="p-2 align-center">{(Number(it.price || 0) * Number(it.quantity || 0) * Number(100 - +it.discount) / 100).toLocaleString()}</td>
                                                    <td className="p-2 align-center">
                                                        <div className="flex gap-2 items-center">
                                                            <button onClick={() => handleRemoveItem(idx)} className="p-2 text-gray-800 dark:text-gray-200 hover:text-red-500 active:scale-90 transition-all duration-200" title={t("remove_row_title")} aria-label={`${t("aria_remove_item")} ${idx + 1}`}>
                                                                <MinusCircle size={22} />
                                                            </button>
                                                            {qtyError && <div className="text-xs text-red-600">{t("qty_exceeds_stock", { avail: stockAvail })}</div>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button onClick={openModal} className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] dark:bg-blue-600 text-white text-[16px] rounded hover:opacity-95 px-3 py-2`}>
                                        <CheckSquare size={22} />
                                        {t("btn_finish")}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className="bg-white dark:bg-card-dark rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6 text-text-light dark:text-text-dark" aria-live="polite">
                        <div id="modal_window" ref={modalContentRef}>
                            <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <h1 id="modal-title" className="text-center text-lg font-bold text-text-light dark:text-text-dark">{t("modal_title_outgoing")}</h1>
                                <div className="meta text-text-light dark:text-text-dark">
                                    <div><strong>{t("label_sender")}:</strong> {invoiceMeta?.[mode]?.sender || getLocationNameById(userLId)}</div>
                                    <div><strong>{t("label_receiver")}:</strong> {invoiceMeta?.[mode]?.receiver || "—"}</div>
                                    <div><strong>{t("label_time")}:</strong> {invoiceMeta?.[mode]?.time || new Date().toLocaleString()}</div>
                                    <div><strong>{t("modal_total_label")}:</strong> {Number(total || 0).toLocaleString()} {t("currency")}</div>
                                    <div><strong>{t("modal_total_discount_value")}:</strong> {(Number(total || 0) - Number(disTotal || 0)).toLocaleString()} {t("currency")}</div>
                                    <div><strong>{t("modal_total_with_discount")}:</strong> {Number(disTotal || 0).toLocaleString()} {t("currency")}</div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full" style={{ borderCollapse: "collapse", width: "100%" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_index")}</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_name")}</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("product_barcode_label")}</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_price")}</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_qty")}</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_unit")}</th>
                                                {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_discount")}</th>}
                                                <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_total")}</th>
                                                {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_total_discount")}</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mixData.map((it, idx) => (
                                                <tr key={it.id || idx}>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{idx + 1}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{it?.name || "—"}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{it.barcode || ""}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.price || 0).toLocaleString()}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.quantity || 0)}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{String(it.unit || t("table_col_unit"))}</td>
                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.discount || 0)}</td>}
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") && <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0) * Number(100 - +it.discount) / 100).toLocaleString()}</td>}
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") ? 7 : 5} style={{ border: "1px solid #333", padding: 6, textAlign: "right", fontWeight: "bold" }}>{t("modal_total_label")}</td>
                                                <td style={{ border: "1px solid #333", padding: 6 }}>{Number(total || 0).toLocaleString()}</td>
                                                <td style={{ border: "1px solid #333", padding: 6 }}>{Number(disTotal || 0).toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div>{t("signature_sender")}</div>
                                    <div style={{ marginTop: 8 }}>{t("signature_receiver")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-[#2b2b2b]">{t("modal_cancel")}</button>
                            <button onClick={handleModalSave} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
                                {saving ? <Spinner size="sm" /> : t("modal_save")}
                            </button>
                            <button onClick={handlePrint} disabled={printing} className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-[#2b2b2b]">
                                {printing ? <Spinner size="sm" /> : t("modal_print")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SelectBatchModal isOpen={batchModalOpen} onClose={() => setBatchModalOpen(false)} products={batchProducts} addItemToMixData={addItemToMixDataByBatchModal} />
        </section>
    );


}
