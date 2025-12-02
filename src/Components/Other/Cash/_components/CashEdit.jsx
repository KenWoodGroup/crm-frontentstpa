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
import { Alert } from "../../../../utils/Alert";
import { Edit } from "lucide-react";
import { Cash } from "../../../../utils/Controllers/Cash";
import { useTranslation } from "react-i18next";


export default function CashEdit({ data, refresh, id }) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation()
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
            Alert(`${t('success')}`, "success");

            handleOpen();
            refresh();
        } catch (error) {
            Alert(`${'Error'}`, "error");
            console.log(error);
        }
    };


    return (
        <div className="">
            <Tooltip content={t('Edit')}>
                <IconButton
                    variant="text"
                    color="blue"
                    onClick={handleOpen}
                >
                    <Edit size={18} />
                </IconButton>
            </Tooltip>
            <Dialog open={open} handler={handleOpen} size="sm" className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            >
                <DialogHeader className="dark:text-text-dark">{t('Edit_Cash')}</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <div>
                        <Input
                            label={t('Name')}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            color="blue-gray"
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: `!text-text-light dark:!text-text-dark  `
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
                        {t('Cancel')}
                    </Button>
                    <Button className="bg-blue-600 dark:bg-blue-500 text-white dark:text-text-dark hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        onClick={handleSubmit}>
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
