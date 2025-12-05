import { Toaster } from "react-hot-toast";

export default function WarehouseNotifyContainer() {
    return (
        <Toaster
            containerClassName=""
            toastOptions={{
                duration: Infinity,       // o‘chmaydi
                position: "top-center",
                style: {
                    background: "transparent",
                    boxShadow: "none",
                    padding: 0,
                },
            }}
            reverseOrder={false}
            gutter={12}
            containerStyle={{
                top: 20,
            }}
        />
    );
}
