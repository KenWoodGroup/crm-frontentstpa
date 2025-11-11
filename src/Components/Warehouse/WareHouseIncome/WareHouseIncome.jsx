// src/Components/Warehouse/WareHousePages/WareHouseIncome.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import Select, { components } from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { customSelectStyles } from "../WareHouseModals/ThemedReactTagsStyles";

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
    CircleX
} from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { button, select, Spinner } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import FreeData from "../../UI/NoData/FreeData";
import SelectBatchModal from "../WareHouseModals/SelectBatchModal";
import FolderOpenMessage from "../../UI/NoData/FolderOpen";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { InvoiceItems } from "../../../utils/Controllers/invoiceItems";
import { location } from "../../../utils/Controllers/location";

import { NavLink } from "react-router-dom";
import { Staff } from "../../../utils/Controllers/Staff";
import CancelInvoiceButton from "../WareHouseOutcome/sectionsWhO/CancelInvoiceButton";
import { data } from "autoprefixer";
import { border, style } from "@mui/system";
import ReturnedInvoiceProcessor from "./sectionsWhI/ReturnedInvoiceProcessor";
import { useInventory } from "../../../context/InventoryContext";
import CarrierCreateModal from "../WareHouseModals/CarrierCreateModal";
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
export default function WareHouseIncome() {
    // user / location
    const userLId = Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");

    // Context (per-mode provider)
    const {
        mode, // 'in' or 'out' provided by WarehouseLayout -> WarehouseProvider
        mixData,
        addItem,
        updateQty,
        updatePrice,
        updateBatch,
        removeItem,
        resetMode,
        invoiceStarted, // object { in, out }
        setInvoiceStarted, // fn (mode, value)
        invoiceId, // object { in, out }
        setInvoiceId, // fn (mode, value)
        returnInvoices,
        setReturnInvoices,
        invoiceMeta, // object { in: {...}, out: {...} }
        setInvoiceMeta, // fn (mode, value)
        isDirty, // object { in, out }
        setIsDirty, // fn (mode, value)
        saveSuccess, // object { in, out }
        setSaveSuccess, // fn (mode, value)
    } = useInventory();


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
            notify.info("Kategoriyalar orqali tovarlarni kiritish panelini ochish uchun Kirimni Boshlang");
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
    const [staffsLoading, setStaffsLoading] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState({ value: null, label: "Укажите отправителя", type: "default" });
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
    const [error, setError] = useState(null);

    // --- Invoice search/select uchun state (ota component ichida e'lon qilinadi) ---
    const [invoiceQuery, setInvoiceQuery] = useState("");
    const debounceInvQuery = useDebounce(invoiceQuery, 550)
    // const fakeInvoices = useMemo(() => [
    //     { id: "qwer1234zxcv5678gfds", invoice_number: "INV-202510-0154", createdAt: "2025-10-30T05:15:00.923Z", total_sum: "12550000" },
    //     { id: "a1b2c3d4e5f6g7h8j9k0", invoice_number: "INV-202510-0010", createdAt: "2025-10-01T12:00:00.000Z", total_sum: "3500000" },
    //     { id: "z9y8x7w6v5u4t3s2r1q0", invoice_number: "INV-202510-0023", createdAt: "2025-10-02T09:10:00.000Z", total_sum: "420000" },
    //     { id: "poiuyt1234lkjh5678gf", invoice_number: "INV-202510-0101", createdAt: "2025-10-15T14:20:00.000Z", total_sum: "950000" },
    //     { id: "mnbvcxz0987asdf6543q", invoice_number: "INV-202510-0077", createdAt: "2025-10-08T11:30:00.000Z", total_sum: "2230000" },
    //     { id: "lkjhgfdsa87654321poi", invoice_number: "INV-202510-0133", createdAt: "2025-10-21T08:45:00.000Z", total_sum: "170000" },
    //     { id: "uytrewq5678zxcv1234l", invoice_number: "INV-202510-0110", createdAt: "2025-10-17T16:05:00.000Z", total_sum: "760000" },
    //     { id: "asdfghjkl1112131415z", invoice_number: "INV-202510-0055", createdAt: "2025-10-05T10:00:00.000Z", total_sum: "5500000" },
    //     { id: "q1w2e3r4t5y6u7i8o9p0", invoice_number: "INV-202510-0099", createdAt: "2025-10-11T13:00:00.000Z", total_sum: "430000" },
    //     { id: "z1x2c3v4b5n6m7l8k9j0", invoice_number: "INV-202510-0200", createdAt: "2025-10-29T18:35:00.000Z", total_sum: "9990000" },
    // ], []);

    const [invoiceResults, setInvoiceResults] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    // filter qilish — oddiy client-side qidiruv (keyinchalik API bilan almashtirasiz)
    // useEffect(() => {
    //     const q = (invoiceQuery || "all").trim().toLowerCase();
    //     if (!q) {
    //         setInvoiceResults([]);
    //         return;
    //     }
    //     setInvoiceResults(fakeInvoices.filter(inv => inv.invoice_number.toLowerCase().includes(q)));
    // }, [invoiceQuery, fakeInvoices]);

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
            const LocationId = Cookies.get("usd_nesw");
            const res = await ProductApi.GetMiniCategoryById(LocationId);
            if (res?.status === 200) setCategories(res.data || []);
            else setCategories(res?.data || []);
        } catch (err) {
            notify.error("Categoriyalarni olishda xato: " + (err?.message || err));
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

                setLocations([{ value: null, label: "Укажите отправителя", type: "default" }, ...formedOptions])
            }
            else setLocations(res || []);
        } catch (err) {
            notify.error("Locationlarni olishda xato: " + (err?.message || err));
        } finally {
            setLocationsLoading(false);
        }
    };

    // ---------- Fetch staffs ----------
    const fetchStaffs = async (id = 0, isNewCreated = false,) => {
        try {
            setStaffsLoading(true);
            const res = await Staff.StaffGet(userLId);
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
            notify.error("Stafflarni olishda xato: " + (err?.message || err));
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
            notify.error("invocielarni olishda xatolik: ", err)
        }
    };
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

    // keep invoice receiver current when locations load (use context setter)
    useEffect(() => {
        const name = getLocationNameById(userLId) || "Me";
        // setInvoiceMeta expects (mode, value)
        setInvoiceMeta(mode, { ...invoiceMeta?.[mode], receiver: name });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations, userLId]);

    // ---------- Sidebar: get products by category ----------
    const handleCategoryClick = async (catId) => {
        setSelectedCategory(catId);
        setViewMode("product");
        try {
            setProductLoading(true);
            const res = await Stock.getLocationStocksByChildId(userLId, catId, invoiceMeta?.[mode]?.operation_type);
            if (res?.status === 200) setProducts(res.data || []);
            else setProducts(res?.data || []);
        } catch (err) {
            notify.error("Stocklarni olishda xato: " + (err?.message || err));
        } finally {
            setProductLoading(false);
        }
    };

    // ---------- Start invoice (create) ----------
    const startInvoice = async () => {
        // For incoming (this component), type is transfer_incoming
        if (!selectedLocation?.value) {
            notify.warning("Iltimos, jo'natuvchini tanlang");
            return;
        } else if (!selectedStaff?.value) {
            notify.warning("Iltimos, driverni tanlang");
            return;
        }
        const operation_type = (selected === "return_in" && sendToTrash === true) ? "return_dis" : (selected === "return_in" && sendToTrash === false) ? "return_in" : (selected === "incoming" && sendToTrash === false) ? "incoming" : "transfer_in";
        if ((operation_type === "return_in" || operation_type === "return_dis") && selectedInvoices?.length === 0) {
            notify.warning("vozvrat uchun kamida bitta invoice tanlang");
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
                    notify.error("Server invoice id qaytarmadi");
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
                setInvoiceMeta(mode, { ...invoiceMeta?.[mode], sender: getLocationNameById(selectedLocation?.value), receiver: getLocationNameById(userLId), operation_type });
                // mark dirty false initially (we just created invoice)
                setIsDirty(mode, true);
                if (operation_type === "transfer_in") {
                    notify.success("Операция перемещения успешно начата");
                } else if (operation_type === "return_in") {
                    notify.success("Операция возврата успешно начата");
                } else if (operation_type === "return_dis") {
                    notify.success("Возврат направлен на утилизацию");
                } else if (operation_type === "incoming") {
                    notify.success("Операция Приход успешно начата")
                }
            } else {
                throw new Error("Invoice yaratishda xato");
            }
        } catch (err) {
            notify.error(`${mode === "in" ? "Kirim" : "Chiqim"}ni boshlashda xato: ` + (err?.message || err));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };

    function getLocationNameById(id) {
        if (!id) return "";
        if (id === "other") return otherLocationName || "Other";
        const f = locations.find((l) => String(l.value) === String(id));
        return f ? f.label || "Location" : "";
    };

    const fetchByBarcode = async (code) => {
        const barcodeMode = localStorage.getItem("barcodeMode");
        try {
            setBarcodeLoading(true);
            const payload = {
                code:code,
                operation_type:invoiceMeta?.[mode]?.operation_type
            }
            let res = await Stock.getByBarcode({payload});
            if (res?.status === 200 || res?.status === 201) {
                const data = res.data;
                if (!data || data.length === 0) {
                    notify.warning("Barcode bo'yicha mahsulot topilmadi");
                } else if (data.length === 1) {
                    const readyData = data[0];
                    addItemToMixData(readyData);
                    notify.success(readyData.product.name + " qo'shildi");
                    setBarcodeInput("");
                } else {
                    if (barcodeMode === "auto") {
                        const lastBatch = data[0];
                        addItemToMixData(lastBatch);
                        notify.success(lastBatch.product.name + " qo'shildi");
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
                notify.error("Barcode topishda xatolik");
            }
        } catch (err) {
            notify.error("Barcode xatosi: " + (err?.message || err));
        } finally {
            setBarcodeLoading(false);
            console.log(code);
            
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
                    fac_id: Cookies.get("usd_nesw"),
                    operation_type: invoiceMeta?.[mode]?.operation_type
                };
                const res = await Stock.getLocationStocksBySearch({ data });
                if (res?.status === 200 || res?.status === 201) setSearchResults(res.data || []);
            } catch (err) {
                notify.error("Qidiruv xatosi: " + (err?.message || err));
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
        notify.success(item.product.name + " qo'shildi");
    };



    // ---------- Normalize & add to mixData (uses context addItem) ----------
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined
        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: (is_raw_stock && raw.batch) ? false : true,
            name: is_raw_stock ? productObj.name : raw.name || "-",
            price: Number(raw.purchase_price || 0),
            origin_price: Number(raw.purchase_price || 0),
            quantity: 1,
            unit: is_raw_stock ? productObj.unit : raw.unit || "-",
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id,
            barcode: raw.barcode || null,
            batch: is_raw_stock ? (raw.batch || "def") : null,
            is_returning: false
        };
    };

    function addItemToMixData(raw) {
        const item = normalizeIncomingItem(raw);
        // addItem in provider will respect mode (incoming allows new batch; outgoing validates existence)
        const res = addItem(item); // provider default mode = provided mode at creation
        if (res && res.ok === false) {
            notify.error(res.message || "Item qo'shilmadi");
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
    function updateBatchNew(index, value, price, org_price) {
        if (price !== org_price) {
            return notify.warning("Narx o'zgarganda yangi partiya yaratilinishi shart");
        }
        updateBatch(index, value);
    }
    function handleRemoveItem(index) {
        removeItem(index);
    }

    // ---------- Save invoice items (returns boolean) ----------
    const saveInvoiceItems = async () => {
        const currentInvoiceId = invoiceId?.[mode];
        if (!currentInvoiceId) {
            notify.error("Invoice ID mavjud emas");
            return false;
        }
        if (!mixData || mixData.length === 0) {
            notify.error("Hech qanday mahsulot qo'shilmagan");
            return false;
        }

        // Validation: ensure qty and price non-negative and something to save
        const invalid = mixData.some((it) => Number(it.quantity) <= 0);
        if (invalid) {
            notify.error("Barcha mahsulotlar uchun miqdor 0 dan katta bo‘lishi kerak");
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
                        price: Number(it.price || 0),
                        barcode: it.barcode || "",
                        is_new_batch: it.batch === "def" ? false : it.is_new_batch,
                        batch: it.batch === "def" ? null : it.batch || null,
                        purchase_price: (invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") ? Number(it.purchase_price) : Number(it.price || 0),
                        discount: it.discount
                    }
                    // if (it.is_new_batch || it.batch === "def") {
                    //     delete item.batch
                    // };
                    if (!it.is_returning) {
                        delete item.discount
                    }
                    return item
                }),
            };


            const res = await InvoiceItems.createInvoiceItems(payload);

            if (res?.status === 200 || res?.status === 201) {
                setSaveSuccess(mode, true);
                setIsDirty(mode, false);
                notify.success("Saqlash muvaffaqiyatli");
                return true;
            } else {
                throw new Error("Saqlashda xato");
            }
        } catch (err) {
            notify.error("Saqlash xatosi: " + (err?.message || err));
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ---------- Modal open/close and actions ----------
    useEffect(() => {
        if (!invoiceStarted?.[mode]) return;
        const t = setInterval(() => {
            setInvoiceMeta(mode, { ...invoiceMeta?.[mode], time: new Date().toLocaleString() });
        }, 1000);
        return () => clearInterval(t);
    }, [invoiceStarted?.[mode]]); // eslint-disable-line

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
            notify.error("Invoice hali boshlanmagan");
            return;
        } else if (!mixData || mixData.length === 0) {
            notify.error("Hech qanday mahsulot qo'shilmagan");
            return;
        }
        const value_spaces = mixData.filter((item) => !item.price || (item.quantity === "" || item.quantity === 0));
        if (value_spaces.length > 0) {
            value_spaces.forEach((err) => {
                notify.warning(err?.name + " tovar uchun " + (!err.price ? "Narx " : (!err.price && !err.quantity) ? "Narx va Miqdor " : "Miqdor ") + "kiriting");
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
            notify.warning("print content yo'q");
            return;
        }
        setPrinting(true);
        try {
            const content = modalContentRef.current.innerHTML;
            const printWindow = window.open("", "_blank", "width=900,height=900");
            if (!printWindow) {
                notify.error("Yangi oynani ochib bo'lmadi. Brauzer popup bloklanmaganligini tekshiring.");
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
            printWindow.document.write(`<html><head><title>${mode === "in" ? "KIRIM HUJJATI" : "CHIQQIM HUJJATI"}</title>${style}</head><body>${content}</body></html>`);
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
            notify.error("Print xatosi: " + (err?.message || err));
            setPrinting(false);
        }
    };

    // ---------- Utilities ----------
    const touchBtn = "min-h-[44px] px-4 py-3";

    // Restart invoices after success saved last
    function resetAllBaseForNewInvoice() {
        resetMode(mode)
        setSelectedLocation({ value: null, label: "Укажите отправителя", type: "default" });
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
                        title="Yangi kuryer qo‘shish"
                    >
                        <Plus size={18} />
                    </div>

                    {/* Oddiy pastga strelka */}
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
            </components.DropdownIndicator>
        );
    };




    return (
        <section className="relative w-full min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark overflow-hidden transition-colors duration-300">
            <div
                className={`fixed transition-all duration-300 text-[rgb(25_118_210)] top-0 right-0 w-full h-[68px] backdrop-blur-[5px]
        bg-card-light dark:bg-gray-800 shadow text-xl font-semibold z-30 flex items-center pr-8 justify-center
        ${invoiceStarted?.[mode] && "justify-between pl-[190px]"}`}
            >
                <h2 className="text-text-light dark:text-text-dark">
                    {!invoiceStarted?.[mode] && "Приём — поступления на склад"}
                    {invoiceStarted?.[mode] &&
                        (invoiceMeta?.[mode]?.operation_type === "incoming"
                            ? "Приход"
                            : invoiceMeta?.[mode]?.operation_type === "transfer_in"
                                ? "Перемещение"
                                : invoiceMeta?.[mode]?.operation_type === "return_in"
                                    ? "возврат"
                                    : invoiceMeta?.[mode]?.operation_type === "return_dis"
                                        ? "Утилизация возврата"
                                        : "Unknown")}
                </h2>

                {invoiceStarted?.[mode] ? (
                    <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} appearance={"btn"} id={invoiceId?.[mode]} />
                ) : (
                    <span />
                )}
            </div>

            {/* Sidebar */}
            {invoiceStarted?.[mode] &&
                invoiceMeta?.[mode]?.operation_type !== "return_in" &&
                invoiceMeta?.[mode]?.operation_type !== "return_dis" && (
                    <div
                        className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)]
            bg-card-light dark:bg-card-dark shadow-lg transition-all duration-500 ease-in-out flex flex-col border-r border-gray-200 dark:border-gray-700`}
                    >
                        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                                title="O‘lchamni o‘zgartirish"
                                aria-label="Toggle sidebar size"
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
                                    >
                                        <Tags size={18} />
                                        {isWide && <span className="text-sm">Категория</span>}
                                    </button>

                                    <button
                                        onClick={() => setViewMode("product")}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition
                    ${viewMode === "product"
                                                ? "bg-blue-50 dark:bg-blue-900 dark:text-white border-blue-500 text-blue-700 shadow"
                                                : "border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-[#2b2b2b] text-gray-700 dark:text-text-dark hover:bg-gray-300 dark:hover:bg-[#3a3a3a]"}`}
                                        aria-pressed={viewMode === "product"}
                                    >
                                        <Package size={18} />
                                        {isWide && <span className="text-sm">Товар</span>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {(isMedium || isWide) && (
                            <div className={`overflow-y-auto p-3 grid gap-3 overflow-x-scroll grid-cols-[repeat(auto-fill,minmax(auto,1fr))]`}>
                                {viewMode === "category" ? (
                                    groupLoading ? (
                                        <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                                            <Spinner /> Yuklanmoqda...
                                        </p>
                                    ) : categories.length === 0 ? (
                                        <div className="text-gray-500 p-3 dark:text-gray-400">Hech qanday kategoriya topilmadi.</div>
                                    ) : (
                                        categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id)}
                                                className={`cursor-pointer border rounded-xl shadow-sm hover:shadow-md p-3 text-left
                        ${selectedCategory === cat.id
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-white"
                                                        : "border-gray-300  bg-white dark:bg-card-dark dark:text-text-dark"}`}
                                            >
                                                <div className="text-sm font-medium">{cat.name}</div>
                                            </button>
                                        ))
                                    )
                                ) : productLoading ? (
                                    <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                                        <Spinner /> Yuklanmoqda...
                                    </p>
                                ) : products.length === 0 ? selectedCategory ? (
                                    <FreeData text={"Tanlangan kategoriyada mahsulot topilmadi"} icon={<PackageSearch className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400" />} />
                                ) : (
                                    <FolderOpenMessage text={"Iltimos, mahsulotlarni ko‘rish uchun kategoriya tanlang."} icon={<FolderOpen className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-400" />} />
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
                                                        <span className="text-gray-900 dark:text-text-dark font-medium whitespace-nowrap">{prod.product?.name || prod.name || "No name"}</span>
                                                        <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-300 font-medium whitespace-nowrap">
                                                            <span>Partiya: {prod.batch === null ? "Default" : prod.batch}</span>
                                                            <span>Shtrix: {prod.barcode || "undefined"}</span>
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
                        <div>
                            {/* Operation selection */}
                            <div className="flex flex-col gap-4 mb-4">
                                {/* Transfer_in */}
                                <button
                                    onClick={() => {
                                        setSelected("incoming");
                                        setSendToTrash(false);
                                    }}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200
                  ${selected === "incoming"
                                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow dark:bg-blue-900 dark:text-white"
                                            : "border-gray-300 hover:border-blue-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-blue-600"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={22} />
                                        <span className="text-lg font-medium">Приход на склад</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setSelected("transfer_in");
                                        setSendToTrash(false);
                                    }}
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200
                  ${selected === "transfer_in"
                                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow dark:bg-blue-900 dark:text-white"
                                            : "border-gray-300 hover:border-blue-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-blue-600"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={22} />
                                        <span className="text-lg font-medium">Перемещение на склад</span>
                                    </div>
                                </button>

                                {/* Return_in */}
                                <div
                                    className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200
                  ${selected === "return_in"
                                            ? "bg-green-50 border-green-500 text-green-700 shadow dark:bg-green-900 dark:text-white"
                                            : "border-gray-300 hover:border-green-300 text-gray-700 dark:border-gray-600 dark:text-text-dark dark:hover:border-green-600"}`}
                                >
                                    <div onClick={() => setSelected("return_in")} className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Undo2 size={22} />
                                            <span className="text-lg font-medium">Принять возврат</span>
                                        </div>
                                    </div>

                                    {/* Checkbox for return_dis */}
                                    {selected === "return_in" && (
                                        <label className="flex items-center justify-between bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Trash2 size={18} />
                                                <span>Направить на утилизацию</span>
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
                                                                        <Spinner /> Loading...
                                                                    </div>
                                                                ) : (
                                                                    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
                                                                        <Select
                                                                            isClearable
                                                                            isSearchable
                                                                            options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
                                                                            placeholder="Укажите отправителя"
                                                                            value={selectedLocation}
                                                                            onChange={(loc) => setSelectedLocation(loc)}
                                                                            styles={customSelectStyles()}
                                                                        />
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* 3) selected invoices pills (mini preview) */}
                                                            <div className="ml-auto flex items-center gap-2">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">Tanlanganlar:</div>
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
                                                                placeholder="Поиск по номеру накладной (например INV-202510-0154)"
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
                                                                            <Plus size={14} /> <span>Tanla</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {invoiceResults.length === 0 && invoiceQuery && <div className="text-sm text-gray-500 dark:text-gray-400 p-3">Ничего не найдено</div>}
                                                        </div>

                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">* Natijadan bir nechta накладные tanlab olishingiz mumkin. Bir xil id ikki marta tanlanmaydi.</div>
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
                                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Комментарий (необязательно)</label>
                                    <textarea
                                        value={operationComment}
                                        onChange={(e) => setOperationComment(e.target.value)}
                                        placeholder="Добавьте комментарий к операции..."
                                        className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                        rows={2}
                                    />
                                </motion.div>
                            )}

                            <div className="h-[65px] bg-white dark:bg-card-dark rounded-lg flex items-center gap-4 px-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                {(selected !== "return_in" && selected !== "return_dis") && (
                                    <div className="flex items-center gap-2">
                                        {locationsLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Spinner /> Loading...
                                            </div>
                                        ) : (
                                            <Select
                                                isClearable
                                                isSearchable
                                                options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
                                                placeholder="Укажите отправителя"
                                                value={selectedLocation}
                                                onChange={(loc) => setSelectedLocation(loc)}
                                                styles={customSelectStyles()}
                                            />
                                        )}

                                        {selectedLocation === "other" && (
                                            <input
                                                value={otherLocationName}
                                                onChange={(e) => setOtherLocationName(e.target.value)}
                                                placeholder="Tashqi location nomi"
                                                className="border rounded px-3 py-2 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                                aria-label="Other location name"
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {staffsLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner /> Loading...
                                        </div>
                                    ) : (
                                        <>
                                            <Select
                                                placeholder="Выберите поставшика"
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
                                                <CarrierCreateModal onClose={() => setCarrierModalOpen(false)} refresh={(id) => fetchStaffs(id, true)} />
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="ml-auto">
                                    <button
                                        disabled={createInvoiceLoading}
                                        onClick={startInvoice}
                                        className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] dark:bg-blue-600 text-white rounded hover:opacity-95 px-3 py-2`}
                                        aria-label="Start invoice"
                                    >
                                        {!createInvoiceLoading ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        ) : (
                                            <Spinner />
                                        )}
                                        {selected === "transfer_in" && "Начать Принять перемещение"}
                                        {selected === "return_in" && sendToTrash === false && "Начать Принять возврат"}
                                        {selected === "return_in" && sendToTrash === true && "Начать Утилизация возврата"}
                                        {selected === "incoming" && "Приход на склад"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        (invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") && (
                            <div className="h-[65px] bg-white dark:bg-card-dark rounded-lg flex items-center gap-3 px-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Mahsulot nomi bilan qidirish..."
                                        className="border rounded px-3 py-2 w-[420px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                                        aria-label="Search products by name"
                                    />
                                    <button onClick={() => setSearchQuery((s) => s.trim())} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 dark:bg-[#2b2b2b] hover:bg-gray-300 dark:hover:bg-[#3a3a3a]" aria-label="Search">
                                        <SearchIcon size={16} /> Поиск
                                    </button>
                                </div>

                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-green-600 text-white animate-[pulse_1.5s_infinite]" : "bg-gray-200 dark:bg-[#2b2b2b] text-gray-800 dark:text-text-dark"}`}
                                        aria-pressed={barcodeEnabled}
                                        aria-label="Toggle barcode input"
                                    >
                                        <BarcodeIcon size={16} /> Штрихкод
                                    </button>
                                    {barcodeEnabled && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={barcodeRef}
                                                value={barcodeInput}
                                                onChange={(e) => setBarcodeInput(e.target.value)}
                                                placeholder="13 ta raqamni kiriting..."
                                                className="border rounded px-3 py-2 w-[200px] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                                                inputMode="numeric"
                                                aria-label="Barcode input"
                                            />
                                            {barcodeLoading && <Spinner size="sm" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )}

                    {/* Invoice info & body */}
                    {invoiceStarted?.[mode] && (
                        <>
                            <div className="bg-white dark:bg-card-dark rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 dark:bg-card-dark">Отправитель</div>
                                    <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.sender || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Получатель</div>
                                    <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.receiver}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Время</div>
                                    <div className="font-medium text-text-light dark:text-text-dark">{invoiceMeta?.[mode]?.time}</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Общая стоимость</div>
                                    <div className="font-semibold text-lg text-text-light dark:text-text-dark">{(total || 0).toLocaleString()} сум</div>
                                </div>
                            </div>

                            {(invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") ? (
                                <div className="bg-white dark:bg-card-dark rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                        <h4 className="text-text-light dark:text-text-dark">Результаты поиска</h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSearchResults([])}
                                                className="p-2 rounded-full border border-gray-600 text-gray-900 dark:text-gray-200 hover:text-red-500 hover:border-red-800 transition-all duration-200"
                                                title="Clear results"
                                                aria-label="Clear search results"
                                            >
                                                <Eraser size={18} />
                                            </button>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{searchResults.length} natija</div>
                                        </div>
                                    </div>

                                    {searchLoading ? (
                                        <div className="p-4 flex items-center gap-2 text-gray-500 dark:text-gray-400"><Spinner /> Поиск...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="text-gray-500 dark:text-gray-400">Ничего не найдено</div>
                                    ) : (
                                        <div className="flex gap-3 flex-wrap">
                                            {searchResults
                                                .sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: "base" }))
                                                .map((r) => (
                                                    <button key={r.id || r.stock_id || generateId()} onClick={() => onSelectSearchResult(r)} className="bg-white dark:bg-card-dark border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
                                                        <div className="text-sm font-medium text-text-light dark:text-text-dark">{r.product?.name || r.name}</div>
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">Штрих: {r.barcode || ""}</div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">Партия: {r.batch === null ? "Default" : r.batch}</div>
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
                                            <th className="p-2">#</th>
                                            <th>Партия</th>
                                            <th className="p-2">Наименование</th>
                                            <th className="p-2">Цена</th>
                                            <th className="p-2">Количество</th>
                                            {(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") &&
                                                ["Продано", "Цена продажи"].map((th) => (
                                                    <th key={th} className="p-2">{th}</th>
                                                ))}
                                            <th className="p-2">Ед. изм.</th>
                                            <th className="p-2">Итого</th>
                                            <th className="p-2">Убрать</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!mixData || mixData.length === 0) ? (
                                            <tr>
                                                <td colSpan={8} className="p-4 text-center text-gray-400 dark:text-gray-400">Mahsulotlar mavjud emas</td>
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
                                                        <div className="font-medium text-text-light dark:text-text-dark">{it?.name || "—"}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{it.barcode}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex">Партия:
                                                            {mode === "in" ? (
                                                                it.is_new_batch ? (<div className="tex-xs text-blue-gray-700 dark:text-blue-200">Новая партия</div>) : (it.batch === null ? "Default" : it.batch)
                                                            ) : (
                                                                (it.batch === null ? "Default" : it.batch)
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
                                                            )
                                                        })
                                                    )}

                                                    <td className="p-2 align-center w-[120px] ">
                                                        {it?.unit || "-"}
                                                    </td>

                                                    <td className="p-2 align-center">
                                                        {(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}
                                                    </td>

                                                    <td className="p-2 align-center">
                                                        <div className="flex gap-2 items-center">
                                                            <button onClick={() => handleRemoveItem(idx)} className="p-2 text-gray-800 dark:text-gray-200 hover:text-red-500 active:scale-90 transition-all duration-200" title="Remove row" aria-label={`Remove item ${idx + 1}`}>
                                                                <MinusCircle size={22} />
                                                            </button>
                                                            {qtyError && <div className="text-xs text-red-600">Miqdor ombordagi ({stockAvail}) dan oshdi</div>}
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
                                        Завершить
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ---------- Modal (centered, A4 preview) ---------- */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className="bg-white dark:bg-card-dark rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6 text-text-light dark:text-text-dark" aria-live="polite">
                        <div id="modal_window" ref={modalContentRef}>
                            {/* A4 preview content */}
                            <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <h1 id="modal-title" className="text-center text-lg font-bold text-text-light dark:text-text-dark">
                                    {invoiceMeta?.[mode]?.operation_type === "transfer_in"
                                        ? "Документ перемещения на склад"
                                        : invoiceMeta?.[mode]?.operation_type === "return_in"
                                            ? "Документ приёма возврата"
                                            : invoiceMeta?.[mode]?.operation_type === "return_dis"
                                                ? "Документ приёма возврата с утилизацией"
                                                : "Документ Приход на склад"}
                                </h1>
                                <div className="meta mb-4 text-text-light dark:text-text-dark">
                                    <div><strong>Отправитель:</strong> {invoiceMeta?.[mode]?.sender || "—"}</div>
                                    <div><strong>Получатель:</strong> {invoiceMeta?.[mode]?.receiver || "—"}</div>
                                    <div><strong>Время:</strong> {invoiceMeta?.[mode]?.time || new Date().toLocaleString()}</div>
                                    <div><strong>Общая стоимость:</strong> {(total || 0).toLocaleString()} сум</div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full" style={{ borderCollapse: "collapse", width: "100%" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>#</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Наименование</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Штрихкод</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Цена</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Количество</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Итого</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mixData.map((it, idx) => (
                                                <tr key={it.id || idx}>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{idx + 1}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{it?.name || "—"}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{it.barcode || ""}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.price || 0).toLocaleString()}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.quantity || 0)} {it.unit || "birlik"}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={5} style={{ border: "1px solid #333", padding: 6, textAlign: "right", fontWeight: "bold" }}>Jami</td>
                                                <td style={{ border: "1px solid #333", padding: 6 }}>{Number(total || 0).toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div>Подпись отправителя:: ______________________</div>
                                    <div style={{ marginTop: 8 }}>Подпись получателя:: ______________________</div>
                                </div>
                            </div>
                        </div>

                        {/* Modal actions */}
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-[#2b2b2b]">Отмена</button>
                            <button onClick={handleModalSave} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
                                {saving ? <Spinner size="sm" /> : "Сохранить"}
                            </button>
                            <button onClick={handlePrint} disabled={printing} className="px-4 py-2 rounded border hover:bg-gray-100 dark:hover:bg-[#2b2b2b]">
                                {printing ? <Spinner size="sm" /> : "Печать"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  ---------- Modal (selectBatchModal) ---------- */}
            <SelectBatchModal isOpen={batchModalOpen} onClose={() => setBatchModalOpen(false)} products={batchProducts} addItemToMixData={addItemToMixDataByBatchModal} />
        </section>
    );


    // return (
    //     <section className="relative w-full min-h-screen bg-white overflow-hidden">
    //         <div className={`fixed transition-all duration-300  text-[rgb(25_118_210)] top-0 right-0 w-full h-[68px] backdrop-blur-[5px] bg-gray-200 shadow flex items-center pr-8  justify-center ${invoiceStarted?.[mode] && "justify-between pl-[190px]"} text-xl font-semibold z-30`}>
    //             <h2>{!invoiceStarted?.[mode] && "Приём — поступления на склад"}
    //                 {invoiceStarted?.[mode] && (
    //                     invoiceMeta?.[mode]?.operation_type === "incoming" ? "Приход" :
    //                         invoiceMeta?.[mode]?.operation_type === "transfer_in" ? "Перемещение" :
    //                             invoiceMeta?.[mode]?.operation_type === "return_in" ? "возврат" :
    //                                 invoiceMeta?.[mode]?.operation_type === "return_dis" ? "Утилизация возврата" :
    //                                     "Unknown"
    //                 )}
    //             </h2>
    //             {invoiceStarted?.[mode] ? <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} appearance={"btn"} id={invoiceId?.[mode]} /> : <span></span>}

    //         </div>

    //         {/* Sidebar */}
    //         {(invoiceStarted?.[mode] && invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") &&
    //             <div
    //                 className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)] bg-gray-50 shadow-lg transition-all duration-500 ease-in-out flex flex-col`}
    //             >
    //                 <div className="flex items-center justify-between p-2 border-b border-gray-200">
    //                     <button onClick={toggleSidebar} className="p-2 hover:bg-gray-200 rounded-xl transition" title="O‘lchamni o‘zgartirish" aria-label="Toggle sidebar size">
    //                         {sidebarMode === 0 ? <ChevronRight size={22} /> : sidebarMode === 1 ? <ChevronsRight size={22} /> : <ChevronLeft size={22} />}
    //                     </button>

    //                     {(isMedium || isWide) && (
    //                         <div className="flex gap-2">
    //                             <button onClick={() => setViewMode("category")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "category" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-pressed={viewMode === "category"}>
    //                                 <Tags size={18} />
    //                                 {isWide && <span className="text-sm">Категория</span>}
    //                             </button>
    //                             <button onClick={() => setViewMode("product")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "product" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-pressed={viewMode === "product"}>
    //                                 <Package size={18} />
    //                                 {isWide && <span className="text-sm">Товар</span>}
    //                             </button>
    //                         </div>
    //                     )}
    //                 </div>

    //                 {(isMedium || isWide) && (
    //                     <div className={`overflow-y-auto p-3 grid gap-3 overflow-x-scroll grid-cols-[repeat(auto-fill,minmax(auto,1fr))]`}>
    //                         {viewMode === "category" ? (
    //                             groupLoading ? (
    //                                 <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
    //                                     <Spinner /> Yuklanmoqda...
    //                                 </p>
    //                             ) : categories.length === 0 ? (
    //                                 <div className="text-gray-500 p-3">Hech qanday kategoriya topilmadi.</div>
    //                             ) : (
    //                                 categories.map((cat) => (
    //                                     <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className={`cursor-pointer border rounded-xl shadow-sm hover:shadow-md p-3 text-left ${selectedCategory === cat.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}>
    //                                         <div className="text-sm font-medium">{cat.name}</div>
    //                                     </button>
    //                                 ))
    //                             )
    //                         ) : productLoading ? (
    //                             <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
    //                                 <Spinner /> Yuklanmoqda...
    //                             </p>
    //                         ) : products.length === 0 ? selectedCategory ? (
    //                             <FreeData text={"Tanlangan kategoriyada mahsulot topilmadi"} icon={<PackageSearch className="w-10 h-10 mb-3 text-gray-400" />} />
    //                         ) : (
    //                             <FolderOpenMessage text={"Iltimos, mahsulotlarni ko‘rish uchun kategoriya tanlang."} icon={<FolderOpen className="w-10 h-10 mb-3 text-gray-400" />} />
    //                         ) : (
    //                             products.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: 'base' })).map((prod, index) => (
    //                                 <button key={index} onClick={() => onSidebarProductClick(prod)} className="active:scale-[0.99]">
    //                                     <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition">
    //                                         <div className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
    //                                             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    //                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    //                                             </svg>
    //                                         </div>
    //                                         <div>
    //                                             <span className="text-gray-900 font-medium whitespace-nowrap">{prod.product?.name || prod.name || "No name"}</span>
    //                                             <div className="flex items-center justify-center gap-2 text-gray-800 font-medium whitespace-nowrap">
    //                                                 <span>Partiya: {prod.batch === null ? "Default" : prod.batch}</span>
    //                                                 <span>Shtrix: {prod.barcode || "undefined"}</span>
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </button>
    //                             ))
    //                         )}
    //                     </div>
    //                 )}
    //             </div>
    //         }

    //         {/* Main content */}
    //         <div className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0 ? "ml-[70px]" : sidebarMode === 1 ? "ml-[25%]" : "ml-[33.3%]"} p-6`}>
    //             <div className="bg-gray-100 rounded-2xl min-h-[calc(100vh-68px)] p-4 flex flex-col gap-4">
    //                 {/* HEAD */}
    //                 {!invoiceStarted?.[mode] ? (
    //                     <div>
    //                         {/* Operation selection */}
    //                         <div className="flex flex-col gap-4 mb-4">
    //                             {/* Transfer_in */}
    //                             <button
    //                                 onClick={() => {
    //                                     setSelected("incoming");
    //                                     setSendToTrash(false);
    //                                 }}
    //                                 className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${selected === "incoming"
    //                                     ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
    //                                     : "border-gray-300 hover:border-blue-300 text-gray-700"
    //                                     }`}
    //                             >
    //                                 <div className="flex items-center gap-3">
    //                                     <Truck size={22} />
    //                                     <span className="text-lg font-medium">Приход на склад</span>
    //                                 </div>
    //                             </button>

    //                             <button
    //                                 onClick={() => {
    //                                     setSelected("transfer_in");
    //                                     setSendToTrash(false);
    //                                 }}
    //                                 className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${selected === "transfer_in"
    //                                     ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
    //                                     : "border-gray-300 hover:border-blue-300 text-gray-700"
    //                                     }`}
    //                             >
    //                                 <div className="flex items-center gap-3">
    //                                     <Truck size={22} />
    //                                     <span className="text-lg font-medium">Перемещение на склад</span>
    //                                 </div>

    //                             </button>

    //                             {/* Return_in */}
    //                             <div
    //                                 className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 ${selected === "return_in"
    //                                     ? "bg-green-50 border-green-500 text-green-700 shadow"
    //                                     : "border-gray-300 hover:border-green-300 text-gray-700"
    //                                     }`}
    //                             >
    //                                 <div
    //                                     onClick={() => setSelected("return_in")}
    //                                     className="flex items-center justify-between cursor-pointer"
    //                                 >
    //                                     <div className="flex items-center gap-3">
    //                                         <Undo2 size={22} />
    //                                         <span className="text-lg font-medium">Принять возврат</span>
    //                                     </div>
    //                                 </div>

    //                                 {/* Checkbox for return_dis */}
    //                                 {selected === "return_in" && (
    //                                     <label className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer">
    //                                         <div className="flex items-center gap-2 text-gray-700">
    //                                             <Trash2 size={18} />
    //                                             <span>Направить на утилизацию</span>
    //                                         </div>
    //                                         <input
    //                                             type="checkbox"
    //                                             checked={sendToTrash}
    //                                             onChange={(e) => setSendToTrash(e.target.checked)}
    //                                             className="w-5 h-5 accent-red-500"
    //                                         />
    //                                     </label>
    //                                 )}
    //                             </div>
    //                         </div>
    //                         <div>
    //                             <div>
    //                                 {/* --- Invoice Search & Select panel (Qo'shimcha, return holatlar uchun) --- */}
    //                                 <AnimatePresence>
    //                                     {(selected === "return_in" || selected === "return_dis") && (
    //                                         <motion.div
    //                                             layout
    //                                             initial={{ opacity: 0, height: 0 }}
    //                                             animate={{ opacity: 1, height: "auto" }}
    //                                             exit={{ opacity: 0, height: 0 }}
    //                                             transition={{ duration: 0.35 }}
    //                                             className="mb-4"
    //                                         >
    //                                             <div className="bg-white rounded-xl border p-4 shadow-sm">
    //                                                 <div className="flex flex-col gap-3">
    //                                                     <div className="flex items-center gap-3 flex-wrap">
    //                                                         {/* 1) location select (sizning original selectni shu yerga ko'rinish beramiz) */}
    //                                                         <div className="min-w-[220px] flex-1">
    //                                                             {locationsLoading ? (
    //                                                                 <div className="flex items-center gap-2"><Spinner /> Loading...</div>
    //                                                             ) : (
    //                                                                 <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
    //                                                                     <Select
    //                                                                         isClearable
    //                                                                         isSearchable
    //                                                                         options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
    //                                                                         placeholder="Укажите отправителя"
    //                                                                         value={selectedLocation}
    //                                                                         onChange={(loc) => setSelectedLocation(loc)}
    //                                                                     />
    //                                                                 </motion.div>
    //                                                             )}
    //                                                         </div>

    //                                                         {/* 3) selected invoices pills (mini preview) */}
    //                                                         <div className="ml-auto flex items-center gap-2">
    //                                                             <div className="text-sm text-gray-500">Tanlanganlar:</div>
    //                                                             <div className="flex items-center gap-2">
    //                                                                 {selectedInvoices.slice(0, 5).map(s => (
    //                                                                     <div key={s.id} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded text-sm">
    //                                                                         <span>{s.invoice_number}</span>
    //                                                                         <button onClick={() => removeInvoice(s.id)} aria-label={`remove-${s.invoice_number}`}><X size={14} /></button>
    //                                                                     </div>
    //                                                                 ))}
    //                                                                 {selectedInvoices.length > 5 && <div className="text-xs text-gray-500">+{selectedInvoices.length - 5}</div>}
    //                                                             </div>
    //                                                         </div>
    //                                                     </div>

    //                                                     {/* Search input Поиск по номеру накладной (например INV-202510-0154) */}
    //                                                     <div className={`mt-2 transition-all duration-700 overflow-hidden relative ${selectedLocation?.value ? "max-w-[600px] w-full" : "max-w-0 w-0 border-transparent opacity-0 cursor-default"}`}>
    //                                                         <input
    //                                                             placeholder="Поиск по номеру накладной (например INV-202510-0154)"
    //                                                             value={invoiceQuery}
    //                                                             onChange={(e) => setInvoiceQuery(e.target.value)}
    //                                                             className={`border rounded pl-3 pr-10 py-2 w-full`}
    //                                                         />
    //                                                         <div className="absolute top-[10px] right-[18px]">
    //                                                             {invoiceQuery ?
    //                                                                 <span onClick={() => setInvoiceQuery("")} className="cursor-pointer hover:text-red-500"><CircleX size={18} /></span>
    //                                                                 :
    //                                                                 <span><Search size={18} color="gray" /></span>
    //                                                             }
    //                                                         </div>
    //                                                     </div>

    //                                                     {/* Results list */}
    //                                                     <div className="mt-3 grid grid-cols-1 gap-2 max-h-56 overflow-auto">
    //                                                         {invoiceResults.map(inv => (
    //                                                             <div key={inv.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
    //                                                                 <div className="flex flex-col">
    //                                                                     <span className="font-medium text-sm">{inv.invoice_number}</span>
    //                                                                     <span className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleString()}</span>
    //                                                                 </div>
    //                                                                 <div className="flex items-center gap-2">
    //                                                                     <div className="text-sm font-semibold">{inv.total_sum}</div>
    //                                                                     <button
    //                                                                         onClick={() => addInvoice(inv)}
    //                                                                         disabled={!!selectedInvoices.find(i => i.id === inv.id)}
    //                                                                         className={`flex items-center gap-2 px-2 py-1 rounded text-sm border ${selectedInvoices.find(i => i.id === inv.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
    //                                                                         aria-label={`select-${inv.invoice_number}`}
    //                                                                     >
    //                                                                         <Plus size={14} /> <span>Tanla</span>
    //                                                                     </button>
    //                                                                 </div>
    //                                                             </div>
    //                                                         ))}
    //                                                         {(invoiceResults.length === 0 && invoiceQuery) && <div className="text-sm text-gray-500 p-3">Ничего не найдено</div>}
    //                                                     </div>

    //                                                     <div className="text-xs text-gray-500 mt-2">* Natijadan bir nechta накладные tanlab olishingiz mumkin. Bir xil id ikki marta tanlanmaydi.</div>
    //                                                 </div>
    //                                             </div>
    //                                         </motion.div>
    //                                     )}
    //                                 </AnimatePresence>

    //                             </div>
    //                         </div>
    //                         {/* Comment field - faqat operation tanlanganda chiqadi */}
    //                         {selected && (
    //                             <motion.div
    //                                 initial={{ opacity: 0, height: 0 }}
    //                                 animate={{ opacity: 1, height: "auto" }}
    //                                 exit={{ opacity: 0, height: 0 }}
    //                                 transition={{ duration: 0.3 }}
    //                                 className="mt-3"
    //                             >
    //                                 <label className="block text-sm text-gray-600 mb-1">
    //                                     Комментарий (необязательно)
    //                                 </label>
    //                                 <textarea
    //                                     value={operationComment}
    //                                     onChange={(e) => setOperationComment(e.target.value)}
    //                                     placeholder="Добавьте комментарий к операции..."
    //                                     className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 "
    //                                     rows={2}
    //                                 />
    //                             </motion.div>
    //                         )}

    //                         <div className="h-[65px] bg-white rounded-lg flex items-center gap-4 px-3 shadow-sm">
    //                             {(selected !== "return_in" && selected !== "return_dis") && (
    //                                 <div className="flex items-center gap-2">
    //                                     {locationsLoading ? (
    //                                         <div className="flex items-center gap-2"><Spinner /> Loading...</div>
    //                                     ) : (
    //                                         // <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border rounded px-3 py-2 bg-white" aria-label="Sender location">
    //                                         //     <option value="">Укажите отправителя</option>
    //                                         //     {operationLocations.filter((item) => String(item.id) !== String(userLId) && item.type !== "other" && item.type !== "disposal").map((loc) => <option key={loc.id} value={loc.id}>{loc.name || loc.address || loc.type}</option>)}
    //                                         // </select>
    //                                         <Select
    //                                             isClearable
    //                                             isSearchable
    //                                             options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
    //                                             placeholder="Укажите отправителя"
    //                                             value={selectedLocation}
    //                                             onChange={(loc) => setSelectedLocation(loc)}
    //                                         />
    //                                     )
    //                                     }

    //                                     {selectedLocation === "other" && (
    //                                         <input value={otherLocationName} onChange={(e) => setOtherLocationName(e.target.value)} placeholder="Tashqi location nomi" className="border rounded px-3 py-2" aria-label="Other location name" />
    //                                     )}
    //                                 </div>
    //                             )}
    //                             <div className="flex items-center gap-2">
    //                                 {staffsLoading ? (
    //                                     <div className="flex items-center gap-2"><Spinner /> Loading...</div>
    //                                 ) : (
    //                                     // <select value={selectedLocation} onChange={(e) => setSelectedStaff(e.target.value)} className="border rounded px-3 py-2 bg-white" aria-label="Sender location">
    //                                     //     <option value="">Выберите поставшика</option>
    //                                     //     {staffs?.map((loc) => <option key={loc.id} value={loc.id}>{loc.full_name || 'Noname'}</option>)}
    //                                     // </select>
    //                                     <>
    //                                         <Select
    //                                             placeholder="Выберите поставшика"
    //                                             options={staffs}
    //                                             value={selectedStaff}
    //                                             onChange={(st) => setSelectedStaff(st)}
    //                                             components={{ DropdownIndicator }}
    //                                             menuPlacement="auto"
    //                                             fetchStaffs={fetchStaffs}
    //                                             setCarrierModalOpen={setCarrierModalOpen}
    //                                             isClearable
    //                                             isSearchable
    //                                             isLoading={staffsLoading}
    //                                             styles={{
    //                                                 control: (base) => ({
    //                                                     ...base,
    //                                                     minWidth: "250px",   // ✅ minimal kenglikni belgilaydi
    //                                                 }),
    //                                                 menu: (base) => ({
    //                                                     ...base,
    //                                                     minWidth: "250px",   // ✅ dropdown menyu ham shu kenglikda bo‘lsin
    //                                                 }),
    //                                             }}
    //                                         />

    //                                         {carrierModalOpen && (
    //                                             <CarrierCreateModal
    //                                                 onClose={() => setCarrierModalOpen(false)}
    //                                                 refresh={(id) => fetchStaffs(id, true)}
    //                                             />
    //                                         )}
    //                                     </>
    //                                 )
    //                                 }

    //                                 {/* {selectedStaff === "other" && (
    //                                     <input value={otherLocationName} onChange={(e) => setOtherLocationName(e.target.value)} placeholder="Tashqi location nomi" className="border rounded px-3 py-2" aria-label="Other location name" />
    //                                 )} */}
    //                             </div>

    //                             <div className="ml-auto">
    //                                 <button disabled={createInvoiceLoading} onClick={startInvoice} className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] text-white rounded hover:opacity-95`} aria-label="Start invoice">
    //                                     {
    //                                         !createInvoiceLoading ?
    //                                             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    //                                             </svg> :
    //                                             <Spinner />
    //                                     }
    //                                     {selected === "transfer_in" && "Начать Принять перемещение"}
    //                                     {(selected === "return_in" && sendToTrash === false) && "Начать Принять возврат"}
    //                                     {(selected === "return_in" && sendToTrash === true) && "Начать Утилизация возврата"}
    //                                     {selected === "incoming" && "Приход на склад"}
    //                                 </button>
    //                             </div>
    //                         </div>
    //                     </div>

    //                 ) : (
    //                     ((invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") && (
    //                         <div className="h-[65px] bg-white rounded-lg flex items-center gap-3 px-3 shadow-sm">
    //                             <div className="flex items-center gap-2">
    //                                 <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Mahsulot nomi bilan qidirish..." className="border rounded px-3 py-2 w-[420px]" aria-label="Search products by name" />
    //                                 <button onClick={() => setSearchQuery((s) => s.trim())} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300" aria-label="Search">
    //                                     <SearchIcon size={16} /> Поиск
    //                                 </button>
    //                             </div>

    //                             <div className="ml-auto flex items-center gap-2">
    //                                 <button onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }} className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-green-600 text-white animate-[pulse_1.5s_infinite]" : "bg-gray-200 text-gray-800"}`} aria-pressed={barcodeEnabled} aria-label="Toggle barcode input">
    //                                     <BarcodeIcon size={16} /> Штрихкод
    //                                 </button>
    //                                 {barcodeEnabled && (
    //                                     <div className="flex items-center gap-2">
    //                                         <input
    //                                             ref={barcodeRef}
    //                                             value={barcodeInput}
    //                                             onChange={(e) => setBarcodeInput(e.target.value)}
    //                                             placeholder="13 ta raqamni kiriting..."
    //                                             className="border rounded px-3 py-2 w-[200px]"
    //                                             inputMode="numeric"
    //                                             aria-label="Barcode input"
    //                                         />
    //                                         {barcodeLoading && <Spinner size="sm" />}
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         </div>)
    //                     )
    //                 )}

    //                 {/* Invoice info & body */}
    //                 {invoiceStarted?.[mode] && (
    //                     <>
    //                         <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-6">
    //                             <div>
    //                                 <div className="text-xs text-gray-500">Отправитель</div>
    //                                 <div className="font-medium">{invoiceMeta?.[mode]?.sender || "—"}</div>
    //                             </div>
    //                             <div>
    //                                 <div className="text-xs text-gray-500">Получатель</div>
    //                                 <div className="font-medium">{invoiceMeta?.[mode]?.receiver}</div>
    //                             </div>
    //                             <div>
    //                                 <div className="text-xs text-gray-500">Время</div>
    //                                 <div className="font-medium">{invoiceMeta?.[mode]?.time}</div>
    //                             </div>
    //                             <div className="ml-auto text-right">
    //                                 <div className="text-xs text-gray-500">Общая стоимость</div>
    //                                 <div className="font-semibold text-lg">{(total || 0).toLocaleString()} сум</div>
    //                             </div>
    //                         </div>


    //                         {(invoiceMeta?.[mode]?.operation_type !== "return_in" && invoiceMeta?.[mode]?.operation_type !== "return_dis") ?
    //                             (
    //                                 <div className="bg-white rounded-lg p-3 shadow-sm">
    //                                     <div className="text-sm font-medium mb-2 flex items-center justify-between">
    //                                         <h4>Результаты поиска</h4>
    //                                         <div className="flex items-center gap-2">
    //                                             <button
    //                                                 onClick={() => setSearchResults([])}
    //                                                 className="p-2 rounded-full border border-gray-600 text-gray-900 hover:text-red-500 hover:border-red-800 transition-all duration-200"
    //                                                 title="Clear results"
    //                                                 aria-label="Clear search results"
    //                                             >
    //                                                 <Eraser size={18} />
    //                                             </button>
    //                                             <div className="text-xs text-gray-500">{searchResults.length} natija</div>
    //                                         </div>
    //                                     </div>
    //                                     {searchLoading ? (
    //                                         <div className="p-4 flex items-center gap-2"><Spinner /> Поиск...</div>
    //                                     ) : searchResults.length === 0 ? (
    //                                         <div className="text-gray-500">Ничего не найдено</div>
    //                                     ) : (
    //                                         <div className="flex gap-3 flex-wrap">
    //                                             {searchResults.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: 'base' })).map((r) => (
    //                                                 <button key={r.id || r.stock_id || generateId()} onClick={() => onSelectSearchResult(r)} className="bg-white border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
    //                                                     <div className="text-sm font-medium">{r.product?.name || r.name}</div>
    //                                                     <div className="flex items-center justify-center gap-3">
    //                                                         <div className="text-xs text-gray-600">Штрих: {r.barcode || ""}</div>
    //                                                         <div className="text-xs text-gray-600">Партия: {r.batch === null ? "Default" : r.batch}</div>
    //                                                     </div>
    //                                                 </button>
    //                                             ))}
    //                                         </div>
    //                                     )}
    //                                 </div>
    //                             ) :
    //                             (<div>
    //                                 {/* "cards invoicess check proccess"
    //                                 {returnInvoices?.map((inv, index) => {
    //                                     return (
    //                                         <div>{index} {inv.invoice_number}</div>
    //                                     )
    //                                 })} */}
    //                                 <ReturnedInvoiceProcessor />
    //                             </div>)
    //                         }
    //                         <div className="bg-white rounded-lg p-3 shadow-sm overflow-auto">
    //                             <table className="min-w-full text-sm">
    //                                 <thead className="text-left text-xs text-gray-500 border-b">
    //                                     <tr>
    //                                         <th className="p-2">#</th>
    //                                         <th>Партия</th>
    //                                         <th className="p-2">Наименование</th>
    //                                         <th className="p-2">Цена</th>
    //                                         <th className="p-2">Количество</th>
    //                                         {(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && (
    //                                             ["Продано", "Цена продажи"].map((th) => <th key={th} className="p-2">{th}</th>)
    //                                         )}
    //                                         <th className="p-2">Ед. изм.</th>
    //                                         <th className="p-2">Итого</th>
    //                                         <th className="p-2">Убрать</th>
    //                                     </tr>
    //                                 </thead>
    //                                 <tbody>
    //                                     {(!mixData || mixData.length === 0) ? (
    //                                         <tr><td colSpan={8} className="p-4 text-center text-gray-400">Mahsulotlar mavjud emas</td></tr>
    //                                     ) : mixData.map((it, idx) => {
    //                                         // compute stock available if provided
    //                                         const stockAvail = Number(it.return_quantity ?? Infinity);
    //                                         const qty = Number(it.quantity ?? 0);
    //                                         const qtyError = (invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && Number.isFinite(stockAvail) && qty > stockAvail;
    //                                         return (
    //                                             <tr key={it.id || idx} className="border-b">
    //                                                 <td className="p-2 align-center">{idx + 1}</td>
    //                                                 <td>
    //                                                     {/* is_new_batch only relevant for incoming */}
    //                                                     {mode === "in" ? (
    //                                                         <input checked={!!it.is_new_batch} onChange={(e) => updateBatchNew(idx, e.target.checked, it.price, it.origin_price)} type="checkbox" name="is_new_batch" />
    //                                                     ) : (
    //                                                         <span className="text-xs text-gray-400">—</span>
    //                                                     )}
    //                                                 </td>
    //                                                 <td className="p-2 align-top">
    //                                                     <div className="font-medium">{it?.name || "—"}</div>
    //                                                     <div className="text-xs text-gray-500">{it.barcode}</div>
    //                                                     <div className="text-xs text-gray-500 flex">Партия:
    //                                                         {mode === "in" ? (
    //                                                             it.is_new_batch ? (<div className="tex-xs text-blue-gray-700 ">Новая партия</div>) : (it.batch === null ? "Default" : it.batch)
    //                                                         ) : (
    //                                                             (it.batch === null ? "Default" : it.batch)
    //                                                         )}
    //                                                     </div>
    //                                                 </td>
    //                                                 <td className="p-2 align-center w-[140px]">
    //                                                     <input type="number" step="any" value={it.price ?? ""} onChange={(e) => handleUpdatePrice(idx, e.target.value, it.origin_price)} className="border rounded px-2 py-1 w-full" aria-label={`Price for ${it.product?.name || idx + 1}`} />
    //                                                 </td>
    //                                                 <td className="p-2 align-center w-[120px] min-w-[120px]">
    //                                                     <input type="number" step="1" min={0} max={(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") ? (Number.isFinite(stockAvail) ? stockAvail : undefined) : Infinity} value={it.quantity === 0 ? "0" : (it.quantity ?? "")} onChange={(e) => handleUpdateQuantity(idx, e.target.value, it.return_quantity)} className={`border rounded px-2 py-1 w-full min-w-[90px] ${qtyError ? "ring-2 ring-red-400" : ""}`} aria-label={`Quantity for ${it.product?.name || idx + 1}`} />
    //                                                 </td>
    //                                                 {(invoiceMeta?.[mode]?.operation_type === "return_in" || invoiceMeta?.[mode]?.operation_type === "return_dis") && (
    //                                                     [{ a: it.return_quantity, b: "rq" }, { a: it.purchase_price, b: it.discount }]?.map((td) => {
    //                                                         return (
    //                                                             <td key={td.b} className="p-2 align-center w-[120px]">
    //                                                                 {td.b === "rq" ? td.a : <div className="text-xs"><span className="block">{td.a}</span> <span className="text-green-700 text-xs">{"(-" + td.b + "%)"}<p className="text-blue-gray-600 inline text-[16px]">{Number(td.a) * (100 - Number(td.b)) / 100}</p></span></div>}
    //                                                             </td>
    //                                                         )
    //                                                     })
    //                                                 )}
    //                                                 <td className="p-2 align-center w-[120px] ">
    //                                                     {it?.unit || "-"}
    //                                                 </td>
    //                                                 <td className="p-2 align-center">
    //                                                     {(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}
    //                                                 </td>
    //                                                 <td className="p-2 align-center">
    //                                                     <div className="flex gap-2 items-center">
    //                                                         <button
    //                                                             onClick={() => handleRemoveItem(idx)}
    //                                                             className="p-2 text-gray-800 hover:text-red-500 active:scale-90 transition-all duration-200"
    //                                                             title="Remove row"
    //                                                             aria-label={`Remove item ${idx + 1}`}
    //                                                         >
    //                                                             <MinusCircle size={22} />
    //                                                         </button>
    //                                                         {qtyError && <div className="text-xs text-red-600">Miqdor ombordagi ({stockAvail}) dan oshdi</div>}
    //                                                     </div>
    //                                                 </td>
    //                                             </tr>
    //                                         );
    //                                     })}
    //                                 </tbody>
    //                             </table>
    //                         </div>
    //                         <div className="flex items-center gap-3">
    //                             <div className="flex items-center gap-2">
    //                                 <button onClick={openModal} className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] text-white text-[16px] rounded hover:opacity-95`}>
    //                                     <CheckSquare size={22} />
    //                                     Завершить
    //                                 </button>
    //                             </div>
    //                         </div>
    //                     </>
    //                 )}
    //             </div>
    //         </div>

    //         {/* ---------- Modal (centered, A4 preview) ---------- */}
    //         {modalOpen && (
    //             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    //                 <div className="bg-white rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6" aria-live="polite">
    //                     <div id="modal_window" ref={modalContentRef}>
    //                         {/* A4 preview content */}
    //                         <div style={{ width: "100%", boxSizing: "border-box" }}>
    //                             <h1 id="modal-title" className="text-center text-lg font-bold">
    //                                 {invoiceMeta?.[mode]?.operation_type === "transfer_in" ?
    //                                     "Документ перемещения на склад" :
    //                                     invoiceMeta?.[mode]?.operation_type === "return_in" ?
    //                                         "Документ приёма возврата" :
    //                                         invoiceMeta?.[mode]?.operation_type === "return_dis" ?
    //                                             "Документ приёма возврата с утилизацией" :
    //                                             "Документ Приход на склад"
    //                                 }
    //                             </h1>
    //                             <div className="meta mb-4">
    //                                 <div><strong>Отправитель:</strong> {invoiceMeta?.[mode]?.sender || "—"}</div>
    //                                 <div><strong>Получатель:</strong> {invoiceMeta?.[mode]?.receiver || "—"}</div>
    //                                 <div><strong>Время:</strong> {invoiceMeta?.[mode]?.time || new Date().toLocaleString()}</div>
    //                                 <div><strong>Общая стоимость:</strong> {(total || 0).toLocaleString()} сум</div>
    //                             </div>

    //                             <div className="overflow-x-auto">
    //                                 <table className="min-w-full" style={{ borderCollapse: "collapse", width: "100%" }}>
    //                                     <thead>
    //                                         <tr>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>#</th>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>Наименование</th>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>Штрихкод</th>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>Цена</th>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>Количество</th>
    //                                             <th style={{ border: "1px solid #333", padding: 6 }}>Итого</th>
    //                                         </tr>
    //                                     </thead>
    //                                     <tbody>
    //                                         {mixData.map((it, idx) => (
    //                                             <tr key={it.id || idx}>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{idx + 1}</td>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{it?.name || "—"}</td>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{it.barcode || ""}</td>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.price || 0).toLocaleString()}</td>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.quantity || 0)} {it.unit || "birlik"}</td>
    //                                                 <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
    //                                             </tr>
    //                                         ))}
    //                                         <tr>
    //                                             <td colSpan={5} style={{ border: "1px solid #333", padding: 6, textAlign: "right", fontWeight: "bold" }}>Jami</td>
    //                                             <td style={{ border: "1px solid #333", padding: 6 }}>{Number(total || 0).toLocaleString()}</td>
    //                                         </tr>
    //                                     </tbody>
    //                                 </table>
    //                             </div>

    //                             <div style={{ marginTop: 20 }}>
    //                                 <div>Подпись отправителя:: ______________________</div>
    //                                 <div style={{ marginTop: 8 }}>Подпись получателя:: ______________________</div>
    //                             </div>
    //                         </div>
    //                     </div>

    //                     {/* Modal actions */}
    //                     <div className="mt-4 flex justify-end gap-2">
    //                         <button onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-100">Отмена</button>
    //                         <button onClick={handleModalSave} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
    //                             {saving ? <Spinner size="sm" /> : "Сохранить"}
    //                         </button>
    //                         <button onClick={handlePrint} disabled={printing} className="px-4 py-2 rounded border hover:bg-gray-100">
    //                             {printing ? <Spinner size="sm" /> : "Печать"}
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         )}
    //         {/*  ---------- Modal (selectBatchModal) ---------- */}
    //         <SelectBatchModal
    //             isOpen={batchModalOpen}
    //             onClose={() => setBatchModalOpen(false)}
    //             products={batchProducts}
    //             addItemToMixData={addItemToMixDataByBatchModal}
    //         />
    //     </section>
    // );
}
