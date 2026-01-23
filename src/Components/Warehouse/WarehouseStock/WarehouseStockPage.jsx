import { useEffect, useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import { ArrowLeft, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useDebounce } from "../../../hooks/useDebounce";
import { useStockSocket } from "../../../hooks/useStockSocket";

import { SearchInput } from "./_components/SearchInput";
import { CategoryFilter } from "./_components/CategoryFilter";
import { StockList } from "./_components/StockList";

import { Stock } from "../../../utils/Controllers/Stock";
import { LocalCategory } from "../../../utils/Controllers/LocalCategory";
import { location } from "../../../utils/Controllers/location";
import InventoryHeader from "../InventoryHeader/InventoryHeader";

export default function WarehouseStockPage({
  productType = "product",
  role = "warehouse",
}) {
  const { t } = useTranslation();
  const params = useParams();
  const deUlId = role === "factory" ? params.deUlId : null;

  const locationId = role === "warehouse" ? Cookies.get("ul_nesw") : deUlId;

  const parentId =
    role === "warehouse" ? Cookies.get("usd_nesw") : Cookies.get("ul_nesw");

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [globalSearch, setGlobalSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const debouncedGlobalSearch = useDebounce(globalSearch);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [warehouseName, setWarehouseName] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total_pages: 1,
    total_count: 0,
  });

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
  const fetchStock = useCallback(
    async (pageNumber = page) => {
      setLoading(true);

      try {
        if (debouncedGlobalSearch) {
          const payload = {
            locationId,
            prd_type: productType,
            search: debouncedGlobalSearch,
            page: pageNumber,
          };

          const res = await Stock.getStockSearchAll({ data: payload });

          setData(res.records || []);
          setPagination(res.pagination || {});
          return;
        }

        if (activeCategory) {
          const res = await Stock.getStockCategory(
            locationId,
            activeCategory,
            productType,
            pageNumber,
          );

          setData(res.records || []);
          setPagination(res.pagination || {});
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedGlobalSearch, activeCategory, productType, locationId, page],
  );

  /* ================= PAGE CHANGE ================= */
  useEffect(() => {
    fetchStock(page);
  }, [page, fetchStock]);

  /* ================= RESET PAGE ================= */
  useEffect(() => {
    setPage(1);
  }, [debouncedGlobalSearch, activeCategory]);

  /* ================= WAREHOUSE NAME ================= */
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const res = await location.Get(locationId);
        setWarehouseName(res?.data?.name || "");
      } catch {}
    };

    fetchWarehouseData();
  }, [locationId]);

  /* ================= SOCKET ================= */
  useStockSocket({
    locationId,
    onUpdate: () => fetchStock(page),
  });

  /* ================= LOCAL SEARCH ================= */
  const filteredCategoryData = useMemo(() => {
    if (!localSearch) return data;

    return data.filter((item) =>
      item.product?.name?.toLowerCase().includes(localSearch.toLowerCase()),
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
    setPagination({
      currentPage: 1,
      total_pages: 1,
      total_count: 0,
    });
  };

  /* ================= RENDER ================= */
  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-background-light dark:bg-background-dark">
      {role === "factory" && (
        <InventoryHeader
          deUlId={deUlId}
          deUlName={warehouseName}
          role={role}
          type="stock"
          prd_type={productType}
          invoiceStarted={{ stock: false }}
          mode="stock"
        />
      )}

      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("warehouseTitle")}</h1>
        <p className="text-sm opacity-60">
          {viewMode === "HOME" && t("inventory.search_hint")}
          {viewMode === "GLOBAL_SEARCH" && t("search.results")}
          {viewMode === "CATEGORY_PRODUCTS" && t("category.selected_products")}
        </p>
      </div>

      {/* GLOBAL SEARCH */}
      {(viewMode === "HOME" || viewMode === "GLOBAL_SEARCH") && (
        <div className="space-y-2">
          <SearchInput
            value={globalSearch}
            onChange={setGlobalSearch}
            loading={loading}
          />
          <p className="flex items-center gap-1 text-xs opacity-50">
            <Search size={12} />
            {t("search.all_categories")}
          </p>
        </div>
      )}

      {/* CATEGORY LIST */}
      {viewMode === "HOME" && (
        <CategoryFilter
          categories={categories}
          onSelect={handleSelectCategory}
        />
      )}

      {/* CATEGORY PRODUCTS */}
      {viewMode === "CATEGORY_PRODUCTS" && (
        <>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} />
            Kategoriyalarga qaytish
          </button>

          <SearchInput
            value={localSearch}
            onChange={setLocalSearch}
            loading={false}
          />

          <StockList
            data={filteredCategoryData}
            loading={loading}
            role={role}
            highlight={localSearch}
            page={pagination.currentPage}
            totalPages={pagination.total_pages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* GLOBAL SEARCH RESULT */}
      {viewMode === "GLOBAL_SEARCH" && (
        <StockList
          data={data}
          loading={loading}
          role={role}
          highlight={debouncedGlobalSearch}
          page={pagination.currentPage}
          totalPages={pagination.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
