import { Outlet, useMatch, useSearchParams } from "react-router-dom";
import { BlogTagDialog } from "../pages/blog/components/BlogTagDialog";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import { SideBar } from "../components/layouts/sidebar/SideBar";
import { Header } from "../components/layouts/Header";
import { adminTheme } from "../config/theme";
import '../styles/index.css';
import { useSidebar } from "../context/sidebar/useSidebar";
import { SidebarProvider } from "../context/sidebar/SidebarProvider";

const LayoutAdminContent = () => {
    const isBlogDetail = useMatch("/admin/blog/detail/:id");
    const { isOpen } = useSidebar();
    const [searchParams, setSearchParams] = useSearchParams();

    const isTagsModalOpen = searchParams.get('modal') === 'tags';

    const handleCloseTags = () => {
        searchParams.delete('modal');
        setSearchParams(searchParams);
    };

    return (
        <div className="flex">
            <ToastContainer />
            <SideBar />

            <div className={`flex-1 transition-[padding-left] duration-[120ms] ease-linear ${isOpen ? 'pl-[300px]' : 'pl-[88px]'}`}>
                <ThemeProvider theme={adminTheme}><Header /></ThemeProvider>

                <ThemeProvider theme={adminTheme}>
                    <main
                        className={
                            isBlogDetail
                                ? undefined
                                : "w-[1200px] mx-auto px-[40px] pt-[8px] pb-[64px]"
                        }
                    >
                        <Outlet />
                    </main>
                </ThemeProvider>
            </div>
            <ThemeProvider theme={adminTheme}>
                {isTagsModalOpen && <BlogTagDialog open={true} onClose={handleCloseTags} />}
            </ThemeProvider>
        </div>
    );
};

export const LayoutAdmin = () => {
    return (
        <SidebarProvider>
            <LayoutAdminContent />
        </SidebarProvider>
    );
};
