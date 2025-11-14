export const customSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: "var(--select-bg)",
        color: "var(--select-text)",
        borderColor: state.isFocused ? "var(--select-hover)" : "var(--select-border)",
        borderRadius: "0.75rem",
        minHeight: "40px",
        boxShadow: state.isFocused ? "0 0 0 1px var(--select-border)" : "none",
        transition: "all 0.2s ease",
        "&:hover": {
            borderColor: "var(--select-hover)",
        },
    }),

    menu: (base) => ({
        ...base,
        backgroundColor: "var(--select-bg)",
        color: "var(--select-text)",
        zIndex: 50,
        borderRadius: "0.5rem",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    }),

    menuList: (base) => ({
        ...base,
        backgroundColor: "var(--select-bg)",
        color: "var(--select-text)",
        paddingTop: 0,
        paddingBottom: 0,
        maxHeight: "200px",
        overflowY: "auto",
        /* scrollbar styling */
        scrollbarWidth: "thin",
        scrollbarColor: "var(--select-border) var(--select-bg)",
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-track": {
            background: "var(--select-bg)",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--select-border)",
            borderRadius: "4px",
        },
    }),

    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "var(--select-hover)"
            : state.isFocused
                ? "var(--select-hover)"
                : "var(--select-bg)",
        color: "var(--select-text)",
        cursor: "pointer",
        transition: "all 0.2s ease",
    }),

    singleValue: (base) => ({
        ...base,
        color: "var(--select-text)",
    }),

    placeholder: (base) => ({
        ...base,
        color: "var(--select-border)",
    }),

    input: (base) => ({
        ...base,
        color: "var(--select-text)",
    }),
});
