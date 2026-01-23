import { PackageSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { StockRow } from "./StockRow";

export function StockList({
  data = [],
  loading = false,
  role,
  highlight,
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse opacity-60">
        Yuklanmoqda...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-20 text-center opacity-60">
        <PackageSearch className="mx-auto mb-3" />
        Ma’lumot topilmadi
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="grid grid-cols-12 px-4 text-xs uppercase opacity-60">
        <div className="col-span-4">Mahsulot</div>
        <div className="col-span-2">Ombor</div>
        <div className="col-span-2">Qoralama</div>
        {role !== "warehouse" && (
          <>
            <div className="col-span-2">Tan narxi</div>
            <div className="col-span-2">Sotuv narxi</div>
          </>
        )}
      </div>

      {data.map((item) => (
        <StockRow
          key={item.product_id}
          item={item}
          role={role}
          highlight={highlight}
        />
      ))}

      {/* PAGINATION */}
      {Number(totalPages) > 1 && (
        <div className="flex items-center justify-between pt-6">
          {/* ORQAGA */}
          <button
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page <= 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={18} />
            Orqaga
          </button>

          {/* PAGE INFO */}
          <span className="text-sm font-medium opacity-70">
            {page} / {totalPages}
          </span>

          {/* KEYINGISI */}
          <button
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Keyingisi
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
