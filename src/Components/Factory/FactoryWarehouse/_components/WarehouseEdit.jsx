import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Regions from "../../../../utils/Regions/regions.json";
import Districts from "../../../../utils/Regions/districts.json";
import { useTranslation } from "react-i18next";

export default function WarehouseEdit({ warehouse, refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouseId, setWarehouseId] = useState("");
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        name: "",
        phone: "",
        password: "",
        region_id: "",
        district_id: "",
    });

    // Разбор адреса "Район, Регион"
    const parseAddress = (address) => {
        if (!address) return { region_id: "", district_id: "" };
        const parts = address.split(', ');
        if (parts.length !== 2) return { region_id: "", district_id: "" };
        const [districtName, regionName] = parts;

        const region = Regions.find(r =>
            r.name_uz === regionName ||
            r.name_ru === regionName ||
            r.name_oz === regionName
        );

        const district = Districts.find(d =>
            (d.name_uz === districtName || d.name_ru === districtName || d.name_oz === districtName) &&
            d.region_id === region?.id
        );

        return {
            region_id: region?.id?.toString() || "",
            district_id: district?.id?.toString() || ""
        };
    };

    useEffect(() => {
        if (warehouse) {
            const addressParts = parseAddress(warehouse.address);
            setData({
                name: warehouse.name || "",
                phone: warehouse.phone || "",
                password: "",
                region_id: addressParts.region_id,
                district_id: addressParts.district_id,
            });
            setWarehouseId(warehouse?.id);
        }
    }, [warehouse]);

    // Получение районов выбранного региона
    const getDistrictsByRegion = (regionId) => {
        if (!regionId) return [];
        return Districts.filter(d => d.region_id === parseInt(regionId));
    };

    const handleOpen = () => {
        setOpen(!open);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setData(prev => ({ ...prev, region_id: value, district_id: "" }));
        if (errors.region_id) setErrors(prev => ({ ...prev, region_id: "" }));
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setData(prev => ({ ...prev, district_id: value }));
        if (errors.district_id) setErrors(prev => ({ ...prev, district_id: "" }));
    };

    const validateFields = () => {
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = t("Field_required", { field: t("Warehouse_name") });
        if (!data.phone.trim()) newErrors.phone = t("Field_required", { field: t("Phone_number") });
        if (!data.region_id) newErrors.region_id = t("Field_required", { field: t("Region") });
        if (!data.district_id) newErrors.district_id = t("Field_required", { field: t("District") });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const EditWarehouse = async () => {
        if (!validateFields()) return;
        try {
            setLoading(true);
            const selectedRegion = Regions.find(r => r.id === parseInt(data.region_id));
            const selectedDistrict = Districts.find(d => d.id === parseInt(data.district_id));
            const payload = {
                name: data.name,
                phone: data.phone,
                address: `${selectedDistrict?.name_uz || ''}, ${selectedRegion?.name_uz || ''}`,
                ...(data.password && { password: data.password })
            };
            await WarehouseApi.WarehouseEdit(payload, warehouseId);
            Alert(t("success"), "success");
            setOpen(false);
            refresh();
        } catch (error) {
            console.error(error);
            Alert(`${t("Error_occurred")}: ${error?.response?.data?.message || error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const availableDistricts = getDistrictsByRegion(data.region_id);

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 normal-case p-[8px] transition-colors duration-200"
            >
                <Edit size={20} />
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>{t("Warehouse_Edit")}</DialogHeader>
                <DialogBody divider className="space-y-4">
                    <div>
                        <Input
                            label={t("Warehouse_name")}
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            error={!!errors.name}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Input
                            label={t("Phone_number")}
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t("Region")} *</label>
                        <select
                            value={data.region_id}
                            onChange={handleRegionChange}
                            className={`w-full p-3 border rounded-lg ${errors.region_id ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">{t("Select_region")}</option>
                            {Regions.map(r => (
                                <option key={r.id} value={r.id}>{r.name_uz}</option>
                            ))}
                        </select>
                        {errors.region_id && <p className="text-red-500 text-xs mt-1">{errors.region_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t("District")} *</label>
                        <select
                            value={data.district_id}
                            onChange={handleDistrictChange}
                            disabled={!data.region_id}
                            className={`w-full p-3 border rounded-lg ${errors.district_id ? "border-red-500" : "border-gray-300"}`}
                        >
                            <option value="">{t("Select_district")}</option>
                            {availableDistricts.map(d => (
                                <option key={d.id} value={d.id}>{d.name_uz}</option>
                            ))}
                        </select>
                        {errors.district_id && <p className="text-red-500 text-xs mt-1">{errors.district_id}</p>}
                        {!data.region_id && <p className="text-gray-500 text-xs mt-1">{t("Select_region_first")}</p>}
                    </div>

                </DialogBody>

                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="text" color="gray" onClick={handleOpen} disabled={loading}>
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={EditWarehouse}
                        disabled={loading}
                        className={`bg-black text-white ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? t("Saving") : t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
