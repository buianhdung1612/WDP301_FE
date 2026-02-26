import { Box, Tabs, Tab } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { ShippingTab } from "./components/ShippingTab";
import { PaymentTab } from "./components/PaymentTab";
import { SocialLoginTab } from "./components/SocialLoginTab";
import { AppPasswordTab } from "./components/AppPasswordTab";
import { GeneralSettingTab } from "./components/GeneralSettingTab";
import { prefixAdmin } from "../../constants/routes";


export const SettingsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { label: "Cài đặt chung", path: "general", component: <GeneralSettingTab /> },
        { label: "Vận chuyển", path: "shipping", component: <ShippingTab /> },
        { label: "Thanh toán", path: "payment", component: <PaymentTab /> },
        { label: "Đăng nhập MXH", path: "social", component: <SocialLoginTab /> },
        { label: "Mật khẩu ứng dụng", path: "app-password", component: <AppPasswordTab /> },
    ];

    const currentTabPath = location.pathname.split("/").pop();
    const currentTabIndex = tabs.findIndex(t => t.path === currentTabPath);
    const activeIndex = currentTabIndex === -1 ? 0 : currentTabIndex;

    const BREADCRUMBS = [
        { label: "Dashboard", to: `/${prefixAdmin}` },
        { label: "Cài đặt", to: `/${prefixAdmin}/dashboard/settings/general` },
        { label: tabs[activeIndex].label }
    ];

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        navigate(`/${prefixAdmin}/dashboard/settings/${tabs[newValue].path}`);
    };

    return (
        <Box>
            <Box sx={{ mb: 5 }}>
                <Title title="Cài đặt hệ thống" />
                <Breadcrumb items={BREADCRUMBS} />
            </Box>

            <Box sx={{ width: '100%' }}>
                <Tabs
                    value={activeIndex}
                    onChange={handleChangeTab}
                    sx={{
                        mb: 4,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#00A76F',
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            minWidth: 100,
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: '#00A76F',
                            },
                        }
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>

                <Box sx={{ mt: 2 }}>
                    {tabs[activeIndex].component}
                </Box>
            </Box>
        </Box>
    );
};
