import { Search, X } from "lucide-react";

export function SearchInput({ value, onChange, loading, disabled }) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60 text-text-light dark:text-text-dark"
      />

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mahsulot nomi yoki shtrix-kod orqali qidirish..."
        className={`
          w-full pl-11 pr-10 py-3 rounded-xl
          bg-card-light dark:bg-card-dark
          border border-gray-200 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200 text-text-light dark:text-text-dark
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      />

      {value && !disabled && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 text-text-light dark:text-text-dark"
        >
          <X size={18} />
        </button>
      )}

      {loading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs opacity-60 animate-pulse text-text-light dark:text-text-dark">
          Qidirilmoqda...
        </div>
      )}
    </div>
  );
}
