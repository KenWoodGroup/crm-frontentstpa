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

    const fileInputRef = useRef(null);
    const [createdInvoiceId, setCreatedInvoiceId] = useState(null);

    // Fetch Partners
    const GetPartner = async () => {
        try {
            const response = await Partner.GetAllPartner(facId);
            setPartners(response?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const GetWarehouse = async

    // === CREATE INVOICE ===
    const createInvoice = async () => {
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
                console.log("invoice id topilmadi");
                return;
            }

            setCreatedInvoiceId(invoiceId);

            // Open file picker automatically
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }

        } catch (error) {
            console.log(error);
            Alert("Xato invoice yaratishda", "error");
        }
    };

    // === UPLOAD EXCEL ===
    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!createdInvoiceId) {
            console.log("Invoice ID yo'q");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            await InvoicesApi.UploadExel(createdInvoiceId, formData);
            console.log("Excel yuklandi");
            Alert("Yaratildi", "success");

            // ⬇️ Очистка формы после успешной загрузки
            setSenderId("");
            setNote("");
            setCreatedInvoiceId(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = null; // сброс выбранного файла
            }

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
            <Card className="shadow-lg rounded-xl">
                <CardBody className="space-y-6">

                    <Typography variant="h5" className="font-semibold">
                        Invoice yaratish
                    </Typography>

                    {/* Sender Select */}
                    <div className="space-y-1">
                        <Typography variant="small">
                            Yuboruvchi
                        </Typography>

                        <select
                            value={senderId}
                            onChange={(e) => setSenderId(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl p-3 bg-white shadow-sm
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            <option value="">Tanlang</option>
                            {partners.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Note */}
                    <Input
                        label="Izoh"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <Button color="blue" fullWidth onClick={createInvoice}>
                        Invoice yaratish
                    </Button>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleExcelUpload}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
