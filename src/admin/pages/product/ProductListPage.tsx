import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { ProductList } from "./sections/ProductList";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "../../components/ui/LoadingButton";
import { useProducts } from "./hooks/useProducts";
import { useState } from "react";
import Button from "@mui/material/Button";

export const ProductListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isTrash, setIsTrash] = useState(false);

    const productHook = useProducts();
    const { pagination, setIsTrashFilter, setStatusFilter } = productHook;

    const handleTrashToggle = () => {
        const nextIsTrash = !isTrash;
        setIsTrash(nextIsTrash);
        setIsTrashFilter(nextIsTrash);
        if (nextIsTrash) {
            setStatusFilter([]);
        }
    };

    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={isTrash ? "Thùng rác sản phẩm" : t("admin.product.title.list")} />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: "/" },
                            { label: t("admin.product.title.list"), to: `/${prefixAdmin}/product/list` },
                            { label: isTrash ? "Thùng rác" : t("admin.common.list") }
                        ]}
                    />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Button
                        onClick={handleTrashToggle}
                        sx={{
                            background: isTrash ? 'var(--palette-error-main)' : 'rgba(255, 86, 48, 0.16)',
                            color: isTrash ? '#fff' : 'var(--palette-error-main)',
                            minHeight: "2.25rem",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            padding: "6px 12px",
                            borderRadius: "var(--shape-borderRadius)",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                background: isTrash ? 'var(--palette-error-dark)' : 'rgba(255, 86, 48, 0.24)',
                            }
                        }}
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        {isTrash ? "Quay lại" : `Thùng rác (${(pagination as any).deletedCount || 0})`}
                    </Button>
                    <LoadingButton
                        onClick={() => navigate(`/${prefixAdmin}/product/create`)}
                        label={t("admin.product.title.create")}
                        startIcon={<AddIcon />}
                        sx={{
                            minHeight: "2.25rem",
                            padding: "var(--shape-borderRadius-sm) calc(2 * var(--spacing))",
                        }}
                    />
                </div>
            </div>


            <ProductList
                productHook={productHook}
                isTrash={isTrash}
            />
        </>
    )
}



