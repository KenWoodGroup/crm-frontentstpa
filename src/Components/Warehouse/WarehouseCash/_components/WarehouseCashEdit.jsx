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
import { Cash } from "../../../../utils/Controllers/Cash";


export default function WarehouseCashEdit({ data, refresh, id }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: data?.name || '',
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await Cash?.EditKassa(id, form);
            Alert("Muvaffaqiyatli", "success");

            handleOpen();
            refresh();
        } catch (error) {
            Alert("Xato", "error");
            console.log(error);
        }
    };


    return (
        <div className="">
            <Tooltip content="Изменить">
                <IconButton
                    variant="text"
                    color="blue"
                    onClick={handleOpen}
                >
                    <Edit size={18} />
                </IconButton>
            </Tooltip>
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Изменения Кассы</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label="Имя клиента"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
