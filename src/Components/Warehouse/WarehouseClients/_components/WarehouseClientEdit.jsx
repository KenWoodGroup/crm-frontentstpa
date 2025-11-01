import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Tooltip,
    IconButton,
} from "@material-tailwind/react";
import { Clients } from "../../../../utils/Controllers/Clients";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Edit } from "lucide-react";

export default function WarehouseClientEdit({ data, refresh, id }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        type: "client",
        name: data?.name || "",
        address: data?.address || "",
        phone: data?.phone || "+998",
        parent_id: Cookies.get(`ul_nesw`),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await Clients?.EditClient(id, form);
            Alert("Muvaffaqiyatli", "success");

            setForm({
                type: "client",
                name: "",
                address: "",
                phone: "+998",
                parent_id: Cookies.get(`ul_nesw`),
            });

            handleOpen();
            refresh();
        } catch (error) {
            Alert("Xato", "error");
            console.log(error);
        }
    };

    return (
        <div>
            <Tooltip content="Изменить">
                <IconButton
                    variant="text"
                    color="blue"
                    onClick={handleOpen}
                >
                    <Edit size={18} />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    Изменение клиента
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label="Имя клиента"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Input
                        label="Адрес"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />

                    <Input
                        label="Телефон"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        containerProps={{
                            className: "!min-w-0",
                        }}
                        labelProps={{
                            className: `!text-text-light dark:!text-text-dark`,
                        }}
                    />
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
