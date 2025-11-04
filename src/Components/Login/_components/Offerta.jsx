import React, { useState, useEffect } from "react";
import { locationInfo } from "../../../utils/Controllers/locationInfo";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Offerta({ isOpen, onClose, onAgree, locationId }) {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ✅ Редирект в зависимости от роли
    const redirectUser = () => {
        const role = Cookies.get("nesw");

        const roleLinks = [
            { role: "SPAfefefeUID", vektor: "/" },
            { role: "AutngergUID", vektor: "/manager/dashboard" },
            { role: "SefwfmgrUID", vektor: "/factory/dashboard" },
            { role: "SesdsdfmgrUID", vektor: "/warehouse/dashboard" },
            { role: "SwedsdfmgrUID", vektor: "/diler/dashboard" },
            { role: "SeCfmgrUID", vektor: "/company/dashboard" },
            { role: "inedsdfmgrUID", vektor: "/independent/dashboard" },
            { role: "comedsdfmgrUID", vektor: "/company-warehouse/dashboard" },
            { role: "builewweUID", vektor: "/building/dashboard" },

        ];

        const vektor_obj = roleLinks.find((item) => item.role === role);
        navigate(vektor_obj?.vektor || "/");
    };

    // Подтверждение оферты
    const handleAgree = async () => {
        try {
            setLoading(true);
            if (!locationId) {
                console.error("No locationId provided");
                return;
            }

            const data = {
                list: [
                    {
                        location_id: locationId,
                        key: "offerta_accepted",
                        value: "true",
                    },
                ],
            };

            const response = await locationInfo?.Create(data);

            if (response?.status === 200 || response?.status === 201) {
                onAgree?.();
                redirectUser(); // ✅ сразу перенаправляем пользователя
            }
        } catch (error) {
            console.log("Error submitting offerta agreement:", error);
        } finally {
            setLoading(false);
        }
    };

    // Если модал закрыт — не показываем
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
                {/* HEADER */}
                <div className="bg-[#1366d6] text-white px-5 py-3">
                    <h2 className="text-lg font-medium">Пользовательское соглашение</h2>
                </div>

                {/* BODY */}
                <div className="p-5 overflow-y-auto max-h-[60vh] text-gray-700 text-sm space-y-3">
                    <h3 className="font-semibold text-base">Договор-оферта</h3>
                    <p>
                        Настоящее соглашение регулирует условия использования системы
                        Kenwood. Продолжая использование, вы соглашаетесь с условиями
                        настоящего договора.
                    </p>
                    <p>
                        Используя систему, вы подтверждаете, что предоставленные данные
                        являются достоверными, и несёте ответственность за их правильность.
                    </p>
                    <h4 className="font-semibold">1. Общие положения</h4>
                    <p>
                        Система предназначена для автоматизации складских операций и
                        управления процессами.
                    </p>
                    <h4 className="font-semibold">2. Конфиденциальность</h4>
                    <p>
                        Вся информация, введённая пользователем, защищена и не
                        распространяется третьим лицам без согласия пользователя.
                    </p>
                    <h4 className="font-semibold">3. Заключительные положения</h4>
                    <p>
                        Принимая соглашение, пользователь подтверждает своё согласие со
                        всеми условиями и положениями данного документа.
                    </p>

                    <label className="flex items-start gap-2 mt-4">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 accent-[#1366d6]"
                        />
                        <span>
                            Я прочитал и согласен с условиями пользовательского соглашения.
                        </span>
                    </label>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleAgree}
                        disabled={!agreed || loading}
                        className="px-4 py-2 bg-[#1366d6] text-white rounded-md hover:bg-[#0f59be] disabled:bg-blue-300 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Отправка...</span>
                            </>
                        ) : (
                            <span>Согласен и продолжить</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}