// src/Components/Warehouse/WareHousePages/WareHouseIncome.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import Select from "react-select";

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, VerticalAlign } from "docx";
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
    PlusCircle,
    CheckSquare,
    CheckCircle,
    Truck, Undo2, Trash2
} from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { Spinner } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import FreeData from "../../UI/NoData/FreeData";
import SelectBatchModal from "../WareHouseModals/SelectBatchModal";
import FolderOpenMessage from "../../UI/NoData/FolderOpen";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { InvoiceItems } from "../../../utils/Controllers/invoiceItems";
import { location } from "../../../utils/Controllers/location";

import { useWarehouse } from "../../../context/WarehouseContext";
import { NavLink } from "react-router-dom";
import { Staff } from "../../../utils/Controllers/Staff";
import CancelInvoiceButton from "../WareHouseOutcome/sectionsWhO/CancelInvoiceButton";

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
        resetAll,
        resetMode,
        invoiceStarted, // object { in, out }
        setInvoiceStarted, // fn (mode, value)
        invoiceId, // object { in, out }
        setInvoiceId, // fn (mode, value)
        invoiceMeta, // object { in: {...}, out: {...} }
        setInvoiceMeta, // fn (mode, value)
        isDirty, // object { in, out }
        setIsDirty, // fn (mode, value)
        saveSuccess, // object { in, out }
        setSaveSuccess, // fn (mode, value)
    } = useWarehouse();


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
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [otherLocationName, setOtherLocationName] = useState("");
    const [createInvoiceLoading, setCreateInvoiceLoading] = useState(false);

    const [selected, setSelected] = useState("incoming");
    const [sendToTrash, setSendToTrash] = useState(false);
    const operationLocations = (selected === "incoming" ? locations?.filter((loc) => loc.type === "factory" || loc.type === "default") : selected === "transfer_in" ? locations?.filter((loc) => loc.type === "warehouse" || loc.type === "default") : locations?.filter((loc) => loc.type === "dealer" || loc.type === "client" || loc.type === "default")) || []

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

    // Local UI-only states for modal / saving / printing
    const [modalOpen, setModalOpen] = useState(false);
    const modalContentRef = useRef(null); // for print
    const [printing, setPrinting] = useState(false);
    const [saving, setSaving] = useState(false); // local saving indicator for UI
    const lastFocusedRef = useRef(null);
    const [error, setError] = useState(null);

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
            const res = await location.getAllGroupLocations(userLId);
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
    const fetchStaffs = async () => {
        try {
            setLocationsLoading(true);
            const res = await Staff.StaffGet(userLId);
            if (res?.status === 200 || res?.status === 201) {
                // setStaffs(res.data  || []);
                const formatted = (res.data || []).map((st) => {
                    return (
                        { value: st.id, label: st.full_name }
                    )
                });
                setStaffs(formatted)
            }
            else setStaffs(res?.data || []);
        } catch (err) {
            notify.error("Stafflarni olishda xato: " + (err?.message || err));
        } finally {
            setLocationsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchLocations();
        fetchStaffs();
    }, []);
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
        }
        const operation_type = (selected === "return_in" && sendToTrash === true) ? "return_dis" : (selected === "return_in" && sendToTrash === false) ? "return_in" : (selected === "incoming" && sendToTrash === false) ? "incoming" : "transfer_in"
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
                note: ""
            };
            const res = await InvoicesApi.CreateInvoice(payload);

            // robust id extraction
            const invoice_id = res?.data?.location?.id || res?.data?.id || res?.data?.invoice_id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error("Server invoice id qaytarmadi");
                    throw new Error("Invoice id topilmadi");
                }
                setSidebarMode(1)
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
    }

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
        return () => document.removeEventListener("click", handleClickOutside);
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

    const fetchByBarcode = async (code) => {
        const barcodeMode = localStorage.getItem("barcodeMode");
        try {
            setBarcodeLoading(true);
            let res = await Stock.getByBarcode(code);
            if (res?.status === 200 || res?.status === 201) {
                const data = res.data;
                if (!data || data.length === 0) {
                    notify.error("Barcode bo'yicha mahsulot topilmadi");
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
        }
    };

    // ---------- Normalize & add to mixData (uses context addItem) ----------
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined
        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: is_raw_stock ? false : true,
            name: is_raw_stock ? productObj.name : raw.name || "-",
            price: invoiceMeta?.[mode]?.operation_type === "transfer_in" ? (Number(raw.purchase_price) || 0) : (Number(raw.sale_price) || 0),
            origin_price: invoiceMeta?.[mode]?.operation_type === "transfer_in" ? Number(raw.purchase_price || 0) : Number(raw.sale_price || 0),
            quantity: 1,
            unit: is_raw_stock ? productObj.unit : raw.unit || "-",
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id,
            barcode: raw.barcode || null,
            batch: is_raw_stock ? (raw.batch || "def") : null,
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
    function handleUpdateQuantity(index, value) {
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
                        batch: it.batch
                    }
                    if (it.is_new_batch || it.batch === "def") {
                        delete it.batch
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
        const value_spaces = mixData.filter((item) => item.price === "" || (item.quantity === "" || item.quantity === 0));
        if (value_spaces.length > 0) {
            value_spaces.forEach((err) => {
                notify.warning(err.product?.name + " tovar uchun " + (err.price === "" ? "Narx kiriting" : "Miqdor kiriting"));
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
        resetAll(); 
        setSelectedLocation("");
        setOtherLocationName("");
        setSearchResults([]);
        setSearchQuery("");
        setSidebarMode(0);
    }

    // ---------- UI ----------


    return (
        <section className="relative w-full min-h-screen bg-white overflow-hidden">
            <div className={`fixed transition-all duration-300  text-[rgb(25_118_210)] top-0 right-0 w-full h-[68px] backdrop-blur-[5px] bg-gray-200 shadow flex items-center pr-8  justify-center ${invoiceStarted?.[mode] && "justify-between pl-[190px]"} text-xl font-semibold z-30`}>
                <h2>{!invoiceStarted?.in && "Приём — поступления на склад"}
                    {invoiceStarted?.in && (invoiceMeta?.in?.operation_type === "incoming" ? "Приход" :
                        invoiceMeta?.in?.operation_type === "transfer_in" ? "Перемещение" :
                            invoiceMeta?.in?.operation_type === "return_in" ? "возврат" :
                                invoiceMeta?.in?.operation_type === "return_dis" ? "Утилизация возврата" : "Unkown"
                    )}</h2>
                    {invoiceStarted?.[mode] ? <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} /> : <span></span>} 
                
            </div>

            {/* Sidebar */}
            {invoiceStarted?.in &&
                <div
                    className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)] bg-gray-50 shadow-lg transition-all duration-500 ease-in-out flex flex-col`}
                >
                    <div className="flex items-center justify-between p-2 border-b border-gray-200">
                        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-200 rounded-xl transition" title="O‘lchamni o‘zgartirish" aria-label="Toggle sidebar size">
                            {sidebarMode === 0 ? <ChevronRight size={22} /> : sidebarMode === 1 ? <ChevronsRight size={22} /> : <ChevronLeft size={22} />}
                        </button>

                        {(isMedium || isWide) && (
                            <div className="flex gap-2">
                                <button onClick={() => setViewMode("category")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "category" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-pressed={viewMode === "category"}>
                                    <Tags size={18} />
                                    {isWide && <span className="text-sm">Категория</span>}
                                </button>
                                <button onClick={() => setViewMode("product")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "product" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-pressed={viewMode === "product"}>
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
                                    <div className="text-gray-500 p-3">Hech qanday kategoriya topilmadi.</div>
                                ) : (
                                    categories.map((cat) => (
                                        <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className={`cursor-pointer border rounded-xl shadow-sm hover:shadow-md p-3 text-left ${selectedCategory === cat.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}>
                                            <div className="text-sm font-medium">{cat.name}</div>
                                        </button>
                                    ))
                                )
                            ) : productLoading ? (
                                <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                                    <Spinner /> Yuklanmoqda...
                                </p>
                            ) : products.length === 0 ? selectedCategory ? (
                                <FreeData text={"Tanlangan kategoriyada mahsulot topilmadi"} icon={<PackageSearch className="w-10 h-10 mb-3 text-gray-400" />} />
                            ) : (
                                <FolderOpenMessage text={"Iltimos, mahsulotlarni ko‘rish uchun kategoriya tanlang."} icon={<FolderOpen className="w-10 h-10 mb-3 text-gray-400" />} />
                            ) : (
                                products.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: 'base' })).map((prod, index) => (
                                    <button key={index} onClick={() => onSidebarProductClick(prod)} className="active:scale-[0.99]">
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition">
                                            <div className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="text-gray-900 font-medium whitespace-nowrap">{prod.product?.name || prod.name || "No name"}</span>
                                                <div className="flex items-center justify-center gap-2 text-gray-800 font-medium whitespace-nowrap">
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
            }

            {/* Main content */}
            <div className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0 ? "ml-[70px]" : sidebarMode === 1 ? "ml-[25%]" : "ml-[33.3%]"} p-6`}>
                <div className="bg-gray-100 rounded-2xl min-h-[calc(100vh-68px)] p-4 flex flex-col gap-4">
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
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${selected === "incoming"
                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
                                        : "border-gray-300 hover:border-blue-300 text-gray-700"
                                        }`}
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
                                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${selected === "transfer_in"
                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow"
                                        : "border-gray-300 hover:border-blue-300 text-gray-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={22} />
                                        <span className="text-lg font-medium">Перемещение на склад</span>
                                    </div>

                                </button>

                                {/* Return_in */}
                                <div
                                    className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 ${selected === "return_in"
                                        ? "bg-green-50 border-green-500 text-green-700 shadow"
                                        : "border-gray-300 hover:border-green-300 text-gray-700"
                                        }`}
                                >
                                    <div
                                        onClick={() => setSelected("return_in")}
                                        className="flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Undo2 size={22} />
                                            <span className="text-lg font-medium">Принять возврат</span>
                                        </div>
                                    </div>

                                    {/* Checkbox for return_dis */}
                                    {selected === "return_in" && (
                                        <label className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-2 text-gray-700">
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
                            <div className="h-[65px] bg-white rounded-lg flex items-center gap-4 px-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    {locationsLoading ? (
                                        <div className="flex items-center gap-2"><Spinner /> Loading...</div>
                                    ) : (
                                        // <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border rounded px-3 py-2 bg-white" aria-label="Sender location">
                                        //     <option value="">Укажите отправителя</option>
                                        //     {operationLocations.filter((item) => String(item.id) !== String(userLId) && item.type !== "other" && item.type !== "disposal").map((loc) => <option key={loc.id} value={loc.id}>{loc.name || loc.address || loc.type}</option>)}
                                        // </select>
                                        <Select
                                            isClearable
                                            isSearchable
                                            options={operationLocations.filter((item) => String(item.value) !== String(userLId) && String(item.type) !== "other" && String(item.type) !== "disposal")}
                                            placeholder="Укажите отправителя"
                                            value={selectedLocation}
                                            onChange={(loc) => setSelectedLocation(loc)}
                                        />
                                    )
                                    }

                                    {selectedLocation === "other" && (
                                        <input value={otherLocationName} onChange={(e) => setOtherLocationName(e.target.value)} placeholder="Tashqi location nomi" className="border rounded px-3 py-2" aria-label="Other location name" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {locationsLoading ? (
                                        <div className="flex items-center gap-2"><Spinner /> Loading...</div>
                                    ) : (
                                        // <select value={selectedLocation} onChange={(e) => setSelectedStaff(e.target.value)} className="border rounded px-3 py-2 bg-white" aria-label="Sender location">
                                        //     <option value="">Выберите поставшика</option>
                                        //     {staffs?.map((loc) => <option key={loc.id} value={loc.id}>{loc.full_name || 'Noname'}</option>)}
                                        // </select>
                                        <Select
                                            placeholder="Выберите поставшика"
                                            options={staffs}
                                            value={selectedStaff}
                                            onChange={(st) => setSelectedStaff(st)}
                                            isClearable
                                            isSearchable
                                            isOptionDisabled={staffs.find((it) => it.id === 0)}
                                        />
                                    )
                                    }

                                    {/* {selectedStaff === "other" && (
                                        <input value={otherLocationName} onChange={(e) => setOtherLocationName(e.target.value)} placeholder="Tashqi location nomi" className="border rounded px-3 py-2" aria-label="Other location name" />
                                    )} */}
                                </div>

                                <div className="ml-auto">
                                    <button disabled={createInvoiceLoading} onClick={startInvoice} className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] text-white rounded hover:opacity-95`} aria-label="Start invoice">
                                        {
                                            !createInvoiceLoading ?
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg> :
                                                <Spinner />
                                        }
                                        {selected === "transfer_in" && "Начать Принять перемещение"}
                                        {(selected === "return_in" && sendToTrash === false) && "Начать Принять возврат"}
                                        {(selected === "return_in" && sendToTrash === true) && "Начать Утилизация возврата"}
                                        {selected === "incoming" && "Приход на склад"}
                                    </button>
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div className="h-[65px] bg-white rounded-lg flex items-center gap-3 px-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Mahsulot nomi bilan qidirish..." className="border rounded px-3 py-2 w-[420px]" aria-label="Search products by name" />
                                <button onClick={() => setSearchQuery((s) => s.trim())} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300" aria-label="Search">
                                    <SearchIcon size={16} /> Поиск
                                </button>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <button onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }} className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-green-600 text-white animate-[pulse_1.5s_infinite]" : "bg-gray-200 text-gray-800"}`} aria-pressed={barcodeEnabled} aria-label="Toggle barcode input">
                                    <BarcodeIcon size={16} /> Штрихкод
                                </button>
                                {barcodeEnabled && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={barcodeRef}
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            placeholder="13 ta raqamni kiriting..."
                                            className="border rounded px-3 py-2 w-[200px]"
                                            inputMode="numeric"
                                            aria-label="Barcode input"
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
                            <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-6">
                                <div>
                                    <div className="text-xs text-gray-500">Отправитель</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.sender || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Получатель</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.receiver}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Время</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.time}</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xs text-gray-500">Общая стоимость</div>
                                    <div className="font-semibold text-lg">{(total || 0).toLocaleString()} сум</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                    <h4>Результаты поиска</h4>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSearchResults([])}
                                            className="p-2 rounded-full border border-gray-600 text-gray-900 hover:text-red-500 hover:border-red-800 transition-all duration-200"
                                            title="Clear results"
                                            aria-label="Clear search results"
                                        >
                                            <Eraser size={18} />
                                        </button>
                                        <div className="text-xs text-gray-500">{searchResults.length} natija</div>
                                    </div>
                                </div>
                                {searchLoading ? (
                                    <div className="p-4 flex items-center gap-2"><Spinner /> Поиск...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-gray-500">Ничего не найдено</div>
                                ) : (
                                    <div className="flex gap-3 flex-wrap">
                                        {searchResults.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: 'base' })).map((r) => (
                                            <button key={r.id || r.stock_id || generateId()} onClick={() => onSelectSearchResult(r)} className="bg-white border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
                                                <div className="text-sm font-medium">{r.product?.name || r.name}</div>
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="text-xs text-gray-600">Штрих: {r.barcode || ""}</div>
                                                    <div className="text-xs text-gray-600">Партия: {r.batch === null ? "Default" : r.batch}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 border-b">
                                        <tr>
                                            <th className="p-2">#</th>
                                            <th>Партия</th>
                                            <th className="p-2">Наименование</th>
                                            <th className="p-2">Цена</th>
                                            <th className="p-2">Количество</th>
                                            <th className="p-2">Ед. изм.</th>
                                            <th className="p-2">Итого</th>
                                            <th className="p-2">Убрать</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!mixData || mixData.length === 0) ? (
                                            <tr><td colSpan={8} className="p-4 text-center text-gray-400">Mahsulotlar mavjud emas</td></tr>
                                        ) : mixData.map((it, idx) => {
                                            // compute stock available if provided
                                            const stockAvail = Number(it.stock_quantity ?? it.stock?.quantity ?? Infinity);
                                            const qty = Number(it.quantity ?? 0);
                                            const qtyError = (mode === "out") && Number.isFinite(stockAvail) && qty > stockAvail;
                                            return (
                                                <tr key={it.id || idx} className="border-b">
                                                    <td className="p-2 align-center">{idx + 1}</td>
                                                    <td>
                                                        {/* is_new_batch only relevant for incoming */}
                                                        {mode === "in" ? (
                                                            <input checked={!!it.is_new_batch} onChange={(e) => updateBatchNew(idx, e.target.checked, it.price, it.origin_price)} type="checkbox" name="is_new_batch" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2 align-top">
                                                        <div className="font-medium">{it?.name || "—"}</div>
                                                        <div className="text-xs text-gray-500">{it.barcode}</div>
                                                        <div className="text-xs text-gray-500 flex">Партия:
                                                            {mode === "in" ? (
                                                                it.is_new_batch ? (<div className="tex-xs text-blue-gray-700 ">Новая партия</div>) : (it.batch === null ? "Default" : it.batch)
                                                            ) : (
                                                                (it.batch === null ? "Default" : it.batch)
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-2 align-center w-[140px]">
                                                        <input type="number" step="any" value={it.price ?? ""} onChange={(e) => handleUpdatePrice(idx, e.target.value, it.origin_price)} className="border rounded px-2 py-1 w-full" aria-label={`Price for ${it.product?.name || idx + 1}`} />
                                                    </td>
                                                    <td className="p-2 align-center w-[120px]">
                                                        <input type="number" step="1" min={0} max={mode === "out" ? (Number.isFinite(stockAvail) ? stockAvail : undefined) : undefined} value={it.quantity === 0 ? "0" : (it.quantity ?? "")} onChange={(e) => handleUpdateQuantity(idx, e.target.value)} className={`border rounded px-2 py-1 w-full ${qtyError ? "ring-2 ring-red-400" : ""}`} aria-label={`Quantity for ${it.product?.name || idx + 1}`} />
                                                    </td>
                                                    <td className="p-2 align-center w-[120px] ">
                                                        {it?.unit || "-"}
                                                    </td>
                                                    <td className="p-2 align-center">
                                                        {(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}
                                                    </td>
                                                    <td className="p-2 align-center">
                                                        <div className="flex gap-2 items-center">
                                                            <button
                                                                onClick={() => handleRemoveItem(idx)}
                                                                className="p-2 text-gray-800 hover:text-red-500 active:scale-90 transition-all duration-200"
                                                                title="Remove row"
                                                                aria-label={`Remove item ${idx + 1}`}
                                                            >
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
                                    <button onClick={openModal} className={`${touchBtn} flex items-center gap-2 bg-[rgb(25_118_210)] text-white text-[16px] rounded hover:opacity-95`}>
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
                    <div className="bg-white rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6" aria-live="polite">
                        <div id="modal_window" ref={modalContentRef}>
                            {/* A4 preview content */}
                            <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <h1 id="modal-title" className="text-center text-lg font-bold">
                                    {invoiceMeta?.[mode]?.operation_type === "transfer_in" ?
                                        "Документ перемещения на склад" :
                                        invoiceMeta?.[mode]?.operation_type === "return_in" ?
                                            "Документ приёма возврата" :
                                            "Документ приёма возврата с утилизацией"
                                    }
                                </h1>
                                <div className="meta">
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
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.quantity || 0)}</td>
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
                            <button onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-100">Отмена</button>
                            <button onClick={handleModalSave} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
                                {saving ? <Spinner size="sm" /> : "Сохранить"}
                            </button>
                            <button onClick={handlePrint} disabled={printing} className="px-4 py-2 rounded border hover:bg-gray-100">
                                {printing ? <Spinner size="sm" /> : "Печать"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/*  ---------- Modal (selectBatchModal) ---------- */}
            <SelectBatchModal
                isOpen={batchModalOpen}
                onClose={() => setBatchModalOpen(false)}
                products={batchProducts}
                addItemToMixData={addItemToMixDataByBatchModal}
            />
        </section>
    );
}
