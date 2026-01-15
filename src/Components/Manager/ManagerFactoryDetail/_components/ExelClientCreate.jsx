import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Spinner,
    Typography
} from "@material-tailwind/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "../../../../utils/Alert";
import { ClientsApi } from "../../../../utils/Controllers/ClientsApi";
import { useParams } from "react-router-dom";

export default function ExelClientCreate({ refresh }) {
    const { t } = useTranslation();
    const { id } = useParams()

    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const handleOpen = () => {
        setOpen(!open);
        if (open) {
            setFile(null);
            setUploadResult(null);
            setLoading(false);
        }
    };

    const uploadExel = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await ClientsApi.ExelClientUpload(
                id,
                formData
            );
            setUploadResult(response.data?.details);
            Alert(t("success"), "success");
            refresh();
        } catch (error) {
            console.log(error);
            Alert(t("Error"), "error");
        } finally {
            setLoading(false);
        }
    };

    const formatResultMessage = () => {
        if (!uploadResult) return "";

        return `${t("ExelTotalProduct")}: ${uploadResult.total}
${t("ExelSuccessCreated")}: ${uploadResult.created}
${t("ExelSiped")}: ${uploadResult.skipped}`;
    };

    const getCreatedClients = () => {
        // Получаем массив created и извлекаем поле row из каждого элемента
        return uploadResult?.details?.created?.map(item => item?.row) || [];
    };

    const getSkippedClients = () => {
        // Получаем массив skipped и структурируем данные
        return uploadResult?.details?.skipped?.map(item => ({
            row: item?.row,
            reason: item?.reason
        })) || [];
    };

    return (
        <>
            <Button color="blue" onClick={handleOpen}>
                {t("Exel")}
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                size={uploadResult ? "lg" : "md"}
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl"
            >
                <DialogHeader className="border-b pb-4">
                    {uploadResult ? t("uploadSkipeTitle") : t("uploadExelTitle")}
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    {!uploadResult ? (
                        <Input
                            type="file"
                            accept=".xlsx,.xls"
                            label="Excel"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* SUMMARY */}
                            <div className="bg-blue-gray-50 dark:bg-blue-gray-900 p-4 rounded-lg">
                                <Typography variant="h6" className="mb-2">
                                    {t("uploadSkipeSummaryTitle")}
                                </Typography>
                                <div className="whitespace-pre-line text-sm font-medium">
                                    {formatResultMessage()}
                                </div>
                            </div>

                            {/* CREATED */}
                            {getCreatedClients().length > 0 && (
                                <div className="border border-green-300 rounded-lg p-4">
                                    <Typography variant="h6" className="mb-2 text-green-600">
                                        {t("uploadSkipeSummarySucces")} ({getCreatedClients().length})
                                    </Typography>

                                    <div className="max-h-40 overflow-y-auto">
                                        {getCreatedClients().map((item, index) => (
                                            <div
                                                key={index}
                                                className="text-sm text-green-600 py-1 border-b last:border-0"
                                            >
                                                ✅ {item?.name || `Client ${index + 1}`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SKIPPED */}
                            {getSkippedClients().length > 0 && (
                                <div className="border border-amber-300 rounded-lg p-4">
                                    <Typography variant="h6" className="mb-2 text-amber-600">
                                        {t("uploadSkipedProduct")} ({getSkippedClients().length})
                                    </Typography>

                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {getSkippedClients().map((item, index) => (
                                            <div
                                                key={index}
                                                className="text-sm text-amber-700 border-b last:border-0 pb-2"
                                            >
                                                ⚠️ <b>{item?.row?.name || `Client ${index + 1}`}</b>
                                                <div className="text-xs opacity-80 mt-1">
                                                    {item?.reason || t("Unknown reason")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="border-t pt-4">
                    {!uploadResult ? (
                        <>
                            <Button
                                variant="text"
                                color="red"
                                onClick={handleOpen}
                                disabled={loading}
                            >
                                {t("Cancel")}
                            </Button>

                            <Button
                                color="blue"
                                onClick={uploadExel}
                                disabled={!file || loading}
                                className="flex items-center gap-2"
                            >
                                {loading && <Spinner className="w-5 h-5" />}
                                {loading ? t("Uploading...") : t("Upload")}
                            </Button>
                        </>
                    ) : (
                        <Button color="blue" onClick={handleOpen} className="w-full">
                            {t("Close")}
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </>
    );
}