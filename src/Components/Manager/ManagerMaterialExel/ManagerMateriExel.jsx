import { useNavigate, useParams } from "react-router-dom";
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

export default function ManagerMateriExel() {
    const { facId, warId } = useParams();

    const [partners, setPartners] = useState([]);
    const [senderId, setSenderId] = useState("");
    const [note, setNote] = useState("");
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
    const navigate = useNavigate()

    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);

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
            setLoadingCreate(true);

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
        } finally {
            setLoadingCreate(false);
        }
    };

    // === SAVE FILE ONLY (NO UPLOAD) ===
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    // === UPLOAD FILE BY BUTTON CLICK ===
    const uploadExcelFile = async () => {
        if (!selectedFile) {
            Alert("Iltimos, fayl tanlang", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setLoadingUpload(true);

            await InvoicesApi.UploadExelMaterial(createdInvoiceId, formData);
            Alert("Excel muvaffaqiyatli yuklandi", "success");

            // Reset states
            setSenderId("");
            setNote("");
            setCreatedInvoiceId(null);
            setSelectedFile(null);

            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (error) {
            console.log(error);
            Alert("Xato Excel yuklashda", "error");
        } finally {
            setLoadingUpload(false);
        }
    };

    useEffect(() => {
        GetPartner();
    }, []);

    return (
        <>
          <div >
                <Button onClick={() => navigate(-1)} className="p-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </Button>
            </div>
        <div className="p-6 max-w-3xl mx-auto">
          
            {/* === Step 1: CREATE INVOICE === */}
            {!createdInvoiceId && (
                <Card className="shadow-lg rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-gray-700">
                    <CardBody className="space-y-6">
                        <Typography variant="h5" className="font-semibold text-gray-900 dark:text-gray-100">
                            Invoice yaratish Materialar uchun
                        </Typography>

                        <div className="space-y-1">
                            <Typography variant="small" className="text-gray-700 dark:text-gray-300">
                                Yuboruvchi
                            </Typography>
                            <select
                                value={senderId}
                                onChange={(e) => setSenderId(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-[#2A2A2F] text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
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
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark  `
                            }}
                        />

                        <Button
                            color="blue"
                            fullWidth
                            onClick={createInvoice}
                            disabled={loadingCreate}
                        >
                            {loadingCreate ? "Yaratilmoqda..." : "Fayl yuklash"}
                        </Button>
                    </CardBody>
                </Card>
            )}

            {/* === Step 2: UPLOAD EXCEL === */}
            {createdInvoiceId && (
                <Card className="shadow-lg rounded-xl bg-white dark:bg-[#1E1E22] border border-gray-200 dark:border-gray-700 mt-6">
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
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-900 dark:text-gray-100 
                                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                                file:text-sm file:font-semibold file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700"
                        />

                        {selectedFile && (
                            <Button
                                color="green"
                                fullWidth
                                onClick={uploadExcelFile}
                                disabled={loadingUpload}
                            >
                                {loadingUpload ? "Yuklanmoqda..." : "Yuklash"}
                            </Button>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
        </>
    );
}
