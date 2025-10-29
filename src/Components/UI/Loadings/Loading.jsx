import ReactLoading from "react-loading";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-[600px] bg-background-light dark:bg-background-dark transition-colors duration-300">
            {/* Светлый режим */}
            <ReactLoading
                type="spinningBubbles"
                color="#212121"
                height={80}
                width={80}
                className="block dark:hidden"
            />
            {/* Тёмный режим */}
            <ReactLoading
                type="spinningBubbles"
                color="#FAFAFA"
                height={80}
                width={80}
                className="hidden dark:block"
            />
        </div>
    );
}
