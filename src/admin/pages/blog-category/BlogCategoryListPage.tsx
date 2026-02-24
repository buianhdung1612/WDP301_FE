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
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
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
                        background: 'var(--palette-text-primary)',
                        minHeight: "2.25rem",
                        minWidth: "4rem",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                            background: "var(--palette-grey-700)",
                            boxShadow: "var(--customShadows-z8)"
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




