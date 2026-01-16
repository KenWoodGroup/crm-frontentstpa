import { useEffect, useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { ArrowLeft, Search } from "lucide-react";

import { useDebounce } from "../../../hooks/useDebounce";
import { useStockSocket } from "../../../hooks/useStockSocket";

import { SearchInput } from "./_components/SearchInput";
import { CategoryFilter } from "./_components/CategoryFilter";
import { StockList } from "./_components/StockList";

import { Stock } from "../../../utils/Controllers/Stock";
import { LocalCategory } from "../../../utils/Controllers/LocalCategory";
import { useParams } from "react-router-dom";
import InventoryHeader from "../InventoryHeader/InventoryHeader";
import { location } from "../../../utils/Controllers/location";

export default function WarehouseStockPage({productType = "product", role = "warehouse",}) {
  const deUlId = role === "factory" ? useParams().deUlId : null;
  const locationId = role === "warehouse" ? Cookies.get("ul_nesw") : deUlId;
  const parentId =
    role === "warehouse"
      ? Cookies.get("usd_nesw")
      : Cookies.get("ul_nesw");

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [globalSearch, setGlobalSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  const debouncedGlobalSearch = useDebounce(globalSearch);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [warehouseName, setWarehouseName] = useState("");

  /* ================= VIEW MODE ================= */
  const viewMode = useMemo(() => {
    if (debouncedGlobalSearch) return "GLOBAL_SEARCH";
    if (activeCategory) return "CATEGORY_PRODUCTS";
    return "HOME";
  }, [debouncedGlobalSearch, activeCategory]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await LocalCategory.GetAllCateogry({
        type: productType,
        location_id: parentId,
      });

      if (res?.status === 200 || res?.status === 201) {
        setCategories(res.data || []);
      }
    };

    fetchCategories();
  }, [productType, parentId]);

  /* ================= FETCH STOCK ================= */
  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      // GLOBAL SEARCH (API)
      if (debouncedGlobalSearch) {
        const payload = {
          prd_type: productType,
          locationId,
          fac_id: parentId,
          operation_type: "outgoing",
          search: debouncedGlobalSearch,
        };

        const res = await Stock.getLocationStocksBySearch({ data: payload });
        setData(res.data || []);
        return;
      }

      // CATEGORY PRODUCTS (API)
      if (activeCategory) {
        const res = await Stock.getLocationStocksByChildId(
          productType,
          locationId,
          activeCategory,
          "outgoing"
        );
        setData(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [
    debouncedGlobalSearch,
    activeCategory,
    productType,
    locationId,
    parentId,
  ]);

  /* ================= FETCH WAREHOSE DATA for name itself ================= */
  const fetchWarehouseData = async () => {
    try {
      const res = await location.Get(locationId);
      setWarehouseName(res?.data?.name || "");
    }catch{};
  };

  useEffect(()=> {
    fetchWarehouseData();
  },[locationId]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useStockSocket({
    locationId,
    onUpdate: fetchStock,
  });

  /* ================= LOCAL SEARCH FILTER ================= */
  const filteredCategoryData = useMemo(() => {
    if (!localSearch) return data;

    return data.filter((item) =>
      item.product?.name
        ?.toLowerCase()
        .includes(localSearch.toLowerCase())
    );
  }, [data, localSearch]);

  /* ================= HANDLERS ================= */
  const handleSelectCategory = (id) => {
    setActiveCategory(id);
    setGlobalSearch("");
    setLocalSearch("");
  };

  const handleBack = () => {
    setActiveCategory(null);
    setLocalSearch("");
    setData([]);
  };

  /* ================= RENDER ================= */
  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-background-light dark:bg-background-dark">
      {role === "factory" && <InventoryHeader deUlId={deUlId} deUlName={warehouseName}  role={role} type={"stock"} prd_type={productType} invoiceStarted={{stock: false}} mode={"stock"} />}
      {/* ===== HEADER ===== */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Ombordagi tovarlar</h1>

        <p className="text-sm opacity-60 text-text-light dark:text-text-dark">
          {viewMode === "HOME" &&
            "Mahsulotlarni global qidiruv yoki kategoriya orqali toping"}
          {viewMode === "GLOBAL_SEARCH" &&
            "Global qidiruv natijalari"}
          {viewMode === "CATEGORY_PRODUCTS" &&
            "Tanlangan kategoriya ichidagi mahsulotlar"}
        </p>
      </div>

      {/* ===== GLOBAL SEARCH (HOME + GLOBAL_SEARCH) ===== */}
      {(viewMode === "HOME" || viewMode === "GLOBAL_SEARCH") && (
        <div className="space-y-2">
          <SearchInput
            value={globalSearch}
            onChange={setGlobalSearch}
            loading={loading}
          />

          <p className="text-xs opacity-50 flex items-center gap-1 text-text-light dark:text-text-dark">
            <Search size={12} />
            Global qidiruv: barcha kategoriyalar bo‘yicha
          </p>
        </div>
      )}

      {/* ===== CATEGORY LIST ===== */}
      {viewMode === "HOME" && !globalSearch && (
        <CategoryFilter
          categories={categories}
          onSelect={handleSelectCategory}
        />
      )}

      {/* ===== CATEGORY PRODUCTS ===== */}
      {viewMode === "CATEGORY_PRODUCTS" && (
        <>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} />
            Kategoriyalarga qaytish
          </button>

          {/* LOCAL SEARCH */}
          <div className="space-y-2">
            <SearchInput
              value={localSearch}
              onChange={setLocalSearch}
              loading={false}
            />
            <p className="text-xs opacity-50">
              Ushbu kategoriya ichida qidirish
            </p>
          </div>

          <StockList
            data={filteredCategoryData}
            loading={loading}
            role={role}
            highlight={localSearch}
          />
        </>
      )}

      {/* ===== GLOBAL SEARCH RESULT ===== */}
      {viewMode === "GLOBAL_SEARCH" && (
        <StockList
          data={data}
          loading={loading}
          role={role}
          highlight={debouncedGlobalSearch}
        />
      )}
    </div>
  );
}
