import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { BlogCategoryList } from "./sections/BlogCategoryList";
import { useTranslation } from "react-i18next";

export const BlogCategoryListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={t("admin.common.list")} />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: "/" },
                            { label: t("admin.blog.title.category"), to: `/${prefixAdmin}/blog-category/list` },
                            { label: t("admin.common.list") }
                        ]}
                    />
                </div>
                <Button
                    onClick={() => navigate(`/${prefixAdmin}/blog-category/create`)}
                    sx={{
                        background: '#1C252E',
                        minHeight: "3.6rem",
                        minWidth: "6.4rem",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                            background: "#454F5B",
                            boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                        }
                    }}
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    {t("admin.blog.title.category_create")}
                </Button>
            </div>
            <BlogCategoryList />
        </>
    )
}
