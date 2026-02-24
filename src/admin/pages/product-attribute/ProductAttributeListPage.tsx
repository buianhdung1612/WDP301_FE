import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { ProductAttributeList } from "./sections/ProductAttributeList";

export const ProductAttributeListPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Thuộc tính sản phẩm" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Sản phẩm", to: `/${prefixAdmin}/product/list` },
                            { label: "Thuộc tính sản phẩm" }
                        ]}
                    />
                </div>
                <Button
                    onClick={() => navigate(`/${prefixAdmin}/product/attribute/create`)}
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
                    Thêm thuộc tính
                </Button>
            </div>

            <ProductAttributeList />
        </>
    )
}




