import React from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Select, Option } from "@material-tailwind/react";

export default function Header() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        if (lng) i18n.changeLanguage(lng);
    };

    return (
        <Navbar
            shadow={false}
            fullWidth
            className="flex bg-transparent border-transparent justify-end items-center p-0  min-h-[60px] mb-[10px]"
        >
            <div className="flex items-center gap-2">
                <div className="w-36 bg-[white] px-[10px] py-[5px] rounded-[10px] shadow-lg">
                    <Select
                        label="Язык"
                        value={i18n.language}
                        onChange={(lng) => changeLanguage(lng)}
                        size="md"
                        color="blue"

                        className="text-sm bg-white"
                        containerProps={{
                            className: "!min-w-0 !w-full",
                        }}
                        menuProps={{
                            className: "z-[9999]",
                        }}
                    >
                        <Option value="ru">Русский</Option>
                        <Option value="en">English</Option>
                        <Option value="uz">O‘zbek</Option>
                    </Select>
                </div>
            </div>
        </Navbar>
    );
}
