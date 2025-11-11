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

            <Dialog className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open} handler={handleOpen}>
                <DialogHeader className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark">
                    Foydalanuvchi yaratish
                </DialogHeader>
                <DialogBody divider className="space-y-4">
                    <Input
                        label="To‘liq ism"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Input
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                    <Select
                        label="Role"
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
                        <Option value="cashier">Кассир</Option>
                        <Option value="warehouse">Менеджер</Option>
                        <Option value="storekeeper">Складчик</Option>
                    </Select>
                </DialogBody>
                <DialogFooter>
                    <Button className="text-text-light dark:text-text-dark"
                        variant="text" color="red" onClick={handleOpen}>
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
