import { Grid, Box, Typography, Button, Divider, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Avatar } from "@mui/material"

import WelcomeWidget from "../../components/dashboard/WelcomeWidget";
import SummaryWidget from "../../components/dashboard/SummaryWidget";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Icon } from '@iconify/react';
import { useState, useEffect } from "react";
import { getEcommerceStats } from "../../api/dashboard.api";
import dayjs from "dayjs";
import Chart from 'react-apexcharts';

const SalesByCategory = ({ data }: { data: any[] }) => {
    const total = data?.reduce((acc, curr) => acc + curr.total, 0) || 0;
    const labels = data?.map(item => item.label) || ['Trống', 'Trống'];
    const series = data?.map(item => (total > 0 ? (item.total / total) * 100 : 0)) || [0, 0];

    const chartOptions: any = {
        chart: { type: 'radialBar' },
        labels: labels,
        stroke: { lineCap: 'round' },
        plotOptions: {
            radialBar: {
                hollow: { size: '40%' },
                track: {
                    background: 'rgba(145, 158, 171, 0.08)',
                    strokeWidth: '100%',
                },
                dataLabels: {
                    name: {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--palette-text-secondary)',
                        offsetY: -10,
                    },
                    value: {
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--palette-text-primary)',
                        offsetY: 5,
                        formatter: (val: number) => `${Math.round(val)}%`,
                    },
                    total: {
                        show: true,
                        label: 'Tổng thu',
                        formatter: () => {
                            if (total >= 1000000) return (total / 1000000).toFixed(1) + 'M';
                            if (total >= 1000) return (total / 1000).toFixed(1) + 'K';
                            return total.toString();
                        },
                    }
                }
            }
        },
        colors: ['#00a76f', '#ffab00', '#00b8d9'],
        legend: { show: false }
    };

    return (
        <DashboardCard>
            <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Doanh số theo danh mục</Typography>
            </Box>

            <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chart options={chartOptions} series={series} type="radialBar" width={300} height={300} />
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {labels.map((label: string, index: number) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: chartOptions.colors[index] }} />
                        <Typography sx={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--palette-text-secondary)' }}>{label}</Typography>
                    </Box>
                ))}
            </Box>
        </DashboardCard>
    );
};

const YearlySales = ({ data }: { data: number[] }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = (year?: string) => {
        if (year && typeof year === 'string') setSelectedYear(year);
        setAnchorEl(null);
    };

    const chartOptions: any = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
        },
        yaxis: { labels: { show: true } },
        grid: { strokeDashArray: 3, borderColor: 'var(--palette-divider)' },
        legend: { show: false },
        colors: ['#00A76F'],
    };

    const series = [
        { name: 'Doanh thu', data: data || Array(12).fill(0) }
    ];

    return (
        <DashboardCard sx={{ p: 3, pb: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Doanh số hàng năm</Typography>
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
                        color: 'inherit',
                        height: '34px',
                        textTransform: 'none',
                        fontWeight: 600,
                        border: 'solid 1px rgba(145, 158, 171, 0.24)',
                    }}
                >
                    {selectedYear}
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => handleClose()}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { mt: 1, borderRadius: '12px', minWidth: 100, p: 0.5 } }}
                >
                    {['2021', '2022', '2023'].map((year) => (
                        <MenuItem
                            key={year}
                            selected={year === selectedYear}
                            onClick={() => handleClose(year)}
                            sx={{ borderRadius: '8px', mb: 0.5 }}
                        >
                            {year}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'var(--palette-primary-main)' }} />
                        <Typography sx={{ fontSize: '0.813rem', fontWeight: 500, color: 'var(--palette-text-secondary)' }}>Doanh thu</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {data?.reduce((a, b) => a + b, 0).toLocaleString()}đ
                    </Typography>
                </Box>
            </Box>

            <Chart options={chartOptions} series={series} type="area" height={280} />
        </DashboardCard>
    );
};

const TopCustomers = ({ customers }: { customers: any[] }) => {
    return (
        <DashboardCard sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Khách hàng thân thiết</Typography>
            </Box>
            <TableContainer>
                <Table sx={{ minWidth: 640 }}>
                    <TableHead sx={{ bgcolor: 'var(--palette-background-neutral)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Khách hàng</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Số đơn</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Tổng chi tiêu</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }} align="right">Hạng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers?.map((row, index) => (
                            <TableRow key={row._id}>
                                <TableCell sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar src={row.avatar} sx={{ width: 40, height: 40 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.fullName}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.totalOrders}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.totalSpent?.toLocaleString()}đ</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Box
                                        sx={{
                                            height: 24,
                                            minWidth: 24,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '6px',
                                            px: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: index === 0 ? 'var(--palette-primary-dark)' : 'var(--palette-text-secondary)',
                                            bgcolor: index === 0 ? 'rgba(0, 167, 111, 0.16)' : 'rgba(145, 158, 171, 0.16)',
                                        }}
                                    >
                                        Top {index + 1}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard>
    );
};

const CurrentBalance = () => {
    return (
        <DashboardCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 1 }}>Số dư hiện tại</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '2rem', mt: 0, mb: 2 }}>$187,650</Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)' }}>Tổng đơn hàng</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>$287,650</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)' }}>Thu nhập</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>$25,500</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)' }}>Đã hoàn tiền</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>$1,600</Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: 'var(--palette-warning-main)',
                        color: 'var(--palette-warning-contrastText)',
                        boxShadow: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        minHeight: '36px',
                        lineHeight: 1.71429,
                        px: '12px',
                        py: '6px',
                        borderRadius: 'var(--shape-borderRadius)',
                        '&:hover': {
                            bgcolor: 'var(--palette-warning-dark)',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Yêu cầu
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: 'var(--palette-primary-main)',
                        color: 'var(--palette-primary-contrastText)',
                        boxShadow: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        minHeight: '36px',
                        lineHeight: 1.71429,
                        px: '12px',
                        py: '6px',
                        borderRadius: 'var(--shape-borderRadius)',
                        '&:hover': {
                            bgcolor: 'var(--palette-primary-dark)',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Chuyển khoản
                </Button>
            </Stack>
        </DashboardCard>
    );
};

const RecentOrders = ({ orders }: { orders: any[] }) => {
    return (
        <DashboardCard sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Đơn hàng gần đây</Typography>
            </Box>
            <TableContainer>
                <Table sx={{ minWidth: 640 }}>
                    <TableHead sx={{ bgcolor: 'var(--palette-background-neutral)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Người mua</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Mã đơn</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Thời gian</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Số tiền</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }} align="right">Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders?.map((row) => (
                            <TableRow key={row._id}>
                                <TableCell sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar src={row.userId?.avatar} sx={{ width: 40, height: 40 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.userId?.fullName || 'Khách vãng lai'}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>#{row._id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{dayjs(row.createdAt).format('DD/MM/YYYY')}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.total?.toLocaleString()}đ</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Box
                                        sx={{
                                            height: 24,
                                            minWidth: 24,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '6px',
                                            px: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: row.orderStatus === 'completed' ? 'var(--palette-success-dark)' : 'var(--palette-warning-dark)',
                                            bgcolor: row.orderStatus === 'completed' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(255, 171, 0, 0.16)',
                                        }}
                                    >
                                        {row.orderStatus}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard>
    );
};

const LatestProducts = ({ products }: { products: any[] }) => {
    return (
        <DashboardCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '18px' }}>Sản phẩm mới nhất</Typography>
            <Stack spacing={3}>
                {products?.map((item) => (
                    <Stack key={item._id} direction="row" spacing={2} alignItems="center">
                        <Avatar variant="rounded" src={item.images?.[0]} sx={{ width: 48, height: 48, borderRadius: '12px' }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{item.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                {item.priceOld > item.priceNew && (
                                    <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)', textDecoration: 'line-through', fontSize: '14px', fontWeight: 400 }}>
                                        {item.priceOld?.toLocaleString()}đ
                                    </Typography>
                                )}
                                <Typography variant="caption" sx={{ fontWeight: 400, color: item.priceOld > item.priceNew ? 'var(--palette-error-main)' : 'var(--palette-text-secondary)', fontSize: '14px' }}>
                                    {item.priceNew?.toLocaleString()}đ
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ p: 0.5, px: 1, borderRadius: '6px', bgcolor: 'var(--palette-background-neutral)', fontSize: '12px', fontWeight: 600 }}>
                            Mới
                        </Box>
                    </Stack>
                ))}
            </Stack>
        </DashboardCard>
    );
};

const TopSellingProducts = ({ products }: { products: any[] }) => {
    return (
        <DashboardCard sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Top sản phẩm bán chạy</Typography>
            </Box>
            <TableContainer>
                <Table sx={{ minWidth: 640 }}>
                    <TableHead sx={{ bgcolor: 'var(--palette-background-neutral)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Sản phẩm</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Số lượng</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Doanh thu</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }} align="right">Hạng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products?.map((row, index) => (
                            <TableRow key={row._id}>
                                <TableCell sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.totalQuantity}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.totalRevenue?.toLocaleString()}đ</TableCell>
                                <TableCell align="right" sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Box
                                        sx={{
                                            height: 24,
                                            minWidth: 24,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '6px',
                                            px: 1,
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: index < 3 ? 'var(--palette-success-dark)' : 'var(--palette-text-secondary)',
                                            bgcolor: index < 3 ? 'rgba(34, 197, 94, 0.16)' : 'rgba(145, 158, 171, 0.16)',
                                        }}
                                    >
                                        #{index + 1}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard>
    );
};



export const EcommercePage = () => {
    const { user } = useAuthStore();
    const [activeIndex, setActiveIndex] = useState(0);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getEcommerceStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch ecommerce stats:", error);
            } finally {
            }
        };
        fetchStats();
    }, []);

    const featuredProducts = [
        {
            name: "Urban Explorer Sneakers",
            description: "NEW",
            image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-1.webp",
        },
        {
            name: "Retro Runner Shoes",
            description: "HOT",
            image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-2.webp",
        },
        {
            name: "Classic Leather Boots",
            description: "CLASSIC",
            image: "https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-3.webp",
        }
    ];

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

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
            {/* Welcome Section */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <WelcomeWidget
                    title={`Chúc mừng 🎉\n${user?.fullName || 'Super Admin'}`}
                    description={`Tháng này bạn đã đạt ${stats?.summary.monthlyRevenue.toLocaleString() || '0'}đ doanh thu.`}
                    img="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/illustrations/characters/character-present.webp"
                    bgImg="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/background/background-5.webp"
                    action={
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: 'var(--palette-success-main)',
                                color: 'var(--palette-success-contrastText)',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: 'var(--palette-success-dark)' }
                            }}
                        >
                            Xem ngay
                        </Button>
                    }
                />
            </Grid>

            {/* Featured Product Slide - Matches SystemPage Style */}
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
                        position: 'relative'
                    }}
                >
                    <div className="m-auto max-w-full overflow-hidden relative h-full">
                        <ul
                            className="flex list-none p-0 m-0 h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translate3d(-${activeIndex * 100}%, 0px, 0px)` }}
                        >
                            {featuredProducts.map((item, index) => (
                                <li key={index} className="block relative min-w-0 flex-[0_0_100%] h-full">
                                    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                                        <div className="absolute bottom-0 z-[9] w-full p-[calc(3*var(--spacing))] flex flex-col gap-[var(--spacing)] text-[var(--palette-common-white)]">
                                            <span className="m-0 font-bold text-[0.75rem] uppercase text-[var(--palette-success-light)]">
                                                {item.description}
                                            </span>
                                            <Typography
                                                component="a"
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '1.1875rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {item.name}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    width: 'fit-content',
                                                    bgcolor: 'var(--palette-success-main)',
                                                    color: 'white',
                                                    mt: 1,
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                Mua ngay
                                            </Button>
                                        </div>

                                        <span className="relative inline-block align-bottom w-full h-full overflow-hidden">
                                            <span className="absolute top-0 left-0 w-full h-full z-[1] bg-[linear-gradient(to_bottom,transparent_0%,var(--palette-common-black)_75%)]"></span>
                                            <img
                                                alt={item.name}
                                                className="top-0 left-0 w-full h-full object-cover vertical-middle"
                                                src={item.image}
                                            />
                                        </span>
                                    </Box>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigation Dots - Same as SystemPage */}
                    <ul className="absolute z-[10] flex gap-[2px] h-[20px] top-[16px] left-[16px] text-[var(--palette-success-light)] list-none p-0 m-0">
                        {featuredProducts.map((_, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`inline-flex items-center justify-center relative bg-transparent border-none p-0 cursor-pointer w-[20px] h-[20px] 
                                               before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:bg-current 
                                               before:transition-[width,opacity] before:duration-200 before:ease-[cubic-bezier(0.4,0,0.6,1)]
                                               ${index === activeIndex ? 'before:opacity-100' : 'before:opacity-[0.24]'}`}
                                />
                            </li>
                        ))}
                    </ul>

                    {/* Carousel Arrows - Same as SystemPage */}
                    <div className="absolute top-[8px] right-[8px] z-[10] inline-flex items-center gap-[4px] text-[var(--palette-common-white)]">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="inline-flex items-center justify-center relative bg-transparent cursor-pointer rounded-full p-[var(--spacing)] border-none transition-all duration-250 ease-[cubic-bezier(0.4,0,0.6,1)] hover:bg-[rgba(255,255,255,0.08)]"
                        >
                            <Icon icon="eva:chevron-left-fill" width={20} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center justify-center relative bg-transparent cursor-pointer rounded-full p-[var(--spacing)] border-none transition-all duration-250 ease-[cubic-bezier(0.4,0,0.6,1)] hover:bg-[rgba(255,255,255,0.08)]"
                        >
                            <Icon icon="eva:chevron-right-fill" width={20} />
                        </button>
                    </div>
                </DashboardCard>
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Tổng sản phẩm"
                    total={stats?.summary.totalProducts.toString() || "0"}
                    percent={2.6}
                    color="#00a76f"
                    chartData={[25, 66, 41, 89, 63, 25, 44, 12]}
                />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Tổng đơn hàng"
                    total={stats?.summary.totalOrders.toString() || "0"}
                    percent={stats?.summary.orderTodayPercent || 0}
                    color="#ffab00"
                    chartData={[15, 32, 45, 32, 56, 32, 44, 55]}
                />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Doanh thu tháng này"
                    total={`${stats?.summary.monthlyRevenue.toLocaleString() || "0"}đ`}
                    percent={stats?.summary.revenueMonthPercent || 0}
                    color="#00b8d9"
                    chartData={[56, 44, 32, 45, 32, 15, 25, 12]}
                />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Dịch vụ đã đặt"
                    total={stats?.summary.totalServiceBookings.toString() || "0"}
                    percent={1.2}
                    color="#8e33ff"
                    chartData={[10, 20, 15, 25, 30, 22, 18, 25]}
                />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Khách sạn đã đặt"
                    total={stats?.summary.totalBoardingBookings.toString() || "0"}
                    percent={0.8}
                    color="#ff5630"
                    chartData={[5, 10, 8, 12, 10, 15, 12, 20]}
                />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Tổng khách hàng"
                    total={stats?.summary.totalUsers.toString() || "0"}
                    percent={3.5}
                    color="#00b8d9"
                    chartData={[40, 50, 45, 60, 55, 70, 65, 80]}
                />
            </Grid>

            {/* Charts Section */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SalesByCategory data={stats?.topCategories} />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <YearlySales data={stats?.yearlyRevenueChart} />
            </Grid>

            {/* New Sections */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <TopSellingProducts products={stats?.topSellingProducts} />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <CurrentBalance />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <TopCustomers customers={stats?.topCustomers} />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <LatestProducts products={stats?.recentProducts} />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: '100%',
                }}
            >
                <RecentOrders orders={stats?.recentOrders} />
            </Grid>



        </Grid>
    );
};

export default EcommercePage;
