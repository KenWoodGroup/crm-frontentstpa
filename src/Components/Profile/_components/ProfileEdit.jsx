import { Button } from "@material-tailwind/react";
import Edit from "../../UI/Icons/Edit";

export default function ProfileEdit() {
    return (
        <>
            <Button
                className="bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 normal-case p-[8px] transition-colors duration-200"
            >
                <Edit size={20} />
            </Button>
        </>
    )
}