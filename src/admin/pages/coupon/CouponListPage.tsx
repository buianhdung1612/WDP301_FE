import Button from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { CouponList } from "./sections/CouponList";

export const CouponListPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Danh sách mã giảm giá" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Mã giảm giá", to: `/${prefixAdmin}/coupon/list` },
                            { label: "Danh sách" }
                        ]}
                    />
                </div>
                <Button
                    onClick={() => navigate(`/${prefixAdmin}/coupon/create`)}
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
                    Thêm mã giảm giá
                </Button>
            </div>
            <CouponList />
        </>
    )
}
