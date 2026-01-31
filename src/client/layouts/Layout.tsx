import { Outlet } from "react-router-dom";
import { Header } from "../components/layouts/Header";
import { ScrollToTopButton } from "../components/layouts/ScrollToTopButton";
import "../styles/index.css";

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Outlet />
            <ScrollToTopButton />
        </div>
    );
};
