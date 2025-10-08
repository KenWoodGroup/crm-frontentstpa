import { toast } from "react-toastify";

// Toast helper functions
export const notify = {
    success: (msg) => toast.success(msg || "Muvaffaqiyatli!"),
    error: (msg) => toast.error(msg || "Xatolik yuz berdi!"),
    warning: (msg) => toast.warning(msg || "Ogohlantirish!"),
    info: (msg) => toast.info(msg || "Ma'lumot uchun!"),
};
