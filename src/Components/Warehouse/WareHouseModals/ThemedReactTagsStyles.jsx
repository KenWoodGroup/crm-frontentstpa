// src/utils/selectStyles.jsx
export const customSelectStyles = () => {
    const isDark = document.documentElement.classList.contains("dark");

    return {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: isDark ? "#181818" : "#fff",
            borderColor: state.isFocused
                ? (isDark ? "#3b82f6" : "#2563eb")
                : (isDark ? "#3A3A3A" : "#ccc"),
            color: isDark ? "#FAFAFA" : "#212121",
            boxShadow: state.isFocused
                ? (isDark ? "0 0 0 1px #3b82f6" : "0 0 0 1px #2563eb")
                : "none",
            "&:hover": {
                borderColor: isDark ? "#3b82f6" : "#2563eb",
            },
            borderRadius: "0.5rem", // Tailwind rounded-lg
            minHeight: "40px",
            transition: "all 0.2s ease",
        }),

        menu: (provided) => ({
            ...provided,
            backgroundColor: isDark ? "#212121" : "#fff",
            color: isDark ? "#FAFAFA" : "#212121",
            zIndex: 50,
            borderRadius: "0.5rem",
            boxShadow: isDark
                ? "0 4px 8px rgba(0,0,0,0.4)"
                : "0 4px 8px rgba(0,0,0,0.1)",
        }),

        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? (isDark ? "#3b82f6" : "#2563eb")
                : state.isFocused
                    ? (isDark ? "#333333" : "#f3f4f6")
                    : "transparent",
            color: state.isSelected
                ? "#fff"
                : (isDark ? "#FAFAFA" : "#212121"),
            cursor: "pointer",
            transition: "all 0.2s ease",
        }),

        singleValue: (provided) => ({
            ...provided,
            color: isDark ? "#FAFAFA" : "#212121",
        }),

        placeholder: (provided) => ({
            ...provided,
            color: isDark ? "#9CA3AF" : "#6B7280", // gray-400/gray-500
        }),

        input: (provided) => ({
            ...provided,
            color: isDark ? "#FAFAFA" : "#212121",
        }),

        menuList: (provided) => ({
            ...provided,
            paddingTop: 0,
            paddingBottom: 0,
        }),
    };
};
