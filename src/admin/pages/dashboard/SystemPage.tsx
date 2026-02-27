import { Grid, Box, Typography, Button, Card, Divider, CardProps, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Stack, Avatar, Tabs, Tab } from "@mui/material"
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import { useState } from "react";

// Shared styled Card component for consistency
const DashboardCard = ({ children, sx, ...props }: CardProps) => (
    <Card
        sx={{
            bgcolor: 'var(--palette-background-paper)',
            color: 'var(--palette-text-primary)',
            position: 'relative',
            boxShadow: 'var(--card-shadow, var(--customShadows-card))',
            borderRadius: '16px',
            transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            ...sx,
        }}
        {...props}
    >
        {children}
    </Card>
);

const CupIcon = ({ size = 20, sx }: { size?: number, sx?: any }) => (
    <Box
        component="svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        sx={{ ...sx }}
    >
        <path fill="currentColor" d="M22 8.162v.073c0 .86 0 1.291-.207 1.643s-.584.561-1.336.98l-.793.44c.546-1.848.729-3.834.796-5.532l.01-.221l.002-.052c.651.226 1.017.395 1.245.711c.283.393.283.915.283 1.958m-20 0v.073c0 .86 0 1.291.207 1.643s.584.561 1.336.98l.794.44c-.547-1.848-.73-3.834-.797-5.532l-.01-.221l-.001-.052c-.652.226-1.018.395-1.246.711C2 6.597 2 7.12 2 8.162" />
        <path fill="currentColor" fillRule="evenodd" d="M12 2c1.784 0 3.253.157 4.377.347c1.139.192 1.708.288 2.184.874s.45 1.219.4 2.485c-.172 4.349-1.11 9.78-6.211 10.26V19.5h1.43a1 1 0 0 1 .98.804l.19.946H18a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5h2.65l.19-.946a1 1 0 0 1 .98-.804h1.43v-3.534c-5.1-.48-6.038-5.912-6.21-10.26c-.051-1.266-.076-1.9.4-2.485c.475-.586 1.044-.682 2.183-.874A26.4 26.4 0 0 1 12 2m.952 4.199l-.098-.176C12.474 5.34 12.284 5 12 5s-.474.34-.854 1.023l-.098.176c-.108.194-.162.29-.246.354c-.085.064-.19.088-.4.135l-.19.044c-.738.167-1.107.25-1.195.532s.164.577.667 1.165l.13.152c.143.167.215.25.247.354s.021.215 0 .438l-.02.203c-.076.785-.114 1.178.115 1.352c.23.174.576.015 1.267-.303l.178-.082c.197-.09.295-.135.399-.135s.202.045.399.135l.178.082c.691.319 1.037.477 1.267.303s.191-.567.115-1.352l-.02-.203c-.021-.223-.032-.334 0-.438s.104-.187.247-.354l.13-.152c.503-.588.755-.882.667-1.165c-.088-.282-.457-.365-1.195-.532l-.19-.044c-.21-.047-.315-.07-.4-.135c-.084-.064-.138-.16-.246-.354" clipRule="evenodd" />
    </Box>
);

const CAROUSEL_DATA = [
    {
        title: "Sự trỗi dậy của làm việc từ xa: Lợi ích và Xu hướng",
        description: "Khám phá cách làm việc từ xa đang thay đổi bộ mặt của các doanh nghiệp hiện đại.",
        image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-4.webp",
    },
    {
        title: "Công nghệ Blockchain: Không chỉ là tiền điện tử",
        description: "Tìm hiểu về tiềm năng to lớn của Blockchain trong việc bảo mật dữ liệu.",
        image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-5.webp",
    },
    {
        title: "Sức khỏe tâm thần trong kỷ nguyên số",
        description: "Cách cân bằng giữa mạng xã hội và đời sống thực để duy trì sức khỏe.",
        image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-6.webp",
    }
];

interface SummaryWidgetProps {
    title: string;
    total: string;
    percent: number;
    color?: string;
    chartData: number[];
}

const SummaryWidget = ({ title, total, percent, color = '#00a76f', chartData }: SummaryWidgetProps) => {
    const isLoss = percent < 0;

    const chartOptions: any = {
        chart: { sparkline: { enabled: true } },
        plotOptions: { bar: { columnWidth: '80%', borderRadius: 2 } },
        colors: [color],
        tooltip: { enabled: false },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } }
        },
        grid: { padding: { top: 2, bottom: 2 } }
    };

    return (
        <DashboardCard sx={{ display: 'flex', alignItems: 'center', p: 'calc(3 * var(--spacing))' }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography sx={{ mt: 1.5, mb: 1, fontSize: '2rem', fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
                    {total}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon
                        icon={isLoss ? "solar:double-alt-arrow-down-bold-duotone" : "solar:double-alt-arrow-up-bold-duotone"}
                        width={24} height={24}
                        style={{ color: isLoss ? '#ff5630' : '#22c55e' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {percent > 0 ? `+${percent}` : percent}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)', fontWeight: 400 }}>
                        7 ngày qua
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ width: 60, height: 48 }}>
                <Chart type="bar" series={[{ data: chartData }]} options={chartOptions} width={60} height={48} />
            </Box>
        </DashboardCard>
    );
};

const PetDistributionChart = () => {
    const chartOptions: any = {
        chart: { type: 'donut' },
        labels: ['Mèo', 'Chó', 'Khác'],
        legend: { show: false },
        stroke: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Tổng',
                            formatter: () => '188,245',
                            color: 'var(--palette-text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        },
                        value: {
                            show: true,
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: 'var(--palette-text-primary)'
                        }
                    }
                }
            }
        },
        colors: ['#007867', '#5BE49B', '#004B50']
    };

    const series = [44313, 53345, 78343];

    return (
        <DashboardCard>
            <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Phân bổ thú cưng</Typography>
                <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)', mt: 0.5 }}>Thống kê theo chủng loại</Typography>
            </Box>

            <Box
                sx={{
                    height: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: '12px',
                    mt: 'calc(2 * var(--spacing))',
                    mb: 'calc(2 * var(--spacing))',
                    ml: 'auto',
                    mr: 'auto'
                }}
            >
                <Chart options={chartOptions} series={series} type="donut" width={260} height={260} />
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {chartOptions.labels.map((label: string, index: number) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: chartOptions.colors[index] }} />
                        <Typography sx={{ fontSize: '0.813rem', fontWeight: 600 }}>{label}</Typography>
                    </Box>
                ))}
            </Box>
        </DashboardCard>
    );
};

const NewProductsTable = () => {
    const products = [
        { id: '1', name: 'Thức ăn hạt Royal Canin', category: 'Thức ăn', price: '450.000đ', status: 'Còn hàng', color: '#00a76f' },
        { id: '2', name: 'Vòng cổ thời trang LED', category: 'Phụ kiện', price: '120.000đ', status: 'Hết hàng', color: '#ff5630' },
        { id: '3', name: 'Pate mèo Snappy Tom', category: 'Thức ăn', price: '35.000đ', status: 'Còn hàng', color: '#00a76f' },
        { id: '4', name: 'Cát đậu nành hữu cơ', category: 'Vệ sinh', price: '185.000đ', status: 'Còn hàng', color: '#00a76f' },
        { id: '5', name: 'Sữa tắm Joyful Paw', category: 'Dịch vụ', price: '250.000đ', status: 'Đang nhập', color: '#ffab00' },
    ];

    return (
        <DashboardCard>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Sản phẩm mới</Typography>
            </Box>
            <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 640 }}>
                    <TableHead sx={{ bgcolor: 'var(--palette-background-neutral)', borderBottom: 'none' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, borderBottom: 'none' }}>Tên sản phẩm</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, borderBottom: 'none' }}>Danh mục</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, borderBottom: 'none' }}>Giá</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, borderBottom: 'none' }}>Trạng thái</TableCell>
                            <TableCell sx={{ borderBottom: 'none' }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((row) => (
                            <TableRow key={row.id} sx={{ height: '68.4px' }}>
                                <TableCell sx={{
                                    fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.57143,
                                    color: 'var(--palette-text-primary)',
                                    borderBottom: '1px dashed var(--palette-divider)',
                                    padding: '16px',
                                }}>
                                    {row.name}
                                </TableCell>
                                <TableCell sx={{
                                    fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                    fontWeight: 400,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.57143,
                                    color: 'var(--palette-text-primary)',
                                    borderBottom: '1px dashed var(--palette-divider)',
                                    padding: '16px',
                                }}>
                                    {row.category}
                                </TableCell>
                                <TableCell sx={{
                                    fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                    fontWeight: 400,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.57143,
                                    color: 'var(--palette-text-primary)',
                                    borderBottom: '1px dashed var(--palette-divider)',
                                    padding: '16px',
                                }}>
                                    {row.price}
                                </TableCell>
                                <TableCell sx={{
                                    borderBottom: '1px dashed var(--palette-divider)',
                                    padding: '16px',
                                }}>
                                    <Box
                                        sx={{
                                            height: 24,
                                            minWidth: 22,
                                            lineHeight: 0,
                                            borderRadius: '6px',
                                            cursor: 'default',
                                            alignItems: 'center',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-flex',
                                            justifyContent: 'center',
                                            padding: '0px 6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            bgcolor: `${row.color}14`,
                                            color: row.color,
                                        }}
                                    >
                                        {row.status}
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{
                                    borderBottom: '1px dashed var(--palette-divider)',
                                    padding: '16px',
                                }}>
                                    <Icon icon="eva:more-vertical-fill" width={20} height={20} style={{ color: 'var(--palette-text-disabled)' }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ p: 2, textAlign: 'right' }}>
                <Button
                    component={Link}
                    to="/admin/dashboard/products"
                    size="small"
                    color="inherit"
                    endIcon={<Icon icon="eva:arrow-ios-forward-fill" />}
                    sx={{
                        p: '4px',
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: 'var(--palette-action-hover)',
                        }
                    }}
                >
                    Xem tất cả
                </Button>
            </Box>
        </DashboardCard>
    );
};

const TopSellingProducts = () => {
    const [tab, setTab] = useState(0);

    const products = [
        { name: 'Pate mèo Whiskas', category: 'Thức ăn', sales: '9.91k', rating: '9.91k', price: 'Free', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-1.webp' },
        { name: 'Cát vệ sinh Crystal', category: 'Vệ sinh', sales: '1.95k', rating: '1.95k', price: 'Free', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-2.webp' },
        { name: 'Sữa tắm chó Joy', category: 'Dịch vụ', sales: '9.12k', rating: '9.12k', price: '$68.71', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-3.webp', color: '#00a76f' },
        { name: 'Xương gặm bò', category: 'Đồ chơi', sales: '6.98k', rating: '6.98k', price: 'Free', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-4.webp' },
        { name: 'Bát ăn đôi Inox', category: 'Phụ kiện', sales: '8.49k', rating: '8.49k', price: '$52.17', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-5.webp', color: '#00a76f' },
    ];

    return (
        <DashboardCard sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Sản phẩm bán chạy</Typography>
            </Box>

            <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{
                    bgcolor: 'var(--palette-background-neutral)',
                    borderRadius: '8px',
                    px: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="fullWidth"
                        sx={{
                            width: '100%',
                            minHeight: 48,
                            '& .MuiTabs-indicator': {
                                height: 'calc(100% - 8px)',
                                borderRadius: '8px',
                                bgcolor: 'var(--palette-common-white)',
                                boxShadow: 'var(--customShadows-z1, 0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12))',
                                zIndex: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                            }
                        }}
                    >
                        {['7 ngày qua', '30 ngày qua', 'Tất cả'].map((label, i) => (
                            <Tab
                                key={label}
                                label={label}
                                sx={{
                                    zIndex: 1,
                                    minHeight: 52,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: '0px',
                                    color: tab === i ? 'var(--palette-text-primary) !important' : 'var(--palette-text-secondary)',
                                    opacity: 1,
                                    transition: 'color 300ms',
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            <Stack spacing={3} sx={{ p: 3, pt: 0 }}>
                {products.map((item) => (
                    <Stack key={item.name} direction="row" alignItems="center" spacing={2}>
                        <Avatar variant="rounded" src={item.image} sx={{ width: 48, height: 48, bgcolor: 'var(--palette-background-neutral)' }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                <Box sx={{ px: 0.5, borderRadius: '4px', bgcolor: 'var(--palette-background-neutral)', fontSize: '0.75rem', color: 'var(--palette-text-secondary)' }}>
                                    {item.price === 'Free' ? 'Miễn phí' : item.price}
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5, color: 'var(--palette-text-disabled)' }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Icon icon="solar:download-bold" width={16} />
                                    <Typography variant="caption">{item.sales}</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <Icon icon="solar:star-bold" width={16} style={{ color: '#ffab00' }} />
                                    <Typography variant="caption">{item.rating}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                        <Icon icon="eva:more-vertical-fill" width={20} style={{ color: 'var(--palette-text-disabled)' }} />
                    </Stack>
                ))}
            </Stack>
        </DashboardCard>
    );
};

const TopCustomers = () => {
    const customers = [
        { name: 'Nguyễn Văn A', total: '15.2M', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-4.webp', color: '#ffab00' },
        { name: 'Trần Thị B', total: '12.8M', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-5.webp', color: '#00b8d9' },
        { name: 'Lê Văn C', total: '10.5M', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-6.webp', color: '#8e33ff' },
    ];

    return (
        <DashboardCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 3 }}>Khách hàng tiêu biểu</Typography>
            <Stack spacing={3}>
                {customers.map((customer) => (
                    <Stack key={customer.name} direction="row" alignItems="center" spacing={2}>
                        <Avatar src={customer.image} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{customer.name}</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'var(--palette-text-disabled)' }}>
                                <Icon icon="solar:cart-bold" width={16} />
                                <Typography variant="caption">{customer.total}</Typography>
                            </Stack>
                        </Box>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: `${customer.color}14`, color: customer.color
                        }}>
                            <Icon icon="solar:medal-star-bold" width={20} />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </DashboardCard>
    );
};

const TopAuthors = () => {
    const authors = [
        { name: 'Jayvion Simon', likes: '9.91k', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-1.webp', color: '#00a76f' },
        { name: 'Deja Brady', likes: '9.12k', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-2.webp', color: '#00b8d9' },
        { name: 'Lucian Obrien', likes: '1.95k', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-3.webp', color: '#ff5630' },
    ];

    return (
        <DashboardCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 3 }}>Nhân viên tiêu biểu</Typography>
            <Stack spacing={3}>
                {authors.map((author) => (
                    <Stack key={author.name} direction="row" alignItems="center" spacing={2}>
                        <Avatar src={author.image} sx={{ width: 40, height: 40 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{author.name}</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'var(--palette-text-disabled)' }}>
                                <Icon icon="solar:heart-bold" width={16} />
                                <Typography variant="caption">{author.likes}</Typography>
                            </Stack>
                        </Box>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: `${author.color}14`, color: author.color
                        }}>
                            <CupIcon />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </DashboardCard>
    );
};

const ProgressCard = ({ title, total, percent, color, bgIcon }: any) => {
    const isConversion = title === "Conversion";
    const chartColor = isConversion ? "#00a76f" : "#00b8d9";
    const chartGradient = isConversion ? "#5be49b" : "#4cf5e1";

    const chartOptions: any = {
        chart: { sparkline: { enabled: true } },
        stroke: { lineCap: 'round' },
        grid: { padding: { top: -15, bottom: -15 } },
        plotOptions: {
            radialBar: {
                hollow: { size: '62%' },
                track: {
                    background: 'rgba(255,255,255,0.08)',
                    strokeWidth: '100%',
                    margin: 0
                },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: 6,
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        formatter: (val: number) => `${val}%`,
                    },
                },
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                gradientToColors: [chartGradient],
                stops: [0, 100]
            }
        },
        colors: [chartColor]
    };

    return (
        <Box sx={{
            p: 3,
            gap: 3,
            borderRadius: '16px',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
            alignItems: 'center',
            color: 'var(--palette-common-white)',
            bgcolor: color,
            height: 120,
        }}>
            <Box sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                right: -40,
                opacity: 0.08,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 0,
            }}>
                {bgIcon}
            </Box>

            <Box sx={{
                width: 80,
                height: 80,
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '6px 6px',
            }}>
                <Chart
                    type="radialBar"
                    series={[percent]}
                    options={chartOptions}
                    width={80}
                    height={80}
                />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{total}</Typography>
                <Typography sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.57143,
                    opacity: 0.64,
                    mt: 0.5
                }}>
                    {title}
                </Typography>
            </Box>
        </Box>
    );
};

const ServiceUsageChart = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedYear, setSelectedYear] = useState('2024');

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (year?: string) => {
        if (year && typeof year === 'string') setSelectedYear(year);
        setAnchorEl(null);
    };

    const chartOptions: any = {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        plotOptions: { bar: { columnWidth: '22.4px', borderRadius: 4 } },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { show: true } },
        grid: { strokeDashArray: 3, borderColor: 'var(--palette-divider)' },
        legend: { show: false },
        colors: ['#007867', '#FFAB00', '#00B8D9'],
        dataLabels: { enabled: false }
    };

    const series = [
        { name: 'Cắt tỉa', data: [10, 18, 14, 9, 20, 10, 22, 19, 8, 22, 8, 17] },
        { name: 'Khám bệnh', data: [5, 12, 10, 7, 10, 13, 15, 12, 6, 15, 7, 13] },
        { name: 'Huấn luyện', data: [2, 13, 12, 6, 18, 5, 17, 16, 5, 16, 6, 14] }
    ];

    return (
        <DashboardCard sx={{ p: 3, pb: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Thống kê dịch vụ</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)', mt: 0.5 }}>
                        <span style={{ fontWeight: 600, color: 'var(--palette-success-main)' }}>(+43%)</span> so với năm ngoái
                    </Typography>
                </Box>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={handleClick}
                    endIcon={<Icon icon={open ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} />}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        bgcolor: 'transparent',
                        color: 'inherit',
                        pr: 'var(--spacing)',
                        pl: 'calc(1.5 * var(--spacing))',
                        gap: 'calc(1.5 * var(--spacing))',
                        height: '34px',
                        borderRadius: 'var(--shape-borderRadius)',
                        fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        lineHeight: 1.57143,
                        border: 'solid 1px rgba(var(--palette-grey-500Channel) / 24%)',
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: 'rgba(var(--palette-grey-500Channel) / 8%)',
                            border: 'solid 1px rgba(var(--palette-grey-500Channel) / 32%)',
                        }
                    }}
                >
                    {selectedYear}
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => handleClose()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: '12px',
                            boxShadow: 'var(--customShadows-z20, 0 0 2px 0 rgba(145, 158, 171, 0.24), -20px 20px 40px -4px rgba(145, 158, 171, 0.24))',
                            border: 'solid 1px rgba(145, 158, 171, 0.08)',
                            minWidth: 100,
                            p: 0.5
                        }
                    }}
                >
                    {['2022', '2023', '2024'].map((year) => (
                        <MenuItem
                            key={year}
                            selected={year === selectedYear}
                            onClick={() => handleClose(year)}
                            sx={{
                                borderRadius: '8px',
                                typography: 'body2',
                                fontWeight: year === selectedYear ? 600 : 400,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(var(--palette-grey-500Channel) / 8%)',
                                    '&:hover': {
                                        bgcolor: 'rgba(var(--palette-grey-500Channel) / 12%)',
                                    }
                                }
                            }}
                        >
                            {year}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                {series.map((item, index) => (
                    <Box key={item.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: chartOptions.colors[index] }} />
                            <Typography sx={{ fontSize: '0.813rem', fontWeight: 500 }}>{item.name}</Typography>
                        </Box>
                        <Typography sx={{ mt: 'var(--spacing)', fontWeight: 600, fontSize: '1.125rem' }}>
                            {index === 0 ? '1.23k' : index === 1 ? '6.79k' : '1.01k'}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Chart options={chartOptions} series={series} type="bar" height={280} />
        </DashboardCard>
    );
};

const SystemStats = () => {
    const statsData = [
        {
            title: "Tổng người dùng",
            total: "18,765",
            percent: 2.6,
            color: "#00a76f",
            chartData: [25, 66, 41, 89, 63, 25, 44, 12]
        },
        {
            title: "Tổng tài khoản quản trị",
            total: "4,876",
            percent: 0.2,
            color: "#00b8d9",
            chartData: [15, 32, 45, 32, 56, 32, 44, 55]
        },
        {
            title: "Tổng thú cưng (Pets)",
            total: "678",
            percent: -0.1,
            color: "#ff5630",
            chartData: [56, 44, 32, 45, 32, 15, 25, 12]
        }
    ];

    return (
        <>
            {statsData.map((stat, index) => (
                <Grid
                    key={index}
                    sx={{
                        flexGrow: 0,
                        flexBasis: 'auto',
                        width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                    }}
                >
                    <SummaryWidget
                        title={stat.title}
                        total={stat.total}
                        percent={stat.percent}
                        color={stat.color}
                        chartData={stat.chartData}
                    />
                </Grid>
            ))}
        </>
    );
};

export const SystemPage = () => {
    const { user } = useAuthStore();
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % CAROUSEL_DATA.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + CAROUSEL_DATA.length) % CAROUSEL_DATA.length);

    return (
        <Grid
            container
            sx={{
                '--Grid-columns': 12,
                '--Grid-columnSpacing': 'calc(3 * var(--spacing))',
                '--Grid-rowSpacing': 'calc(3 * var(--spacing))',
                flexFlow: 'wrap',
                minWidth: '0px',
                boxSizing: 'border-box',
                display: 'flex',
                gap: 'var(--Grid-rowSpacing) var(--Grid-columnSpacing)',
                '& > *': {
                    '--Grid-parent-rowSpacing': 'calc(3 * var(--spacing))',
                    '--Grid-parent-columnSpacing': 'calc(3 * var(--spacing))',
                    '--Grid-parent-columns': 12,
                }
            }}
        >
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <Box
                    sx={{
                        backgroundImage: 'linear-gradient(to right, rgba(var(--palette-grey-900Channel) / 88%) 0%, var(--palette-grey-900) 75%), url(https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/background/background-5.webp)',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        pt: 'calc(5 * var(--spacing))',
                        pb: 'calc(5 * var(--spacing))',
                        pr: 'calc(3 * var(--spacing))',
                        pl: 'calc(5 * var(--spacing))',
                        gap: 'calc(5 * var(--spacing))',
                        borderRadius: 'calc(2 * var(--shape-borderRadius))',
                        display: 'flex',
                        position: 'relative',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--palette-common-white)',
                        border: 'solid 1px var(--palette-grey-800)',
                        height: '320px',
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                fontWeight: 600,
                                fontSize: '1.5rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-line',
                                mb: 'var(--spacing)',
                            }}
                        >
                            Chào mừng trở lại 👋 {'\n'}
                            {user?.fullName || 'Quản trị viên'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                fontWeight: 400,
                                fontSize: '0.875rem',
                                lineHeight: 1.57143,
                                opacity: 0.64,
                                maxWidth: '360px',
                                mb: 'calc(3 * var(--spacing))',
                            }}
                        >
                            Chào mừng bạn đến với hệ thống quản trị. Hãy bắt đầu quản lý các dịch vụ và đơn hàng của bạn ngay hôm nay.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                fontFamily: '"Public Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                textTransform: 'none',
                                bgcolor: 'var(--palette-primary-main)',
                                color: 'var(--palette-primary-contrastText)',
                                boxShadow: 'none',
                                py: '6px',
                                px: '12px',
                                minHeight: '36px',
                                lineHeight: 1.71429,
                                borderRadius: 'var(--shape-borderRadius)',
                                '&:hover': {
                                    bgcolor: 'var(--palette-primary-dark)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Khám phá ngay
                        </Button>
                    </Box>
                    <Box
                        component="svg"
                        viewBox="0 0 480 360"
                        xmlns="http://www.w3.org/2000/svg"
                        sx={{
                            userSelect: 'none',
                            display: 'inline-block',
                            fill: 'currentcolor',
                            fontSize: '1.5rem',
                            '--primary-light': 'var(--palette-primary-light)',
                            '--primary-dark': 'var(--palette-primary-dark)',
                            width: '260px',
                            maxWidth: '100%',
                            flexShrink: 0,
                            height: 'auto',
                            transition: 'fill 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <path fill="var(--primary-dark)" fillRule="evenodd" d="M109.224 97.41l.812 1.827-.02.009-.061.027-.248.112c-.219.1-.544.25-.968.449l-.849-1.811c.43-.202.762-.355.988-.457l.256-.117.066-.03.024-.01zm-6.771 3.278c.997-.507 1.901-.958 2.7-1.35l.882 1.795c-.791.388-1.687.835-2.675 1.337l-.907-1.782zm-5.356 2.808c.93-.502 1.82-.975 2.665-1.418l.929 1.771c-.838.439-1.72.909-2.644 1.407l-.95-1.76zm-5.274 2.927c.901-.513 1.779-1.007 2.63-1.479l.97 1.749c-.844.468-1.715.958-2.609 1.468l-.99-1.738zm-5.232 3.065c.887-.533 1.758-1.05 2.612-1.55l1.01 1.725c-.847.497-1.712 1.01-2.591 1.539l-1.03-1.714zm-5.117 3.16c.861-.546 1.713-1.079 2.555-1.599l1.05 1.702c-.834.516-1.68 1.044-2.534 1.586l-1.071-1.689zm-5.065 3.301a242.86 242.86 0 012.515-1.661l1.092 1.675a236.91 236.91 0 00-2.494 1.648l-1.113-1.662zm-4.978 3.431c.83-.589 1.66-1.168 2.484-1.736l1.134 1.646c-.817.564-1.638 1.137-2.461 1.721l-1.157-1.631zm-4.873 3.56a197.5 197.5 0 012.427-1.8l1.18 1.615c-.8.585-1.602 1.179-2.404 1.782l-1.203-1.597zm-4.771 3.71c.787-.632 1.576-1.256 2.366-1.87l1.228 1.579c-.782.608-1.563 1.225-2.342 1.85l-1.252-1.559zm-4.651 3.867c.765-.659 1.534-1.31 2.307-1.952l1.279 1.538c-.764.635-1.525 1.278-2.281 1.929l-1.305-1.515zm-4.51 4.035c.739-.688 1.485-1.368 2.236-2.04l1.333 1.491c-.742.664-1.478 1.335-2.208 2.013l-1.362-1.464zm-4.347 4.215a136.43 136.43 0 012.151-2.132l1.392 1.437c-.715.692-1.422 1.392-2.12 2.1l-1.423-1.405zm-4.157 4.411c.674-.751 1.359-1.495 2.053-2.231l1.455 1.371c-.683.725-1.356 1.457-2.019 2.196l-1.489-1.336zm-3.929 4.623c.633-.788 1.279-1.568 1.936-2.341l1.524 1.295a105.43 105.43 0 00-1.9 2.298l-1.56-1.252zm-3.657 4.848a94.278 94.278 0 011.793-2.455l1.596 1.205c-.6.794-1.185 1.595-1.754 2.403l-1.635-1.153zm-3.328 5.084a83.294 83.294 0 011.617-2.57l1.673 1.097a80.437 80.437 0 00-1.578 2.507l-1.712-1.034zm-2.94 5.341c.45-.907.922-1.806 1.414-2.698l1.752.965a69.62 69.62 0 00-1.375 2.623l-1.791-.89zm-2.465 5.583c.366-.948.755-1.889 1.168-2.823l1.83.808c-.4.906-.778 1.817-1.132 2.735l-1.866-.72zm-1.903 5.808c.265-.984.558-1.962.876-2.932l1.9.624a54.83 54.83 0 00-.845 2.828l-1.93-.52zm-1.253 5.993c.15-1.012.331-2.018.54-3.017l1.958.41a50.126 50.126 0 00-.52 2.901l-1.978-.294zm-.467 4.577c.028-.513.065-1.024.109-1.535l1.992.174c-.042.489-.077.98-.104 1.472-.028.496-.04.986-.037 1.469l-2 .014c-.003-.526.01-1.057.04-1.594zm.822 7.749a22.495 22.495 0 01-.643-3.074l1.982-.272c.131.959.328 1.892.585 2.801l-1.924.545zm2.498 5.699a23.889 23.889 0 01-1.444-2.77l1.83-.805c.382.867.824 1.713 1.324 2.538l-1.71 1.037zm3.777 4.87a30.2 30.2 0 01-2.019-2.327l1.578-1.23a28.113 28.113 0 001.885 2.173l-1.444 1.384zm4.602 4.048a41.441 41.441 0 01-2.349-1.902l1.316-1.506c.706.617 1.452 1.22 2.235 1.809l-1.202 1.599zm5.09 3.361a56.872 56.872 0 01-2.58-1.598l1.1-1.671a54.91 54.91 0 002.488 1.542l-1.008 1.727zm5.371 2.823a75.691 75.691 0 01-2.716-1.355l.929-1.771c.857.449 1.74.889 2.645 1.319l-.858 1.807zm5.542 2.408c-.95-.379-1.882-.766-2.794-1.162l.795-1.834c.894.387 1.807.767 2.74 1.138l-.741 1.858zm294.857-2.594c.244.101.598.253 1.048.457l-.828 1.821a31.67 31.67 0 00-1.241-.534l-.061-.025-.014-.005-.003-.001.357-.934.356-.934h.001l.002.001.006.002.021.008.075.03c.065.025.159.063.281.114zm-289.206 4.68c-.96-.329-1.906-.664-2.837-1.007l.692-1.877c.915.337 1.846.668 2.793.992l-.648 1.892zm293.015-2.865c.807.425 1.708.923 2.682 1.497l-1.016 1.723a62.506 62.506 0 00-2.598-1.45l.932-1.77zm-287.286 4.698c-.965-.289-1.918-.583-2.859-.884l.609-1.905c.928.296 1.87.587 2.824.873l-.574 1.916zm292.565-1.59a69.641 69.641 0 012.522 1.724l-1.165 1.626a66.44 66.44 0 00-2.449-1.674l1.092-1.676zM69.05 221.541c-.967-.256-1.924-.517-2.87-.783l.54-1.926c.938.264 1.885.522 2.842.776l-.512 1.933zm5.833 1.464c-.977-.233-1.945-.469-2.905-.709l.486-1.94c.952.238 1.912.472 2.881.703l-.462 1.946zm5.867 1.326c-.988-.213-1.97-.429-2.944-.649l.44-1.951c.968.219 1.943.434 2.925.645l-.42 1.955zm280.057-2.439a67.422 67.422 0 012.356 1.94l-1.306 1.515a65.709 65.709 0 00-2.286-1.883l1.236-1.572zM86.623 225.54a333.57 333.57 0 01-2.954-.595l.403-1.959c.973.201 1.952.398 2.937.591l-.386 1.963zm5.88 1.112c-.985-.179-1.967-.361-2.944-.546l.371-1.965c.973.184 1.95.365 2.931.543l-.357 1.968zm5.904 1.035c-.983-.167-1.963-.335-2.94-.506l.345-1.97c.973.17 1.95.338 2.93.504l-.335 1.972zm267.031-1.801a64.195 64.195 0 012.181 2.162l-1.442 1.386a63.013 63.013 0 00-2.113-2.095l1.374-1.453zm-261.112 2.771c-.989-.157-1.976-.316-2.959-.477l.323-1.974c.981.161 1.964.319 2.95.476l-.314 1.975zm5.919.916c-.99-.149-1.978-.3-2.965-.453l.306-1.976c.984.152 1.969.302 2.957.451l-.298 1.978zm5.92.873c-.987-.143-1.975-.287-2.961-.432l.292-1.979c.984.145 1.969.289 2.955.431l-.286 1.98zm5.929.84a781.94 781.94 0 01-2.965-.417l.281-1.98 2.96.417-.276 1.98zm5.927.818c-.987-.135-1.976-.27-2.965-.407l.273-1.981c.988.136 1.976.272 2.962.406l-.27 1.982zm241.664-1.8a62.33 62.33 0 011.957 2.359l-1.571 1.238a58.92 58.92 0 00-1.893-2.282l1.507-1.315zm-235.74 2.603l-2.957-.4.269-1.982 2.956.4-.268 1.982zm5.935.801l-2.964-.4.267-1.982 2.965.4-.268 1.982zm5.928.805l-2.977-.406.269-1.982 2.98.407-.272 1.981zm5.915.821l-2.962-.414.275-1.981c.993.138 1.982.276 2.966.415l-.279 1.98zm5.896.848c-.971-.143-1.948-.285-2.93-.426l.284-1.98c.985.142 1.964.284 2.937.427l-.291 1.979zm5.922.895c-.972-.151-1.952-.302-2.94-.451l.299-1.977c.99.149 1.973.3 2.949.452l-.308 1.976zm209.938-1.957a59.573 59.573 0 011.709 2.551l-1.69 1.069a56.139 56.139 0 00-1.651-2.463l1.632-1.157zm-204.034 2.911c-.974-.163-1.958-.325-2.952-.486l.319-1.974c.998.161 1.986.324 2.965.488l-.332 1.972zm5.881 1.035a369.37 369.37 0 00-2.965-.534l.346-1.97c1.006.177 2 .356 2.982.537l-.363 1.967zm5.85 1.143c-.972-.201-1.959-.399-2.961-.595l.383-1.963c1.009.197 2.004.397 2.984.6l-.406 1.958zm5.81 1.291c-.958-.228-1.935-.453-2.932-.674l.433-1.953c1.006.223 1.995.451 2.964.682l-.465 1.945zm5.75 1.497a126.97 126.97 0 00-2.901-.788l.502-1.936c1.006.261 1.988.527 2.947.8l-.548 1.924zm184.026-2.689c.494.881.972 1.787 1.431 2.718l-1.794.884a54.93 54.93 0 00-1.381-2.623l1.744-.979zm-178.387 4.477a83.817 83.817 0 00-2.858-.956l.602-1.907c1.007.317 1.983.643 2.926.978l-.67 1.885zm5.402 2.214a50.388 50.388 0 00-2.665-1.174l.755-1.852a52.08 52.08 0 012.773 1.222l-.863 1.804zm175.7-1.183c.397.928.775 1.88 1.132 2.854l-1.878.687a55.769 55.769 0 00-1.093-2.754l1.839-.787zm-171.918 3.282a27.52 27.52 0 00-1.18-.728l1.008-1.727c.438.255.86.515 1.266.781.386.252.788.506 1.206.763l-1.045 1.705a54.43 54.43 0 01-1.255-.794zm6.674 3.795a88.769 88.769 0 01-2.71-1.43l.964-1.752c.839.462 1.723.928 2.65 1.398l-.904 1.784zm167.354-1.314c.295.964.57 1.949.822 2.955l-1.94.486a56.86 56.86 0 00-.794-2.854l1.912-.587zm-161.766 3.964c-.978-.436-1.926-.872-2.842-1.305l.856-1.808c.902.427 1.836.856 2.801 1.287l-.815 1.826zm5.624 2.389c-.977-.396-1.932-.792-2.864-1.188l.781-1.841c.922.391 1.867.783 2.834 1.175l-.751 1.854zm5.702 2.219c-.979-.366-1.942-.734-2.887-1.101l.726-1.864c.936.364 1.891.728 2.863 1.092l-.702 1.873zm151.931-2.627c.195.988.367 1.994.517 3.019l-1.979.289a60 60 0 00-.5-2.921l1.962-.387zm-146.173 4.709a282.93 282.93 0 01-2.913-1.035l.68-1.881c.95.343 1.915.686 2.893 1.028l-.66 1.888zm5.793 1.961c-.989-.325-1.966-.651-2.932-.977l.642-1.895c.959.325 1.931.649 2.913.971l-.623 1.901zm5.808 1.851a366.91 366.91 0 01-2.928-.92l.607-1.905c.961.306 1.932.611 2.912.915l-.591 1.91zm135.458-2.462c.049.509.093 1.023.131 1.542a15.1 15.1 0 01.032 1.682l-1.998-.075c.017-.471.008-.958-.029-1.461a59 59 0 00-.127-1.495l1.991-.193zm-129.616 4.222a452.59 452.59 0 01-2.926-.869l.577-1.915c.963.29 1.934.578 2.911.864l-.562 1.92zm5.875 1.674c-.982-.272-1.957-.546-2.927-.823l.548-1.923c.965.275 1.936.548 2.913.819l-.534 1.927zm5.902 1.593a521.99 521.99 0 01-2.943-.783l.521-1.931c.972.262 1.949.522 2.93.779l-.508 1.935zm117.481-1.038a12.02 12.02 0 01-1.365 2.996l-1.691-1.069a9.965 9.965 0 001.139-2.499l1.917.572zm-111.556 2.55c-.993-.246-1.982-.495-2.968-.747l.495-1.938c.981.251 1.966.499 2.955.744l-.482 1.941zm5.937 1.432c-.995-.233-1.987-.469-2.977-.708l.469-1.944c.985.238 1.973.472 2.964.704l-.456 1.948zm5.954 1.352a461.96 461.96 0 01-2.98-.667l.443-1.95c.987.224 1.976.445 2.967.663l-.43 1.954zm5.976 1.272a440.55 440.55 0 01-2.989-.626l.416-1.956c.992.211 1.984.419 2.976.623l-.403 1.959zm90.244-1.087a17.352 17.352 0 01-2.54 1.996l-1.091-1.676a15.272 15.272 0 002.247-1.764l1.384 1.444zm-84.25 2.277c-1-.191-2.001-.386-3.002-.585l.39-1.962c.996.198 1.992.392 2.987.582l-.375 1.965zm6.003 1.101c-.999-.175-1.999-.355-3.001-.539l.361-1.967c.997.183 1.993.362 2.987.537l-.347 1.969zm72.9.168c-.911.427-1.878.819-2.897 1.178l-.663-1.887a29.338 29.338 0 002.71-1.102l.85 1.811zm-66.872.844c-1-.16-2.003-.324-3.007-.493l.33-1.972c1 .168 1.997.331 2.992.49l-.315 1.975zm6.051.913a350.993 350.993 0 01-3.025-.444l.299-1.977c1.006.152 2.009.299 3.007.441l-.281 1.98zm54.962.332c-.979.263-1.996.501-3.05.716l-.4-1.96a50.079 50.079 0 002.932-.688l.518 1.932zm-48.896.472a292.674 292.674 0 01-3.049-.39l.263-1.982c1.015.135 2.025.264 3.03.387l-.244 1.985zm6.076.684a273.234 273.234 0 01-3.058-.328l.224-1.987c1.019.115 2.031.223 3.037.325l-.203 1.99zm36.729.101c-.989.152-2.005.287-3.047.406l-.226-1.988a74.52 74.52 0 002.968-.395l.305 1.977zm-30.642.446a247.153 247.153 0 01-3.048-.255l.18-1.992c1.015.091 2.023.176 3.023.253l-.155 1.994zm6.099.39a193.964 193.964 0 01-3.036-.173l.128-1.995c1.012.064 2.015.122 3.007.171l-.099 1.997zm18.393-.133c-.991.079-2.002.144-3.032.196l-.101-1.997a107.33 107.33 0 002.975-.193l.158 1.994zm-12.279.337a175.75 175.75 0 01-3.028-.075l.067-1.999c1.01.034 2.008.059 2.993.075l-.032 1.999zm6.131-.023c-.993.025-2.002.039-3.025.043l-.007-2c1.009-.004 2.003-.018 2.981-.043l.051 2z" clipRule="evenodd" opacity="0.24"></path>
                        <path fill="#fff" d="M47.943 122.571L96.231 273.55a11.4 11.4 0 0011.786 7.805l63.326-5.36 148.013-12.644a11.316 11.316 0 009.904-7.823c.456-1.421.627-2.918.503-4.405a12.314 12.314 0 00-.729-3.122l-11.838-31.221-21.412-57.238-16.599-44.23a11.37 11.37 0 00-10.641-7.362H58.741a11.345 11.345 0 00-11.344 11.343c.016 1.114.2 2.219.546 3.278z"></path>
                        <path fill="#fff" d="M47.943 122.571L96.231 273.55a11.4 11.4 0 0011.786 7.805l63.326-5.36 148.013-12.644a11.316 11.316 0 009.904-7.823c.456-1.421.627-2.918.503-4.405a12.314 12.314 0 00-.729-3.122l-11.838-31.221-21.412-57.238-16.599-44.23a11.37 11.37 0 00-10.641-7.362H58.741a11.345 11.345 0 00-11.344 11.343c.016 1.114.2 2.219.546 3.278z"></path>
                        <path fill="url(#paint0_linear_1_51)" d="M170.575 276.06l-62.558 5.295a11.4 11.4 0 01-11.785-7.805L47.942 122.571a11.028 11.028 0 01-.546-3.278A11.34 11.34 0 0158.74 107.95h57.453l54.382 168.11z"></path>
                        <path fill="#F4F6F8" d="M227.879 191.221c2.613-.162 4.368-2.749 3.553-5.237l-8.483-25.895a4.002 4.002 0 00-3.993-2.75l-61.621 2.961c-2.666.128-4.461 2.782-3.588 5.304l9.248 26.717a3.999 3.999 0 004.028 2.683l60.856-3.783z"></path>
                        <path fill="#DFE3E8" d="M244.879 239.221c2.613-.162 4.368-2.749 3.553-5.237l-8.483-25.895a4.002 4.002 0 00-3.993-2.75l-61.621 2.961c-2.666.128-4.461 2.782-3.588 5.304l9.248 26.717a3.999 3.999 0 004.028 2.683l60.856-3.783z"></path>
                        <g filter="url(#filter0_f_1_51)" opacity="0.4"><path fill="#919EAB" d="M253.012 134.539l15.948 52.893a4.007 4.007 0 003.903 2.94l39.559-1.142a2 2 0 001.816-2.7l-20.001-53.4a2 2 0 00-1.755-1.295l-35.906-2.109a3.612 3.612 0 00-3.059 1.461 3.614 3.614 0 00-.505 3.352z"></path></g>
                        <path fill="#fff" d="M330.082 174.424l-16.495-46.701a4.03 4.03 0 00-3.512-2.732l-69.518-4.111a3.676 3.676 0 00-3.061 1.481 3.663 3.663 0 00-.53 3.358l15.949 52.92a4.057 4.057 0 003.902 2.966l70.091-2.108a3.663 3.663 0 002.898-1.716 3.667 3.667 0 00.276-3.357z"></path>
                        <path fill="var(--primary-dark)" d="M295.375 166.976c.478 1.237.718 1.856 1.229 2.206.511.351 1.174.351 2.501.351h.32c2.648 0 3.972 0 4.568-.87.596-.869.118-2.104-.837-4.574l-6.427-16.612c-.479-1.238-.719-1.856-1.23-2.207-.511-.35-1.174-.35-2.501-.35h-.32c-2.648 0-3.972 0-4.568.87-.596.869-.118 2.104.837 4.573l6.428 16.613z"></path>
                        <g opacity="0.48">
                            <path fill="url(#paint1_linear_1_51)" d="M306.33 166.969c.478 1.241.717 1.861 1.228 2.212.512.351 1.176.351 2.505.351h.314c2.649 0 3.973 0 4.569-.869.596-.87.118-2.105-.839-4.574l-1.586-4.099c-.479-1.237-.718-1.855-1.229-2.205-.511-.351-1.175-.351-2.501-.351h-.305c-2.644 0-3.966 0-4.562.868-.596.868-.121 2.102.829 4.569l1.577 4.098z"></path>
                            <path fill="url(#paint2_linear_1_51)" d="M284.397 166.971c.478 1.24.717 1.86 1.228 2.211.512.351 1.176.351 2.505.351h.315c2.648 0 3.973 0 4.568-.87.596-.87.118-2.105-.838-4.575l-2.705-6.986c-.479-1.237-.718-1.855-1.229-2.205-.511-.35-1.175-.35-2.501-.35h-.303c-2.645 0-3.967 0-4.563.868-.596.868-.12 2.102.831 4.57l2.692 6.986z"></path>
                            <path fill="url(#paint3_linear_1_51)" d="M273.442 166.976c.479 1.237.718 1.856 1.229 2.206.511.351 1.175.351 2.502.351h.32c2.648 0 3.972 0 4.568-.87.596-.869.118-2.104-.838-4.574l-9.445-24.417c-.479-1.238-.718-1.856-1.229-2.207-.511-.35-1.175-.35-2.502-.35h-.32c-2.648 0-3.972 0-4.568.869-.596.87-.118 2.104.837 4.574l9.446 24.418z"></path>
                            <path fill="url(#paint4_linear_1_51)" d="M262.463 166.974c.479 1.239.718 1.858 1.229 2.208.511.351 1.175.351 2.502.351h.322c2.647 0 3.97 0 4.566-.869.596-.869.119-2.104-.835-4.573l-12.935-33.472c-.479-1.238-.718-1.857-1.229-2.207-.511-.351-1.175-.351-2.502-.351h-.322c-2.647 0-3.97 0-4.566.869-.596.869-.119 2.104.835 4.573l12.935 33.471z"></path>
                        </g>
                        <g fill="#fff" fillRule="evenodd" clipRule="evenodd" opacity="0.4">
                            <path d="M78.02 155.171a15.22 15.22 0 11.312 1.015l-.156-.495-.157-.52zm15.194-4.189l-3.59-11.525a12.641 12.641 0 013.121-.547 12.102 12.102 0 0111.994 8.456c.312 1.014.496 2.062.546 3.122a13.006 13.006 0 01-.286 3.148 11.815 11.815 0 01-2.914 5.516 11.914 11.914 0 01-11.525 3.59 13.21 13.21 0 01-2.94-1.067 12.76 12.76 0 01-2.602-1.821 12.257 12.257 0 01-3.33-5.203l11.526-3.669zM111.296 251.773a15.298 15.298 0 0129.321-8.429v.494c0 .156 0 .338.182.494a15.272 15.272 0 01-28.619 10.407c-.078-.247-.149-.495-.221-.742a28.499 28.499 0 00-.221-.741 16.041 16.041 0 01-.171-.595 10.734 10.734 0 00-.271-.888zm11.187-14.7l3.746 11.474.079-.026 3.746 11.5a11.965 11.965 0 006.921-6.01 11.83 11.83 0 001.04-2.966c.23-1.024.317-2.075.26-3.122a12.07 12.07 0 00-9.548-11.188 12.42 12.42 0 00-6.244.338zM100.21 187.509a15.272 15.272 0 00-4.473 10.799v1.066a15.272 15.272 0 1030.544 0v-1.066a15.271 15.271 0 00-26.071-10.799zm10.591 11.293V186.73c2.112.016 4.183.581 6.01 1.639a11.366 11.366 0 012.602 1.925 12.027 12.027 0 01-.005 17.068 12.022 12.022 0 01-5.433 3.096 11.575 11.575 0 01-6.244 0 12.202 12.202 0 01-2.914-1.171l5.984-10.485z"></path>
                        </g>
                        <path fill="url(#paint5_linear_1_51)" d="M151.154 76h-41.55l12.645 7.727L151.154 76z"></path>
                        <path fill="url(#paint6_linear_1_51)" d="M151.154 76l-26.668 12.332 4.501 15.715L151.154 76z"></path>
                        <path fill="url(#paint7_linear_1_51)" d="M117.435 95.279l7.051-6.947L151.154 76 117.435 95.28z"></path>
                        <path fill="var(--primary-dark)" d="M117.435 95.279l7.051-6.947L151.154 76l-28.905 7.727-4.814 11.552z"></path>
                        <defs>
                            <filter id="filter0_f_1_51" width="101.56" height="100.65" x="232.807" y="109.722" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                                <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                                <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
                                <feGaussianBlur result="effect1_foregroundBlur_1_51" stdDeviation="10"></feGaussianBlur>
                            </filter>
                            <linearGradient id="paint0_linear_1_51" x1="47.397" x2="47.397" y1="107.95" y2="281.395" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint1_linear_1_51" x1="248.43" x2="248.43" y1="128.061" y2="169.533" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint2_linear_1_51" x1="248.43" x2="248.43" y1="128.061" y2="169.533" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint3_linear_1_51" x1="248.43" x2="248.43" y1="128.061" y2="169.533" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint4_linear_1_51" x1="248.43" x2="248.43" y1="128.061" y2="169.533" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint5_linear_1_51" x1="109.604" x2="109.604" y1="76" y2="104.047" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint6_linear_1_51" x1="109.604" x2="109.604" y1="76" y2="104.047" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                            <linearGradient id="paint7_linear_1_51" x1="109.604" x2="109.604" y1="76" y2="104.047" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--primary-light)"></stop>
                                <stop offset="1" stopColor="var(--primary-dark)"></stop>
                            </linearGradient>
                        </defs>
                        <image href="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/illustrations/characters/character-present.webp" height="280" x="320" y="40"></image>
                    </Box>
                </Box>
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <DashboardCard
                    sx={{
                        backgroundColor: 'var(--palette-common-black)',
                        height: '320px',
                        overflow: 'hidden',
                    }}
                >
                    {/* Carousel Content */}
                    <div className="m-auto max-w-full overflow-hidden relative h-full">
                        <ul
                            className="flex list-none p-0 m-0 h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translate3d(-${activeIndex * 100}%, 0px, 0px)` }}
                        >
                            {CAROUSEL_DATA.map((item, index) => (
                                <li key={index} className="block relative min-w-0 flex-[0_0_100%] h-full">
                                    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                                        {/* Text Content Overlay */}
                                        <div className="absolute bottom-0 z-[9] w-full p-[calc(3*var(--spacing))] flex flex-col gap-[var(--spacing)] text-[var(--palette-common-white)]">
                                            <span className="m-0 font-bold text-[0.75rem] uppercase text-[var(--palette-primary-light)]">
                                                Featured App
                                            </span>
                                            <Typography
                                                component="a"
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '1.1875rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <p className="m-0 font-normal text-[0.875rem] leading-[1.57143] overflow-hidden text-ellipsis whitespace-nowrap">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Image with Overlay */}
                                        <span className="relative inline-block align-bottom w-full h-full overflow-hidden">
                                            <span className="absolute top-0 left-0 w-full h-full z-[1] bg-[linear-gradient(to_bottom,transparent_0%,var(--palette-common-black)_75%)]"></span>
                                            <img
                                                alt={item.title}
                                                className="top-0 left-0 w-full h-full object-cover vertical-middle"
                                                src={item.image}
                                            />
                                        </span>
                                    </Box>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigation Dots */}
                    <ul className="absolute z-[10] flex gap-[2px] h-[20px] top-[16px] left-[16px] text-[var(--palette-primary-light)] list-none p-0 m-0">
                        {CAROUSEL_DATA.map((_, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    aria-label={`dot-${index}`}
                                    onClick={() => setActiveIndex(index)}
                                    className={`inline-flex items-center justify-center relative bg-transparent border-none p-0 cursor-pointer w-[20px] h-[20px] 
                                               before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:bg-current 
                                               before:transition-[width,opacity] before:duration-200 before:ease-[cubic-bezier(0.4,0,0.6,1)]
                                               ${index === activeIndex ? 'before:opacity-100' : 'before:opacity-[0.24]'}`}
                                />
                            </li>
                        ))}
                    </ul>

                    {/* Carousel Arrows */}
                    <div className="absolute top-[8px] right-[8px] z-[10] inline-flex items-center gap-[4px] text-[var(--palette-common-white)]">
                        <button
                            type="button"
                            aria-label="Prev button"
                            onClick={handlePrev}
                            className="inline-flex items-center justify-center relative bg-transparent cursor-pointer rounded-full p-[var(--spacing)] border-none transition-all duration-250 ease-[cubic-bezier(0.4,0,0.6,1)] hover:bg-[rgba(255,255,255,0.08)]"
                        >
                            <svg className="user-select-none inline-block flex-shrink-0 fill-current text-[1.5rem] w-[20px] h-[20px] transition-fill duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" fillRule="evenodd" d="M15.488 4.43a.75.75 0 0 1 .081 1.058L9.988 12l5.581 6.512a.75.75 0 1 1-1.138.976l-6-7a.75.75 0 0 1 0-.976l6-7a.75.75 0 0 1 1.057-.081" clipRule="evenodd"></path>
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Next button"
                            onClick={handleNext}
                            className="inline-flex items-center justify-center relative bg-transparent cursor-pointer rounded-full p-[var(--spacing)] border-none transition-all duration-250 ease-[cubic-bezier(0.4,0,0.6,1)] hover:bg-[rgba(255,255,255,0.08)]"
                        >
                            <svg className="user-select-none inline-block flex-shrink-0 fill-current text-[1.5rem] w-[20px] h-[20px] transition-fill duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" fillRule="evenodd" d="M8.512 4.43a.75.75 0 0 1 1.057.082l6 7a.75.75 0 0 1 0 .976l-6 7a.75.75 0 0 1-1.138-.976L14.012 12L8.431 5.488a.75.75 0 0 1 .08-1.057" clipRule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </DashboardCard>
            </Grid>

            {/* Stats Cards */}
            <SystemStats />

            {/* Advanced Charts Section */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <PetDistributionChart />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <ServiceUsageChart />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <NewProductsTable />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <TopSellingProducts />
            </Grid>

            {/* Bottom Section */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <TopCustomers />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <TopAuthors />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <Stack spacing={3}>
                    <ProgressCard
                        title="Conversion"
                        total="38,566"
                        percent={48}
                        color="#007867"
                        bgIcon={
                            <svg width="120" height="120" viewBox="0 0 24 24">
                                <circle cx="12" cy="6" r="4" fill="currentColor"></circle>
                                <ellipse cx="12" cy="17" fill="currentColor" rx="7" ry="4"></ellipse>
                            </svg>
                        }
                    />
                    <ProgressCard
                        title="Applications"
                        total="55,566"
                        percent={75}
                        color="var(--palette-info-dark)"
                        bgIcon={
                            <svg width="120" height="120" viewBox="0 0 24 24">
                                <path fill="currentColor" fillRule="evenodd" d="M3.172 5.172C2 6.343 2 8.229 2 12s0 5.657 1.172 6.828S6.229 20 10 20h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12s0-5.657-1.172-6.828S17.771 4 14 4h-4C6.229 4 4.343 4 3.172 5.172M18.576 7.52a.75.75 0 0 1-.096 1.056l-2.196 1.83c-.887.74-1.605 1.338-2.24 1.746c-.66.425-1.303.693-2.044.693s-1.384-.269-2.045-.693c-.634-.408-1.352-1.007-2.239-1.745L5.52 8.577a.75.75 0 0 1 .96-1.153l2.16 1.799c.933.777 1.58 1.315 2.128 1.667c.529.34.888.455 1.233.455s.704-.114 1.233-.455c.547-.352 1.195-.89 2.128-1.667l2.159-1.8a.75.75 0 0 1 1.056.097" clipRule="evenodd" />
                            </svg>
                        }
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};
