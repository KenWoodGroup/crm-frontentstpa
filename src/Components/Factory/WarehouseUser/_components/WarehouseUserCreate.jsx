import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import { UserApi } from "../../../../utils/Controllers/UserApi";
import { Alert } from "../../../../utils/Alert";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function WarehouseUserCreate({ refresh }) {
    const { id } = useParams();
    const [open, setOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("warehouse");
    const [loading, setLoading] = useState(false); // <-- добавлено
    const { t } = useTranslation();

    const handleOpen = () => setOpen(!open);

    const handleCreate = async () => {
        if (!fullName || !username || !password || !role) {
            return Alert("Iltimos, barcha maydonlarni to‘ldiring ❌", "error");
        }

        try {
            setLoading(true); // start loading

            await UserApi.UserCreate({
                location_id: id,
                full_name: fullName,
                username,
                password,
                role,
            });

            Alert(`${t("success")}`, "success");
            handleOpen();
            refresh();
        } catch (error) {
            console.log(error);
            Alert(`${t("Error")}`, "error");
        } finally {
            setLoading(false); // stop loading
        }
    };

    return (
        <>
            <Button color="blue" onClick={handleOpen}>
                + {t("Add")}
            </Button>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open}
                handler={handleOpen}
            >
                <DialogHeader className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark">
                    {t("Warehouse_user_create")}
                </DialogHeader>

                <DialogBody divider className="space-y-4">
                    <Input
                        label={t("Name")}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{ className: "!min-w-0" }}
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />

                    <Input
                        label={t("Login")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{ className: "!min-w-0" }}
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />

                    <Input
                        label={t("Password")}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{ className: "!min-w-0" }}
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />

                    <Select
                        label={t("Role")}
                        value={role}
                        onChange={(value) => setRole(value)}
                        className="text-gray-900 dark:text-text-dark outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark",
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark",
                        }}
                    >
                        <Option value="cashier">{t("Kassir")}</Option>
                        <Option value="warehouse">{t("Manager")}</Option>
                        <Option value="storekeeper">{t("Warehouser")}</Option>
                    </Select>
                </DialogBody>

                <DialogFooter>
                    <Button
                        className="text-text-light dark:text-text-dark"
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        disabled={loading}
                    >
                        {t("Cancel")}
                    </Button>

                    <Button color="blue" onClick={handleCreate} disabled={loading}>
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 mx-auto"
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
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                        ) : (
                            t("Save")
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
