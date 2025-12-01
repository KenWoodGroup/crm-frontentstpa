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
import Regions from "../../../../utils/Regions/regions.json";
import Districts from "../../../../utils/Regions/districts.json";
import { useTranslation } from "react-i18next";

export default function WarehouseDilerCreate({ refresh }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    const handleOpen = () => {
        setOpen(!open);
        setErrors({});
        setData(initialData);
    };

    const getDistrictsByRegion = (regionId) => {
        if (!regionId) return [];
        return Districts.filter((district) => district.region_id === parseInt(regionId));
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
        setData({
            ...data,
            region_id: value,
            district_id: "",
        });
        if (errors.region_id) {
            setErrors((prev) => ({ ...prev, region_id: "" }));
        }
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setData({
            ...data,
            district_id: value,
        });
        if (errors.district_id) {
            setErrors((prev) => ({ ...prev, district_id: "" }));
        }
    };

    const validateFields = () => {
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = t("Field_required", { field: t("Dealer_name") });
        if (!data.username.trim()) newErrors.username = t("Field_required", { field: t("Dealer_login") });
        if (!data.phone.trim()) newErrors.phone = t("Field_required", { field: t("Phone_number") });
        else if (!/^\+998\d{9}$/.test(data.phone)) newErrors.phone = t("Phone_format_error");
        if (!data.password.trim()) newErrors.password = t("Field_required", { field: t("Password") });
        else if (data.password.length < 6) newErrors.password = t("Password_min_error");
        if (!data.confirm_password.trim()) newErrors.confirm_password = t("Field_required", { field: t("Confirm_password") });
        else if (data.password !== data.confirm_password) newErrors.confirm_password = t("Passwords_not_match");
        if (!data.region_id) newErrors.region_id = t("Field_required", { field: t("Region") });
        if (!data.district_id) newErrors.district_id = t("Field_required", { field: t("District") });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createDealer = async () => {
        if (!validateFields()) return;

        try {
            setLoading(true);

            const selectedRegion = Regions.find((region) => region.id === parseInt(data.region_id));
            const selectedDistrict = Districts.find((district) => district.id === parseInt(data.district_id));

            const payload = {
                name: data.name,
                username: data.username,
                full_name: data.name,
                phone: data.phone,
                password: data.password,
                type: "dealer",
                address: `${selectedRegion?.name_uz || ""}, ${selectedDistrict?.name_uz || ""},`,
                parent_id: Cookies.get("ul_nesw") || "",
            };

            await WarehouseApi.CreateWarehouse(payload);
            Alert(t("success"), "success");
            handleOpen();
            refresh();
        } catch (error) {
            console.error("Xatolik:", error);
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const availableDistricts = getDistrictsByRegion(data.region_id);

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-black text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            >
                + {t("Add")}
            </Button>

            <Dialog
                className="bg-white dark:bg-card-dark text-gray-900 dark:text-text-dark"
                open={open}
                handler={handleOpen}
                size="sm"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    {t("Dealer_create")}
                </DialogHeader>
                <DialogBody divider className="space-y-4 overflow-y-auto h-[500px]">
                    {/* Name */}
                    <div>
                        <Input
                            label={t("Firstname")}
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Username */}
                    <div>
                        <Input
                            label={t("Login")}
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <Input
                            label={t("Phone_number")}
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Region */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-text-dark">{t("Region")}</label>
                        <select
                            value={data.region_id}
                            onChange={handleRegionChange}
                            className={`w-full p-3 border rounded-lg outline-none ${errors.region_id ? "border-red-500 focus:border-red-500" : "border-black dark:border-text-dark focus:border-black"
                                }`}
                        >
                            <option value="">{t("Select_region")}</option>
                            {Regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name_uz}
                                </option>
                            ))}
                        </select>
                        {errors.region_id && <p className="text-red-500 text-xs mt-1">{errors.region_id}</p>}
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-text-dark">{t("District")}</label>
                        <select
                            value={data.district_id}
                            onChange={handleDistrictChange}
                            disabled={!data.region_id}
                            className={`w-full p-3 border rounded-lg outline-none ${errors.region_id ? "border-red-500 focus:border-red-500" : "border-black dark:border-text-dark focus:border-black"
                                }`}
                        >
                            <option value="">{t("Select_district")}</option>
                            {availableDistricts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name_uz}
                                </option>
                            ))}
                        </select>
                        {errors.district_id && <p className="text-red-500 text-xs mt-1">{errors.district_id}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <Input
                            label={t("Password")}
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <Input
                            label={t("Confirm_password")}
                            name="confirm_password"
                            type="password"
                            value={data.confirm_password}
                            onChange={handleChange}
                            error={!!errors.confirm_password}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark `
                            }}
                        />
                        {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                    </div>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                        disabled={loading}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={createDealer}
                        disabled={loading}
                        className={`bg-black text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? t("Saving") : t("Save")}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
