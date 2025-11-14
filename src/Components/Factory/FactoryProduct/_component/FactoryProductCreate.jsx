import { useParams } from "react-router-dom";
import { ProductApi } from "../../../../utils/Controllers/ProductApi";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Input,
    Button,
} from "@material-tailwind/react";
import EmptyData from "../../../UI/NoData/EmptyData";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";

export default function FactoryProductCreate() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [savedLocations, setSavedLocations] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [processingProducts, setProcessingProducts] = useState(new Set());
    const [editingProduct, setEditingProduct] = useState(null); // ID продукта в режиме редактирования
    const [editName, setEditName] = useState(""); // Новое название для редактирования
    const [hoveredProduct, setHoveredProduct] = useState(null); // Для отслеживания hover
    const location_id = Cookies.get("ul_nesw");

    // GET: Получить продукты подкатегории
    const getProduct = async () => {
        try {
            const response = await ProductApi.GetProductId(id);
            setProducts(response?.data || []);
        } catch (error) {
            console.log("Ошибка при получении продукта:", error);
        }
    };

    const getMyProduct = async () => {
        try {
            const data = {
                location_id: location_id,
                sub_id: id
            }
            const response = await LocalProduct.GetMyProduct(data);
            setMyProducts(response?.data || []);
        } catch (error) {
            console.log(error)
        }
    }

    // Создание продукта при клике
    const createProduct = async (product) => {
        setProcessingProducts(prev => new Set(prev).add(product.id));

        try {
            const data = {
                name: product.name,
                unit: product.unit || "шт",
                location_id: location_id,
                product_id: product.id
            };
            await LocalProduct?.CreateProduct(data);
            await getMyProduct();
        } catch (error) {
            console.error("Error creating product:", error);
        } finally {
            setProcessingProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id);
                return newSet;
            });
        }
    };

    // Удаление продукта при клике на созданный
    const deleteProduct = async (product) => {
        setProcessingProducts(prev => new Set(prev).add(product.id));

        try {
            const myProduct = myProducts.find(myProduct => myProduct.product_id === product.id);
            if (myProduct && myProduct.id) {
                await LocalProduct.DeleteProduct(myProduct.id);
                await getMyProduct();
                console.log("Продукт успешно удален:", product.name);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        } finally {
            setProcessingProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(product.id);
                return newSet;
            });
        }
    };

    // Редактирование продукта
    const updateProduct = async (productId) => {
        if (!editName.trim()) return;

        setProcessingProducts(prev => new Set(prev).add(productId));

        try {
            const myProduct = myProducts.find(myProduct => myProduct.product_id === productId);
            if (myProduct && myProduct.id) {
                const data = {
                    name: editName,
                    unit: myProduct.unit || "шт",
                    location_id: location_id,
                    product_id: productId
                }
                await LocalProduct?.EditProduct(myProduct.id, data);
                await getMyProduct();
                setEditingProduct(null);
                setEditName("");
                console.log("Продукт успешно обновлен:", editName);
            }
        } catch (error) {
            console.error("Error updating product:", error);
        } finally {
            setProcessingProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };

    // Начало редактирования
    const startEditing = (productId) => {
        const myProduct = myProducts.find(myProduct => myProduct.product_id === productId);
        if (myProduct) {
            setEditingProduct(productId);
            setEditName(myProduct.name); // Устанавливаем текущее название из myProducts
        }
    };

    // Отмена редактирования
    const cancelEditing = () => {
        setEditingProduct(null);
        setEditName("");
    };

    // Проверяем, создан ли продукт
    const isProductCreated = (productId) => {
        return myProducts.some(myProduct => myProduct.product_id === productId);
    };

    // Проверяем, обрабатывается ли продукт
    const isProductProcessing = (productId) => {
        return processingProducts.has(productId);
    };

    // Получаем данные созданного продукта из myProducts
    const getMyProductData = (productId) => {
        return myProducts.find(myProduct => myProduct.product_id === productId);
    };

    // Обработчик клика по продукту
    const handleProductClick = async (product) => {
        if (isProductProcessing(product.id) || editingProduct) return;

        const isCreated = isProductCreated(product.id);

        if (isCreated) {
            deleteProduct(product);
        } else {
            createProduct(product);
        }
    };

    // Загружаем только GET
    useEffect(() => {
        (async () => {
            setLoading(true);
            await Promise.all([getProduct(), getMyProduct()]);
            setLoading(false);
        })();
    }, [id]);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
            </div>
        );
    }

    const subcategoryName = products[0]?.subcategory?.name || "Без подкатегории";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Typography
                        variant="h3"
                        className="text-gray-900 dark:text-gray-100 font-bold"
                    >
                        {subcategoryName}
                    </Typography>
                </div>

                <div className="flex items-center justify-between mx-auto">
                    <div className="max-w-[500px] w-full">
                        <Input
                            label={t(`Search`)}
                            color="blue"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredProducts.map((product) => {
                            const isCreated = isProductCreated(product.id);
                            const isProcessing = isProductProcessing(product.id);
                            const isEditing = editingProduct === product.id;
                            const myProductData = getMyProductData(product.id);
                            const isHovered = hoveredProduct === product.id;

                            return (
                                <Card
                                    key={product.id}
                                    className={`transition-all duration-150 border 
                                               border-gray-200 dark:border-gray-700
                                               bg-white dark:bg-gray-800 hover:shadow-xl
                                               cursor-pointer relative overflow-hidden
                                               ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
                                               ${isCreated
                                            ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                    onClick={() => !isProcessing && !isEditing && handleProductClick(product)}
                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                >
                                    {/* Индикатор загрузки */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-70 flex items-center justify-center">
                                            <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full"></div>
                                        </div>
                                    )}

                                    {/* Кнопка Edit при hover на созданном продукте */}
                                    {isCreated && !isEditing && !isProcessing && isHovered && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <Button
                                                size="sm"
                                                color="blue"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(product.id);
                                                }}
                                                className="px-3 py-1 text-xs"
                                            >
                                                {t('Edit')}
                                            </Button>
                                        </div>
                                    )}

                                    <CardBody className="p-4">
                                        {isEditing ? (
                                            // Режим редактирования
                                            <div className="space-y-3">
                                                <Input
                                                    label={t('Product')}
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    autoFocus
                                                    color="blue-gray"
                                                    className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                                                    containerProps={{
                                                        className: "!min-w-0",
                                                    }}
                                                    labelProps={{
                                                        className: `!text-text-light dark:!text-text-dark  `
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        color="green"
                                                        onClick={() => updateProduct(product.id)}
                                                        disabled={!editName.trim() || isProcessing}
                                                    >
                                                        {t('Save')}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        color="red"
                                                        variant="outlined"
                                                        onClick={cancelEditing}
                                                        disabled={isProcessing}
                                                    >
                                                        {t('Cancel')}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Обычный режим
                                            <>
                                                <Typography
                                                    variant="h6"
                                                    className={`relative ${isCreated
                                                        ? 'text-green-700 dark:text-green-300 font-semibold'
                                                        : 'text-gray-900 dark:text-gray-100'
                                                        } ${isProcessing ? 'opacity-50' : ''}`}
                                                >
                                                    {isCreated ? myProductData?.name : product.name}
                                                    {isCreated && !isProcessing && (
                                                        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                                                            ✓
                                                        </span>
                                                    )}
                                                </Typography>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyData text={t(`Empty_data`)} />
                )}
            </div>
        </div>
    );
}