import AddIcon from '@mui/icons-material/Add';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { ProductList } from "./sections/ProductList";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "../../components/ui/LoadingButton";

export const ProductListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={t("admin.product.title.list")} />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: "/" },
                            { label: t("admin.product.title.list"), to: `/${prefixAdmin}/product/list` },
                            { label: t("admin.common.list") }
                        ]}
                    />
                </div>
                <LoadingButton
                    onClick={() => navigate(`/${prefixAdmin}/product/create`)}
                    label={t("admin.product.title.create")}
                    startIcon={<AddIcon />}
                    sx={{
                        minHeight: "2.25rem",
                        padding: "6px 16px",
                    }}
                />
            </div>
            <ProductList />
        </>
    )
}