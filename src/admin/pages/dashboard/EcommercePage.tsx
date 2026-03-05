import { Grid, Box, Typography, Button, Divider, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Avatar } from "@mui/material"

import WelcomeWidget from "../../components/dashboard/WelcomeWidget";
import SummaryWidget from "../../components/dashboard/SummaryWidget";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Icon } from '@iconify/react';
import { useState } from "react";
import Chart from 'react-apexcharts';

const SalesByCategory = () => {
    const chartOptions: any = {
        chart: { type: 'radialBar' },
        labels: ['Chó', 'Mèo'],
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
                        formatter: (val: number) => val.toLocaleString(),
                    },
                    total: {
                        show: true,
                        label: 'Tổng cộng',
                        formatter: () => '2,324',
                    }
                }
            }
        },
        colors: ['#00a76f', '#ffab00'],
        legend: { show: false }
    };

    const series = [65, 35];

    return (
        <DashboardCard>
            <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Doanh số Chó & Mèo</Typography>
            </Box>

            <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chart options={chartOptions} series={series} type="radialBar" width={300} height={300} />
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {chartOptions.labels.map((label: string, index: number) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: chartOptions.colors[index] }} />
                        <Typography sx={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--palette-text-secondary)' }}>{label}</Typography>
                    </Box>
                ))}
            </Box>
        </DashboardCard>
    );
};

const YearlySales = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedYear, setSelectedYear] = useState('2023');

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
            dropShadow: {
                enabled: true,
                top: 10,
                left: 0,
                blur: 10,
                color: ['#00A76F', '#FFAB00'],
                opacity: 0.1,
            }
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
        markers: {
            size: 0,
            strokeColors: 'var(--palette-background-paper)',
            strokeWidth: 3,
            hover: {
                size: 7,
            }
        },
        xaxis: {
            categories: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { labels: { show: true } },
        grid: { strokeDashArray: 3, borderColor: 'var(--palette-divider)' },
        legend: { show: false },
        colors: ['#00A76F', '#FFAB00'],
    };

    const series = [
        { name: 'Tổng thu nhập', data: [50, 40, 45, 10, 80, 70, 65, 150, 90, 70, 60, 50] },
        { name: 'Tổng chi phí', data: [55, 15, 35, 10, 75, 100, 85, 45, 80, 100, 90, 80] }
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
                {series.map((item, index) => (
                    <Box key={item.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: chartOptions.colors[index] }} />
                            <Typography sx={{ fontSize: '0.813rem', fontWeight: 500, color: 'var(--palette-text-secondary)' }}>{item.name}</Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {index === 0 ? '1.23k' : '6.79k'}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Chart options={chartOptions} series={series} type="area" height={280} />
        </DashboardCard>
    );
};

const SalesOverview = () => {
    const data = [
        { label: 'Tổng lợi nhuận', value: 8374, percent: 10.1, color: '#00a76f' },
        { label: 'Tổng thu nhập', value: 9714, percent: 13.6, color: '#00b8d9' },
        { label: 'Tổng chi phí', value: 6871, percent: 28.2, color: '#ffab00' },
    ];

    return (
        <DashboardCard sx={{ p: 3, pb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 4 }}>Doanh số tổng quan</Typography>
            <Stack spacing={4}>
                {data.map((item) => (
                    <Box key={item.label}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                ${item.value.toLocaleString()} <Box component="span" sx={{ color: 'var(--palette-text-secondary)', fontWeight: 400 }}>({item.percent}%)</Box>
                            </Typography>
                        </Box>
                        <Box sx={{ height: 8, bgcolor: 'rgba(145, 158, 171, 0.16)', borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${item.percent}%`, bgcolor: item.color, borderRadius: 1 }} />
                        </Box>
                    </Box>
                ))}
            </Stack>
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

const TopCustomers = () => {
    const customers = [
        { id: 1, name: 'Jayvion Simon', product: 'CAP', country: 'DE', total: '$83.74', rank: 'Top 1', color: 'var(--palette-primary-dark)' },
        { id: 2, name: 'Lucian Obrien', product: 'Branded shoes', country: 'GB', total: '$97.14', rank: 'Top 2', color: 'var(--palette-secondary-dark)' },
        { id: 3, name: 'Deja Brady', product: 'Headphone', country: 'FR', total: '$68.71', rank: 'Top 3', color: 'var(--palette-info-dark)' },
        { id: 4, name: 'Harrison Stein', product: 'Cell phone', country: 'KR', total: '$85.21', rank: 'Top 4', color: 'var(--palette-warning-dark)' },
        { id: 5, name: 'Reece Chung', product: 'Earings', country: 'US', total: '$52.17', rank: 'Top 5', color: 'var(--palette-error-dark)' },
    ];

    const getFlag = (code: string) => {
        const flags: any = {
            'DE': '🇩🇪', 'GB': '🇬🇧', 'FR': '🇫🇷', 'KR': '🇰🇷', 'US': '🇺🇸'
        };
        return flags[code] || '🌐';
    };

    return (
        <DashboardCard sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>Khách hàng mua nhiều nhất</Typography>
            </Box>
            <TableContainer>
                <Table sx={{ minWidth: 640 }}>
                    <TableHead sx={{ bgcolor: 'var(--palette-background-neutral)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Người mua</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Sản phẩm</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Quốc gia</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }}>Tổng cộng</TableCell>
                            <TableCell sx={{ color: 'var(--palette-text-secondary)', fontWeight: 600, fontSize: '0.875rem', borderBottom: 'none' }} align="right">Hạng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{ borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ width: 40, height: 40 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.product}</TableCell>
                                <TableCell sx={{ fontSize: '1.25rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{getFlag(row.country)}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', borderBottom: '1px dashed rgba(145, 158, 171, 0.2)' }}>{row.total}</TableCell>
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
                                            color: row.color,
                                            bgcolor: row.color.replace('-dark)', '-mainChannel) / 0.16)').replace('var(--', 'rgba(var(--'),
                                        }}
                                    >
                                        {row.rank}
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

const LatestProducts = () => {
    const products = [
        { name: 'Urban Explorer Sneakers', price: '$83.74', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-1.webp', colors: ['#00A76F', '#FFAB00', '#FF5630'] },
        { name: 'Classic Leather Loafers', price: '$97.14', oldPrice: '$97.14', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-2.webp', colors: ['#00B8D9', '#007867'] },
        { name: 'Mountain Trekking Boots', price: '$68.71', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-3.webp', colors: ['#8E33FF', '#454F5B', '#212B36'] },
        { name: 'Elegance Stiletto Heels', price: '$85.21', oldPrice: '$85.21', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-4.webp', colors: ['#8E33FF', '#FF5630', '#FFAB00'] },
        { name: 'Comfy Running Shoes', price: '$52.17', image: 'https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/cover/cover-5.webp', colors: ['#003768'] },
    ];

    return (
        <DashboardCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '18px' }}>Sản phẩm mới nhất</Typography>
            <Stack spacing={3}>
                {products.map((item) => (
                    <Stack key={item.name} direction="row" spacing={2} alignItems="center">
                        <Avatar variant="rounded" src={item.image} sx={{ width: 48, height: 48, borderRadius: '12px' }} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{item.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                {item.oldPrice && <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)', textDecoration: 'line-through', fontSize: '14px', fontWeight: 400 }}>{item.oldPrice}</Typography>}
                                <Typography variant="caption" sx={{ fontWeight: 400, color: item.oldPrice ? 'var(--palette-error-main)' : 'var(--palette-text-secondary)', fontSize: '14px' }}>{item.price}</Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={-0.8}>
                            {item.colors.slice(0, 3).map((c, i) => (
                                <Box key={i} sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: c, border: '2px solid var(--palette-background-paper)' }} />
                            ))}
                            {item.colors.length > 3 && <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)', ml: 0.5 }}>+{item.colors.length - 3}</Typography>}
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </DashboardCard>
    );
};



export const EcommercePage = () => {
    const { user } = useAuthStore();
    const [activeIndex, setActiveIndex] = useState(0);

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
                    description="Người bán hàng xuất sắc nhất tháng, bạn đã đạt thêm 57.6% doanh số hôm nay."
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

            {/* Summary Widgets */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SummaryWidget
                    title="Sản phẩm đã bán"
                    total="765"
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
                    title="Tổng số dư"
                    total="18,765"
                    percent={-0.1}
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
                    title="Lợi nhuận bán hàng"
                    total="4,876"
                    percent={0.6}
                    color="#00b8d9"
                    chartData={[56, 44, 32, 45, 32, 15, 25, 12]}
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
                <SalesByCategory />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <YearlySales />
            </Grid>

            {/* New Sections */}
            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <SalesOverview />
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
                <TopCustomers />
            </Grid>

            <Grid
                sx={{
                    flexGrow: 0,
                    flexBasis: 'auto',
                    width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))',
                }}
            >
                <LatestProducts />
            </Grid>



        </Grid>
    );
};

export default EcommercePage;
