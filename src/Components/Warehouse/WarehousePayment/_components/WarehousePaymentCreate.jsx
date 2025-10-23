import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option,
    Typography,
    Textarea,
} from "@material-tailwind/react";

export default function WarehousePaymentCreate() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(!open);

    return (
        <div>
            {/* 🔹 Кнопка открытия модалки */}
            <Button color="blue" onClick={handleOpen}>
                Оплатит
            </Button>

            {/* 🧾 Модал создания оплаты */}
            <Dialog open={open} handler={handleOpen} size="md" className="p-2">
                <DialogHeader className="flex justify-between items-center">
                    <Typography variant="h5" color="blue-gray">
                        Создание оплаты
                    </Typography>
                </DialogHeader>

                <DialogBody divider>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Клиент */}
                        <div>
                            <Input
                                label="Имя клиента"
                                color="blue"
                                placeholder="Введите имя клиента..."
                            />
                        </div>

                        {/* Сумма */}
                        <div>
                            <Input
                                type="number"
                                label="Сумма оплаты"
                                color="blue"
                                placeholder="Введите сумму..."
                            />
                        </div>

                        {/* Способ оплаты */}
                        <div>
                            <Select label="Способ оплаты" color="blue">
                                <Option>Наличный Cум</Option>
                                <Option>Перечисление (счёт)</Option>
                                <Option>Карта</Option>
                            </Select>
                        </div>

                        {/* Тип оплаты */}
                        <div>
                            <Select label="Тип оплаты" color="blue">
                                <Option>Оплата клиента</Option>
                                <Option>Возврат</Option>
                            </Select>
                        </div>

                        {/* Дата оплаты */}
                        <div>
                            <Input type="date" label="Дата оплаты" color="blue" />
                        </div>

                        {/* Агент */}
                        <div>
                            <Input
                                label="Агент"
                                color="blue"
                                placeholder="Введите имя агента..."
                            />
                        </div>
                        {/* Комментарий */}
                        <div className="col-span-2">
                            <Textarea
                                label="Комментарий"
                                color="blue"
                            />
                        </div>
                    </div>
                </DialogBody>

                <DialogFooter className="flex justify-between">
                    <Button variant="text" color="red" onClick={handleOpen}>
                        Отмена
                    </Button>
                    <Button color="blue" onClick={handleOpen}>
                        Сохранить оплату
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
