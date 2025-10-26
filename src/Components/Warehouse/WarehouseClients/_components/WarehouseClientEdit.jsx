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
        name: data?.name || '',
        address: data?.address || '',
        phone: data?.phone || '',
        parent_id: Cookies.get(`usd_nesw`),
    });

    const handleOpen = () => setOpen(!open);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await Clients?.EditClient(id, form); 
            Alert("Muvaffaqiyatli", "success");

            setForm({
                type: "client",
                name: "",
                address: "",
                phone: "+998",
            });

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
                <DialogHeader>Изменения клиента</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label="Имя клиента"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Input
                            label="Адрес"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div>

                        <Input
                            label="Телефон"
                            name="phone"
                            value={form.phone}
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
