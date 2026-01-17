import {
  Package,
  Layers,
  Lock,
  Unlock,
  Gauge,
  Infinity,
  Link
} from "lucide-react";

export function StockRow({ item, role, highlight }) {
  const {
    product,
    quantity,
    draft_quantity,
    purchase_price,
    sale_price_type,
    fixed_quantity
  } = item;

  const escapeRegExp = (string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightText = (text, search) => {
    if (!search) return text;

    const safeSearch = escapeRegExp(search);
    const regex = new RegExp(`(${safeSearch})`, "gi");

    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-300/40 dark:bg-yellow-500/30 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };



  return (
    <div
      className="
        grid grid-cols-12 items-center px-4 py-3 relative
        rounded-xl bg-card-light dark:bg-card-dark
        border border-gray-200 dark:border-gray-700
        hover:shadow-sm transition text-card-light dark:text-card-dark
      "
    >
      {/* PRODUCT */}
      <div className="col-span-4 flex items-center gap-3 text-text-light dark:text-text-dark">
        <div className="p-2 rounded-lg bg-gray-500/10">
          <Package size={18} />
        </div>
        <div>
          <p className="font-semibold">
            {highlightText(product?.name || "Noma’lum", highlight)}
          </p>
          <p className="text-xs opacity-60">
            {product?.unit}
          </p>
        </div>
      </div>
      {/* QUANTITY */}
      <div className="col-span-2 flex items-center gap-2 text-text-light dark:text-text-dark">
        <Layers size={16} />
        <span>{quantity ?? "—"}</span>
      </div>
      {/* DRAFT */}
      <div className="col-span-2">
        <span className={draft_quantity > 0 ? "text-orange-500" : ""}>
          {draft_quantity ?? 0}
        </span>
      </div>

      {role !== "warehouse" && (
        <>
          {/* PURCHASE */}
          <div className="col-span-2 text-text-light dark:text-text-dark">
            {purchase_price ?? "—"}
          </div>

          {/* SALE */}
          <div className="col-span-2 flex flex-wrap gap-1 text-text-light dark:text-text-dark">
            {sale_price_type?.length ? (
              sale_price_type.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 text-xs rounded bg-green-500/15 text-green-500"
                >
                  {p.price_type?.name}: {p.sale_price}
                </span>
              ))
            ) : (
              <span className="text-xs opacity-50">Belgilanmagan</span>
            )}
          </div>
        </>
      )}

      {/* FIXED */}
      <div className={`absolute right-4  opacity-60 ${fixed_quantity ? "text-orange-500" : "text-text-light dark:text-text-dark"} `}>
        {fixed_quantity ? <Link size={16} /> : <Infinity size={16} />}
      </div>
    </div>
  );
}
