import { useState } from "react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input } from "@material-tailwind/react";
import { Alert } from "../../../../utils/Alert";
import { UserApi } from "../../../../utils/Controllers/UserApi";
import { useParams } from "react-router-dom";


export default function WarehouseUserCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { id } = useParams()
    const [data, setData] = useState({
        location_id: id,
        full_name: "",
        email: "",
        password: "",
        role: "warehouse",
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        if (!data.full_name.trim()) return Alert("Iltimos, foydalanuvchi ismini kiriting ❗", "warning");
        if (!data.email.trim()) return Alert("Iltimos, email kiriting ❗", "warning");
        if (!data.password.trim()) return Alert("Iltimos, parol kiriting ❗", "warning");
        return true;
    };

    const createUser = async () => {
        if (validateFields() !== true) return;

        try {
            setLoading(true);
            await UserApi.UserCreate({
                ...data,
                role: "warehouse"
            });

            Alert("Foydalanuvchi muvaffaqiyatli yaratildi ", "success");
            setOpen(false);
            setData({ ...data, full_name: "", email: "", password: "" });
            refresh && refresh();
        } catch (error) {
            console.error(error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message || ""}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-black text-white normal-case  hover:bg-gray-800 "
            >
                + Yangi foydalanuvchi
            </Button>

            <Dialog open={open} handler={handleOpen} className="bg-white text-gray-900 rounded-xl">
                <DialogHeader className="text-lg font-semibold border-b border-gray-200">
                    Yangi foydalanuvchi yaratish
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label="To‘liq ism"
                        color="gray"
                        name="full_name"
                        value={data.full_name}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
                        color="gray"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Parol"
                        type="password"
                        color="gray"
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
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={createUser}
                        disabled={loading}
                        className={`bg-black text-white normal-case hover:bg-gray-800  flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                        ) : (
                            "Yaratish"
                        )}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
