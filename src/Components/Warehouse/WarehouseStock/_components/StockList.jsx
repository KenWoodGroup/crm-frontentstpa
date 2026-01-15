import { PackageSearch } from "lucide-react";
import { StockRow } from "./StockRow";

export function StockList({ data, loading, role, highlight }) {
  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse opacity-60 text-text-light dark:text-text-dark">
        Yuklanmoqda...
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="py-20 text-center opacity-60 text-text-light dark:text-text-dark">
        <PackageSearch className="mx-auto mb-3" />
        Ma’lumot topilmadi
      </div>
    );
  }

  return (
    <div className="space-y-2 ">
      {/* HEADER */}
      <div className="grid grid-cols-12 px-4 text-xs uppercase opacity-60 text-text-light dark:text-text-dark">
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
        <StockRow key={item.product_id} item={item} role={role} highlight={highlight} />
      ))}
    </div>
  );
}
