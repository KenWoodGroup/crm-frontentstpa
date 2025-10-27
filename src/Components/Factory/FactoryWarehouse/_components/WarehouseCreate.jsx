import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import { useTranslation } from "react-i18next";

export default function WarehouseCreate({ refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        type: "warehouse",
        name: "",
        full_name: "",
        address: "",
        phone: "+998",
        email: "",
        parent_id: Cookies.get("ul_nesw"),
        password: "",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.name.trim()) return Alert(t("enterWarehouseName"), "warning");
        if (!data.full_name.trim()) return Alert(t("enterFullName"), "warning");
        if (!data.address.trim()) return Alert(t("enterAddress"), "warning");
        if (!data.phone.trim()) return Alert(t("enterPhone"), "warning");
        if (!data.email.trim()) return Alert(t("enterEmail"), "warning");
        if (!data.password.trim()) return Alert(t("enterPassword"), "warning");
        return true;
    };

    const CreateWarehouse = async () => {
        if (validateFields() !== true) return;

        try {
            setLoading(true);
            await WarehouseApi.CreateWarehouse(data);

            Alert(t("warehouseCreated"), "success");
            setOpen(false);
            setData({
                type: "warehouse",
                name: "",
                full_name: "",
                address: "",
                phone: "+998",
                email: "",
                password: "",
            });
            refresh();
        } catch (error) {
            console.error("Ошибка:", error);
            Alert(`${t("errorOccurred")} ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-black text-white normal-case hover:bg-gray-800"
            >
                + {t("newWarehouse")}
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                className="bg-white text-gray-900 rounded-xl"
            >
                <DialogHeader className="text-lg font-semibold border-b border-gray-200">
                    {t("warehouse_info")}
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label={t("warehouseName")}
                        color="gray"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                    />
                    <Input
                        label={t("managerName")}
                        color="gray"
                        name="full_name"
                        value={data.full_name}
                        onChange={handleChange}
                    />
                    <Input
                        label={t("warehouseAddress")}
                        color="gray"
                        name="address"
                        value={data.address}
                        onChange={handleChange}
                    />
                    <Input
                        label={t("managerPhone")}
                        color="gray"
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                    />
                    <Input
                        label={t("email")}
                        color="gray"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                    />
                    <Input
                        label={t("password")}
                        color="gray"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                    />
                </DialogBody>
                <DialogFooter className="border-t border-gray-200">
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2"
                        disabled={loading}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        className={`bg-black text-white normal-case hover:bg-gray-800 flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        onClick={CreateWarehouse}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                        ) : (
                            t("save")
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
