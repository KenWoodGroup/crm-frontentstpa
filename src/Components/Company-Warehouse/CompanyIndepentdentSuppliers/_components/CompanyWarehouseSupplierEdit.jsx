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


export default function CompanyWarehouseSupplierEdit({ data, refresh, id }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        type: "supplier",
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
                type: "supplier",
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
            <Dialog className="dark:bg-card-dark dark:text-text-dark transition-colors duration-300"
                open={open} handler={handleOpen} size="sm">
                <DialogHeader className="flex justify-between items-center dark:text-text-dark">
                    Изменения поставщика</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark">
                    <div>
                        <Input
                            label="Имя поставщика"
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
                    </div>

                    <div>
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
                    </div>

                    <div>

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
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                        onClick={handleSubmit}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
