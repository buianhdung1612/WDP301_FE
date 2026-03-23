import { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { ProductAttributeList } from "./sections/ProductAttributeList";

export const ProductAttributeListPage = () => {
    const navigate = useNavigate();
    const [isTrash, setIsTrash] = useState(false);

    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={isTrash ? "Thùng rác thuộc tính" : "Thuộc tính sản phẩm"} />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Sản phẩm", to: `/${prefixAdmin}/product/list` },
                            { label: isTrash ? "Thùng rác" : "Thuộc tính sản phẩm" }
                        ]}
                    />
                </div>
                <Button
                    onClick={() => setIsTrash(!isTrash)}
                    sx={{
                        background: isTrash ? 'var(--palette-text-secondary)' : 'var(--palette-error-main)',
                        minHeight: "2.25rem",
                        minWidth: "4rem",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        padding: "6px 12px",
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: "none",
                        boxShadow: "none",
                        color: "white",
                        "&:hover": {
                            background: isTrash ? "var(--palette-grey-600)" : "var(--palette-error-dark)",
                            boxShadow: "var(--customShadows-z8)"
                        }
                    }}
                    variant="contained"
                    startIcon={isTrash ? <ArrowBackIcon /> : <DeleteIcon />}
                >
                    {isTrash ? "Quay lại" : "Thùng rác"}
                </Button>
                {!isTrash && (
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
                )}
            </div>

            <ProductAttributeList isTrash={isTrash} />
        </>
    )
}




