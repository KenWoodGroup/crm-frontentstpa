// src/Components/Warehouse/WareHousePages/WareHouseIncome.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import Select, { components } from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { customSelectStyles } from "../WareHouseModals/ThemedReactTagsStyles";
import { useTranslation } from "react-i18next";
// import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, VerticalAlign } from "docx";
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";

import {
    Tags,
    Package,
    PackageSearch,
    ChevronRight,
    ChevronLeft,
    ChevronsRight,
    ChevronDown,
    FolderOpen,
    Download,
    Search as SearchIcon,
    Barcode as BarcodeIcon,
    Eraser,
    MinusCircle,
    PlusIcon,
    PlusCircle,
    CheckSquare,
    CheckCircle,
    Truck, Undo2, Trash2,
    X, Plus,
    Search,
    Circle,
    CircleX,
    Move,
    PackagePlus,
    PackageMinus,
    SendIcon,
    Home,
    DropletsIcon
} from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { button, input, Menu, MenuHandler, MenuItem, MenuList, select, Spinner, Typography } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import FreeData from "../../UI/NoData/FreeData";
import SelectBatchModal from "../WareHouseModals/SelectBatchModal";
import FolderOpenMessage from "../../UI/NoData/FolderOpen";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { InvoiceItems } from "../../../utils/Controllers/invoiceItems";
import { location } from "../../../utils/Controllers/location";

import { NavLink, useNavigate } from "react-router-dom";
import { Staff } from "../../../utils/Controllers/Staff";
import CancelInvoiceButton from "../WareHouseOutcome/sectionsWhO/CancelInvoiceButton";
import { data } from "autoprefixer";
import { border, style } from "@mui/system";
import ReturnedInvoiceProcessor from "./sectionsWhI/ReturnedInvoiceProcessor";
import { useInventory } from "../../../context/InventoryContext";
import CarrierCreateModal from "../WareHouseModals/CarrierCreateModal";
import { PriceType } from "../../../utils/Controllers/PriceType";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";
import { LocalCategory } from "../../../utils/Controllers/LocalCategory";
import { ArrowDropDown } from "@mui/icons-material";
// Utility: generate simple unique id (no external dep)
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/* ---------- Hooks (local) ---------- */
// Debounce hook (ms)
function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* ---------- Component ---------- */
export default function WareHouseIncome({ role = "factory", prd_type = "product" }) {
    // Ensure you have this import at the top of the file:
    // import { useTranslation } from 'react-i18next';

    // --- Function section (i18n keys applied) ---
    // user / location
    const navigate = useNavigate();
    const userLId = role === "factory" ? Cookies.get("de_ul_nesw") : Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");
    const deUlName = sessionStorage.getItem("de_ul_name")

    // Context (per-mode provider)
    const {
        mode, // 'in' or 'out' provided by WarehouseLayout -> WarehouseProvider
        mixData,
        addItem,
        updateQty,
        updatePrice,
        updateSPrice,
        updateBatch,
        removeItem,
        resetMode,
        invoiceStarted, // object { in, out }
        setInvoiceStarted, // fn (mode, value)
        invoiceId, // object { in, out }
        setInvoiceId, // fn (mode, value)
        returnInvoices,
        setReturnInvoices,
        selectedSalePriceType,
        setSelectedSalePriceType,
        invoiceMeta, // object { in: {...}, out: {...} }
        setInvoiceMeta, // fn (mode, value)
        setIsDirty, // fn (mode, value)
        saveSuccess, // object { in, out }
        setSaveSuccess, // fn (mode, value)
    } = useInventory();

    // i18n hook
    const { t } = useTranslation();
    const skladSubLinks = [
        { id: 1, label: t('Warehouse'), path: "/factory/warehouse/product", icon: Package },
        { id: 3, label: t('Coming'), path: "/factory/warehouse/stockin", icon: PackagePlus },
        { id: 4, label: t('Shipment'), path: "/factory/warehouse/stockout", icon: PackageMinus },
        { id: 5, label: t("notifies"), path: "/factory/warehouse/notifications", icon: SendIcon }
    ];

    // Local UI state
    const [sidebarMode, setSidebarMode] = useState(0); // 0=closed,1=25%,2=33.3%
    const [viewMode, setViewMode] = useState("category"); // 'category'|'product'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const getSidebarWidth = () => {
        if (sidebarMode === 0) return "w-[70px]";
        if (sidebarMode === 1) return "w-1/4";
        return "w-1/3";
    };
    const toggleSidebar = () => {
        // require invoice started for opening product/category panel
        if (!invoiceStarted?.[mode]) {
            notify.info(t("notify_categories_panel_open_info"));
            return;
        }
        setSidebarMode((p) => (p + 1) % 3);
    };
    const isWide = sidebarMode === 2;
    const isMedium = sidebarMode === 1;

    // Main content states (local UI)
    const [locations, setLocations] = useState([]);
    const [staffs, setStaffs] = useState([])
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [staffsLoading, setStaffsLoading] = useState(false);
    const [saleTypes, setSaleTypes] = useState([]);
    const [saleTypesLoading, setSaleTypesLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState({ value: null, label: t("select_sender_placeholder"), type: "default" });
    const [selectedStaff, setSelectedStaff] = useState("");
    const [otherLocationName, setOtherLocationName] = useState("");
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);

    const [selected, setSelected] = useState("incoming");
    const [sendToTrash, setSendToTrash] = useState(false);
    const operationLocations = (selected === "incoming" ? locations?.filter((loc) => loc.type === "partner" || loc.type === "default") : selected === "transfer_in" ? locations?.filter((loc) => loc.type === "warehouse" || loc.type === "default") : locations?.filter((loc) => loc.type === "dealer" || loc.type === "client" || loc.type === "default")) || []

    // search & barcode (local UI)
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
    const [operationComment, setOperationComment] = useState("")

    // Local UI-only states for modal / saving / printing
    const [modalOpen, setModalOpen] = useState(false);
    const modalContentRef = useRef(null); // for print
    const [printing, setPrinting] = useState(false);
    const [saving, setSaving] = useState(false); // local saving indicator for UI
    const lastFocusedRef = useRef(null);

    // --- Invoice search/select uchun state (ota component ichida e'lon qilinadi) ---
    const [invoiceQuery, setInvoiceQuery] = useState("");
    const debounceInvQuery = useDebounce(invoiceQuery, 550)

    const [invoiceResults, setInvoiceResults] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    function addInvoice(inv) {
        if (selectedInvoices.find(i => i.id === inv.id)) return; // duplicate oldini olish
        const next = [...selectedInvoices, inv].sort((a, b) => a.invoice_number.localeCompare(b.invoice_number));
        setSelectedInvoices(next);
    }

    function removeInvoice(invId) {
        setSelectedInvoices(selectedInvoices.filter(i => i.id !== invId));
    };

    // ---------- Fetch categories ----------
    const fetchCategories = async () => {
        try {
            setGroupLoading(true);
            const LocationId = role === "factory" ? Cookies.get("ul_nesw") : Cookies.get("usd_nesw");
            const res = await LocalCategory.GetAll(LocationId, prd_type);
            if (res?.status === 200) setCategories(res.data || []);
            else setCategories(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_categories_error", { msg: err?.message || err }));
        } finally {
            setGroupLoading(false);
        }
    };

    // ---------- Fetch locations ----------
    const fetchLocations = async () => {
        try {
            setLocationsLoading(true);
            const res = await location.getAllGroupLocalLocations(userLId);
            if (res?.status === 200 || res?.status === 201) {
                // setLocations(res.data || []);
                const formedOptions = (res.data || []).map((lc) => {
                    return (
                        { value: lc.id, label: lc.name, type: lc.type }
                    )
                });

                setLocations([{ value: null, label: t("select_sender_placeholder"), type: "default" }, ...formedOptions])
            }
            else setLocations(res || []);
        } catch (err) {
            notify.error(t("fetch_locations_error", { msg: err?.message || err }));
        } finally {
            setLocationsLoading(false);
        }
    };

    // ---------- Fetch staffs ----------
    const fetchStaffs = async (id = 0, isNewCreated = false,) => {
        try {
            setStaffsLoading(true);
            const locationId = role === "factory" ? Cookies.get("ul_nesw") : Cookies.get("usd_nesw")
            const res = await Staff.StaffGet(locationId);
            if (res?.status === 200 || res?.status === 201) {
                // setStaffs(res.data  || []);
                const formatted = (res.data || []).map((st) => {
                    return (
                        { value: st.id, label: st.full_name }
                    )
                });
                setStaffs(formatted)
                if (isNewCreated && id) {
                    const newCreatedOption = formatted.find((st) => st.value === id);
                    setSelectedStaff(newCreatedOption)
                }
            }
            else setStaffs(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_staffs_error", { msg: err?.message || err }));
        } finally {
            setStaffsLoading(false);
        }
    };
    // -------fetch Invoices for Return Operatins
    const fetchInvoicesForReturn = async () => {
        const q = (debounceInvQuery || "all").trim().toLowerCase();
        const data = {
            sender_id: userLId,
            receiver_id: selectedLocation?.value,
            searchINV: q || "all"
        }
        try {
            const res = await InvoicesApi.GetLocationInvoicesesForReturnIn(data)
            if (res.status === 200 || res.status === 201) {
                setInvoiceResults(res.data);
            }
        } catch (err) {
            notify.error(t("fetch_invoices_error", { msg: err?.message || err }))
        }
    };
    // -------fetch Sale Price Types
    const fetchSalePriceTypes = async () => {
        try {
            setSaleTypesLoading(true);
            const res = await PriceType.PriceTypeGet(Cookies.get("ul_nesw"));
            if (res.status === 200 || res.status === 201) {
                const options = res.data?.map((op) => ({ value: op.id, label: op.name }))
                setSaleTypes(options)
            }
        } catch (err) {
            notify.error(t("get_sale_price_types_error", { msg: err?.message || err }))
        } finally {
            setSaleTypesLoading(false)
        }
    }
    useEffect(() => {
        fetchSalePriceTypes()
    }, []);
    useEffect(() => {
        const operation_type = (selected === "return_in" && sendToTrash === true) ? "return_dis" : (selected === "return_in" && sendToTrash === false) ? "return_in" : (selected === "incoming" && sendToTrash === false) ? "incoming" : "transfer_in"
        if (operation_type !== "return_in" && operation_type !== "return_dis") {
            return
        }
        if (selectedLocation?.value && selectedLocation?.type !== "default") {
            fetchInvoicesForReturn()
        } else {
            setInvoiceResults([]);
            setSelectedInvoices([]);
            setInvoiceQuery("")
        }

    }, [debounceInvQuery, selectedLocation, selected])

    useEffect(() => {
        if (invoiceStarted?.in) {
            fetchCategories();
        } else {
            fetchLocations();
            fetchStaffs();
        }
    }, [invoiceStarted]);
    useEffect(() => {
        setSelectedLocation(operationLocations?.find((it) => it.type === "default"))
    }, [selected])

    // ---------- Sidebar: get products by category ----------
    const handleCategoryClick = async (catId) => {
        setSelectedCategory(catId);
        setViewMode("product");
        try {
            setProductLoading(true);
            const res = await Stock.getLocationStocksByChildId(prd_type, userLId, catId, invoiceMeta?.[mode]?.operation_type);
            if (res?.status === 200) setProducts(res.data || []);
            else setProducts(res?.data || []);
        } catch (err) {
            notify.error(t("fetch_categories_error", { msg: err?.message || err }));
        } finally {
            setProductLoading(false);
        }
    };

    // ---------- Start invoice (create) ----------
    const startInvoice = async () => {
        // For incoming (this component), type is transfer_incoming
        if (!selectedLocation?.value) {
            notify.warning(t("missing_sender_warning"));
            return;
        } else if (!selectedStaff?.value) {
            notify.warning(t("missing_staff_warning"));
        }
        const operation_type = (selected === "return_in" && sendToTrash === true) ? "return_dis" : (selected === "return_in" && sendToTrash === false) ? "return_in" : (selected === "incoming" && sendToTrash === false) ? "incoming" : "transfer_in";
        if ((operation_type === "return_in" || operation_type === "return_dis") && selectedInvoices?.length === 0) {
            notify.warning(t("invoice_search_note"));
            return;
        }
        try {
            setCreateInvoiceLoading(true);
            const payload = {
                type: operation_type,
                sender_id: selectedLocation === "other" ? null : selectedLocation?.value,
                receiver_id: userLId,
                receiver_name: getLocationNameById(userLId),
                sender_name: getLocationNameById(selectedLocation?.value),
                created_by: createdBy,
                status: "received",
                carrier_id: selectedStaff?.value,
                note: operationComment,
            };
            const res = await InvoicesApi.CreateInvoice(payload);

            // robust id extraction
            const invoice_id = res?.data?.invoice?.id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error(t("server_invoice_id_missing"));
                    throw new Error("Invoice id topilmadi");
                }
                setReturnInvoices(selectedInvoices);
                if (operation_type !== "return_in" && operation_type !== "return_dis") {
                    setSidebarMode(1)
                } else {
                    setSidebarMode(0)
                }
                setInvoiceId(mode, invoice_id);
                setInvoiceStarted(mode, true);
                setInvoiceMeta(mode, {
                    sender: getLocationNameById(selectedLocation?.value),
                    receiver: getLocationNameById(userLId),
                    time: new Date(res.data?.invoice?.createdAt).toLocaleString("uz-UZ", {
                        timeZone: "Asia/Tashkent",
                    }),
                    operation_type
                });
                setIsDirty(mode, true);
                if (operation_type === "transfer_in") {
                    notify.success(t("start_invoice_success_transfer"));
                } else if (operation_type === "return_in") {
                    notify.success(t("start_invoice_success_return"));
                } else if (operation_type === "return_dis") {
                    notify.success(t("start_invoice_success_return_disposal"));
                } else if (operation_type === "incoming") {
                    notify.success(t("start_invoice_success_incoming"))
                }
            } else {
                throw new Error("Invoice yaratishda xato");
            }
        } catch (err) {
            notify.error(t("invoice_creation_error") + ": " + (err?.message || err));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };

    function getLocationNameById(id) {
        if (!id) return "";
        if (id === "other") return otherLocationName || t("other_location_placeholder");
        const f = locations.find((l) => String(l.value) === String(id));
        return f ? f.label || t("label_sender") : "";
    };

    const fetchByBarcode = async (code) => {
        const barcodeMode = localStorage.getItem("barcodeMode");
        try {
            setBarcodeLoading(true);
            const payload = {
                code: code,
                operation_type: invoiceMeta?.[mode]?.operation_type
            }
            let res = await Stock.getByBarcode({ payload });
            if (res?.status === 200 || res?.status === 201) {
                const data = res.data;
                if (!data || data.length === 0) {
                    notify.warning(t("barcode_not_found"));
                } else if (data.length === 1) {
                    const readyData = data[0];
                    addItemToMixData(readyData);
                    notify.success(t("product_added", { name: readyData.product.name }));
                    setBarcodeInput("");
                } else {
                    if (barcodeMode === "auto") {
                        const lastBatch = data[0];
                        addItemToMixData(lastBatch);
                        notify.success(t("product_added", { name: lastBatch.product.name }));
                        setBarcodeInput("");
                    } else if (barcodeMode === "modal") {
                        setBatchProducts(data);
                        setBarcodeInput("");
                        setBatchModalOpen(true);
                    } else {
                        // default show modal
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
    // ---------- Search products ----------
    useEffect(() => {
        const doSearch = async () => {
            if (!debouncedSearch?.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                setSearchLoading(true);
                const data = {
                    locationId: userLId,
                    search: debouncedSearch.trim(),
                    fac_id: role === "warehouse" ? Cookies.get("usd_nesw") : Cookies.get("ul_nesw"),
                    operation_type: invoiceMeta?.[mode]?.operation_type
                };
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

    // ---------- Barcode (debounced) ----------
    const handleClickOutside = useCallback((e) => {
        if (barcodeRef.current && !barcodeRef.current.contains(e.target)) {
            setBarcodeEnabled(false);
        }
    }, []);
    useEffect(() => {
        if (barcodeEnabled && barcodeRef.current) {
            barcodeRef.current.focus();
        }
    }, [barcodeEnabled]);

    useEffect(() => {
        if (barcodeEnabled) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [barcodeEnabled, handleClickOutside]);

    useEffect(() => {
        const val = debouncedBarcode?.replace?.(/\D/g, "") || "";
        if (!barcodeEnabled || !val) return;
        if (val.length === 13) {
            fetchByBarcode(val);
        }
    }, [debouncedBarcode, barcodeEnabled]);

    const addItemToMixDataByBatchModal = (item) => {
        addItemToMixData(item);
        notify.success(t("product_added", { name: item.product.name }));
    };



    // ---------- Normalize & add to mixData (uses context addItem) ----------
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined;
        const sspt_id = selectedSalePriceType?.[mode]?.value;
        const spts = raw.sale_price_type || [];
        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: (is_raw_stock && raw.batch) ? false : true,
            name: is_raw_stock ? productObj.name : raw.name || "-",
            price: Number(raw.purchase_price || 0),
            origin_price: Number(raw.purchase_price || 0),
            quantity: 1,
            unit: is_raw_stock ? productObj.unit : raw.unit || "-",
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id || raw.product_id || null,
            barcode: raw.barcode || null,
            batch: is_raw_stock ? (raw.batch || "def") : null,
            is_returning: false,
            s_price_types: spts,
            s_price: (sspt_id && spts.length > 0) ? spts.find((t) => t.price_type_id === sspt_id)?.sale_price || 0 : 0,
        };
    };

    function addItemToMixData(raw) {
        const item = normalizeIncomingItem(raw);
        // addItem in provider will respect mode (incoming allows new batch; outgoing validates existence)
        const res = addItem(item); // provider default mode = provided mode at creation
        if (res && res.ok === false) {
            notify.error(res.message || t("save_error"));
        }
    };

    // // ---------- recalcTotal ----------
    const total = useMemo(() => {
        const safeNum = (v) =>
            v === "" || v == null || isNaN(Number(v)) ? 0 : Number(v);
        return mixData.reduce(
            (sum, it) => sum + safeNum(it.price) * safeNum(it.quantity),
            0
        );
    }, [mixData]);

    // ---------- Click handlers ----------
    const onSidebarProductClick = (prodStock) => {
        addItemToMixData(prodStock);
    };
    const onSelectSearchResult = (r) => {
        addItemToMixData(r);
    };

    // ---------- Table handlers ---------- (use context helpers)
    function handleUpdateQuantity(index, value, return_quantity) {
        if (invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") {
            const avail = Number(return_quantity || 0);
            if (value !== "" && value !== null && !Number.isNaN(Number(value))) {
                const clamped = Math.max(0, Math.min(Number(value), avail));
                const toSend = clamped === 0 ? "0" : clamped;
                return updateQty(index, toSend)
            } else {
                return updateQty(index, value)
            }
        }
        if (value === "" || Number(value) > 0 || value === "0") {
            updateQty(index, value); // provider will clamp for outgoing
        }
    }
    function handleUpdatePrice(index, value, org_price) {
        if (value === "" || Number(value) >= 0) {
            updatePrice(index, value);
            if (Number(value) !== +org_price) {
                // For incoming: create new batch flag; outgoing doesn't use it
                if (mode === "in") updateBatch(index, true);
            }
        }
    }
    function handleUpdateSPrice(index, value, org_s_price) {
        if (value === "" || Number(value) >= 0) {
            updateSPrice(index, value);
        }
    }
    function updateBatchNew(index, value, price, org_price) {
        if (price !== org_price) {
            // NOTE: you may want to add a translation key like 'new_batch_price_change_warning'
            notify.warning(t("generic_error", { msg: t("priceChangedNewBatchRequired") }));
            return;
        }
        updateBatch(index, value);
    }
    function handleRemoveItem(index) {
        removeItem(index);
    }
    function changeSalePriceType(op, index) {
        // setSelectedSalePriceType((prev)=> ({...prev, in:op}))
        setSelectedSalePriceType(mode, op);
        mixData?.map((ch, ix) => {
            let orgVal = ch?.s_price_types?.find((sp) => sp?.price_type_id === op?.value)?.sale_price || 0
            return updateSPrice(ix, orgVal || 0)
        });
    }

    // ---------- Save invoice items (returns boolean) ----------
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

        // Validation: ensure qty and price non-negative and something to save
        const invalid = mixData.some((it) => Number(it.quantity) <= 0);
        if (invalid) {
            notify.error(t("qty_must_be_positive_error"));
            return false;
        }

        try {
            setSaving(true);
            const payload = {
                list: mixData.map((it) => {
                    const item = {
                        invoice_id: currentInvoiceId,
                        product_id: it.product_id || null,
                        quantity: Number(it.quantity || 0),
                        purchase_price: Number(it.price || 0),
                        barcode: it.barcode || "",
                        is_new_batch: it.batch === "def" ? false : it.is_new_batch,
                        batch: it.batch === "def" ? null : it.batch || null,
                        sale_price: (invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") ? Number(it.s_price) : Number(it.s_price || 0),
                        discount: it.discount,
                        price_type_id: selectedSalePriceType?.[mode]?.value,
                        // product_type: prd_type,
                    }
                    // if (it.is_new_batch || it.batch === "def") {
                    //     delete item.batch
                    // };
                    if (!it.is_returning) {
                        delete item.discount
                    }
                    if (!it.s_price) {
                        delete item.sale_price
                    }
                    return item
                }),
            };


            const res = await InvoiceItems.createInvoiceItems(payload);

            if (res?.status === 200 || res?.status === 201) {
                setSaveSuccess(mode, true);
                setIsDirty(mode, false);
                notify.success(t("save_success"));
                return true;
            } else {
                throw new Error("Saqlashda xato");
            }
        } catch (err) {
            notify.error(t("save_error_detail", { msg: (err?.message || err) }));
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ---------- Modal open/close and actions ----------


    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && modalOpen) {
                closeModal();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modalOpen]);

    const openModal = () => {
        if (!invoiceStarted?.[mode]) {
            notify.error(t("invoice_not_started_error"));
            return;
        } else if (!mixData || mixData.length === 0) {
            notify.warning(t("no_products_added_error"));
            return;
        } else if (!selectedSalePriceType?.[mode]?.value && role === "factory") {
            notify.warning(t("sale_price_type_not_selected_warning"));
            return;
        }
        const value_spaces = mixData.filter((item) => !item.price || (item.quantity === "" || item.quantity === 0));
        if (value_spaces.length > 0) {
            value_spaces.forEach((err) => {
                // dynamic message: "<name> tovar uchun <field> kiriting"
                const field = !err.price ? t("table_col_price") : (!err.price && !err.quantity) ? t("table_col_price") + ' ' + t("table_col_qty") : t("table_col_qty");
                notify.warning(`${err?.name} ${t("comment_placeholder")} ${field}`);
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
            try {
                lastFocusedRef.current?.focus?.();
            } catch (err) { /* ignore */ }
        }, 50);
    };

    const handleModalSave = async () => {
        const ok = await saveInvoiceItems();
        if (ok) {
            // reset all to prepare for a new invoice
            resetAllBaseForNewInvoice();
            setModalOpen(false);
        }
    };

    // ---------- Print ----------
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
            const style = `
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; font-size: 13px; color: #111; padding: 8mm; }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { border: 1px solid #333; padding: 6px; text-align: left; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 6px; }
            .meta { margin-bottom: 12px; }
            .meta div { margin-bottom: 4px; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        `;
            printWindow.document.open();
            printWindow.document.write(`<html><head><title>${mode === "in" ? t("income_header_incoming") : t("income_header_unknown")}</title>${style}</head><body>${content}</body></html>`);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                setPrinting(false);
            };
            setTimeout(() => {
                try {
                    printWindow.focus();
                    printWindow.print();
                } catch (e) { /* ignore */ }
                setPrinting(false);
            }, 1500);
        } catch (err) {
            notify.error(t("print_error", { msg: err?.message || err }));
            setPrinting(false);
        }
    };

    // ---------- Utilities ----------
    const touchBtn = "min-h-[44px] px-4 py-3";

    // Restart invoices after success saved last
    function resetAllBaseForNewInvoice() {
        resetMode(mode)
        setSelectedLocation({ value: null, label: t("select_sender_placeholder"), type: "default" });
        setOtherLocationName("");
        setSearchResults([]);
        setSearchQuery("");
        setSidebarMode(0);
        setViewMode("category");
        setSelectedCategory(null);
    }

    // ---------- UI ----------
    const [carrierModalOpen, setCarrierModalOpen] = useState(false);
    // --- Custom DropdownIndicator ---
    const DropdownIndicator = (props) => {
        const { selectProps } = props;
        const { setCarrierModalOpen } = selectProps;

        return (
            <components.DropdownIndicator {...props}>
                <div className="flex items-center gap-1">
                    {/* Yangi kuryer qo‘shish tugmasi */}
                    <div
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            document.activeElement.blur(); // react-select fokusni olib tashlaydi
                            setCarrierModalOpen(true);
                        }}
                        className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform cursor-pointer"
                        title={t("add_courier_title")}
                    >
                        <Plus size={18} />
                    </div>

                    {/* Oddiy pastga strelka */}
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
            </components.DropdownIndicator>
        );
    };

    // category sidebar drag Y
    const initialHeight = window.innerWidth > 1279 ? window.innerHeight - 84 : 56
    const maxHeight = window.innerHeight - 84
    const minHeight = 56

    const [height, setHeight] = useState(initialHeight)
    const isResizing = useRef(false)
    const containerRef = useRef(null)

    const startResizing = (e) => {
        e.preventDefault()
        isResizing.current = true
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", stopResizing)
        document.addEventListener("touchmove", handleTouchMove)
        document.addEventListener("touchend", stopResizing)
        document.body.style.cursor = "row-resize"
    }

    const stopResizing = () => {
        isResizing.current = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", stopResizing)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", stopResizing)
        document.body.style.cursor = "default"
    }

    const handleMouseMove = (e) => {
        if (!isResizing.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const newHeight = e.clientY - rect.top
        if (newHeight >= minHeight && newHeight <= maxHeight) {
            setHeight(newHeight)
        }
    }

    const handleTouchMove = (e) => {
        if (!isResizing.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const touch = e.touches[0]
        const newHeight = touch.clientY - rect.top
        if (newHeight >= minHeight && newHeight <= maxHeight) {
            setHeight(newHeight)
        }
    };
    useEffect(() => {
        if (height < 95) {
            const timer = setTimeout(() => {
                if(height < 95) {
                    setHeight(minHeight);
                }
            }, 800);
            return () => clearTimeout(timer);
        }        
    }, [height]);

    return (
        <section className="relative w-full min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark overflow-hidden transition-colors duration-300">
            <div
                className={`fixed transition-all duration-300 text-[rgb(25_118_210)] top-0 right-0 w-full h-[68px] backdrop-blur-[5px]
        bg-card-light dark:bg-card-dark shadow text-xl font-semibold z-30 flex items-center pr-8 justify-center
        ${(invoiceStarted?.[mode] || role === "factory") && "justify-between pl-[190px] phone:pl-[140px]"} laptop:h-[52px]`}
            >

                <h2 className="text-text-light dark:text-text-dark text-lg laptop:text-base leading-[16px] font-semibold laptop:leading-[16bpx] line-clamp-2">
                    {(role === "factory" && deUlName) && <span className="phone:text-sm">{deUlName} <span className="mid:hidden"> | </span></span>}
                    <span className="mid:hidden">
                        {!invoiceStarted?.[mode]
                            ? t("income_header_not_started")
                            : invoiceMeta?.[mode]?.operation_type === "incoming"
                                ? t("income_header_incoming")
                                : invoiceMeta?.[mode]?.operation_type === "transfer_in"
                                    ? t("income_header_transfer")
                                    : invoiceMeta?.[mode]?.operation_type === "return_in"
                                        ? t("income_header_return")
                                        : invoiceMeta?.[mode]?.operation_type === "return_dis"
                                            ? t("income_header_return_disposal")
                                            : t("income_header_unknown")}
                    </span>
                </h2>

                {invoiceStarted?.[mode] ? (
                    <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} appearance={"btn"} id={invoiceId?.[mode]} />
                ) : (
                    <span />
                )}
                {(!invoiceStarted?.[mode] && role === "factory") ? (
                    <div className="flex items-center gap-[6px] tablet:gap-1">
                        {/* <div className="flex gap-2 cursor-pointer"><Move /> Operations</div> */}
                        <Menu placement="right-start" allowHover offset={15}>
                            <MenuHandler>
                                <div className="flex flex-col items-center justify-center w-full py-2 px-2 rounded-xl cursor-pointer 
                                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                                        transition-all duration-300 laptop:p-1 phone:rounded-md">
                                    <Move className="w-8 h-8 mb-0 phone:w-6 phone:h-6" />
                                </div>
                            </MenuHandler>

                            <MenuList className="p-4 w-[220px] translate-x-3 bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-gray-700 rounded-xl flex flex-col gap-2 transition-colors duration-300 phone:p-2 phone:gap-1 phone:w-[180px]">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="mb-1 font-semibold text-[13px] uppercase tracking-wide text-center dark:text-gray-400 phone:text-xs"
                                >
                                    {t('Opt_warehouse')}
                                </Typography>
                                {skladSubLinks.map(({ id, label, path, icon: Icon }) => (
                                    <NavLink key={id} to={path}>
                                        <MenuItem className="flex items-center gap-2 rounded-md text-sm hover:bg-[#4DA057]/10 hover:text-[#4DA057] dark:hover:bg-[#4DA057]/20 dark:hover:text-green-400 transition-all phone:text-xs phone:py-2 phone:px-3">
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </MenuItem>
                                    </NavLink>
                                ))}
                            </MenuList>
                        </Menu>
                        <div onClick={() => navigate(`/factory/warehouse-access/${Cookies.get("de_ul_nesw")}`)} className="flex flex-col items-center justify-center w-full py-2 px-2 rounded-xl cursor-pointer 
                                        text-gray-700 hover:bg-white/40 hover:text-[#0A9EB3] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#4DA057] 
                                        transition-all duration-300 laptop:p-1 phone:rounded-md phone:p-1">
                            <Home className="w-8 h-8 mb-0 phone:w-6 phone:h-6" />
                        </div>
                    </div>
                ) :
                    <noscript></noscript>
                }
            </div>

            {/* Sidebar */}
            {invoiceStarted?.[mode] &&
                invoiceMeta?.[mode]?.operation_type !== "return_in" &&
                invoiceMeta?.[mode]?.operation_type !== "return_dis" && (
                    <div
                        className={`absolute z-20 left-0 top-[73px] ${getSidebarWidth()} h-[calc(100vh-78px)]
            bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-lg transition-[width] duration-500 ease-in-out flex flex-col desktop:border-r desktop:border-gray-200 dark:border-gray-700 laptop:shadow-sm laptop:shadow-white laptop:rounded-lg laptop:top-[68px] laptop:left-4 laptop:min-h-[52px]`}
                        ref={containerRef}
                        style={{
                            height: `${height}px`
                        }}
                    >
                        <div className="flex mb-0.5 items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 laptop:h-[44px]">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-400 laptop:p-0"
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
                                                : "border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-[#2b2b2b] text-gray-700 dark:text-text-dark hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"
                                            }`}
                                        aria-pressed={viewMode === "category"}
                                    >
                                        <Tags size={18} />
                                        {isWide && <span className="text-sm">{t("sidebar_category")}</span>}
                                    </button>

                                    <button
                                        onClick={() => setViewMode("product")}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition
                    ${viewMode === "product"
                                                ? "bg-blue-50 dark:bg-blue-900 dark:text-white border-blue-500 text-blue-700 shadow"
                                                : "border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-[#2b2b2b] text-gray-700 dark:text-text-dark hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"
                                            }`}
                                        aria-pressed={viewMode === "product"}
                                    >
                                        <Package size={18} />
                                        {isWide && <span className="text-sm">{t("sidebar_product")}</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {((isMedium || isWide) && height > 80) && (
                            <div className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 dark:scrollbar-thumb-black dark:scrollbar-track-gray-600 p-3 grid gap-3 overflow-x-scroll grid-cols-[repeat(auto-fill,minmax(auto,1fr))]`}>
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
                        ${selectedCategory === cat.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-white/50" : "border-gray-300  bg-transparent   dark:text-text-dark"}`}
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
                                                <div className="flex items-center gap-2 bg-white dark:bg-card-dark border border-gray-200  rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition">
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
                        <button
                            onMouseDown={startResizing}
                            onTouchStart={startResizing}
                            onDoubleClick={() => {
                                if (height === minHeight) {
                                    setHeight(maxHeight)
                                } else {
                                    setHeight(minHeight)
                                }
                            }}
                            className="mt-auto pb-1 flex flex-col items-center gap-1 cursor-n-resize desktop:hidden">
                            <hr className="w-8 border-[1px] rounded-2xl border-card-dark dark:border-card-light opacity-70" />
                            <hr className="w-7 border-[1px] rounded-2xl border-card-dark dark:border-card-light opacity-70" />
                        </button>
                    </div>
                )}

            {/* Main content */}
            <div className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0 ? "ml-[69px]" : sidebarMode === 1 ? "ml-[25%]" : "ml-[33.3%]"} px-6 laptop:ml-0  laptop:px-0 phone:pl-2 phone:pr-1`}>
                <div className="bg-background-light dark:bg-background-dark rounded-2xl min-h-[calc(100vh-68px)] p-4 flex flex-col gap-2 transition-colors duration-300 tablet:p-2">
                    {/* HEAD */}
                    {!invoiceStarted?.[mode] ? (
                        <div className="p-0">
                            {/* Operation selection */}
                            <div className="flex flex-col gap-4 mb-4">
                                {/* Transfer_in */}
                                <button
                                    onClick={() => {
                                        setSelected("incoming");
                                        setSendToTrash(false);
                                    }}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200
                  ${selected === "incoming" ? "bg-blue-50 border-blue-500 text-blue-700 shadow dark:bg-blue-900 dark:text-white" : "border-gray-300 hover:border-blue-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-blue-600"} laptop:px-4 laptop:py-3 laptop:rounded-lg phone:px-3 phone:py-2 phone:rounded-md`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={22} />
                                        <span className="text-lg font-medium phone:text-sm">{t("op_incoming_card")}</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setSelected("transfer_in");
                                        setSendToTrash(false);
                                    }}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200
                  ${selected === "transfer_in" ? "bg-blue-50 border-blue-500 text-blue-700 shadow dark:bg-blue-900 dark:text-white" : "border-gray-300 hover:border-blue-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-blue-600"} laptop:px-4 laptop:py-3 laptop:rounded-lg phone:px-3 phone:py-2 phone:rounded-md`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={22} />
                                        <span className="text-lg font-medium phone:text-sm">{t("op_transfer_card")}</span>
                                    </div>
                                </button>

                                {/* Return_in */}
                                {role === "factory" &&
                                    <div
                                        className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200
                  ${selected === "return_in" ? "bg-green-50 border-green-500 text-green-700 shadow dark:bg-green-900 dark:text-white" : "border-gray-300 hover:border-green-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-green-600"} laptop:px-4 laptop:py-3 laptop:rounded-lg phone:px-3 phone:py-2 phone:rounded-md`}
                                    >
                                        <div onClick={() => setSelected("return_in")} className="flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Undo2 size={22} />
                                                <span className="text-lg font-medium phone:text-sm">{t("op_return_card")}</span>
                                            </div>
                                        </div>

                                        {/* Checkbox for return_dis */}
                                        {selected === "return_in" && (
                                            <label className="flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg cursor-pointer">
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Trash2 size={18} />
                                                    <span className="phone:text-base">{t("return_disposal_label")}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={sendToTrash}
                                                    onChange={(e) => setSendToTrash(e.target.checked)}
                                                    className="w-5 h-5 accent-red-500"
                                                />
                                            </label>
                                        )}
                                    </div>
                                }
                            </div>

                            <div>
                                <div>
                                    {/* --- Invoice Search & Select panel (Qo'shimcha, return holatlar uchun) --- */}
                                    <AnimatePresence>
                                        {(selected === "return_in" || selected === "return_dis") && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.35 }}
                                                className="mb-4"
                                            >
                                                <div className="bg-white dark:bg-card-dark rounded-xl border p-4 shadow-sm border-gray-200 dark:border-gray-700">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            {/* 1) location select */}
                                                            <div className="min-w-[220px] flex-1">
                                                                {locationsLoading ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Spinner /> {t("loading")}
                                                                    </div>
                                                                ) : (
                                                                    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
                                                                        <Select
                                                                            isClearable
                                                                            isSearchable
                                                                            options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
                                                                            placeholder={t("select_sender_placeholder")}
                                                                            value={selectedLocation}
                                                                            onChange={(loc) => setSelectedLocation(loc)}
                                                                            styles={customSelectStyles()}
                                                                        />
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* 3) selected invoices pills (mini preview) */}
                                                            <div className="ml-auto flex items-center gap-2">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">{t("selected_label")}</div>
                                                                <div className="flex items-center gap-2">
                                                                    {selectedInvoices.slice(0, 5).map((s) => (
                                                                        <div key={s.id} className="flex items-center gap-2 bg-gray-100 dark:bg-[#2b2b2b] px-2 py-1 rounded text-sm">
                                                                            <span className="text-text-light dark:text-text-dark">{s.invoice_number}</span>
                                                                            <button onClick={() => removeInvoice(s.id)} aria-label={`remove-${s.invoice_number}`} className="text-gray-600 dark:text-gray-300">
                                                                                <X size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    {selectedInvoices.length > 5 && <div className="text-xs text-gray-500 dark:text-gray-400">+{selectedInvoices.length - 5}</div>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Search input */}
                                                        <div className={`mt-2 transition-all duration-700 overflow-hidden relative ${selectedLocation?.value ? "max-w-[600px] w-full" : "max-w-0 w-0 border-transparent opacity-0 cursor-default"}`}>
                                                            <input
                                                                placeholder={t("invoice_search_placeholder")}
                                                                value={invoiceQuery}
                                                                onChange={(e) => setInvoiceQuery(e.target.value)}
                                                                className="border rounded pl-3 pr-10 py-2 w-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                                                            />
                                                            <div className="absolute top-[10px] right-[18px]">
                                                                {invoiceQuery ? (
                                                                    <span onClick={() => setInvoiceQuery("")} className="cursor-pointer hover:text-red-500">
                                                                        <CircleX size={18} />
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        <Search size={18} color="gray" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Results list */}
                                                        <div className="mt-3 grid grid-cols-1 gap-2 max-h-56 overflow-auto">
                                                            {invoiceResults.map((inv) => (
                                                                <div key={inv.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-sm text-text-light dark:text-text-dark">{inv.invoice_number}</span>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(inv.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-semibold text-text-light dark:text-text-dark">{inv.total_sum}</div>
                                                                        <button
                                                                            onClick={() => addInvoice(inv)}
                                                                            disabled={!!selectedInvoices.find((i) => i.id === inv.id)}
                                                                            className={`flex items-center gap-2 px-2 py-1 rounded text-sm border ${selectedInvoices.find((i) => i.id === inv.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-[#3a3a3a]"}`}
                                                                            aria-label={`select-${inv.invoice_number}`}
                                                                        >
                                                                            <Plus size={14} /> <span>{t("select_button")}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {invoiceResults.length === 0 && invoiceQuery && <div className="text-sm text-gray-500 dark:text-gray-400 p-3">{t("search_nothing_found")}</div>}
                                                        </div>

                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("invoice_search_note")}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Comment field */}
                            {selected && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-3">
                                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t("comment_label")}</label>
                                    <textarea
                                        value={operationComment}
                                        onChange={(e) => setOperationComment(e.target.value)}
                                        placeholder={t("comment_placeholder")}
                                        className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                        rows={2}
                                    />
                                </motion.div>
                            )}

                            <div className="h-[65px] bg-white dark:bg-card-dark rounded-lg flex items-center gap-4 px-3 shadow-sm border border-gray-200 dark:border-gray-700 laptop:rounded-lg laptop:grid laptop:grid-cols-4 laptop:h-auto laptop:py-3 mid:grid-cols-2 phone:rounded-md phone:px-2 phone:py-2">
                                {(selected !== "return_in" && selected !== "return_dis") && (
                                    <div className="flex items-center gap-2 laptop:col-span-2 laptop:w-full">
                                        {locationsLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Spinner /> {t("loading")}
                                            </div>
                                        ) : (
                                            <Select
                                                className="w-full phone:w-full phone:text-sm"
                                                isClearable
                                                isSearchable
                                                options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
                                                placeholder={t("select_sender_placeholder")}
                                                value={selectedLocation}
                                                onChange={(loc) => setSelectedLocation(loc)}
                                                styles={customSelectStyles()}
                                            />
                                        )}

                                        {selectedLocation === "other" && (
                                            <input
                                                value={otherLocationName}
                                                onChange={(e) => setOtherLocationName(e.target.value)}
                                                placeholder={t("other_location_placeholder")}
                                                className="border rounded px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                aria-label="Other location name"
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 laptop:col-span-2">
                                    {staffsLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner /> {t("loading")}
                                        </div>
                                    ) : (
                                        <>
                                            <Select
                                                className="w-full phone:w-full phone:text-sm"
                                                placeholder={t("select_staff_placeholder")}
                                                options={staffs}
                                                value={selectedStaff}
                                                onChange={(st) => setSelectedStaff(st)}
                                                components={{ DropdownIndicator }}
                                                menuPlacement="auto"
                                                fetchStaffs={fetchStaffs}
                                                setCarrierModalOpen={setCarrierModalOpen}
                                                isClearable
                                                isSearchable
                                                isLoading={staffsLoading}
                                                styles={customSelectStyles()}

                                            />

                                            {carrierModalOpen && (
                                                <CarrierCreateModal role={role} onClose={() => setCarrierModalOpen(false)} refresh={(id) => fetchStaffs(id, true)} />
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="ml-auto laptop:col-span-2 laptop:col-start-3 mid:col-start-1 ">
                                    <button
                                        disabled={createInvoiceLoading}
                                        onClick={startInvoice}
                                        className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] dark:bg-blue-600 text-white rounded hover:opacity-95 px-3 py-2 phone:w-full phone:text-sm phone:py-[2px] phone:px-3 phone:rounded-md phone:font-medium`}
                                        aria-label={t("aria_start_invoice")}
                                    >
                                        {!createInvoiceLoading ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        ) : (
                                            <Spinner />
                                        )}
                                        {selected === "transfer_in" && t("btn_start_transfer")}
                                        {selected === "return_in" && sendToTrash === false && t("btn_start_return")}
                                        {selected === "return_in" && sendToTrash === true && t("btn_start_return_disposal")}
                                        {selected === "incoming" && t("btn_start_incoming")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        (invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") && (
                            <div>
                                <div className="flex justify-end items-center gap-2 mb-2 desktop:hidden">
                                    <button
                                        onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }}
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
                                                aria-label={t("barcode_button")}
                                            />
                                            {barcodeLoading && <Spinner size="sm" />}
                                        </div>
                                    )}
                                </div>
                                <div className="h-[65px] bg-white dark:bg-card-dark rounded-lg flex items-center gap-3 px-3 shadow-sm border border-gray-200 dark:border-gray-700">
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

                                    <div className="ml-auto flex items-center gap-2 laptop:hidden">
                                        <button
                                            onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }}
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
                                                    aria-label={t("barcode_button")}
                                                />
                                                {barcodeLoading && <Spinner size="sm" />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Invoice info & body */}
                    {invoiceStarted?.[mode] && (
                        <>
                            <div className="bg-white dark:bg-card-dark rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex  flex-col gap-2">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:bg-card-dark">{t("label_sender")}</div>
                                        <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.sender || t("dash_fallback")}</div>
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
                                        <div className="font-semibold text-lg text-text-light dark:text-text-dark">{(total || 0).toLocaleString()} sum</div>
                                    </div>
                                </div>
                                {role === "factory" &&
                                    <div className="max-w-80">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 dark:bg-card-dark mb-2">{t("sale_price_type_label")}</div>
                                        <Select
                                            options={saleTypes}
                                            value={selectedSalePriceType?.[mode]}
                                            onChange={(op) => changeSalePriceType(op)}
                                            placeholder={t("sale_price_type_label")}
                                            isSearchable
                                            isClearable
                                            isLoading={saleTypesLoading}
                                            styles={customSelectStyles()}
                                        />
                                    </div>
                                }
                            </div>

                            {(invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") ? (
                                <div className="bg-white dark:bg-card-dark rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
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
                                        <div className="p-4 flex items-center gap-2 text-gray-500 dark:text-gray-400"><Spinner /> {t("loading")}</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="text-gray-500 dark:text-gray-400">{t("search_nothing_found")}</div>
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
                            ) : (
                                <div className="dark:bg-card-dark">
                                    <ReturnedInvoiceProcessor />
                                </div>
                            )}

                            <div className="bg-white dark:bg-card-dark rounded-lg p-3 shadow-sm overflow-auto border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="p-2">{t("table_col_index")}</th>
                                            <th>{t("table_col_batch")}</th>
                                            <th className="p-2">{t("table_col_name")}</th>
                                            <th className="p-2">{t("table_col_price")}</th>
                                            <th className="p-2">{t("table_col_qty")}</th>
                                            {(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") &&
                                                ["Продано", "Цена продажи"].map((th) => (
                                                    <th key={th} className="p-2">{th}</th>
                                                ))}
                                            <th className="p-2">{t("table_col_unit")}</th>
                                            {role === "factory" &&
                                                <th className="p-2">{t("table_col_sale_price")}</th>
                                            }
                                            <th className="p-2">{t("table_col_total")}</th>
                                            <th className="p-2">{t("table_col_remove")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!mixData || mixData.length === 0) ? (
                                            <tr>
                                                <td colSpan={8} className="p-4 text-center text-gray-400 dark:text-gray-400">{t("no_products_message")}</td>
                                            </tr>
                                        ) : mixData.map((it, idx) => {
                                            const stockAvail = Number(it.return_quantity ?? Infinity);
                                            const qty = Number(it.quantity ?? 0);
                                            const qtyError = (invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && Number.isFinite(stockAvail) && qty > stockAvail;
                                            return (
                                                <tr key={it.id || idx} className="border-b border-gray-200 dark:border-gray-700">
                                                    <td className="p-2 align-center">{idx + 1}</td>
                                                    <td>
                                                        {mode === "in" ? (
                                                            <input checked={!!it.is_new_batch} onChange={(e) => updateBatchNew(idx, e.target.checked, it.price, it.origin_price)} type="checkbox" name="is_new_batch" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <div className="font-medium text-text-light dark:text-text-dark">{it?.name || t("dash_fallback")}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{it.barcode}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex">{t("product_batch_label")}
                                                            {mode === "in" ? (
                                                                it.is_new_batch ? (<div className="tex-xs text-blue-gray-700 dark:text-blue-200">{t("new_batch_label")}</div>) : (it.batch === null ? t("default_label") : it.batch)
                                                            ) : (
                                                                (it.batch === null ? t("default_label") : it.batch)
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 align-center w-[140px]">
                                                        <input type="number" step="any" value={it.price ?? ""} onChange={(e) => handleUpdatePrice(idx, e.target.value, it.origin_price)} className="border rounded px-2 py-1 w-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400" aria-label={`Price for ${it.product?.name || idx + 1}`} />
                                                    </td>
                                                    <td className="p-2 align-center w-[120px] min-w-[120px]">
                                                        <input type="number" step="1" min={0} max={(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") ? (Number.isFinite(stockAvail) ? stockAvail : undefined) : Infinity} value={it.quantity === 0 ? "0" : (it.quantity ?? "")} onChange={(e) => handleUpdateQuantity(idx, e.target.value, it.return_quantity)} className={`border rounded px-2 py-1 w-full min-w-[90px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${qtyError ? "ring-2 ring-red-400" : ""}`} aria-label={`Quantity for ${it.product?.name || idx + 1}`} />
                                                    </td>

                                                    {(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && (
                                                        [{ a: it.return_quantity, b: "rq" }, { a: it.purchase_price, b: it.discount }]?.map((td) => {
                                                            return (
                                                                <td key={td.b} className="p-2 align-center w-[120px]">
                                                                    {td.b === "rq" ? td.a : <div className="text-xs"><span className="block">{td.a}</span> <span className="text-green-700 text-xs">{"(-" + td.b + "%)"}<p className="text-blue-gray-600 inline text-[16px]">{Number(td.a) * (100 - Number(td.b)) / 100}</p></span></div>}
                                                                </td>
                                                            );
                                                        })
                                                    )}

                                                    <td className="p-2 align-center w-[120px] ">{it?.unit || "-"}</td>
                                                    {role === "factory" &&
                                                        < td className="p-2 align-center w-[120px] ">
                                                            {selectedSalePriceType?.[mode]?.value ? (
                                                                ((invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && !it.is_new_batch) ? t("price_type_not_selected") :
                                                                    <input placeholder={t("s_price_placeholder")} type="number" step="any" value={it.s_price ?? ""} onChange={(e) => handleUpdateSPrice(idx, e.target.value, it.origin_s_price)} className="border rounded px-2 py-1 w-full bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400" aria-label={`Price for ${it.product?.name || idx + 1}`} />
                                                            )
                                                                :
                                                                <p className="text-xs text-yellow-900">{t("price_type_not_selected")}</p>
                                                            }
                                                        </td>
                                                    }
                                                    <td className="p-2 align-center">{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>

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

            {/* ---------- Modal (centered, A4 preview) ---------- */}
            {
                modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <div className="bg-white dark:bg-card-dark rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6 text-text-light dark:text-text-dark" aria-live="polite">
                            <div id="modal_window" ref={modalContentRef}>
                                {/* A4 preview content */}
                                <div style={{ width: "100%", boxSizing: "border-box" }}>
                                    <h1 id="modal-title" className="text-center text-lg font-bold text-text-light dark:text-text-dark">
                                        {invoiceMeta?.[mode]?.operation_type === "transfer_in"
                                            ? t("modal_title_transfer")
                                            : invoiceMeta?.[mode]?.operation_type === "return_in"
                                                ? t("modal_title_return")
                                                : invoiceMeta?.[mode]?.operation_type === "return_dis"
                                                    ? t("modal_title_return_disposal")
                                                    : t("modal_title_incoming")}
                                    </h1>
                                    <div className="meta mb-4 text-text-light dark:text-text-dark">
                                        <div><strong>{t("label_sender")}:</strong> {invoiceMeta?.[mode]?.sender || t("dash_fallback")}</div>
                                        <div><strong>{t("label_receiver")}:</strong> {invoiceMeta?.[mode]?.receiver || t("dash_fallback")}</div>
                                        <div><strong>{t("label_time")}:</strong> {invoiceMeta?.[mode]?.time || new Date().toLocaleString()}</div>
                                        <div><strong>{t("label_total_sum")}:</strong> {(total || 0).toLocaleString()} sum</div>
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
                                                    <th style={{ border: "1px solid #333", padding: 6 }}>{t("table_col_total")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mixData.map((it, idx) => (
                                                    <tr key={it.id || idx}>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{idx + 1}</td>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{it?.name || t("dash_fallback")}</td>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{it.barcode || ""}</td>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.price || 0).toLocaleString()}</td>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.quantity || 0)} {it.unit || t("table_col_unit")}</td>
                                                        <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td colSpan={5} style={{ border: "1px solid #333", padding: 6, textAlign: "right", fontWeight: "bold" }}>{t("modal_total_label")}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(total || 0).toLocaleString()}</td>
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

                            {/* Modal actions */}
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
                )
            }

            {/*  ---------- Modal (selectBatchModal) ---------- */}
            <SelectBatchModal isOpen={batchModalOpen} onClose={() => setBatchModalOpen(false)} products={batchProducts} addItemToMixData={addItemToMixDataByBatchModal} />
        </section >
    );

}
