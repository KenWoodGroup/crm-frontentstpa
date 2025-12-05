import { Bell, ChevronRight, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function NotifyToast({ t, onNavigate }) {
    return (
        <div
            className="
                relative flex items-center gap-4
                bg-white dark:bg-[#1f1f1f]
                px-5 py-4 rounded-2xl
                shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.35)]
                border border-gray-100/70 dark:border-gray-700/60
                select-none
            "
        >
            {/* Close */}
            <button
                onClick={() => toast.dismiss(t.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <X size={16} className="text-gray-500 dark:text-gray-300" />
            </button>

            {/* Icon */}
            <div
                onClick={onNavigate}
                className="
                    flex items-center justify-center 
                    w-12 h-12 rounded-full cursor-pointer
                    bg-gradient-to-br from-blue-500 to-blue-600
                    text-white shadow-md
                "
            >
                <Bell size={24} />
            </div>

            {/* Text */}
            <div onClick={onNavigate} className="flex-1 cursor-pointer">
                <p className="text-gray-900 dark:text-gray-100 text-[15px] font-semibold">
                    Yangi jo'natma
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Bildirishnomalar sahifasiga o'tish
                </p>
            </div>

            <ChevronRight size={22} className="text-gray-400 dark:text-gray-300" />
        </div>
    );
}
