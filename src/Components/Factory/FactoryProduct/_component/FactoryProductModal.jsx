import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    IconButton,
    Typography,
} from "@material-tailwind/react";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import { useState } from "react";
import Cookies from "js-cookie";
import { Alert } from "../../../../utils/Alert";

export default function FactoryProductModal({
    showModal,
    setShowModal,
    selectedProducts,
    clearSelectedProducts,
    handleProductSelect,
}) {
    const [loading, setLoading] = useState(false);
    const location_id = Cookies.get('ul_nesw');

    const PostProduct = async () => {
        try {
            setLoading(true);

            // Формируем данные в нужном формате
            const dataToSend = {
                list: selectedProducts.map((product) => ({
                    location_id: location_id,
                    key: "products",
                    value: product.id,
                })),
            };
            // Отправляем на backend
            const response = await locationInfo?.Post(dataToSend);
            console.log("✅ Ma'lumot yuborildi:", response);
            Alert("Muvaffaqiyatli ", "success");

            setShowModal(false);
            // Alert("Muvaffaqiyatli ", "success");
        } catch (error) {
            console.error("❌ Xatolik yuz berdi:", error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");

        } finally {
            setLoading(false);
        }
    };

    // Функция для удаления одного продукта
    const removeSingleProduct = (productId) => {
        handleProductSelect(selectedProducts.find(p => p.id === productId));
    };

    return (
        <Dialog
            size="xl"
            open={showModal}
            handler={() => setShowModal(false)}
            className="relative bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0.9, y: -100 },
            }}
        >
            <DialogHeader className="flex justify-between rounded-xl items-center border-b border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark">
                <span className="font-semibold text-lg dark:text-text-dark">Tanlangan mahsulotlar</span>
                <IconButton
                    color="red"
                    variant="text"
                    size="sm"
                    onClick={() => setShowModal(false)}
                >
                    <XMarkIcon className="h-5 w-5" />
                </IconButton>
            </DialogHeader>

            <DialogBody className="max-h-96 overflow-y-auto">
                {selectedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 transition-all duration-300 hover:shadow-md hover:border-blue-400"
                            >
                                <div className="flex flex-col h-full justify-between">
                                    <Typography
                                        variant="small"
                                        className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2"
                                    >
                                        {product.name}
                                    </Typography>

                                    <Button
                                        size="sm"
                                        color="red"
                                        variant="outlined"
                                        onClick={() => removeSingleProduct(product.id)}
                                        className="mt-2 text-xs"
                                    >
                                        Olib tashlash
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <Typography variant="paragraph" className="text-gray-500 dark:text-gray-400 mb-2">
                            Hozircha mahsulot tanlanmagan
                        </Typography>
                        <Typography variant="small" className="text-gray-400 dark:text-gray-500">
                            Mahsulotlarni tanlash uchun kategoriyalarni oching
                        </Typography>
                    </div>
                )}
            </DialogBody>

            <DialogFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <Button
                    variant="outlined"
                    color="red"
                    onClick={clearSelectedProducts}
                    disabled={selectedProducts.length === 0}
                >
                    Hammasini tozalash
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outlined"
                        color="gray"
                        onClick={() => setShowModal(false)}
                    >
                        Yopish
                    </Button>
                    <Button
                        color="blue"
                        onClick={PostProduct}
                        disabled={selectedProducts.length === 0 || loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? "Yuborilmoqda..." : "Yuborish"}
                    </Button>
                </div>
            </DialogFooter>
        </Dialog>
    );
}