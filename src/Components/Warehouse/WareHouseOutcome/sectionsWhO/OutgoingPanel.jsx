import { useState } from "react";
import { motion } from "framer-motion";
import Select, { components } from "react-select";
import Spinner from "../../../UI/spinner/Spinner";
import { customSelectStyles } from "../../WareHouseModals/ThemedReactTagsStyles";
import Cookies from "js-cookie";
import { ChevronDown, Plus } from "lucide-react";
import CarrierCreateModal from "../../WareHouseModals/CarrierCreateModal";
import { useTranslation } from "react-i18next";

const OutgoingPanel = ({ receiverLocations, getStaffs, staffs, selectStaff, selectedStaff, isLoading, selectOprType, selectStatus, selectReceiver, startOperation, selectedReceiver, role }) => {
    // Komponent ichida (funksiya scope) joylashtiring:
    const { t } = useTranslation();
    const access = Cookies.get("sedqwdqdqwd") === "terrwerwerw";

    const [operationType, setOperationType] = useState("outgoing");
    const [status, setStatus] = useState("draft");

    // translation-backed labels for combinations
    const comboLabels = {
        draft_outgoing: t("combo.draft_outgoing"),
        approved_outgoing: t("combo.approved_outgoing"),
        sent_outgoing: t("combo.sent_outgoing"),
        received_outgoing: t("combo.received_outgoing"),
        draft_transfer_out: t("combo.draft_transfer_out"),
        approved_transfer_out: t("combo.approved_transfer_out"),
        sent_transfer_out: t("combo.sent_transfer_out"),
        received_transfer_out: t("combo.received_transfer_out"),
    };

const typeOptions = [
    access && role === "factory"  && { value: "outgoing", label: t("type.outgoing_label") }, // Отгрузка (Klientlarga)
    { value: "transfer_out", label: t("type.transfer_out_label") },   // Перемещение (Boshqa omborga)
    { value: "disposal", label: t("type.disposal_label") },            // Disposal
].filter(Boolean);


    const statusOptions = [
        { value: "draft", label: t("status.draft") }, // Черновик
        { value: "sent", label: t("status.sent") },   // Отправлено
        { value: "received", label: t("status.received") }, // Получено
    ];

    const receiverOptions = receiverLocations?.map((loc) => ({
        value: loc.id,
        label: loc.name,
        type: loc.type,
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

    const activeLabel = comboLabels[`${status}_${operationType}`] || t("combo.unknown");

    // ---------- UI ----------
    const [carrierModalOpen, setCarrierModalOpen] = useState(false);

    // --- Custom DropdownIndicator ---
    const DropdownIndicator = (props) => {
        const { selectProps } = props;
        const { setCarrierModalOpen } = selectProps;

        return (
            <components.DropdownIndicator {...props}>
                <div className="flex items-center gap-1">
                    {/* Add new courier button */}
                    <div
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            document.activeElement.blur(); // react-select fokusni olib tashlaydi
                            setCarrierModalOpen(true);
                        }}
                        className="flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform cursor-pointer"
                        title={t("driver.add_new_title")}
                        aria-label={t("driver.add_new_aria")}
                    >
                        <Plus size={18} />
                    </div>

                    {/* Dropdown chevron */}
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>
            </components.DropdownIndicator>
        );
    };

    return (
        <motion.div
            className="w-full max-w-3xl mx-auto mt-10 
               bg-card-light dark:bg-card-dark 
               text-text-light dark:text-text-dark 
               shadow-lg rounded-2xl p-6 
               border border-gray-200 dark:border-gray-700 
               transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <fieldset className="border border-gray-300 dark:border-gray-600 rounded-xl p-5 transition-colors duration-300">
                <legend className="px-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
                    📦 {t("legend.title")}
                </legend>

                {/* Operation Type */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {t("label.operation_type")}
                    </label>
                    <Select
                        options={typeOptions}
                        value={typeOptions.find((topt) => topt.value === operationType)}
                        onChange={(opt) => changeOprType(opt.value)}
                        className="text-sm dark:text-gray-200"
                        styles={customSelectStyles()}
                        aria-label={t("aria.operation_type")}
                    />
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {t("label.status")}
                    </label>
                    <Select
                        options={
                            operationType === "disposal"
                                ? statusOptions.filter((st) => st.value === "received")
                                : statusOptions.filter((st) => st.value !== "received")
                        }
                        value={statusOptions.find((s) => s.value === status)}
                        onChange={(opt) => changeOprSatatus(opt.value)}
                        className="text-sm dark:text-gray-200"
                        styles={customSelectStyles()}
                        aria-label={t("aria.status")}
                    />
                </div>

                {/* Receiver */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {t("label.receiver")}
                    </label>
                    <Select
                        options={receiverOptions.filter((r) =>
                            operationType === "outgoing"
                                ? r.type === "client" || r.type === "dealer"
                                : operationType === "transfer_out"
                                    ? r.type === "warehouse"
                                    : r.type === "disposal"
                        )}
                        value={
                            selectedReceiver
                                ? receiverOptions?.find((loc) => loc.value === selectedReceiver)
                                : null
                        }
                        onChange={(opt) => changeReceiver(opt.value)}
                        isSearchable
                        placeholder={t("placeholder.choose")}
                        className="text-sm dark:text-gray-200"
                        styles={customSelectStyles()}
                        aria-label={t("aria.receiver")}
                    />
                </div>

                {/* Driver */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {t("label.driver")}
                    </label>
                    <>
                        <Select
                            options={staffOptions}
                            value={staffOptions?.find((loc) => loc.value === selectedStaff)}
                            onChange={(opt) => selectStaff(opt.value)}
                            isSearchable
                            components={{ DropdownIndicator }}
                            menuPlacement="auto"
                            fetchStaffs={getStaffs}
                            setCarrierModalOpen={setCarrierModalOpen}
                            placeholder={t("placeholder.choose_driver")}
                            className="text-sm dark:text-gray-200"
                            styles={customSelectStyles()}
                            aria-label={t("aria.driver")}
                        />
                        {carrierModalOpen && (
                            <CarrierCreateModal onClose={() => setCarrierModalOpen(false)} refresh={(id) => getStaffs(id, true)} />
                        )}
                    </>
                </div>

                {/* Summary */}
                <motion.div
                    className="mt-6 bg-gray-50 dark:bg-gray-800 
                   border border-gray-200 dark:border-gray-700 
                   rounded-xl p-4 text-center transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                >
                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-base">
                        {activeLabel || t("combo.unknown")}
                    </p>
                </motion.div>

                {/* Start Button */}
                <div className="mt-6 flex justify-end">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                     text-white font-medium py-2 px-5 rounded-xl 
                     transition-all flex gap-2 items-center"
                        onClick={startOperation}
                        aria-label={t("aria.start_operation")}
                    >
                        {isLoading && <Spinner />}
                        {t("button.start_operation")}
                    </motion.button>
                </div>
            </fieldset>
        </motion.div>
    );
};

export default OutgoingPanel;
