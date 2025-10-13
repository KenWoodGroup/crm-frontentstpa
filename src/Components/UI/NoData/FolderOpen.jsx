import { FolderOpen } from "lucide-react";

export default function FolderOpenMessage({text, icon}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        {icon ? icon : "#"}
      <span className="text-base font-medium text-center">
        {text}
      </span>
    </div>
  );
}
