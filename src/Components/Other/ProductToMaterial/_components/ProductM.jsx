import { Card, CardBody, Typography, IconButton } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Доступные единицы измерения
const units = [
  { value: "tonna", label: "Тонна (t)" },
  { value: "kg", label: "Килограмм (kg)" },
  { value: "dona", label: "Штука (dona)" },
  { value: "m.kub", label: "Куб. метр (m³)" },
  { value: "m.kv", label: "Кв. метр (m²)" },
  { value: "litr", label: "Литр (l)" },
  { value: "metr", label: "Метр (m)" },
];

export default function ProductM({ selectedMaterials, onUpdateMaterial, onRemoveMaterial }) {
  const [focusedInput, setFocusedInput] = useState(null);
  const { t } = useTranslation();


  // Форматирование числа с пробелами
  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Парсинг форматированного числа
  const parseFormattedNumber = (str) => {
    const cleaned = str.replace(/\s/g, '');
    if (cleaned === "") return 0;
    const num = parseInt(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Обработчик изменения количества
  const handleCountChange = (id, value) => {
    // Разрешаем пустую строку (пользователь может удалить все)
    if (value === "") {
      onUpdateMaterial(id, { count: 0 });
      return;
    }

    // Удаляем все символы кроме цифр и пробелов
    const cleaned = value.replace(/[^\d\s]/g, '');

    // Форматируем с пробелами
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    // Обновляем отображаемое значение
    const inputElement = document.getElementById(`count-${id}`);
    if (inputElement) {
      inputElement.value = formatted;
    }

    // Парсим и обновляем состояние
    const parsedValue = parseFormattedNumber(cleaned);
    onUpdateMaterial(id, { count: parsedValue });
  };

  // Обработчик изменения единицы измерения
  const handleUnitChange = (id, unit) => {
    onUpdateMaterial(id, { unit });
  };

  // Проверка, заполнено ли количество
  const isCountFilled = (count) => {
    return count > 0;
  };

  // Получение цвета рамки на основе состояния
  const getBorderColor = (count, isFocused) => {
    if (isFocused) return "border-blue-500";
    if (isCountFilled(count)) return "border-green-500";
    return "border-yellow-300";
  };

  return (
    <div className="flex-1 h-[calc(100vh-200px)]">
      <Card className="w-full h-full shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818]">
        <CardBody className="p-6 h-full flex flex-col text-gray-900 dark:text-gray-100">

          <div className="mb-6">
            <Typography
              variant="h4"
              className="font-bold text-gray-800 dark:text-gray-100"
            >
              {t("Product_materila_text")}
            </Typography>
          </div>

          {selectedMaterials.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <Typography
                variant="h6"
                className="text-gray-500 dark:text-gray-400 mb-2"
              >
                Материалы не выбраны
              </Typography>

              <Typography
                variant="small"
                className="text-gray-400 dark:text-gray-500"
              >
                Выберите материалы из списка слева
              </Typography>
            </div>
          ) : (
            <>
              {/* Список выбранных материалов */}
              <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {selectedMaterials.map((material) => {
                  const isFocused = focusedInput === material.id;
                  const isFilled = isCountFilled(material.count);

                  return (
                    <div
                      key={material.id}
                      className={`
                    rounded-lg border shadow-sm
                    bg-white dark:bg-[#212121]
                    border-gray-200 dark:border-gray-700
                    ${getBorderColor(material.count, false)}
                  `}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Typography
                            variant="h6"
                            className="font-semibold text-gray-800 dark:text-gray-100"
                          >
                            {material.name}
                          </Typography>

                          <IconButton
                            variant="text"
                            size="sm"
                            onClick={() =>
                              onRemoveMaterial(material.id, material?.db_id)
                            }
                            className="
                          text-gray-500 dark:text-gray-400
                          hover:bg-red-50 hover:text-red-500
                          dark:hover:bg-red-900/30 dark:hover:text-red-400
                        "
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Количество */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("enter_quantity")}
                              {!isFilled && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>

                            <div className="relative">
                              <input
                                type="text"
                                value={formatNumber(material.count)}
                                onChange={(e) =>
                                  handleCountChange(material.id, e.target.value)
                                }
                                onFocus={() => setFocusedInput(material.id)}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Введите количество"
                                className={`
                              w-full px-3 py-2.5 rounded-md border
                              bg-white dark:bg-[#1e1e1e]
                              text-gray-700 dark:text-gray-100
                              placeholder-gray-400 dark:placeholder-gray-500
                              focus:outline-none focus:ring-1 focus:ring-blue-500
                              transition-colors
                              ${getBorderColor(material.count, isFocused)}
                            `}
                              />

                              {isFilled && (
                                <div className="absolute right-3 top-2.5">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Единицы измерения */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t("table_col_unit")}
                            </label>

                            <div className="relative">
                              <select
                                value={material.unit}
                                onChange={(e) =>
                                  handleUnitChange(material.id, e.target.value)
                                }
                                className={`
                              w-full px-3 py-2.5 rounded-md border
                              bg-white dark:bg-[#1e1e1e]
                              text-gray-700 dark:text-gray-100
                              focus:outline-none focus:ring-1 focus:ring-blue-500
                              cursor-pointer appearance-none
                              ${getBorderColor(material.count, false)}
                            `}
                              >
                                {units.map((unit) => (
                                  <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Итог */}
                        {isFilled && (
                          <div className="mt-3 p-2 rounded border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                {t("total_prew")}:
                              </span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {formatNumber(material.count)}{" "}
                                {units
                                  .find((u) => u.value === material.unit)
                                  ?.label.split("(")[1]
                                  ?.replace(")", "") || material.unit}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>

  );
}