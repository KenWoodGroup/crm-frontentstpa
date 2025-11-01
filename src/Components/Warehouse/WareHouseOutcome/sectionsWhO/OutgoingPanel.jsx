import { useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import Spinner from "../../../UI/spinner/Spinner";
import Cookies from "js-cookie";

const OutgoingPanel = ({
    receiverLocations,
    staffs,
    selectStaff,
    selectedStaff,
    isLoading,
    selectOprType,
    selectStatus,
    selectReceiver,
    startOperation,
    selectedReceiver
}) => {

    // ✅ читаем значение доступа
    const accessValue = Cookies.get("sedqwdqdqwd");
    const hasAccess = accessValue === "terrwerwerw"; // true = разрешено
    const [operationType, setOperationType] = useState("outgoing");
    const [status, setStatus] = useState("draft");

    const comboLabels = {
        draft_outgoing: { ru: "Черновик отгрузки", uz: "Chiqim zayafkasini qoralab qo‘yish" },
        approved_outgoing: { ru: "Подтвержденная отгрузка", uz: "Chiqim zayafkasini tasdiqlash" },
        sent_outgoing: { ru: "Отправленная отгрузка", uz: "Chiqim jo‘natildi" },
        received_outgoing: { ru: "Полученная отгрузка", uz: "Jo‘natilgan tovar qabul qilindi" },
        draft_transfer_out: { ru: "Черновик перемещения", uz: "Ko‘chirish zayafkasini qoralab qo‘yish" },
        approved_transfer_out: { ru: "Подтвержденное перемещение", uz: "Ko‘chirish zayafkasini tasdiqlash" },
        sent_transfer_out: { ru: "Отправленное перемещение", uz: "Ko‘chirish jo‘natildi" },
        received_transfer_out: { ru: "Полученное перемещение", uz: "Ko‘chirilgan tovar qabul qilindi" },
    };

    // ✅ если нет доступа — исключаем “Отгрузка”
    const typeOptions = [
        hasAccess && { value: "outgoing", label: "Отгрузка (Klientlarga)" },
        { value: "transfer_out", label: "Перемещение (Boshqa omborga)" },
        { value: "disposal", label: "Diposal" }
    ].filter(Boolean);

    const statusOptions = [
        { value: "draft", label: "Черновик" },
        { value: "sent", label: "Отправлено" },
        { value: "received", label: "Получено" },
    ];

    const receiverOptions = receiverLocations?.map((loc) => ({
        value: loc.id,
        label: loc.name,
        type: loc.type
    }));

    const staffOptions = staffs?.map((loc) => ({
        value: loc.id,
        label: loc.full_name,
    }));

    const changeReceiver = (value) => {
        selectReceiver(value);
    };

    const changeOprSatatus = (value) => {
        setStatus(value);
        selectStatus(value);
    };

    const changeOprType = (value) => {
        setOperationType(value);
        selectOprType(value);

        if (value === "disposal") {
            const disposal = receiverOptions?.find((op) => op.type === "disposal");
            changeReceiver(disposal?.value);
            changeOprSatatus("received");
        } else {
            selectReceiver(null);
            changeOprSatatus("draft");
        }
    };

    const activeLabel = comboLabels[`${status}_${operationType}`];

    return (
        <motion.div
            className="w-full max-w-3xl mx-auto mt-10 bg-white dark:bg-card-dark shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <fieldset className="border border-gray-300 dark:border-gray-600 rounded-xl p-5 transition-colors duration-200">
                <legend className="px-3 text-lg font-semibold text-gray-700 dark:text-text-dark flex items-center gap-2 transition-colors duration-200">
                    📦 Отгрузка / Перемещение
                </legend>

                {/* Operation Type */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                        Тип операции:
                    </label>
                    <Select
                        options={typeOptions}
                        value={typeOptions.find(t => t.value === operationType)}
                        onChange={opt => changeOprType(opt.value)}
                        className="text-sm"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderRadius: "0.75rem",
                                borderColor: state.isFocused
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    borderColor: state.isFocused
                                        ? "#3b82f6"
                                        : "#9ca3af"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    borderColor: state.isFocused
                                        ? "#60a5fa"
                                        : "#4b5563",
                                    color: "#f9fafb",
                                    "&:hover": {
                                        borderColor: state.isFocused
                                            ? "#60a5fa"
                                            : "#6b7280"
                                    }
                                }
                            }),
                            menu: base => ({
                                ...base,
                                borderRadius: "0.75rem",
                                backgroundColor: "#ffffff",
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    border: "1px solid #4b5563"
                                }
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                        ? "#f3f4f6"
                                        : "#ffffff",
                                color: state.isSelected ? "#ffffff" : "#1f2937",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: state.isSelected
                                        ? "#2563eb"
                                        : state.isFocused
                                            ? "#4b5563"
                                            : "#374151",
                                    color: state.isSelected ? "#ffffff" : "#f9fafb",
                                    "&:hover": {
                                        backgroundColor: "#4b5563"
                                    }
                                }
                            }),
                            singleValue: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            input: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            placeholder: base => ({
                                ...base,
                                color: "#9ca3af",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#9ca3af"
                                }
                            })
                        }}
                    />
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                        Статус:
                    </label>
                    <Select
                        options={
                            operationType === "disposal"
                                ? statusOptions.filter(st => st.value === "received")
                                : statusOptions.filter(st => st.value !== "received")
                        }
                        value={statusOptions.find(s => s.value === status)}
                        onChange={opt => changeOprSatatus(opt.value)}
                        className="text-sm"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderRadius: "0.75rem",
                                borderColor: state.isFocused
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    borderColor: state.isFocused
                                        ? "#3b82f6"
                                        : "#9ca3af"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    borderColor: state.isFocused
                                        ? "#60a5fa"
                                        : "#4b5563",
                                    color: "#f9fafb",
                                    "&:hover": {
                                        borderColor: state.isFocused
                                            ? "#60a5fa"
                                            : "#6b7280"
                                    }
                                }
                            }),
                            menu: base => ({
                                ...base,
                                borderRadius: "0.75rem",
                                backgroundColor: "#ffffff",
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    border: "1px solid #4b5563"
                                }
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                        ? "#f3f4f6"
                                        : "#ffffff",
                                color: state.isSelected ? "#ffffff" : "#1f2937",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: state.isSelected
                                        ? "#2563eb"
                                        : state.isFocused
                                            ? "#4b5563"
                                            : "#374151",
                                    color: state.isSelected ? "#ffffff" : "#f9fafb",
                                    "&:hover": {
                                        backgroundColor: "#4b5563"
                                    }
                                }
                            }),
                            singleValue: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            input: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            placeholder: base => ({
                                ...base,
                                color: "#9ca3af",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#9ca3af"
                                }
                            })
                        }}
                    />
                </div>

                {/* Receiver */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                        Получатель:
                    </label>
                    <Select
                        options={receiverOptions.filter(r =>
                            operationType === "outgoing"
                                ? r.type === "client" || r.type === "dealer"
                                : operationType === "transfer_out"
                                    ? r.type === "warehouse"
                                    : r.type === "disposal"
                        )}
                        value={
                            selectedReceiver
                                ? receiverOptions?.find(loc => loc.value === selectedReceiver)
                                : null
                        }
                        onChange={opt => changeReceiver(opt.value)}
                        isSearchable
                        placeholder="Выберите..."
                        className="text-sm"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderRadius: "0.75rem",
                                borderColor: state.isFocused
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    borderColor: state.isFocused
                                        ? "#3b82f6"
                                        : "#9ca3af"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    borderColor: state.isFocused
                                        ? "#60a5fa"
                                        : "#4b5563",
                                    color: "#f9fafb",
                                    "&:hover": {
                                        borderColor: state.isFocused
                                            ? "#60a5fa"
                                            : "#6b7280"
                                    }
                                }
                            }),
                            menu: base => ({
                                ...base,
                                borderRadius: "0.75rem",
                                backgroundColor: "#ffffff",
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    border: "1px solid #4b5563"
                                }
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                        ? "#f3f4f6"
                                        : "#ffffff",
                                color: state.isSelected ? "#ffffff" : "#1f2937",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: state.isSelected
                                        ? "#2563eb"
                                        : state.isFocused
                                            ? "#4b5563"
                                            : "#374151",
                                    color: state.isSelected ? "#ffffff" : "#f9fafb",
                                    "&:hover": {
                                        backgroundColor: "#4b5563"
                                    }
                                }
                            }),
                            singleValue: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            input: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            placeholder: base => ({
                                ...base,
                                color: "#9ca3af",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#9ca3af"
                                }
                            })
                        }}
                    />
                </div>

                {/* Driver */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-200">
                        Водитель:
                    </label>
                    <Select
                        options={staffOptions}
                        value={staffOptions?.find(loc => loc.value === selectedStaff)}
                        onChange={opt => selectStaff(opt.value)}
                        isSearchable
                        placeholder="Выберите водителя..."
                        className="text-sm"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderRadius: "0.75rem",
                                borderColor: state.isFocused
                                    ? "#3b82f6"
                                    : "#d1d5db",
                                backgroundColor: "#ffffff",
                                "&:hover": {
                                    borderColor: state.isFocused
                                        ? "#3b82f6"
                                        : "#9ca3af"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    borderColor: state.isFocused
                                        ? "#60a5fa"
                                        : "#4b5563",
                                    color: "#f9fafb",
                                    "&:hover": {
                                        borderColor: state.isFocused
                                            ? "#60a5fa"
                                            : "#6b7280"
                                    }
                                }
                            }),
                            menu: base => ({
                                ...base,
                                borderRadius: "0.75rem",
                                backgroundColor: "#ffffff",
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "#374151",
                                    border: "1px solid #4b5563"
                                }
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                        ? "#f3f4f6"
                                        : "#ffffff",
                                color: state.isSelected ? "#ffffff" : "#1f2937",
                                "&:hover": {
                                    backgroundColor: "#f3f4f6"
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: state.isSelected
                                        ? "#2563eb"
                                        : state.isFocused
                                            ? "#4b5563"
                                            : "#374151",
                                    color: state.isSelected ? "#ffffff" : "#f9fafb",
                                    "&:hover": {
                                        backgroundColor: "#4b5563"
                                    }
                                }
                            }),
                            singleValue: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            input: base => ({
                                ...base,
                                color: "#1f2937",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#f9fafb"
                                }
                            }),
                            placeholder: base => ({
                                ...base,
                                color: "#9ca3af",
                                "@media (prefers-color-scheme: dark)": {
                                    color: "#9ca3af"
                                }
                            })
                        }}
                    />
                </div>

                {/* Summary */}
                <motion.div
                    className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                >
                    <p className="text-gray-700 dark:text-text-dark font-semibold text-base transition-colors duration-200">
                        {activeLabel?.ru}
                    </p>
                </motion.div>

                {/* Start Button */}
                <div className="mt-6 flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 dark:active:bg-blue-500 text-white font-medium py-2 px-5 rounded-xl transition-all flex gap-2 items-center transition-colors duration-200"
                        onClick={startOperation}
                    >
                        {isLoading && <Spinner />}
                        Начать операцию
                    </motion.button>
                </div>
            </fieldset>
        </motion.div>
    );
};

export default OutgoingPanel;
