import { useParams } from "react-router-dom";
import { LocalProduct } from "../../../utils/Controllers/LocalProduct";
import Material from "./_components/Material";
import { useEffect, useState } from "react";
import Loading from "../../UI/Loadings/Loading";
import ProductM from "./_components/ProductM";
import { Button } from "@material-tailwind/react";
import { ProductToMaterialApi } from "../../../utils/Controllers/ProductToMaterialApi";
import { Alert } from "../../../utils/Alert";
import { useTranslation } from "react-i18next";

export default function ProductToMaterial() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [saving, setSaving] = useState(false)
  const [existingMaterials, setExistingMaterials] = useState([])
  const { t } = useTranslation();

  // Загрузка существующих материалов
  const loadExistingMaterials = async () => {
    setLoading(true)
    try {
      const response = await ProductToMaterialApi.GetProductMaterial(id)

      if (response?.data && Array.isArray(response.data)) {
        // Сохраняем данные о существующих материалах
        setExistingMaterials(response.data);

        // Если есть существующие материалы, загружаем их детали
        if (response.data.length > 0) {
          // Создаем массив для выбранных материалов из существующих данных
          const materialsFromServer = await Promise.all(
            response.data.map(async (item) => {
              try {
                // Получаем информацию о материале по его ID
                const materialResponse = await LocalProduct.GetByid(item.material_id);
                const materialData = materialResponse?.data;

                return {
                  id: item.material_id,
                  name: materialData?.name || `Материал ${item.material_id}`,
                  description: materialData?.description || '',
                  category_id: materialData?.category_id || null,
                  count: item.count,
                  unit: item.unit,
                  // Сохраняем ID записи из базы данных для обновления
                  db_id: item.id,
                  // Сохраняем оригинальные значения для сравнения
                  original_count: item.count,
                  original_unit: item.unit
                };
              } catch (error) {
                console.error(`Ошибка загрузки материала ${item.material_id}:`, error);
                return {
                  id: item.material_id,
                  name: `Материал ${item.material_id}`,
                  description: '',
                  category_id: null,
                  count: item.count,
                  unit: item.unit,
                  db_id: item.id,
                  original_count: item.count,
                  original_unit: item.unit
                };
              }
            })
          );

          // Фильтруем успешно загруженные материалы
          const validMaterials = materialsFromServer.filter(m => m !== null);
          setSelectedMaterials(validMaterials);
        }
      }
    } catch (error) {
      console.log("Ошибка загрузки существующих материалов:", error);
      // Если нет существующих материалов, это нормально - просто начинаем с пустого списка
    }finally {
      setLoading(false)
    }
  }

  // Функция для обработки выбора материала
  const handleMaterialSelect = (material) => {
    const existingMaterial = selectedMaterials.find(item => item.id === material.id);

    if (!existingMaterial) {
      const newMaterial = {
        id: material.id,
        name: material.name,
        description: material.description,
        category_id: material.category_id,
        count: 0,
        unit: "dona"
      };
      setSelectedMaterials(prev => [...prev, newMaterial]);
    }
  }

  // Функция для обновления количества
  const handleUpdateMaterial = (id, updates) => {
    setSelectedMaterials(prev =>
      prev.map(material =>
        material.id === id ? { ...material, ...updates } : material
      )
    );
  }

  // Функция для удаления материала
  const handleRemoveMaterial = async (material_id, db_id) => {
    try {
      // Если есть db_id (старая запись), удаляем через API
      if (db_id) {
        const response = await ProductToMaterialApi?.RemoveProductMaterial(db_id);
      }
      
      // Удаляем из локального состояния
      setSelectedMaterials(prev => prev.filter(material => material.id !== material_id));
      
      // Обновляем список существующих материалов
      await loadExistingMaterials();
      
      Alert(t("success"), "success");
    } catch (error) {
      console.log(error);
      Alert(t("Error"), "error");
    }
  }

  // Проверка изменились ли данные материала
  const hasMaterialChanged = (material) => {
    if (!material.db_id) {
      // Новый материал - всегда считается измененным
      return true;
    }
    
    // Проверяем изменилось ли количество или единица измерения
    return material.count !== material.original_count || 
           material.unit !== material.original_unit;
  }

  // Функция сохранения/обновления материалов
  const handleSaveMaterials = async () => {
    // Проверяем, что у всех материалов заполнено количество
    const hasEmptyCount = selectedMaterials.some(material => material.count <= 0);
    if (hasEmptyCount) {
      Alert("Укажите количество для всех выбранных материалов!", 'error');
      return;
    }

    setSaving(true);

    try {
      // Разделяем материалы на 3 группы:
      // 1. Новые материалы (db_id = null)
      // 2. Измененные существующие материалы
      // 3. Неизмененные материалы (не отправляем)
      
      const newMaterials = [];
      const updatedMaterials = [];
      
      selectedMaterials.forEach(material => {
        const materialData = {
          product_id: id,
          material_id: material.id,
          count: material.count,
          unit: material.unit
        };
        
        if (!material.db_id) {
          // Новый материал - добавляем в create
          newMaterials.push(materialData);
        } else if (hasMaterialChanged(material)) {
          // Измененный существующий материал - добавляем в update
          updatedMaterials.push({
            id: material.db_id,
            ...materialData
          });
        }
        // Если материал не изменился - пропускаем
      });
      
      
      // Выполняем операции в правильном порядке
      let createdCount = 0;
      let updatedCount = 0;
      
      // 1. Создаем новые материалы (если есть)
      if (newMaterials.length > 0) {
        const createData = { list: newMaterials };
        const createResponse = await ProductToMaterialApi?.CreateProductMaterial(createData);
        createdCount = newMaterials.length;
      }
      
      // 2. Обновляем измененные материалы (если есть)
      if (updatedMaterials.length > 0) {
        const updateData = { list: updatedMaterials };
        const updateResponse = await ProductToMaterialApi?.PutProductMaterial(updateData);
        updatedCount = updatedMaterials.length;
      }
      
      // Обновляем список существующих материалов
      await loadExistingMaterials();
      
      // Показываем информативное сообщение
      if (createdCount > 0 && updatedCount > 0) {
        Alert(`${t("success")}: создано ${createdCount}, обновлено ${updatedCount} материалов`, "success");
      } else if (createdCount > 0) {
        Alert(`${t("success")}: создано ${createdCount} материалов`, "success");
      } else if (updatedCount > 0) {
        Alert(`${t("success")}: обновлено ${updatedCount} материалов`, "success");
      } else {
        Alert("Нет изменений для сохранения", "info");
      }

    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      Alert(t("Error"), "error");
    } finally {
      setSaving(false);
    }
  }

  // Функция для проверки валидности данных
  const isFormValid = () => {
    if (selectedMaterials.length === 0) return false;

    // Проверяем, что у всех материалов есть количество больше 0
    return !selectedMaterials.some(material => material.count <= 0);
  }

  // Подсчет статистики
  const getStats = () => {
    const total = selectedMaterials.length;
    const newCount = selectedMaterials.filter(m => !m.db_id).length;
    const changedCount = selectedMaterials.filter(m => m.db_id && hasMaterialChanged(m)).length;
    const unchangedCount = selectedMaterials.filter(m => m.db_id && !hasMaterialChanged(m)).length;
    
    return { total, newCount, changedCount, unchangedCount };
  }

  // Функция загрузки информации о продукте
  const GetProduct = async () => {
    try {
      const response = await LocalProduct.GetByid(id)
      setData(response?.data)
    } catch (error) {
      console.log(error)
    } 
  }

  useEffect(() => {
    const loadData = async () => {
      await GetProduct();
      await loadExistingMaterials();
    };

    loadData();
  }, [id])

  if (loading) {
    return <Loading />
  }

  const stats = getStats();

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[25px] text-black font-bold dark:text-text-dark">
            {data?.name}
          </h1>
        </div>

        {/* Статистика и кнопки управления */}
        <div className="flex items-center gap-3">
      <Button
  onClick={handleSaveMaterials}
  disabled={
    !isFormValid() ||
    saving ||
    (stats.changedCount === 0 && stats.newCount === 0)
  }
  className={`
    flex items-center gap-2 transition-all
    ${
      stats.changedCount > 0 || stats.newCount > 0
        ? `
          bg-blue-500 hover:bg-blue-600
          dark:bg-blue-600 dark:hover:bg-blue-500
          text-white
        `
        : `
          bg-gray-300 text-gray-500
          dark:bg-[#2a2a2a] dark:text-gray-500
        `
    }
    disabled:opacity-100
    disabled:cursor-not-allowed
  `}
>
  {saving ? (
    <>
      <svg
        className="animate-spin h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {t("Saving")}
    </>
  ) : (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {t("Save")}
    </>
  )}
</Button>

        </div>
      </div>


      <div className="flex items-start justify-between w-full gap-4">
        <Material
          onMaterialSelect={handleMaterialSelect}
          selectedMaterials={selectedMaterials}
          existingMaterialIds={existingMaterials.map(m => m.material_id)}
        />
        <ProductM
          selectedMaterials={selectedMaterials}
          onUpdateMaterial={handleUpdateMaterial}
          onRemoveMaterial={handleRemoveMaterial}
          productName={data?.name}
          existingMaterials={existingMaterials}
          hasMaterialChanged={hasMaterialChanged}
        />
      </div>
    </>
  )
}