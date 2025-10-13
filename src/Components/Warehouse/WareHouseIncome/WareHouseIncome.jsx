// WareHouseIncome.jsx
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, VerticalAlign, BorderStyle } from "docx";
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
  Save,
  Search as SearchIcon,
  Barcode as BarcodeIcon,
  Eraser,
  MinusCircle,
  PlusCircle
} from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { Spinner } from "@material-tailwind/react";
import { Stock } from "../../../utils/Controllers/Stock";
import FreeData from "../../UI/NoData/FreeData";
import FolderOpenMessage from "../../UI/NoData/FolderOpen";
// import { create } from "@mui/material/styles/createTransitions";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import { InvoiceItems } from "../../../utils/Controllers/invoiceItems";
import { location } from "../../../utils/Controllers/location";

export default function WareHouseIncome() {
  const userLId = Cookies.get("ul_nesw");
  // Sidebar state (sizning original)
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
  const toggleSidebar = () => setSidebarMode((p) => (p + 1) % 3);
  const isWide = sidebarMode === 2;
  const isMedium = sidebarMode === 1;

  // Main content states
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [otherLocationName, setOtherLocationName] = useState("");
  const [invoiceStarted, setInvoiceStarted] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);
  // invoice meta
  const [invoiceMeta, setInvoiceMeta] = useState({
    sender: null,
    receiver: locations.find((item) => item.id === userLId)?.name || "Me",
    time: new Date().toLocaleString(),
    total: 0,
  });

  // search & barcode
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [barcodeEnabled, setBarcodeEnabled] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const barcodeTimer = useRef(null);

  // mixData — unified invoice items
  const [mixData, setMixData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ---------- Fetch categories (existing) ----------
  const fetchCategories = async () => {
    try {
      setGroupLoading(true);
      const LocationId = Cookies.get("usd_nesw");
      const res = await ProductApi.GetMiniCategoryById(LocationId); // <-- siz bergan funksiya
      if (res?.status === 200) setCategories(res.data || []);
      else setCategories(res?.data || []);
    } catch (err) {
      notify.error("Categoriyalarni olishda xato: " + (err?.message || err));
    } finally {
      setGroupLoading(false);
    }
  };

  // ---------- Fetch locations (sender list) ----------
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

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  // ---------- Sidebar: get products by category ----------
  const handleCategoryClick = async (catId) => {
    setSelectedCategory(catId);
    setViewMode("product");
    try {
      setProductLoading(true);
      const res = await Stock.getLocationStocksByChildId(userLId, catId); // <-- siz bergan funksiya
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
    if (!selectedLocation) {
      notify.error("Iltimos, jo'natuvchini tanlang");
      return;
    }
    try {
      const payload = {
        type: "incoming",
        sender_id: selectedLocation === "other" ? null : selectedLocation,
        receiver_id: userLId,
        created_by: Cookies.get("us_nesw"),
        status: "approved",
      };
      const res = await InvoicesApi.CreateInvoice(payload);
      console.log(res);

      if (res?.status === 200 || res?.status === 201) {
        const invoice_id = res.data?.location?.id;
        setInvoiceId(invoice_id);
        setInvoiceStarted(true);
        setInvoiceMeta((p) => ({ ...p, sender: getLocationNameById(selectedLocation), receiver: getLocationNameById(userLId) || "Me" }));
        notify.success("Kirim boshlandi");
      } else {
        throw new Error("Invoice yaratishda xato");
      }
    } catch (err) {
      notify.error("Kirimni boshlashda xato: " + (err?.message || err));
    }
  };

  function getLocationNameById(id) {
    if (!id) return "";
    if (id === "other") return otherLocationName || "Other";
    const f = locations.find((l) => String(l.id) === String(id));
    return f ? f.name || f.address || "Location" : "";
  }

  // ---------- Search products ----------
  const doSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const data = {
        locationId: userLId,
        search: searchQuery.trim(),
      }
      const res = await Stock.getLocationStocksBySearch({ data });
      if (res?.status === 200 || res?.status === 201) setSearchResults(res.data || []);
    } catch (err) {
      notify.error("Qidiruv xatosi: " + (err?.message || err));
    } finally {
      setSearchLoading(false);
    }
  };

  // ---------- Barcode (1.2s debounce, 13 digits) ----------
  React.useEffect(() => {
    if (!barcodeEnabled) return;
    if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
    if (!barcodeInput) return;
    barcodeTimer.current = setTimeout(() => {
      const digits = barcodeInput.replace(/\D/g, "");
      if (digits.length === 13) fetchByBarcode(digits);
    }, 1200);

    return () => {
      if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
    };
  }, [barcodeInput, barcodeEnabled]);

  const fetchByBarcode = async (code) => {
    try {
      setBarcodeLoading(true);
      let res = await Stock.getByBarcode(code);
      if (res?.status === 200 || res?.status === 201) {
        addItemToMixData(res.data);
        setBarcodeInput("");
      } else {
        notify.error("Barcode bo'yicha mahsulot topilmadi");
      }
    } catch (err) {
      notify.error("Barcode xatosi: " + (err?.message || err));
    } finally {
      setBarcodeLoading(false);
    }
  };

  // ---------- Normalize & add to mixData ----------
  function normalizeIncomingItem(raw) {
    // raw tuzilishini siz bergan namunaga moslab ishlayapti
    const productObj = raw.product || raw.product || {};
    return {
      barcode: raw.barcode || productObj.barcode || "",
      stock_id: raw.id || null,
      location: raw.location || null,
      price: Number(raw.price || 0),
      product: productObj,
      product_id: raw.product_id || productObj.id || null,
      quantity: Number(raw.quantity || 1) || 1,
      raw,
    };
  }

  function addItemToMixData(raw) {
    const item = normalizeIncomingItem(raw);
    setMixData((prev) => {
      // agar product_id yoki barcode mos kelsa birlashtiramiz (quantity oshirish)
      const idx = prev.findIndex(
        (p) =>
          (p.product_id && item.product_id && String(p.product_id) === String(item.product_id)) ||
          (p.barcode && item.barcode && String(p.barcode) === String(item.barcode))
      );
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: Number(copy[idx].quantity || 0) + Number(item.quantity || 1),
          price: item.price || copy[idx].price || 0,
        };
        recalcTotal(copy);
        return copy;
      } else {
        const newList = [
          ...prev,
          {
            barcode: item.barcode,
            stock_id: item.stock_id,
            location_id: item.location?.id || null,
            price: item.price || 0,
            product: item.product || { id: item.product_id, name: item.raw?.name || "" },
            product_id: item.product_id,
            quantity: item.quantity || 1,
          },
        ];
        recalcTotal(newList);
        return newList;
      }
    });
  }

  function recalcTotal(list) {
    const total = list.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    setInvoiceMeta((p) => ({ ...p, total }));
  }

  // ---------- Click from sidebar product list ----------
  const onSidebarProductClick = (prodStock) => {
    addItemToMixData(prodStock);
  };

  // ---------- Click from search results ----------
  const onSelectSearchResult = (r) => {
    addItemToMixData(r);
  };

  // ---------- Table handlers ----------
  function updateQuantity(index, value) {
    setMixData((prev) => {
      const copy = [...prev];
      copy[index].quantity = Number(value || 0);
      recalcTotal(copy);
      return copy;
    });
  }
  function updatePrice(index, value) {
    setMixData((prev) => {
      const copy = [...prev];
      copy[index].price = Number(value || 0);
      recalcTotal(copy);
      return copy;
    });
  }
  function removeItem(index) {
    setMixData((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      recalcTotal(copy);
      return copy;
    });
  }

  // ---------- Save invoice items ----------
  const saveInvoiceItems = async () => {
    if (!invoiceId) {
      notify.error("Invoice ID mavjud emas");
      return;
    }
    if (mixData.length === 0) {
      notify.error("Hech qanday mahsulot qo'shilmagan");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        list: mixData.map((it) => ({
          invoice_id: invoiceId,
          product_id: it.product_id,
          quantity: Number(it.quantity || 0),
          price: Number(it.price || 0),
          barcode: it.barcode || "",
        })),
      };

      const res = await InvoiceItems.createInvoiceItems(payload);

      if (res?.status === 200 || res?.status === 201) {
        setSaveSuccess(true);
        notify.success("Saqlash muvaffaqiyatli");
      } else {
        throw new Error("Saqlashda xato");
      }
    } catch (err) {
      notify.error("Saqlash xatosi: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  // ---------- Download invoice ----------
  const downloadInvoice = async (type = "docx") => {
    if (!invoiceStarted) {
      notify.error("Invoice hali boshlanmagan");
      return;
    }

    // yordamchi: xavfsiz fayl nomi
    const sanitize = (s = "") =>
      String(s)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_\-\.]/g, "")
        .substring(0, 80);

    const senderName = invoiceMeta.sender || "Sender";
    const receiverName = invoiceMeta.receiver || "Receiver";
    const totalStr = (Number(invoiceMeta.total || 0)).toLocaleString?.() ?? String(invoiceMeta.total || 0);
    const baseName = `${sanitize(senderName)}_to_${sanitize(receiverName)}_${sanitize(totalStr)}_kirim`;

    // umumiy jadval satrlari tayyorlash (docx va excel uchun)
    const headers = ["#", "Nomi", "Barcode", "Narx", "Miqdor", "Jami"];
    const rows = mixData.map((it, idx) => {
      const name = it.product?.name || it.name || "—";
      const barcode = it.barcode || "";
      const price = Number(it.price || 0);
      const qty = Number(it.quantity || 0);
      const lineTotal = price * qty;
      return {
        idx: idx + 1,
        name,
        barcode,
        price,
        qty,
        lineTotal,
      };
    });

    try {
      if (type === "docx") {
        // ---------- DOCX generation ----------
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                // Title
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "KIRIM HUJJATI",
                      bold: true,
                      size: 48, // 24pt
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),

                // Meta info blok
                new Paragraph({
                  children: [
                    new TextRun({ text: `Jo'natuvchi: `, bold: true }),
                    new TextRun({ text: `${senderName}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Qabul qiluvchi: `, bold: true }),
                    new TextRun({ text: `${receiverName}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Vaqt: `, bold: true }),
                    new TextRun({ text: `${invoiceMeta.time || new Date().toLocaleString()}` }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Umumiy: `, bold: true }),
                    new TextRun({ text: `${totalStr} сум` }),
                  ],
                  spacing: { after: 300 },
                }),

                // Jadval sarlavhasi (DOCX table)
                (() => {
                  // create header row
                  const tableRows = [];

                  const headerCells = headers.map((h) =>
                    new TableCell({
                      width: { size: 1000, type: WidthType.DXA },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: h, bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      margins: { top: 100, bottom: 100 },
                    })
                  );

                  tableRows.push(new TableRow({ children: headerCells }));

                  // data rows
                  rows.forEach((r) => {
                    const cells = [
                      new TableCell({ children: [new Paragraph(String(r.idx))] }),
                      new TableCell({ children: [new Paragraph(r.name)] }),
                      new TableCell({ children: [new Paragraph(r.barcode || "")] }),
                      new TableCell({ children: [new Paragraph(String(r.price))] }),
                      new TableCell({ children: [new Paragraph(String(r.qty))] }),
                      new TableCell({ children: [new Paragraph(String(r.lineTotal))] }),
                    ];
                    tableRows.push(new TableRow({ children: cells }));
                  });

                  // total row
                  const totalCells = [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: " ", })] }),], columnSpan: 4 }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Jami", bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph(String(Number(invoiceMeta.total || 0)))] }),
                  ];

                  tableRows.push(new TableRow({ children: totalCells }));

                  return new Table({
                    rows: tableRows,
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    },
                  });
                })(),

                // Footer / signature lines
                new Paragraph({ children: [], spacing: { before: 300 } }),
                new Paragraph({
                  children: [new TextRun({ text: "\n\nJo'natuvchi imzo: ______________________", })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: "Qabul qiluvchi imzo: ______________________", })],
                }),
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc); // browser-friendly
        saveAs(blob, `${baseName}.docx`);
        notify.success(".docx fayl generatsiya qilindi");
      } else {
        // ---------- EXCEL generation ----------
        // Prepare 2D array (A-O-A format)
        const aoa = [];

        // header info
        aoa.push(["Kirim hujjati"]);
        aoa.push([]);
        aoa.push(["Jo'natuvchi", senderName, "", "Qabul qiluvchi", receiverName]);
        aoa.push(["Vaqt", invoiceMeta.time || new Date().toLocaleString()]);
        aoa.push(["Umumiy", totalStr]);
        aoa.push([]);
        // table header
        aoa.push(headers);
        // table rows
        rows.forEach((r) => {
          aoa.push([r.idx, r.name, r.barcode, r.price, r.qty, r.lineTotal]);
        });
        // total row
        aoa.push([]);
        aoa.push(["", "", "", "Jami", "", Number(invoiceMeta.total || 0)]);

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        // autosize columns (simple heuristic)
        const max_length = (arr) =>
          arr.reduce((m, v) => Math.max(m, String(v || "").length), 0);
        const cols = [
          { wch: Math.max(4, max_length(aoa.map((r) => r[0]))) },
          { wch: Math.max(10, max_length(aoa.map((r) => r[1]))) },
          { wch: Math.max(8, max_length(aoa.map((r) => r[2]))) },
          { wch: Math.max(8, max_length(aoa.map((r) => r[3]))) },
          { wch: Math.max(6, max_length(aoa.map((r) => r[4]))) },
          { wch: Math.max(8, max_length(aoa.map((r) => r[5]))) },
        ];
        ws["!cols"] = cols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kirim");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, `${baseName}.xlsx`);
        notify.success(".xlsx fayl generatsiya qilindi");
      }
    } catch (err) {
      console.error("Download xatosi:", err);
      notify.error("Fayl generatsiya qilishda xatolik: " + (err?.message || err));
    }
  };

  // realtime time update
  React.useEffect(() => {
    if (!invoiceStarted) return;
    const t = setInterval(() => {
      setInvoiceMeta((p) => ({ ...p, time: new Date().toLocaleString() }));
    }, 1000);
    return () => clearInterval(t);
  }, [invoiceStarted]);

  // ---------- JSX render ----------
  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden">
      <div className="fixed top-0 right-0 w-[100%] h-[68px] backdrop-blur-[5px] bg-gray-200 shadow flex items-center justify-center text-xl font-semibold z-30">
        Warehouse Income
      </div>

      {/* Sidebar */}
      <div
        className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)] bg-gray-50 shadow-lg transition-all duration-500 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-200 rounded-xl transition" title="O‘lchamni o‘zgartirish">
            {sidebarMode === 0 ? <ChevronRight size={22} /> : sidebarMode === 1 ? <ChevronsRight size={22} /> : <ChevronLeft size={22} />}
          </button>

          {(isMedium || isWide) && (
            <div className="flex gap-2">
              <button onClick={() => setViewMode("category")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "category" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Tags size={18} />
                {isWide && <span className="text-sm">Category</span>}
              </button>
              <button onClick={() => setViewMode("product")} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "product" ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Package size={18} />
                {isWide && <span className="text-sm">Product</span>}
              </button>
            </div>
          )}
        </div>

        {(isMedium || isWide) && (
          <div className={`overflow-y-auto ${isMedium ? "overflow-x-scroll" : "overflow-x-scroll"} p-3 grid gap-3 grid-cols-[repeat(auto-fill,minmax(auto,1fr))]`}>
            {viewMode === "category" ? (
              groupLoading ? (
                <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Spinner /> Yuklanmoqda...
                </p>
              ) : categories.length === 0 ? (
                "Hech qanday kategoriya topilmadi."
              ) : (
                categories.map((cat) => (
                  <button key={cat.id} onClick={() => handleCategoryClick(cat.id)}>
                    <div className={`cursor-pointer border rounded-xl shadow-sm hover:shadow-md p-3 flex justify-center items-center text-gray-800 font-medium transition ${selectedCategory === cat.id ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}>
                      <span className="text-sm">{cat.name}</span>
                    </div>
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
              products.map((prod) => (
                <button className="active:scale-[0.99]" key={prod.id} onClick={() => onSidebarProductClick(prod)}>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition">
                    <div className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-gray-800 font-medium whitespace-nowrap">{prod.product?.name || prod.name || "No name"}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0 ? "ml-[70px]" : sidebarMode === 1 ? "ml-[25%]" : "ml-[33.3%]"} p-6`}>
        <div className="bg-gray-100 rounded-2xl min-h-[calc(100vh-68px)] p-4 flex flex-col gap-4">
          {/* HEAD */}
          {!invoiceStarted ? (
            <div className="h-[55px] bg-white rounded-lg flex items-center gap-4 px-3 shadow-sm">
              <div className="flex items-center gap-2">
                {locationsLoading ? (
                  <div className="flex items-center gap-2"><Spinner /> Loading...</div>
                ) : (
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="border rounded px-3 py-2 bg-white">
                    <option value="">Jo'natuvchini tanlang</option>
                    {locations.filter((item) => item.id !== userLId).map((loc) => <option key={loc.id} value={loc.id}>{loc.name || loc.address || loc.type}</option>)}
                    {/* <option value="other">Other</option> */}
                  </select>
                )}

                {selectedLocation === "other" && (
                  <input value={otherLocationName} onChange={(e) => setOtherLocationName(e.target.value)} placeholder="Tashqi location nomi" className="border rounded px-3 py-2" />
                )}
              </div>

              <div className="ml-auto">
                <button onClick={startInvoice} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:opacity-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Kirimni boshlash
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[55px] bg-white rounded-lg flex items-center gap-3 px-3 shadow-sm">
              {/*<select className="border rounded px-3 py-2" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                <option value="">Qayerdan qidirish</option>
                {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name || loc.address}</option>)}
              </select>*/}

              <div className="flex items-center gap-2">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Mahsulot nomi bilan qidirish..." className="border rounded px-3 py-2 w-[420px]" />
                <button onClick={doSearch} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">
                  <SearchIcon size={16} /> Qidirish
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => { setBarcodeEnabled((s) => !s); setBarcodeInput(""); }} className={`flex items-center gap-2 px-3 py-2 rounded ${barcodeEnabled ? "bg-black text-white" : "bg-gray-200"}`}>
                  <BarcodeIcon size={16} /> Barcode
                </button>
                {barcodeEnabled && (
                  <div className="flex items-center gap-2">
                    <input value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="13 ta raqamni kiriting..." className="border rounded px-3 py-2 w-[200px]" />
                    {barcodeLoading && <Spinner size="sm" />}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice info & body */}
          {invoiceStarted && (
            <>
              <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500">Jo'natuvchi</div>
                  <div className="font-medium">{invoiceMeta.sender || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Qabul qiluvchi</div>
                  <div className="font-medium">{invoiceMeta.receiver}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Vaqt</div>
                  <div className="font-medium">{invoiceMeta.time}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500">Umumiy qiymat</div>
                  <div className="font-semibold text-lg">{invoiceMeta.total?.toLocaleString?.() ?? invoiceMeta.total} сум</div>
                </div>
              </div>


              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm font-medium mb-2 flex items-center justify-between">
                  <h4>Qidiruv natijalari</h4>
                  <button
                    onClick={() => setSearchResults([])}
                    className="p-2 rounded-full border border-gray-600 text-gray-900 hover:text-red-500 hover:border-red-800 transition-all duration-200"
                    title="Clear results"
                  >
                    <Eraser size={18} />
                  </button>

                </div>
                {searchLoading ? (
                  <div className="p-4 flex items-center gap-2"><Spinner /> Qidirilmoqda...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-gray-500">Natija topilmadi</div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {searchResults.map((r) => (
                      <button key={r.id} onClick={() => onSelectSearchResult(r)} className="bg-white border rounded p-2 shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col items-center gap-1 min-w-[100px]">
                        <div className="text-sm font-medium">{r.product?.name || r.name}</div>
                        <div className="text-xs text-gray-400">{r.barcode || ""}</div>
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
                      <th className="p-2">Nomi</th>
                      <th className="p-2">Narx</th>
                      <th className="p-2">Miqdor</th>
                      <th className="p-2">Jami</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mixData.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-400">Mahsulotlar mavjud emas</td></tr>
                    ) : mixData.map((it, idx) => (
                      <tr key={(it.product_id || it.barcode) + idx} className="border-b">
                        <td className="p-2 align-top">{idx + 1}</td>
                        <td className="p-2 align-top">
                          <div className="font-medium">{it.product?.name || "—"}</div>
                          <div className="text-xs text-gray-400">{it.barcode}</div>
                        </td>
                        <td className="p-2 align-top w-[140px]">
                          <input type="number" value={it.price} onChange={(e) => updatePrice(idx, e.target.value)} className="border rounded px-2 py-1 w-full" />
                        </td>
                        <td className="p-2 align-top w-[120px]">
                          <input type="number" value={it.quantity} onChange={(e) => updateQuantity(idx, e.target.value)} className="border rounded px-2 py-1 w-full" />
                        </td>
                        <td className="p-2 align-top">
                          {(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString()}
                        </td>
                        <td className="p-2 align-top">
                          <button

                            onClick={() => removeItem(idx)}
                            className="p-2 text-gray-800 hover:text-red-500 active:scale-90 transition-all duration-200"
                            title="Remove row"
                          >
                            <MinusCircle size={22} />
                          </button>
                          {/* <button  className="text-sm text-red-600">Remove</button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">

                  <button onClick={saveInvoiceItems} disabled={saving || saveSuccess} className={`flex items-center gap-2 bg-black-500 text-white px-4 py-2 rounded hover:opacity-95 disabled:opacity-80  disabled:cursor-not-allowed ${saveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-800"}`}>
                    {saving ? <Spinner size="sm" /> : <Save size={16} />}
                    {saveSuccess ? "Saved" : "Saqlash"}
                  </button>
                  {saveSuccess && (
                    <button onClick={() => { setInvoiceStarted(false); setInvoiceId(null); setMixData([]); setSaveSuccess(false); setSelectedLocation(""); setOtherLocationName(""); setInvoiceMeta((p) => ({ ...p, total: 0 })); }} className={`flex items-center gap-2 bg-black-500 text-white px-4 py-2 rounded hover:opacity-95 bg-[rgb(25_118_210)]`} type="button">
                      <PlusCircle size={16} />
                      Start
                    </button>
                  )}

                  <button >

                  </button>
                </div>


                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={() => downloadInvoice("docx")} className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    <Download size={14} /> Download .docx
                  </button>
                  <button onClick={() => downloadInvoice("excel")} className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    <Download size={14} /> Download .xlsx
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
