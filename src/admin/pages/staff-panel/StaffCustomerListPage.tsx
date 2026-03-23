import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { AccountUserList } from "../account-user/sections/AccountUserList";
import { useAuthStore } from "../../../stores/useAuthStore";

export const StaffCustomerListPage = () => {
    const { user } = useAuthStore();

    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Khách hàng của tôi" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Nhân viên", to: `/${prefixAdmin}/staff/tasks` },
                            { label: "Khách hàng của tôi" }
                        ]}
                    />
                </div>
            </div>
            <AccountUserList />
        </>
    );
};




