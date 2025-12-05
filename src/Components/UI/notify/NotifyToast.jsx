import { Bell, ChevronRight } from "lucide-react";

export default function NotifyToast({ message, handleClick }) {
    return (
        <div
            onClick={handleClick}
            className="
        flex items-center gap-4
        bg-white dark:bg-[#1f1f1f]
        px-5 py-4 rounded-2xl
        shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.35)]
        border border-gray-100/70 dark:border-gray-700/60
        cursor-pointer select-none
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-[1px]
      "
        >
            {/* Icon circle */}
            <div
                className="
          flex items-center justify-center 
          w-12 h-12 rounded-full
          bg-gradient-to-br from-blue-500 to-blue-600
          text-white shadow-md
        "
            >
                <Bell size={24} />
            </div>

            {/* Main text */}
            <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100 text-[15px] font-semibold">
                    {message}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Bosing — bildirishnomalar sahifasiga o‘tish
                </p>
            </div>

            <ChevronRight
                size={22}
                className="
          text-gray-400 dark:text-gray-300
          transition-opacity
          group-hover:opacity-60
        "
            />
        </div>
    );
}
