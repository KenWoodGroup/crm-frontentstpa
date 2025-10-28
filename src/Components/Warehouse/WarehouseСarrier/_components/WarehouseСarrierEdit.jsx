import React, { useEffect, useState } from "react";
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
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";
import { Staff } from "../../../../utils/Controllers/Staff";
import Edit from "../../../UI/Icons/Edit";

export default function WarehouseСarrierEdit({ refresh, data, id }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        role: "carrier",
        full_name: "",
        phone: "+998",
        location_id: Cookies.get("ul_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    // когда модал открывается, загружаем старые данные
    useEffect(() => {
        if (open && data) {
            setForm({
                role: data?.role || "carrier",
                full_name: data?.full_name || "",
                phone: data?.phone || "+998",
                location_id: data?.location_id || Cookies.get("ul_nesw"),
            });
        }
    }, [open, data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await Staff?.EditStaff(id, form);
            Alert("Поставщик успешно обновлён", "success");
            handleOpen();
            refresh();
        } catch (error) {
            Alert("Ошибка при обновлении поставщика", "error");
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

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Редактирование Поставщика</DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label="Имя поставщика"
                            name="full_name"
                            value={form.full_name}
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
                    <Button onClick={handleSubmit} color="green">
                        Сохранить изменения
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
