import { createContext, useState, useEffect } from "react";

export const FontContext = createContext();

export function FontProvider({ children }) {
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        const savedFont = localStorage.getItem("textFontSize");
        if (savedFont) setFontSize(Number(savedFont));
    }, []);

    const updateFont = (size) => {
        setFontSize(size);
        localStorage.setItem("textFontSize", size);
    };

    return (
        <FontContext.Provider value={{ fontSize, updateFont }}>
            {children}
        </FontContext.Provider>
    );
}
