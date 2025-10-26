import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Cash } from "../../../../utils/Controllers/Cash";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseCashCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const CreateCash = async () => {
        if (!name.trim()) return alert("Введите название кассы");

        try {
            setLoading(true);
            const location_id = Cookies.get("ul_nesw");
            const data = {
                location_id: location_id,
                name,
            };
            const response = await Cash?.CreateKassa(data);
            setOpen(false);
            setName("");
            refresh()
            Alert("Muvaffaqiyatli yaratildi ", "success");
        } catch (error) {
            console.log("Ошибка при создании кассы:", error);
            Alert("Xato ", "error");

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleOpen} color="blue">
                Создать кассу
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создание кассы</DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Название кассы"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        color="gray"
                        onClick={handleOpen}
                        className="mr-2"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={CreateCash}
                        disabled={loading}
                    >
                        {loading ? "Создание..." : "Создать"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
