import React from "react";
import { Button, Typography, Card, CardBody } from "@material-tailwind/react";

export default function SelectBatchModal({ isOpen, onClose, products = [], addItemToMixData }) {
    if (!isOpen) return null;

    const handleSelect = (item) => {
        addItemToMixData(item);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg transition-all"
            >
                <Typography variant="h5" className="mb-4 font-semibold text-center text-gray-800 dark:text-gray-100">
                    Product uchun partiyani tanlang
                </Typography>

                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                    {products.map((item, idx) => (
                        <Card
                            key={idx}
                            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 dark:bg-card-dark border border-gray-200 rounded-xl"
                            onClick={() => handleSelect(item)}
                        >
                            <CardBody className="flex justify-between items-center">
                                <div>
                                    <Typography variant="h6" className="text-gray-900 dark:text-white">
                                        {item.product.name}
                                    </Typography>
                                    <Typography className="text-sm text-gray-600 dark:text-gray-400">
                                        Partiya: {item.batch}
                                    </Typography>
                                </div>
                                <Typography className="font-semibold text-blue-600 dark:text-blue-400">
                                    {item.price} so‘m
                                </Typography>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center mt-5">
                    <Button color="red" variant="outlined" onClick={onClose}>
                        Bekor qilish
                    </Button>
                </div>
            </div>
        </div>
    );
}
