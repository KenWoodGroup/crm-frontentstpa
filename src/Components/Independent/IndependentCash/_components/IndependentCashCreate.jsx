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

export default function IndependentCashCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(!open);

    const CreateCash = async () => {
        if (!name.trim()) return alert("Введите название кассы");

        try {
            setLoading(true);
            const location_id = Cookies.get("ul_nesw");
            const data = { location_id, name };
            await Cash?.CreateKassa(data);
            setOpen(false);
            setName("");
            refresh();
            Alert("Muvaffaqiyatli yaratildi", "success");
        } catch (error) {
            console.log("Ошибка при создании кассы:", error);
            Alert("Xato", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                className="bg-blue-600 dark:bg-blue-500 text-white dark:text-text-dark hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
                Создать кассу
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            >
                <DialogHeader className="border-b border-gray-200 dark:border-gray-600 dark:text-text-dark">
                    Создание кассы
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label="Название кассы"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark  `
                        }}
                    />
                </DialogBody>
                <DialogFooter className="border-t border-gray-200 dark:border-gray-600">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 normal-case text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={CreateCash}
                        disabled={loading}
                        className="bg-blue-600 dark:bg-blue-500 text-white dark:text-text-dark hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        {loading ? "Создание..." : "Создать"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
