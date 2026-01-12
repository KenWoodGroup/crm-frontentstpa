import { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Switch,
} from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Regions from "../../../../utils/Regions/regions.json";
import Districts from "../../../../utils/Regions/districts.json";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";

export default function WarehouseCreate({ refresh, Allowed }) {
    const { id } = useParams(); // factory / location id
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isMaterial, setIsMaterial] = useState(false);

    const initialData = {
        name: "",
        username: "",
        full_name: "",
        phone: "+998",
        password: "",
        confirm_password: "",
        region_id: "",
        district_id: "",
    };

    const [data, setData] = useState(initialData);

    /* ================= helpers ================= */

    const getDistrictsByRegion = (regionId) => {
        if (!regionId) return [];
        return Districts.filter(
            (d) => d.region_id === parseInt(regionId)
        );
    };

    const handleOpen = () => {
        setOpen(!open);
        setErrors({});
        setIsMaterial(false);
        setData(initialData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let val = value;
        if (name === "phone") {
            val = value.replace(/[^\d+]/g, "");
        }

        setData((prev) => ({ ...prev, [name]: val }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setData((prev) => ({
            ...prev,
            region_id: value,
            district_id: "",
        }));

        if (errors.region_id) {
            setErrors((prev) => ({ ...prev, region_id: "" }));
        }
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setData((prev) => ({
            ...prev,
            district_id: value,
        }));

        if (errors.district_id) {
            setErrors((prev) => ({ ...prev, district_id: "" }));
        }
    };

    /* ================= validation ================= */

    const validateFields = () => {
        const newErrors = {};

        if (!data.name.trim())
            newErrors.name = t("Field_required", { field: t("Warehouse_name") });

        if (!data.username.trim())
            newErrors.username = t("Field_required", { field: t("Warehouse_login") });

        if (!data.full_name.trim())
            newErrors.full_name = t("Field_required", { field: t("Warehouse_owner_name") });

        if (!data.phone.trim())
            newErrors.phone = t("Field_required", { field: t("Phone_number") });
        else if (!/^\+998\d{9}$/.test(data.phone))
            newErrors.phone = t("Phone_format_error");

        if (!data.password.trim())
            newErrors.password = t("Field_required", { field: t("Password") });
        else if (data.password.length < 6)
            newErrors.password = t("Password_min_error");

        if (!data.confirm_password.trim())
            newErrors.confirm_password = t("Field_required", { field: t("Confirm_password") });
        else if (data.password !== data.confirm_password)
            newErrors.confirm_password = t("Passwords_not_match");

        if (!data.region_id)
            newErrors.region_id = t("Field_required", { field: t("Region") });

        if (!data.district_id)
            newErrors.district_id = t("Field_required", { field: t("District") });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ================= API ================= */

    const setMaterialWarehouse = async (warehouseId) => {
        const body = {
            location_id: warehouseId,
            key: "material",
            value: id,
        };

        await locationInfo.PostMaterialWarehouse(body);
    };

    const createWarehouse = async () => {
        if (!validateFields()) return;

        try {
            setLoading(true);

            const region = Regions.find(
                (r) => r.id === parseInt(data.region_id)
            );
            const district = Districts.find(
                (d) => d.id === parseInt(data.district_id)
            );

            const payload = {
                name: data.name,
                username: data.username,
                full_name: data.full_name,
                phone: data.phone,
                password: data.password,
                type: "warehouse",
                address: `${region?.name_uz || ""}, ${district?.name_uz || ""}`,
                parent_id: id,
            };

            const res = await WarehouseApi.CreateWarehouse(payload);
            const warehouseId = res?.data?.id;

            if (isMaterial && warehouseId) {
                await setMaterialWarehouse(warehouseId);
            }

            Alert(t("success"), "success");
            handleOpen();
            refresh();
        } catch (error) {
            Alert(
                error?.response?.data?.message || error.message,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const availableDistricts = getDistrictsByRegion(data.region_id);

    /* ================= UI ================= */

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-blue-600 text-white hover:bg-blue-700"
            >
                {t("New_Warehouse")}
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark"
            >
                <DialogHeader>{t("Create_Warehouse")}</DialogHeader>

                <DialogBody divider className="space-y-4 h-[500px] overflow-y-auto">

                    <Input label={t("Warehouse_name")} name="name" value={data.name} onChange={handleChange} error={!!errors.name} />
                    <Input label={t("Warehouse_login")} name="username" value={data.username} onChange={handleChange} error={!!errors.username} />
                    <Input label={t("Warehouse_owner_name")} name="full_name" value={data.full_name} onChange={handleChange} error={!!errors.full_name} />
                    <Input label={t("Phone_number")} name="phone" value={data.phone} onChange={handleChange} error={!!errors.phone} />
                    <Input label={t("Password")} type="password" name="password" value={data.password} onChange={handleChange} error={!!errors.password} />
                    <Input label={t("Confirm_password")} type="password" name="confirm_password" value={data.confirm_password} onChange={handleChange} error={!!errors.confirm_password} />

                    <select
                        value={data.region_id}
                        onChange={handleRegionChange}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">{t("Select_region")}</option>
                        {Regions.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name_uz}
                            </option>
                        ))}
                    </select>

                    <select
                        value={data.district_id}
                        onChange={handleDistrictChange}
                        disabled={!data.region_id}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">{t("Select_district")}</option>
                        {availableDistricts.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name_uz}
                            </option>
                        ))}
                    </select>

                    {/* SWITCH ТОЛЬКО ЕСЛИ Allowed === true */}
                    {Allowed && (
                        <Switch
                            checked={isMaterial}
                            onChange={(e) => setIsMaterial(e.target.checked)}
                            label="Сделать материальным складом"
                            className="checked:bg-blue-600"
                        />
                    )}

                </DialogBody>

                <DialogFooter>
                    <Button variant="text" onClick={handleOpen}>
                        {t("Cancel")}
                    </Button>
                    <Button onClick={createWarehouse} disabled={loading}>
                        {loading ? t("Saving") : t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
