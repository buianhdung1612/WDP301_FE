import { Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { ShippingTab } from "./components/ShippingTab";
import { PaymentTab } from "./components/PaymentTab";
import { SocialLoginTab } from "./components/SocialLoginTab";
import { AppPasswordTab } from "./components/AppPasswordTab";
import { GeneralSettingTab } from "./components/GeneralSettingTab";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export const SettingsPage = () => {
    const [value, setValue] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Cài đặt hệ thống" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Cài đặt" }
                    ]}
                />
            </Box>

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="settings tabs"
                        textColor="inherit"
                        indicatorColor="primary"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: '#637381',
                                '&.Mui-selected': {
                                    color: '#1C252E',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#1C252E',
                            }
                        }}
                    >
                        <Tab label="Cài đặt chung" {...a11yProps(0)} />
                        <Tab label="API hãng vận chuyển" {...a11yProps(1)} />
                        <Tab label="API cổng thanh toán" {...a11yProps(2)} />
                        <Tab label="API đăng nhập MXH" {...a11yProps(3)} />
                        <Tab label="API Mật khẩu ứng dụng" {...a11yProps(4)} />
                    </Tabs>
                </Box>

                <CustomTabPanel value={value} index={0}>
                    <GeneralSettingTab />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <ShippingTab />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <PaymentTab />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <SocialLoginTab />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    <AppPasswordTab />
                </CustomTabPanel>
            </Box>
        </Box>
    );
};
