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

export default function WarehouseUserCreate({ refresh }) {
    const { id } = useParams()
    const [open, setOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("warehouse");

    const handleOpen = () => setOpen(!open);

    const handleCreate = async () => {
        if (!fullName || !username || !password || !role) {
            return Alert("Iltimos, barcha maydonlarni to‘ldiring ❌", "error");
        }
        try {
            await UserApi.UserCreate({
                location_id: id,
                full_name: fullName,
                username,
                password,
                role,
            });
            Alert("Foydalanuvchi muvaffaqiyatli yaratildi ", "success");
            handleOpen();
            refresh();
        } catch (error) {
            console.log(error);
            Alert("Xatolik yuz berdi ❌", "error");
        }
    };

    return (
        <>
            <Button color="blue" onClick={handleOpen}>
                Yangi foydalanuvchi
            </Button>

            <Dialog open={open} handler={handleOpen}>
                <DialogHeader>Foydalanuvchi yaratish</DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label="To‘liq ism"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Select
                        label="Role"
                        value={role}
                        onChange={(value) => setRole(value)}
                    >
                        <Option value="cashier">Кассир</Option>
                        <Option value="warehouse">Менеджер</Option>
                    </Select>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Bekor qilish
                    </Button>
                    <Button color="blue" onClick={handleCreate}>
                        Saqlash
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
