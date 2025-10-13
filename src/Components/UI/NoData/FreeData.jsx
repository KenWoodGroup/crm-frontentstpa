
export default function FreeData({ text, icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            {icon ? icon : "#"}
            <span className="text-base font-medium">
                {text}
            </span>
        </div>
    );
}
