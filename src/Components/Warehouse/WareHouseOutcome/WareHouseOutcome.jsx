// src/Components/Warehouse/WareHousePages/WareHouseOutcome.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
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
    InfinityIcon
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

import { useWarehouse } from "../../../context/WarehouseContext";
import OutgoingPanel from "./sectionsWhO/OutgoingPanel";
import { Staff } from "../../../utils/Controllers/Staff";
import CancelInvoiceButton from "./sectionsWhO/CancelInvoiceButton";

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

export default function WareHouseOutcome() {
    // user / location
    const userLId = Cookies.get("ul_nesw");
    const createdBy = Cookies.get("us_nesw");

    // context (per-mode)
    const {
        mode, // should be "out" from WarehouseLayout
        mixData,
        addItem,
        updateQty,
        updatePrice,
        updateDiscount,
        removeItem,
        resetAll,
        resetMode,
        invoiceStarted,
        setInvoiceStarted,
        invoiceId,
        setInvoiceId,
        invoiceMeta,
        setInvoiceMeta,
        isDirty,
        setIsDirty,
        saveSuccess,
        setSaveSuccess,
    } = useWarehouse();

    // local UI
    const [sidebarMode, setSidebarMode] = useState(0);
    const [viewMode, setViewMode] = useState("category");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [productLoading, setProductLoading] = useState(false);
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
            notify.info("Kategoriyalar panelini ochish uchun Chiqimni boshlang");
            return;
        }
        setSidebarMode((p) => (p + 1) % 3);
    };
    const isWide = sidebarMode === 2;
    const isMedium = sidebarMode === 1;

    const [locations, setLocations] = useState([{ id: 0, name: "Loading" }]);
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

    const fetchLocations = async () => {
        try {
            setLocationsLoading(true);
            const res = await location.getAllGroupLocations(userLId);
            if (res?.status === 200 || res?.status === 201) setLocations(res.data || []);
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
            if (res?.status === 200 || res?.status === 201) setStaffs(res.data || []);
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

    // update invoiceMeta receiver for outgoing: receiver is selectedLocation, sender is current location
    useEffect(() => {
        const senderName = getLocationNameById(userLId) || "Me";
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
            notify.error("Stocklarni olishda xato: " + (err?.message || err));
        } finally {
            setProductLoading(false);
        }
    };

    // start outgoing invoice
    const startInvoice = async () => {
        // for outgoing: user selects receiver (where items go)
        if (!selectedLocation) {
            notify.warning("Iltimos, qabul qiluvchini tanlang");
            return;
        } else if (!selectedStaff) {
            notify.warning("Iltimos, driverni tanlang")
            return;
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
            const res = await InvoicesApi.CreateInvoice(payload);
            const invoice_id = res?.data?.location?.id || res?.data?.id || res?.data?.invoice_id;

            if (res?.status === 200 || res?.status === 201) {
                if (!invoice_id) {
                    notify.error("Server invoice id qaytarmadi");
                    throw new Error("Invoice id topilmadi");
                }
                setSidebarMode(1);
                setInvoiceId(mode, invoice_id);
                setInvoiceStarted(mode, true);
                setInvoiceMeta(mode, { ...invoiceMeta?.[mode], sender: getLocationNameById(userLId), receiver: selectedLocation !== "other" ? getLocationNameById(selectedLocation) : (otherLocationName || "Other"), operation_type: operationType, status });
                setIsDirty(mode, true);
                notify.success("Chiqim boshlandi");
            } else {
                throw new Error("Invoice yaratishda xato");
            }
        } catch (err) {
            notify.error("Chiqimni boshlashda xato: " + (err?.message || err));
        } finally {
            setCreateInvoiceLoading(false);
        }
    };

    function getLocationNameById(id) {
        if (!id) return "";
        if (id === "other") return otherLocationName || "Other";
        const f = locations.find((l) => String(l.id) === String(id));
        return f ? f.name || f.address || "Location" : "";
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
                notify.error("Qidiruv xatosi: " + (err?.message || err));
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
                    } else {
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

    // normalize (ensure stock_quantity available for outgoing)
    function normalizeIncomingItem(raw) {
        const productObj = raw.product || undefined;
        const is_raw_stock = productObj !== undefined;
        const fixed_qty = raw?.fixed_quantity
        return {
            is_raw_stock: productObj === undefined ? true : false,
            is_new_batch: false,
            name: is_raw_stock ? productObj.name : raw.name || "-",
            price: (invoiceMeta?.[mode]?.operation_type === "transfer_out" || invoiceMeta?.[mode]?.operation_type === "disposal") ? (Number(raw.purchase_price) || 0) : (Number(raw.sale_price) || 0),
            origin_price: invoiceMeta?.[mode]?.operation_type === "transfer_out" ? Number(raw.purchase_price || 0) : Number(raw.sale_price || 0),
            quantity: 1,
            stock_quantity: invoiceMeta?.[mode]?.operation_type === "disposal" ? raw?.quantity : raw?.draft_quantity,
            unit: is_raw_stock ? productObj.unit : raw.unit || "-",
            product_id: is_raw_stock ? (raw.product_id || productObj.id) : raw.id,
            barcode: raw.barcode || null,
            batch: raw.batch ?? null,
            fixed_quantity: raw.fixed_quantity,
            discount: 0,
        };
    }

    function addItemToMixData(raw) {
        const item = normalizeIncomingItem(raw);
        const res = addItem(item);
        if (res && res.ok === false) notify.error(res.message || "Item qo'shilmadi");
    };

    /// // ---------- recalcTotal ----------
    const total = useMemo(() => {
        const safeNum = (v) =>
            v === "" || v == null || isNaN(Number(v)) ? 0 : Number(v);
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
    // function handleUpdatePrice(index, value) {
    //     if (value === "" || Number(value) >= 0) {
    //         updatePrice(index, value);
    //         // outgoing: do NOT create new batch on price change
    //     }
    //     console.log("ok");

    // }
    const handleDiscountChange = (index, value) => {
        const num = Math.min(20, Math.max(0, Number(value))); // min:0, max:20\
        value = num
        updateDiscount(index, value);
    };

    const handleApplyAll = (currentValue) => {
        mixData?.map((prd, ix) => {
            return updateDiscount(ix, currentValue)
        })
    };
    function handleRemoveItem(index) {
        removeItem(index);
    }

    // save items
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

        const invalid = mixData.some((it) => Number(it.quantity) <= 0);
        if (invalid) {
            notify.error("Barcha mahsulotlar uchun miqdor 0 dan katta bo‘lishi kerak");
            return false;
        }

        try {
            setSaving(true);
            const payload = {
                list: mixData.map((it) => ({
                    invoice_id: currentInvoiceId,
                    product_id: it.product_id || null,
                    quantity: Number(it.quantity || 0),
                    price: Number(it.price || 0),
                    barcode: it.barcode || "",
                    is_new_batch: false,
                    batch: it.batch || null,
                    discount: it.discount || 0,
                })),
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

    // modal actions (time update only when invoice started)
    useEffect(() => {
        if (!invoiceStarted?.[mode]) return;
        const t = setInterval(() => {
            setInvoiceMeta(mode, { ...invoiceMeta?.[mode], time: new Date().toLocaleString() });
        }, 1000);
        return () => clearInterval(t);
    }, [invoiceStarted?.[mode]]); // eslint-disable-line

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && modalOpen) closeModal();
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
                @media print { body { -webkit-print-color-adjust: exact; } }
              </style>
            `;
            printWindow.document.open();
            printWindow.document.write(`<html><head><title>CHIQQIM HUJJATI</title>${style}</head><body>${content}</body></html>`);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                setPrinting(false);
            };
            setTimeout(() => { try { printWindow.focus(); printWindow.print(); } catch (e) { } setPrinting(false); }, 1500);
        } catch (err) {
            notify.error("Print xatosi: " + (err?.message || err));
            setPrinting(false);
        }
    };

    const touchBtn = "min-h-[44px] px-4 py-3";

    function resetAllBaseForNewInvoice() {
        resetAll();
        setSelectedLocation("");
        setOtherLocationName("");
        setSearchResults([]);
        setSearchQuery("");
        setSidebarMode(0);
        setSelectedCategory(null);
        setViewMode("category");
    }

    return (
        <section className="relative w-full min-h-screen bg-white overflow-hidden">
            <div className={`fixed transition-all duration-300  text-[rgb(25_118_210)] top-0 right-0 w-full h-[68px] backdrop-blur-[5px] bg-gray-200 shadow flex items-center pr-8  justify-center ${invoiceStarted?.[mode] && "justify-between pl-[190px]"} text-xl font-semibold z-30`}>
                <h2>{!invoiceStarted?.out && "Tovarni ombordan chiqarish"}
                    {invoiceStarted?.out && (invoiceMeta?.out?.operation_type === "outgoing" ? "Sotuv" :
                        invoiceMeta?.out?.operation_type === "transfer_out" ? "Ombordan ko'chirish" :
                            invoiceMeta?.out?.operation_type === "return_out" ? "Ombordan vozvrat" :
                                invoiceMeta?.out?.operation_type === "disposal" ? "Утилизация" : "Unkown"
                    )}</h2>
                {invoiceStarted?.[mode] ? <CancelInvoiceButton resetAll={resetAllBaseForNewInvoice} /> : <span></span>}

            </div>

            {/* Sidebar */}
            {invoiceStarted?.out &&
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
                                    {isWide && <span className="text-sm">Category</span>}
                                </button>
                                <button onClick={() => setViewMode("product")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "product" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} aria-pressed={viewMode === "product"}>
                                    <Package size={18} />
                                    {isWide && <span className="text-sm">Product</span>}
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
                        <OutgoingPanel
                            receiverLocations={locationsLoading ? [{ id: 0, name: "loading..." }] : locations?.filter((item) => item.id !== userLId)}
                            selectedReceiver={selectedLocation}
                            selectReceiver={setSelectedLocation}
                            isLoading={createInvoiceLoading}
                            selectOprType={setOperationType}
                            selectStatus={setOperationStatus}
                            startOperation={startInvoice}
                            staffs={locationsLoading ? [{ id: 0, full_name: "loading..." }] : staffs}
                            selectedStaff={selectedStaff}
                            selectStaff={setSelectedStaff}
                        // staffs={}
                        />
                    ) : (
                        <div className="h-[65px] bg-white rounded-lg flex items-center gap-3 px-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Mahsulot nomi bilan qidirish..." className="border rounded px-3 py-2 w-[420px]" aria-label="Search products by name" />
                                <button onClick={() => setSearchQuery((s) => s.trim())} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300" aria-label="Search">
                                    <SearchIcon size={16} /> Qidirish
                                </button>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <button onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }} className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-green-600 text-white animate-[pulse_1.5s_infinite]" : "bg-gray-200 text-gray-800"}`} aria-pressed={barcodeEnabled} aria-label="Toggle barcode input">
                                    <BarcodeIcon size={16} /> Barcode
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
                                    <div className="text-xs text-gray-500">Jo'natuvchi</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.sender || getLocationNameById(userLId)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Qabul qiluvchi</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.receiver}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Vaqt</div>
                                    <div className="font-medium">{invoiceMeta?.[mode]?.time}</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xs text-gray-500">Umumiy qiymat</div>
                                    <div className="font-semibold text-lg">{Number(total || 0).toLocaleString()} сум</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xs text-gray-500">Umumiy chegirma qiymati</div>
                                    <div className="font-semibold text-lg">{(Number(total || 0) - Number(disTotal || 0)).toLocaleString()} сум</div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-xs text-gray-500">Umumiy qiymat chegirma bilan</div>
                                    <div className="font-semibold text-lg">{Number(disTotal || 0).toLocaleString()} сум</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-sm font-medium mb-2 flex items-center justify-between">
                                    <h4>Qidiruv natijalari</h4>
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
                                    <div className="p-4 flex items-center gap-2"><Spinner /> Qidirilmoqda...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-gray-500">Natija topilmadi</div>
                                ) : (
                                    <div className="flex gap-3 flex-wrap">
                                        {searchResults.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || "", undefined, { numeric: true, sensitivity: 'base' })).map((r) => (
                                            <button key={r.id || r.stock_id || generateId()} onClick={() => onSelectSearchResult(r)} className="bg-white border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
                                                <div className="text-sm font-medium">{r.product?.name || r.name}</div>
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="text-xs text-gray-600">Shtrix: {r.barcode || ""}</div>
                                                    <div className="text-xs text-gray-600">Partiya: {r.batch === null ? "Default" : r.batch}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg p-3 shadow-sm overflow-auto max-w-[100%] overflow-x-scroll">
                                <table className="min-w-full text-sm">
                                    <thead className="text-left text-xs text-gray-500 border-b">
                                        <tr>
                                            <th className="p-2">#</th>
                                            <th>Partiya</th>
                                            <th className="p-2">Nomi</th>
                                            <th className="p-2">Narx</th>
                                            <th className="p-2">Miqdor</th>
                                            <th className="p-2">Omborda</th>
                                            <th className="p-2">Birlik</th>
                                            {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                <th className="p-2">Chegirma(%)</th>}
                                            <th className="p-2">Jami</th>
                                            {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                <th className="p-2">Jami(chegirma)</th>}
                                            <th className="p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!mixData || mixData.length === 0) ? (
                                            <tr><td colSpan={8} className="p-4 text-center text-gray-400">Mahsulotlar mavjud emas</td></tr>
                                        ) : mixData.map((it, idx) => {
                                            const stockAvail = Number(it.stock_quantity ?? Infinity);
                                            const qty = Number(it.quantity ?? 0);
                                            const qtyError = Number.isFinite(stockAvail) && qty > stockAvail;
                                            return (
                                                <tr key={idx} className="border-b">
                                                    <td className="p-2 align-center">{idx + 1}</td>
                                                    <td className="p-2 align-center">
                                                        {/* no is_new_batch UI for outgoing */}
                                                        <div className="text-[14px] text-gray-700">{it.batch ?? "Default"}</div>
                                                    </td>
                                                    <td className="p-2 align-center min-w-[300px]">
                                                        <div className="font-medium">{it.name || "—"}</div>
                                                        <div className="text-xs text-gray-500">{it.barcode}</div>
                                                    </td>
                                                    <td className="p-2 align-center w-[140px]">
                                                        {it.origin_price}
                                                        {/* <input type="number" step="any" value={it.price ?? ""} onChange={(e) => handleUpdatePrice(idx, e.target.value)} className="border rounded px-2 py-1 w-full" aria-label={`Price for ${it?.name || idx + 1}`} /> */}
                                                    </td>
                                                    <td className="p-2 align-center w-[120px]">
                                                        <input type="number" step="any" value={it.quantity} onChange={(e) => handleUpdateQuantity(idx, e.target.value)} className={`border rounded px-2 py-1 w-full ${qtyError ? "ring-2 ring-red-400" : ""}`} aria-label={`Quantity for ${it.product?.name || idx + 1}`} />
                                                    </td>
                                                    <td className="p-2 aligin-center text-green-900">
                                                        {Number.isFinite(stockAvail) && <div className="flex align-center">
                                                            <span>{stockAvail}</span>
                                                            {!it.fixed_qty &&
                                                                <span className="ml-1 flex items-center text-blue-500 text-xs">
                                                                    {
                                                                        " (+"}
                                                                    <InfinityIcon size={18} className="mr-1" />
                                                                    {")"
                                                                    }
                                                                </span>
                                                            }
                                                        </div>}
                                                    </td>
                                                    <td className="p-2 align-center w-[120px]">{it?.unit || "-"}</td>
                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                        <td className="p-2 relative">
                                                            <input
                                                                type="number"
                                                                value={it.discount}
                                                                min={0}
                                                                max={20}
                                                                onFocus={() => {
                                                                    if(mixData?.length > 1) {                                                                        
                                                                    setShowApplyAll(true);
                                                                    setFocusedInput(idx);}
                                                                }}
                                                                onBlur={() => {
                                                                    // biroz kechikish tugmani bosganda yo‘qolmasin
                                                                    setTimeout(() => setShowApplyAll(false), 200);
                                                                }}
                                                                onChange={(e) => handleDiscountChange(idx, e.target.value)}
                                                                className="w-16 px-2 py-1  border rounded outline-blue-500"
                                                            />

                                                            {/* Apply All button faqat shu input fokusta bo‘lsa ko‘rinadi */}
                                                            {showApplyAll && focusedInput === idx && (
                                                                <button
                                                                    onMouseDown={() => handleApplyAll(it.discount)}
                                                                    className="absolute right-[-140px] top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded shadow transition-all"
                                                                >
                                                                    Barchasiga qo‘llash
                                                                </button>
                                                            )}
                                                        </td>}
                                                    {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                        <td className="p-2 align-center">{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>}
                                                    <td className="p-2 align-center">{(Number(it.price || 0) * Number(it.quantity || 0) * Number(100 - +it.discount) / 100).toLocaleString()}</td>
                                                    <td className="p-2 align-center">
                                                        <div className="flex gap-2 items-center">
                                                            <button onClick={() => handleRemoveItem(idx)} className="p-2 text-gray-800 hover:text-red-500 active:scale-90 transition-all duration-200" title="Remove row" aria-label={`Remove item ${idx + 1}`}>
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
                                        Yakunlash
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
                    <div className="bg-white rounded shadow-lg w-[210mm] max-w-full max-h-[95vh] overflow-auto p-6" aria-live="polite">
                        <div id="modal_window" ref={modalContentRef}>
                            <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <h1 id="modal-title" className="text-center text-lg font-bold">CHIQQIM HUJJATI</h1>
                                <div className="meta">
                                    <div><strong>Jo'natuvchi:</strong> {invoiceMeta?.[mode]?.sender || getLocationNameById(userLId)}</div>
                                    <div><strong>Qabul qiluvchi:</strong> {invoiceMeta?.[mode]?.receiver || "—"}</div>
                                    <div><strong>Vaqt:</strong> {invoiceMeta?.[mode]?.time || new Date().toLocaleString()}</div>
                                    <div><strong>Jami:</strong> {Number(total || 0).toLocaleString()} сум</div>
                                    <div><strong>Umumiy chegirma qiymati:</strong> {(Number(total || 0) - Number(disTotal || 0)).toLocaleString()} сум</div>
                                    <div><strong>Chegirma bilan jami:</strong> {Number(disTotal || 0).toLocaleString()} сум</div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full" style={{ borderCollapse: "collapse", width: "100%" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>#</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Nomi</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Barcode</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Narx</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Miqdor</th>
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Birlik</th>
                                                {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                    <th style={{ border: "1px solid #333", padding: 6 }}>Chegirma(%)</th>}
                                                <th style={{ border: "1px solid #333", padding: 6 }}>Jami</th>
                                                {(invoiceMeta?.[mode]?.operation_type !== "disposal" && invoiceMeta?.[mode]?.operation_type !== "transfer_out") &&
                                                    <th style={{ border: "1px solid #333", padding: 6 }}>Jami(chegirma)</th>}
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
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{String(it.unit || "birlik")}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{Number(it.discount || 0)}</td>
                                                    <td style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                                                    <td className="p-2 align-center" style={{ border: "1px solid #333", padding: 6 }}>{(Number(it.price || 0) * Number(it.quantity || 0) * Number(100 - +it.discount) / 100).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={7} style={{ border: "1px solid #333", padding: 6, textAlign: "right", fontWeight: "bold" }}>Jami</td>
                                                <td style={{ border: "1px solid #333", padding: 6 }}>{Number(total || 0).toLocaleString()}</td>
                                                <td style={{ border: "1px solid #333", padding: 6 }}>{Number(disTotal || 0).toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div>Jo'natuvchi imzo: ______________________</div>
                                    <div style={{ marginTop: 8 }}>Qabul qiluvchi imzo: ______________________</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={closeModal} className="px-4 py-2 rounded border hover:bg-gray-100">Cancel</button>
                            <button onClick={handleModalSave} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
                                {saving ? <Spinner size="sm" /> : "Save"}
                            </button>
                            <button onClick={handlePrint} disabled={printing} className="px-4 py-2 rounded border hover:bg-gray-100">
                                {printing ? <Spinner size="sm" /> : "Print"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <SelectBatchModal
                isOpen={batchModalOpen}
                onClose={() => setBatchModalOpen(false)}
                products={batchProducts}
                addItemToMixData={addItemToMixDataByBatchModal}
            />
        </section>
    );
}
