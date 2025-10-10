import { useEffect, useState } from "react"
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Card,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton
} from "@material-tailwind/react"
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { ProductApi } from "../../../utils/Controllers/ProductAPi"
import FactoryProductModal from "./_component/FactoryProductModal"
import Cookies from "js-cookie";

export default function FactoryProduct() {
    const [categories, setCategories] = useState([])
    const [openAccordions, setOpenAccordions] = useState([])
    const [productsData, setProductsData] = useState({})
    const [selectedProducts, setSelectedProducts] = useState([])
    const [showModal, setShowModal] = useState(false)
    const location_id = Cookies.get('ul_nesw');

    const getAllCategories = async () => {
        try {
            const response = await ProductApi.GetAllCategory()
            setCategories(response.data || [])
        } catch (error) {
            console.log("Kategoriyalarni yuklashda xato:", error)
        }
    }

    const loadCategoryData = async (categoryId) => {
        try {
            const subResponse = await ProductApi.GetSubCategoryByID(categoryId)
            const subCategories = subResponse.data || []

            const productsPromises = subCategories.map(async (subCategory) => {
                const productResponse = await ProductApi.GetProductById(subCategory.id)
                return {
                    subCategoryId: subCategory.id,
                    subCategoryName: subCategory.name,
                    products: productResponse.data || []
                }
            })

            const productsResult = await Promise.all(productsPromises)

            setProductsData(prev => ({
                ...prev,
                [categoryId]: productsResult
            }))

        } catch (error) {
            console.log("Kategoriya ma'lumotlarini yuklashda xato:", error)
        }
    }

    const getMiniCategory = async () => {
        try {
            const response = await ProductApi?.GetMiniCategoryById(location_id)
            if (response?.data) {
                // Автоматически выбираем продукты из ответа
                setSelectedProducts(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleAccordion = (categoryId) => {
        setOpenAccordions(prev => {
            const isOpen = prev.includes(categoryId)
            if (isOpen) {
                return prev.filter(id => id !== categoryId)
            } else {
                // Загружаем данные если категория открывается впервые
                if (!productsData[categoryId]) {
                    loadCategoryData(categoryId)
                }
                return [...prev, categoryId]
            }
        })
    }

    const handleProductSelect = (product) => {
        setSelectedProducts(prev => {
            const isAlreadySelected = prev.find(p => p.id === product.id)
            if (isAlreadySelected) {
                return prev.filter(p => p.id !== product.id)
            } else {
                return [...prev, product]
            }
        })
    }

    const clearSelectedProducts = () => {
        setSelectedProducts([])
    }

    // Функция для сохранения выбранных продуктов
    const saveSelectedProducts = async () => {
        try {
            // Отправляем выбранные продукты на сервер
            const response = await ProductApi?.SaveMiniCategory(location_id, selectedProducts)
            if (response?.data) {
                console.log("Mahsulotlar muvaffaqiyatli saqlandi")
                // Можно добавить уведомление об успешном сохранении
            }
        } catch (error) {
            console.log("Mahsulotlarni saqlashda xato:", error)
        }
    }

    useEffect(() => {
        getAllCategories()
        getMiniCategory() // Загружаем ранее выбранные продукты
    }, [])

    // Разделяем категории на две колонки
    const leftColumnCategories = categories.slice(0, Math.ceil(categories.length / 2))
    const rightColumnCategories = categories.slice(Math.ceil(categories.length / 2))

    return (
        <div className="min-h-screen">

            {/* Фиксированный глазок в правом верхнем углу */}
            <div className="fixed top-[100px] right-4 z-50">
                <div className="relative">
                    <IconButton
                        color="blue"
                        size="lg"
                        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => setShowModal(true)}
                    >
                        <EyeIcon className="h-6 w-6" />
                    </IconButton>
                    {selectedProducts.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                            {selectedProducts.length}
                        </span>
                    )}
                </div>
            </div>

            <div className="mx-auto">
                <Typography variant="h2" className="mb-8 text-gray-900 font-bold text-center">
                    Mahsulotlar katalogi
                </Typography>
                

                {/* Две колонки */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Левая колонка */}
                    <div className="space-y-4">
                        {leftColumnCategories.map((category) => (
                            <Accordion
                                key={category.id}
                                open={openAccordions.includes(category.id)}
                                className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <AccordionHeader
                                    onClick={() => handleAccordion(category.id)}
                                    className={`p-4 border-b-0 hover:bg-gray-50 transition-all duration-300 ${openAccordions.includes(category.id) ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <Typography variant="h5" className="text-gray-800">
                                            {category.name}
                                        </Typography>
                                    </div>
                                </AccordionHeader>

                                <AccordionBody className="p-0">
                                    <div className="p-4 bg-gray-50 overflow-y-auto">
                                        {productsData[category.id] ? (
                                            <div className="space-y-3">
                                                {productsData[category.id].map((item) => (
                                                    <div
                                                        key={item.subCategoryId}
                                                        className="border border-gray-300 rounded-lg p-3 bg-white transform transition-transform duration-300 hover:scale-[1.02]"
                                                    >
                                                        <Typography variant="h6" className="text-gray-700 mb-2">
                                                            {item.subCategoryName}
                                                        </Typography>

                                                        {item.products.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {item.products.map((product) => {
                                                                    const isSelected = selectedProducts.find(p => p.id === product.id)
                                                                    return (
                                                                        <div
                                                                            key={product.id}
                                                                            className={`flex items-center p-2 rounded border cursor-pointer transition-all duration-300 transform hover:translate-x-1 ${isSelected
                                                                                ? "bg-blue-100 border-blue-500 scale-[1.02]"
                                                                                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                                                                                }`}
                                                                            onClick={() => handleProductSelect(product)}
                                                                        >
                                                                            <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-300 ${isSelected
                                                                                ? "bg-blue-500"
                                                                                : "bg-gray-400"
                                                                                }`}></div>
                                                                            <Typography variant="paragraph" className="text-gray-800">
                                                                                {product.name}
                                                                                {isSelected && " ✓"}
                                                                            </Typography>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <Typography variant="small" className="text-gray-500">
                                                                Mahsulotlar mavjud emas
                                                            </Typography>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        ))}
                    </div>

                    {/* Правая колонка */}
                    <div className="space-y-4">
                        {rightColumnCategories.map((category) => (
                            <Accordion
                                key={category.id}
                                open={openAccordions.includes(category.id)}
                                className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <AccordionHeader
                                    onClick={() => handleAccordion(category.id)}
                                    className={`p-4 border-b-0 hover:bg-gray-50 transition-all duration-300 ${openAccordions.includes(category.id) ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <Typography variant="h5" className="text-gray-800">
                                            {category.name}
                                        </Typography>
                                    </div>
                                </AccordionHeader>

                                <AccordionBody className="p-0">
                                    <div className="p-4 bg-gray-50 overflow-y-auto">
                                        {productsData[category.id] ? (
                                            <div className="space-y-3">
                                                {productsData[category.id].map((item) => (
                                                    <div
                                                        key={item.subCategoryId}
                                                        className="border border-gray-300 rounded-lg p-3 bg-white transform transition-transform duration-300 hover:scale-[1.02]"
                                                    >
                                                        <Typography variant="h6" className="text-gray-700 mb-2">
                                                            {item.subCategoryName}
                                                        </Typography>

                                                        {item.products.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {item.products.map((product) => {
                                                                    const isSelected = selectedProducts.find(p => p.id === product.id)
                                                                    return (
                                                                        <div
                                                                            key={product.id}
                                                                            className={`flex items-center p-2 rounded border cursor-pointer transition-all duration-300 transform hover:translate-x-1 ${isSelected
                                                                                ? "bg-blue-100 border-blue-500 scale-[1.02]"
                                                                                : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                                                                                }`}
                                                                            onClick={() => handleProductSelect(product)}
                                                                        >
                                                                            <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-300 ${isSelected
                                                                                ? "bg-blue-500"
                                                                                : "bg-gray-400"
                                                                                }`}></div>
                                                                            <Typography variant="paragraph" className="text-gray-800">
                                                                                {product.name}
                                                                                {isSelected && " ✓"}
                                                                            </Typography>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <Typography variant="small" className="text-gray-500">
                                                                Mahsulotlar mavjud emas
                                                            </Typography>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        )}
                                    </div>
                                </AccordionBody>
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>
            <FactoryProductModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedProducts={selectedProducts}
                clearSelectedProducts={clearSelectedProducts}
                handleProductSelect={handleProductSelect}
                saveSelectedProducts={saveSelectedProducts}
            />
        </div>
    )
}