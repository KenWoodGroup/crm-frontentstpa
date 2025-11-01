import { Outlet } from "react-router-dom";
import IndependentSideBar from "../Components/Independent/IndependentSideBar/IndependentSideBar";
import Header from "../Components/UI/Header/Header";

export default function IndependentLayout() {
    return (
        <div className={` bg-background-light dark:bg-background-dark transition-colors  min-h-screen duration-300 pl-[125px]`}>
            <IndependentSideBar />
            <div className="pt-[10px] pr-[10px]">
                <Header />
                <Outlet />
            </div>
        </div>
    );
}
