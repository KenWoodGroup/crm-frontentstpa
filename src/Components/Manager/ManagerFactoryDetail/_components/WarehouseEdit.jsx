import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Switch
} from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import Edit from "../../../UI/Icons/Edit";
import { WarehouseApi } from "../../../../utils/Controllers/WarehouseApi";
import Regions from "../../../../utils/Regions/regions.json";
import Districts from "../../../../utils/Regions/districts.json";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function WarehouseEdit({ warehouse, refresh }) {
    const { id } = useParams();
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouseId, setWarehouseId] = useState("");
    const [errors, setErrors] = useState({});

    const [isMainState, setIsMainState] = useState(false);

    const [data, setData] = useState({
        name: "",
        phone: "",
        password: "",
        region_id: "",
        district_id: "",
    });

    const parseAddress = (address) => {
        if (!address) return { region_id: "", district_id: "" };

        const parts = address.split(", ");
        if (parts.length < 2) return { region_id: "", district_id: "" };

        const [regionName, districtName] = parts;

        const region = Regions.find(
            r =>
                r.name_uz === regionName ||
                r.name_ru === regionName ||
                r.name_oz === regionName
        );

        const district = Districts.find(
            d =>
                (d.name_uz === districtName ||
                    d.name_ru === districtName ||
                    d.name_oz === districtName) &&
                d.region_id === region?.id
        );

        return {
            region_id: region?.id?.toString() || "",
            district_id: district?.id?.toString() || ""
        };
    };

    useEffect(() => {
        if (warehouse) {
            const a = parseAddress(warehouse.address);

            setData({
                name: warehouse.name || "",
                phone: warehouse.phone || "",
                password: "",
                region_id: a.region_id,
                district_id: a.district_id,
            });

            setWarehouseId(warehouse.id);
            setIsMainState(warehouse?.is_main);
        }
    }, [warehouse]);

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
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleRegionChange = (e) => {
        const value = e.target.value;
        setData(prev => ({
            ...prev,
            region_id: value,
            district_id: ""
        }));
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setData(prev => ({ ...prev, district_id: value }));
    };


    const EditWarehouse = async () => {

        try {
            setLoading(true);

            const selectedRegion = Regions.find(r => r.id === parseInt(data.region_id));
            const selectedDistrict = Districts.find(d => d.id === parseInt(data.district_id));

            const payload = {
                name: data.name,
                phone: data.phone,
                address: `${selectedRegion?.name_uz || ""}, ${selectedDistrict?.name_uz || ""}`,
                is_main: isMainState,
                ...(data.password && { password: data.password }),
            };

            await WarehouseApi.WarehouseEdit(payload, warehouseId);

            Alert(t("success"), "success");
            setOpen(false);
            refresh();
        } catch (error) {
            Alert(error?.response?.data?.message || error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const availableDistricts = getDistrictsByRegion(data.region_id);

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-yellow-600 p-[8px] text-white hover:bg-yellow-700"
            >
                <Edit size={20} />
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>{t("Warehouse_Edit")}</DialogHeader>

                <DialogBody divider className="space-y-4">
                    <Input
                        label={t("Warehouse_name")}
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        error={!!errors.name}
                    />

                    <Input
                        label={t("Phone_number")}
                        name="phone"
                        value={data.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                    />

                    <select
                        value={data.region_id}
                        onChange={handleRegionChange}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">{t("Select_region")}</option>
                        {Regions.map(r => (
                            <option key={r.id} value={r.id}>{r.name_uz}</option>
                        ))}
                    </select>

                    <select
                        value={data.district_id}
                        onChange={handleDistrictChange}
                        disabled={!data.region_id}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">{t("Select_district")}</option>
                        {availableDistricts.map(d => (
                            <option key={d.id} value={d.id}>{d.name_uz}</option>
                        ))}
                    </select>

                    <div className="flex flex-col gap-3">
                        <Switch
                            checked={isMainState}
                            onChange={(e) => setIsMainState(e.target.checked)}
                            label="Сделать основным складом"
                        />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" onClick={handleOpen}>
                        {t("Cancel")}
                    </Button>

                    <Button
                        onClick={EditWarehouse}
                        disabled={loading}
                        className="bg-black text-white"
                    >
                        {loading ? t("Saving") : t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
