import { Grid, Box, Typography, Button, Divider, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Stack, Avatar, Tabs, Tab } from "@mui/material"
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import Chart from 'react-apexcharts';
import { Icon } from '@iconify/react';
import { useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import SummaryWidget from "../../components/dashboard/SummaryWidget";
import WelcomeWidget from "../../components/dashboard/WelcomeWidget";


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
                <WelcomeWidget
                    title={`Chào mừng trở lại 👋 \n ${user?.fullName || 'Quản trị viên'}`}
                    description="Chào mừng bạn đến với hệ thống quản trị. Hãy bắt đầu quản lý các dịch vụ và đơn hàng của bạn ngay hôm nay."
                    img="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/illustrations/characters/character-present.webp"
                    bgImg="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/background/background-5.webp"
                    action={
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
                    }
                />
            </Grid >

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
        </Grid >
    );
};
