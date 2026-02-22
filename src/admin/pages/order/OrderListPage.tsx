import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { OrderList } from "./sections/OrderList";
import { LoadingButton } from "../../components/ui/LoadingButton";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";

export const OrderListPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Danh sách đơn hàng" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Danh sách đơn hàng" }
                        ]}
                    />
                </div>

                <LoadingButton
                    label="Tạo đơn hàng"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/${prefixAdmin}/order/create`)}
                    sx={{
                        minHeight: "2.25rem",
                        padding: "var(--shape-borderRadius-sm) calc(2 * var(--spacing))",
                    }}
                />
            </div>

            <OrderList />
        </>
    );
};
