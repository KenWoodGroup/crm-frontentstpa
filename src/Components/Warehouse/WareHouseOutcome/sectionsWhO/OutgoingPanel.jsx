import { useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import Spinner from "../../../UI/spinner/Spinner";

const OutgoingPanel = ({ receiverLocations, staffs, selectStaff, selectedStaff, isLoading, selectOprType, selectStatus, selectReceiver, startOperation, selectedReceiver }) => {
    const [operationType, setOperationType] = useState("outgoing");
    const [status, setStatus] = useState("draft");
    // const [receiver, setReceiver] = useState(null);


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

    const typeOptions = [
        { value: "outgoing", label: "Отгрузка (Klientlarga)" },
        { value: "transfer_out", label: "Перемещение (Boshqa omborga)" },
        { value: "disposal", label: "Diposal" }
    ];

    const statusOptions = [
        { value: "draft", label: "Черновик" },
        // { value: "approved", label: "Подтверждено" },
        { value: "sent", label: "Отправлено" },
        { value: "received", label: "Получено" },
    ];

    const receiverOptions = receiverLocations?.map((loc) => ({
        value: loc.id,
        label: loc.name,
        type: loc.type
    })
    )
    const staffOptions = staffs?.map((loc) => ({
        value: loc.id,
        label: loc.full_name,
    })
    )
    
    const changeReceiver = (value) => {
        // setReceiver(value);
        selectReceiver(value);
    };
    const changeOprSatatus = (value) => {
        setStatus(value);
        selectStatus(value)
    };
    const changeOprType = (value) => {
        setOperationType(value);
        selectOprType(value);
        if (value === "disposal") {
            const disposal = receiverOptions?.find((op) => op.type === "disposal");
            changeReceiver(disposal?.value);
            changeOprSatatus("received")
        } else {
            selectReceiver(null)
            changeOprSatatus("draft")
        }
    };

    const activeLabel = comboLabels[`${status}_${operationType}`];

    return (
        <motion.div
            className="w-full max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <fieldset className="border border-gray-300 rounded-xl p-5">
                <legend className="px-3 text-lg font-semibold text-gray-700">
                    📦 Отгрузка / Перемещение
                </legend>

                {/* Operation Type */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Тип операции:
                    </label>
                    <Select
                        options={typeOptions}
                        value={typeOptions.find(t => t.value === operationType)}
                        onChange={opt => changeOprType(opt.value)}
                        className="text-sm"
                        styles={{
                            control: base => ({
                                ...base,
                                borderRadius: "0.75rem",
                                borderColor: "#d1d5db",
                                padding: "2px",
                            }),
                        }}
                    />
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Статус:
                    </label>
                    <Select
                        options={operationType === "disposal" ? statusOptions.filter((st)=> st.value === "received") :statusOptions.filter((st)=> st.value !== "received")}
                        value={statusOptions.find(s => s.value === status)}
                        onChange={opt => changeOprSatatus(opt.value)}
                        className="text-sm"
                    />
                </div>

                {/* Receiver */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Получатель:
                    </label>
                    <Select
                        options={receiverOptions.filter(r =>
                            operationType === "outgoing"
                                ? r.type === "client" || r.type === "dealer"
                                : operationType === "transfer_out" ? r.type === "warehouse"
                                    : r.type === "disposal"
                        )}
                        value={selectedReceiver ? receiverOptions?.find((loc) => loc.value === selectedReceiver) : null}
                        onChange={opt => changeReceiver(opt.value)}
                        isSearchable
                        placeholder="Выберите..."
                        className="text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        Driver:
                    </label>
                    <Select
                        options={staffOptions}
                        value={staffOptions?.find((loc) => loc.value === selectedStaff)}
                        onChange={opt => selectStaff(opt.value)}
                        isSearchable
                        placeholder="Выберите получателя..."
                        className="text-sm"
                    />
                </div>

                {/* Summary */}
                <motion.div
                    className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center"
                    whileHover={{ scale: 1.02 }}
                >
                    <p className="text-gray-700 font-semibold text-base">
                        {activeLabel?.ru}
                    </p>
                </motion.div>

                {/* Start Button */}
                <div className="mt-6 flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-5 rounded-xl transition-all flex gap-2 items-center"
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
