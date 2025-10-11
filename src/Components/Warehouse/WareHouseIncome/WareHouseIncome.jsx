import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Tags, Package, ChevronRight, ChevronLeft, ChevronsRight, } from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProductApi } from "../../../utils/Controllers/ProductApi";
import { Spinner } from "@material-tailwind/react";
import Loading from "../../UI/Loadings/Loading";

export default function WareHouseIncome() {
  const [sidebarMode, setSidebarMode] = useState(0); // 0=closed, 1=medium(25%), 2=wide(33.3%)
  const [viewMode, setViewMode] = useState("category"); // 'category' or 'product'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  const products = [
    { id: 101, name: "Lampochka 220V" },
    { id: 102, name: "Kabellar 10m" },
    { id: 103, name: "Shurup 3x30mm" },
    { id: 104, name: "Qog‘oz A4" },
    { id: 105, name: "Printer siyohi" },
    { id: 106, name: "Tibbiy qo‘lqop" },
    { id: 107, name: "Dezinfeksiya spreyi" },
    { id: 108, name: "Kafel yelim" },
  ];

  // width o‘tish logikasi
  const getSidebarWidth = () => {
    if (sidebarMode === 0) return "w-[70px]";
    if (sidebarMode === 1) return "w-1/4";
    return "w-1/3";
  };

  const toggleSidebar = () => {
    setSidebarMode((prev) => (prev + 1) % 3);
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setViewMode("product");
  };

  const isWide = sidebarMode === 2;
  const isMedium = sidebarMode === 1;

  // --CRUD opareations
  // Get Groups by LocationId
  const fetchCategories = async () => {
    try {
      setGroupLoading(true);
      const LocationId = Cookies.get("usd_nesw");
      const res = await ProductApi.GetMiniCategoryById(LocationId);
      if (res.status === 200) {
        setCategories(res.data);
      }
    } catch (err) {
      notify.error("Categoriyalarni olishda xato:", err);
    } finally {
      setGroupLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  // Get Products by GroupId
  // Add Product to Income List
  // Remove Product from Income List
  // Submit Income List
  // --END CRUD opareations

  return (
    <section className="relative w-full h-screen bg-white overflow-hidden">
      {/* Fixed title bar */}
      <div className="fixed top-0 right-0 w-[100%] h-[68px] bg-gray-100 shadow flex items-center justify-center text-xl font-semibold z-30">
        Warehouse Income
      </div>

      {/* Sidebar */}
      <div
        className={`absolute z-20 left-0 top-[68px] ${getSidebarWidth()} h-[calc(100vh-68px)] bg-gray-50 shadow-lg transition-all duration-500 ease-in-out flex flex-col`}
      >
        {/* Sidebar top controls */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-200 rounded-xl transition"
            title="O‘lchamni o‘zgartirish"
          >
            {sidebarMode === 0 ? (
              <ChevronRight size={22} />
            ) : sidebarMode === 1 ? (
              <ChevronsRight size={22} />
            ) : (
              <ChevronLeft size={22} />
            )}
          </button>

          {(isMedium || isWide) && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("category")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "category"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                <Tags size={18} />
                {isWide && <span className="text-sm">Category</span>}
              </button>
              <button
                onClick={() => setViewMode("product")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${viewMode === "product"
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                <Package size={18} />
                {isWide && <span className="text-sm">Product</span>}
              </button>
            </div>
          )}
        </div>

        {/* Card list */}
        {(isMedium || isWide) && (
          <div
            className={`flex-1 overflow-y-auto ${isMedium ? "overflow-x-auto" : "overflow-x-hidden"
              } p-3 grid gap-3 ${isWide ? "grid-cols-2" : "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]"
              }`}
          >
            {viewMode === "category"
              ? (
                groupLoading ? (
                  <p className="p-4 text-center text-gray-400 flex items-center justify-center gap-2"> <Loading /> Yuklanmoqda...</p>
                ) :
                  (
                    categories.length === 0 ? ("Hech qanday kategoriya topilmadi.") : (
                      categories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="cursor-pointer bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md p-3 text-center text-gray-800 font-medium transition"
                        >
                          {cat.name}
                        </div>

                      )))

                  ))
              : products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-3 min-w-[180px] transition"
                >
                  <button className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                    <PlusIcon />
                  </button>
                  <span className="text-gray-800 font-medium whitespace-nowrap">
                    {prod.name}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Main content (sidebar kengayganda joy o‘zgaradi) */}
      <div
        className={`transition-all duration-500 ease-in-out pt-[68px] ${sidebarMode === 0
          ? "ml-[70px]"
          : sidebarMode === 1
            ? "ml-[25%]"
            : "ml-[33.3%]"
          } p-6`}
      >
        <div className="h-[calc(100vh-68px)] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 text-lg">
          Asosiy kontent joyi
        </div>
      </div>
    </section>
  );
}

// Plus icon — minimalist uslubda (lucide-react dagi plus emas, soddaroq SVG)
function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
