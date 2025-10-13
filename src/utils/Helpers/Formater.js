export const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const unformatNumber = (formattedValue) => {
    if (!formattedValue) return 0;
    return Number(formattedValue.toString().replace(/\s/g, ""));
};
