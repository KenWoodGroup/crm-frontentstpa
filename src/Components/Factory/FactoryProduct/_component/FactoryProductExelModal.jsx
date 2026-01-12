import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Spinner } from "@material-tailwind/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";

export default function FactoryProductExelModal({ id }) {

    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(!open);

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const uploadExel = async () => {
        if (!file) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            await LocalProduct.CreateProductExelProduct(Cookies.get("ul_nesw"),
                formData);

            handleOpen();
            setFile(null);
            Alert(t("success"), "success");

        } catch (error) {
            console.log(error);
            Alert(t("Error"), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button

                color="blue" onClick={handleOpen}>
                {t("Exel")}
            </Button>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
                open={open} handler={handleOpen}>
                <DialogHeader className="text-lg dark:text-text-dark font-semibold border-b border-gray-200 dark:border-gray-700 pb-4 bg-card-light dark:bg-card-dark rounded-t-xl">
                    {t("Upload Excel File")}</DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        type="file"
                        accept=".xlsx, .xls"
                        label="Choose Excel File"
                        onChange={(e) => setFile(e.target.files[0])}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                </DialogBody>

                <DialogFooter>
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
                </DialogFooter>
            </Dialog>
        </>
    );
}
