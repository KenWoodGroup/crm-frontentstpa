const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FAFAFA", // фон светлого режима
          dark: "#212121",  // фон тёмного режима
        },
        card: {
          light: "#FFFFFF", // карточки при светлой теме
          dark: "#181818",  // карточки при тёмной теме
        },
        text: {
          light: "#212121", // тёмный текст при светлой теме
          dark: "#FAFAFA",  // светлый текст при тёмной теме
        },
      },
    },
  },
  plugins: [],
});
