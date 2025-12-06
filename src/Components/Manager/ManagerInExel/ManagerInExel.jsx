import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Partner } from "../../../utils/Controllers/Partner";
import { InvoicesApi } from "../../../utils/Controllers/invoices";
import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../utils/Alert";

export default function ManagerInExel() {
    const { facId, warId } = useParams();

    const [partners, setPartners] = useState([]);
    const [senderId, setSenderId] = useState("");
    const [note, setNote] = useState("");
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null);

    const fileInputRef = useRef(null);

    // Fetch Partners
    const GetPartner = async () => {
        try {
            const response = await Partner.GetAllPartner(facId);
            setPartners(response?.data || []);
        } catch (error) {
            console.log("Xatolik partnerlarni olishda:", error);
        }
    };

    // === CREATE INVOICE ===
    const createInvoice = async () => {
        if (!senderId) {
            Alert("Iltimos, yuboruvchini tanlang", "error");
            return;
        }

        const data = {
            type: "incoming",
            sender_id: senderId,
            receiver_id: warId,
            status: "received",
            note,
            created_by: Cookies?.get("us_nesw"),
        };

        try {
            const response = await InvoicesApi.CreateInvoice(data);
            const invoiceId = response?.data?.invoice?.id;

            if (!invoiceId) {
                Alert("Invoice ID topilmadi", "error");
                return;
            }

            setCreatedInvoiceId(invoiceId);
        } catch (error) {
            console.log(error);
            Alert("Xato invoice yaratishda", "error");
        }
    };

    // === UPLOAD EXCEL ===
    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !createdInvoiceId) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await InvoicesApi.UploadExel(createdInvoiceId, formData);
            Alert("Excel muvaffaqiyatli yuklandi", "success");

            // Сброс состояния после успешной загрузки
            setSenderId("");
            setNote("");
            setCreatedInvoiceId(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (error) {
            console.log(error);
            Alert("Xato Excel yuklashda", "error");
        }
    };

    useEffect(() => {
        GetPartner();
    }, []);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* === Step 1: Создание Invoice === */}
            {!createdInvoiceId && (
                <Card className="shadow-lg rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-gray-700">
                    <CardBody className="space-y-6">
                        <Typography variant="h5" className="font-semibold text-gray-900 dark:text-gray-100">
                            Invoice yaratish
                        </Typography>

                        <div className="space-y-1">
                            <Typography variant="small" className="text-gray-700 dark:text-gray-300">
                                Yuboruvchi
                            </Typography>
                            <select
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-[#2A2A2F] text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <option value="">Tanlang</option>
                                {partners.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Izoh"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="bg-white dark:bg-[#2A2A2F] text-gray-900 dark:text-gray-100"
                        />

                        <Button color="blue" fullWidth onClick={createInvoice}>
                            Invoice yaratish
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* === Step 2: Загрузка Excel === */}
            {createdInvoiceId && (
                <Card className="shadow-lg rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-gray-700">
                    <CardBody className="space-y-6">
                        <Typography variant="h5" className="font-semibold text-gray-900 dark:text-gray-100">
                            Excel yuklash
                        </Typography>

                        <Typography variant="small" className="text-gray-700 dark:text-gray-300">
                            Invoice ID: {createdInvoiceId}
                        </Typography>

                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            onChange={handleExcelUpload}
                            className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
