import { useState, useEffect } from "react";
import { useBeforeUnload, useNavigate, useLocation } from "react-router-dom";

export default function useConfirmNavigation({ when, clearAll }) {
    const [showModal, setShowModal] = useState(false);
    const [nextHref, setNextHref] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 🔹 Sahifa yangilanayotgan bo‘lsa ogohlantirish
    useBeforeUnload(
        when ? (e) => {
            e.preventDefault();
            e.returnValue = "Saqlanmagan o‘zgarishlar yo‘qoladi.";
        } : null
    );

    // 🔹 Layout ichidagi link bosilganda modal chiqadi
    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest("a");
            if (!link) return;

            const href = link.getAttribute("href");
            if (
                href &&
                href !== location.pathname &&
                when // yani hali saqlanmagan holatda
            ) {
                e.preventDefault();
                setNextHref(href);
                setShowModal(true);
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [when, location.pathname]);

    const handleConfirm = () => {
        if (clearAll) clearAll();
        setShowModal(false);
        if (nextHref) navigate(nextHref);
    };

    const handleCancel = () => {
        setShowModal(false);
        setNextHref(null);
    };

    return { showModal, handleConfirm, handleCancel };
}
