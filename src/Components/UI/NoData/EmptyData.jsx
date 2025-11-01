import { Typography } from "@material-tailwind/react";
import { Inbox } from "lucide-react";

export default function EmptyData({ text }) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-gray-800 mb-5">
                <Inbox className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <Typography
                variant="h5"
                className="text-gray-800 dark:text-gray-100 font-semibold mb-2 text-center"
            >
                {text}
            </Typography>
            <Typography className="text-gray-500 dark:text-gray-400 text-center max-w-md px-4">
                Bu yerda hozircha hech qanday ma’lumot yo‘q. <br />
                Yangi yozuv qo‘shib ko‘ring yoki keyinroq qaytib keling.
            </Typography>
        </div>
    );
}
