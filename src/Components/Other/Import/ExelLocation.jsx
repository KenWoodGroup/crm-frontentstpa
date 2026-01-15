import { Button } from "@material-tailwind/react";
import { location } from "../../../utils/Controllers/location";
import Cookies from "js-cookie";

export default function ExelLocation({ type }) {

    const Import = async () => {
        try {
            const data = {
                location_id: Cookies.get("ul_nesw"),
            };

            const response = await location.ImportExel(type, data);

            // 🔹 Создаём файл
            const blob = new Blob(
                [response.data],
                { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
            );

            // 🔹 Создаём ссылку
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${type}.xlsx`; // имя файла
            document.body.appendChild(link);
            link.click();

            // 🔹 Чистим память
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Button
            className="flex items-center gap-[5px] bg-blue-600 text-white hover:bg-blue-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
            onClick={Import}>
            Excel <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z" /></svg>
        </Button>
    );
}
