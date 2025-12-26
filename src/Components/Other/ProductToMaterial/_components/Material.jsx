import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  Card,
  CardBody,
  Typography,
  Spinner,
  Button,
} from "@material-tailwind/react";

import { LocalCategory } from "../../../../utils/Controllers/LocalCategory";
import { LocalProduct } from "../../../../utils/Controllers/LocalProduct";
import { useTranslation } from "react-i18next";

export default function Material({ onMaterialSelect, selectedMaterials }) {
  const location_id = Cookies.get("ul_nesw");
  const { t } = useTranslation();


  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true)

  // Проверка, выбран ли материал
  const isMaterialSelected = (materialId) => {
    return selectedMaterials.some(item => item.id === materialId);
  };

  // Получить категории
  const getCategories = async () => {
    setCategoryLoading(true)
    try {
      const data = {
        location_id,
        type: "material",
      };

      const response = await LocalCategory.GetAllCateogry(data);
      const list = response?.data || [];
      setCategories(list);
    } catch (error) {
      console.log(error)
    } finally {
      setCategoryLoading(false)
    }
  };

  // Получить продукты
  const getProducts = async (category_id) => {
    try {
      setLoading(true);
      setProducts([]);

      const data = {
        category_id,
        location_id,
        type: "material",
      };

      const response = await LocalProduct.GetAllProduct(data);
      setProducts(response?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Accordion toggle
  const toggleCategory = (category) => {
    if (openCategoryId === category.id) {
      setOpenCategoryId(null);
      setProducts([]);
    } else {
      setOpenCategoryId(category.id);
      getProducts(category.id);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="h-[calc(100vh-200px)] max-w-[400px] w-full">
      <Card className="w-full h-full bg-white dark:bg-[#181818]">
        <CardBody className="p-4 h-full flex flex-col text-gray-900 dark:text-gray-100">

          <Typography
            variant="h5"
            className="mb-4 font-bold text-gray-800 dark:text-gray-100"
          >
            {t("Material")}
          </Typography>
          {categoryLoading === true ? (
            <>
              <div className="flex justify-center py-4 mt-[100px]">
                <Spinner className="h-6 w-6" />
              </div>
            </>
          ) : (
            <>
              <>
                <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                  {categories.map((cat) => {
                    const isOpen = openCategoryId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className="
                border rounded-lg overflow-hidden shadow-sm
                border-gray-200 dark:border-gray-700
                bg-white dark:bg-[#212121]
              "
                      >
                        {/* Header */}
                        <button
                          onClick={() => toggleCategory(cat)}
                          className={`
                  w-full flex justify-between items-center px-4 py-3 text-left transition
                  ${isOpen
                              ? "bg-blue-50 text-blue-700 border-b border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                              : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                            }
                `}
                        >
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {cat.name}
                          </span>

                          <span
                            className={`transition-transform text-gray-500 dark:text-gray-400 ${isOpen ? "rotate-90" : ""
                              }`}
                          >
                            ▶
                          </span>
                        </button>

                        {/* Accordion body */}
                        {isOpen && (
                          <div className="px-4 py-3 space-y-3 bg-gray-50 dark:bg-[#1e1e1e]">
                            {loading ? (
                              <div className="flex justify-center py-4">
                                <Spinner className="h-6 w-6" />
                              </div>
                            ) : products.length === 0 ? (
                              <Typography
                                variant="small"
                                className="text-center py-2 text-gray-500 dark:text-gray-400"
                              >
                                Нет товаров в этой категории
                              </Typography>
                            ) : (
                              products.map((product) => (
                                <div
                                  key={product.id}
                                  className={`
                          p-3 rounded-lg border transition-all
                          ${isMaterialSelected(product.id)
                                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                      : "bg-white border-gray-200 hover:shadow-md dark:bg-[#212121] dark:border-gray-700 dark:hover:bg-[#2a2a2a]"
                                    }
                        `}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <Typography
                                        variant="small"
                                        className={`font-semibold ${isMaterialSelected(product.id)
                                          ? "text-blue-700 dark:text-blue-300"
                                          : "text-gray-800 dark:text-gray-100"
                                          }`}
                                      >
                                        {product.name}
                                      </Typography>

                                      {product.description && (
                                        <Typography
                                          variant="small"
                                          className="mt-1 text-gray-500 dark:text-gray-400"
                                        >
                                          {product.description}
                                        </Typography>
                                      )}
                                    </div>

                                    <Button
                                      size="sm"
                                      onClick={() => onMaterialSelect(product)}
                                      className={`
                              ml-2
                              ${isMaterialSelected(product.id)
                                          ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300"
                                          : "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
                                        }
                            `}
                                      variant={isMaterialSelected(product.id) ? "outlined" : "filled"}
                                    >
                                      {isMaterialSelected(product.id) ? "✓" : "+"}
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Typography
                    variant="small"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {t("Select_Material")}: {selectedMaterials.length}
                  </Typography>
                </div>
              </>
            </>
          )}
        </CardBody>
      </Card>
    </div>

  );
}