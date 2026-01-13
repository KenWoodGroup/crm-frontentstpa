import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Spinner, Typography } from "@material-tailwind/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";

export default function FactoryProductExelModal({ id, refresh }) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(!open);
        // Сброс данных при закрытии/открытии модалки
        if (!open) {
            setFile(null);
            setUploadResult(null);
            setLoading(false);
        }
    };

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const uploadExel = async () => {
        if (!file) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await LocalProduct.CreateProductExelProduct(
                Cookies.get("ul_nesw"),
                formData
            );

            // Сохраняем результат для отображения
            setUploadResult(response?.data);
            setFile(null);

            // Не закрываем модалку, показываем результаты
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

        const createdCount = uploadResult.created?.length || 0;
        const skippedCount = uploadResult.skipped?.length || 0;
        const totalCount = createdCount + skippedCount;

        return `${t("ExelTotalProduct")}: ${totalCount}\n${t("ExelSuccessCreated")}: ${createdCount}\n${t("ExelSiped")}: ${skippedCount}`;
    };

    const getSkippedProductNames = () => {
        if (!uploadResult?.skipped || uploadResult.skipped.length === 0) return [];
        return uploadResult.skipped.map(item => item.row.name);
    };

    const getCreatedProductNames = () => {
        if (!uploadResult?.created || uploadResult.created.length === 0) return [];
        return uploadResult.created.map(item => item.name);
    };

    return (
        <>
            <Button color="blue" onClick={handleOpen}>
                {t("Exel")}
            </Button>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
                open={open}
                handler={handleOpen}
                size={uploadResult ? "lg" : "md"}
            >
                <DialogHeader className="text-lg dark:text-text-dark font-semibold border-b border-gray-200 dark:border-gray-700 pb-4 bg-card-light dark:bg-card-dark rounded-t-xl">
                    {uploadResult ? t("uploadSkipeTitle") : t("uploadExelTitle")}
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    {!uploadResult ? (
                        // Форма загрузки
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            label="Excel"
                            onChange={(e) => setFile(e.target.files[0])}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark`
                            }}
                        />
                    ) : (
                        // Результаты загрузки
                        <div className="space-y-6">
                            {/* Общая статистика */}
                            <div className="bg-blue-gray-50 dark:bg-blue-gray-900 p-4 rounded-lg">
                                <Typography variant="h6" className="mb-2 text-blue-gray-800 dark:text-blue-gray-200">
                                    {t("uploadSkipeSummaryTitle")}
                                </Typography>
                                <div className="whitespace-pre-line text-sm font-medium">
                                    {formatResultMessage()}
                                </div>
                            </div>

                            {/* Список созданных товаров */}
                            {getCreatedProductNames().length > 0 && (
                                <div className="border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <Typography variant="h6" className="mb-2 text-green-700 dark:text-green-300">
                                        {t("uploadSkipeSummarySucces")} ({getCreatedProductNames().length})
                                    </Typography>
                                    <div className="max-h-40 overflow-y-auto">
                                        {getCreatedProductNames().map((name, index) => (
                                            <div key={index} className="text-sm text-green-600 dark:text-green-400 py-1 border-b border-green-100 dark:border-green-900 last:border-0">
                                                ✅ {name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Список пропущенных товаров */}
                            {getSkippedProductNames().length > 0 && (
                                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                    <Typography variant="h6" className="mb-2 text-amber-700 dark:text-amber-300">
                                        {t("uploadSkipedProduct")} ({getSkippedProductNames().length})
                                    </Typography>
                                    <div className="max-h-40 overflow-y-auto">
                                        {getSkippedProductNames().map((name, index) => (
                                            <div key={index} className="text-sm text-amber-600 dark:text-amber-400 py-1 border-b border-amber-100 dark:border-amber-900 last:border-0">
                                                ⚠️ {name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {!uploadResult ? (
                        // Кнопки для загрузки
                        <>
                            <Button
                                variant="text"
                                color="red"
                                onClick={handleOpen}
                                className="mr-2"
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
                                {loading ? <Spinner className="w-5 h-5" /> : null}
                                {loading ? t("Uploading...") : t("Upload")}
                            </Button>
                        </>
                    ) : (
                        // Кнопка для закрытия после просмотра результатов
                        <Button
                            color="blue"
                            onClick={handleOpen}
                            className="w-full"
                        >
                            {t("Close")}
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </>
    );
}