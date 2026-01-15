import { Boxes } from "lucide-react";

export function CategoryFilter({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="
            group p-4 rounded-2xl
            bg-card-light dark:bg-card-dark
            border border-gray-200 dark:border-gray-700
            hover:border-blue-500 hover:shadow-md
            transition-all duration-200
            text-left text-card-light dark:text-card-dark
          "
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Boxes size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-text-light dark:text-text-dark">
                {cat.name}
              </p>
              <p className="text-xs opacity-60 mt-1 text-text-light dark:text-text-dark">
                Kategoriyadagi mahsulotlar
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
