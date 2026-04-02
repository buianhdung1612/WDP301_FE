import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Grid } from '@mui/material';
import Chart from 'react-apexcharts';
import { getDetailedBoardingStats } from '../../../api/dashboard.api';
import DashboardCard from '../../../components/dashboard/DashboardCard';

export const BoardingStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDetailedBoardingStats();
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching boarding stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <Box p={3}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} /></Box>;
    }

    const { occupancyRes, revenueByCageType, avgStayDuration, totalOrders, checkedInOrders, upcomingOrders, thisMonthRevenue, statusDist, revenueTrend } = stats;

    const trendLabels = (revenueTrend || []).map((t: any) => t.month);
    const trendData = (revenueTrend || []).map((t: any) => t.total);

    const trendOptions: any = {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        xaxis: { categories: trendLabels },
        colors: ['#00A76F'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
        grid: { strokeDashArray: 3 }
    };

    const statusObj = (statusDist || []).reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {});
    const statusLabels = ['Chờ xử lý', 'Giữ chỗ', 'Đã xác nhận', 'Đang lưu trú', 'Đã trả phòng', 'Đã hủy'];
    const statusData = [
        statusObj['pending'] || 0,
        statusObj['held'] || 0,
        statusObj['confirmed'] || 0,
        statusObj['checked-in'] || 0,
        statusObj['checked-out'] || 0,
        statusObj['cancelled'] || 0
    ];

    const statusOptions: any = {
        labels: statusLabels,
        colors: ['#00B8D9', '#FFAB00', '#00A76F', '#8E33FF', '#4CAF50', '#FF5630'],
        legend: { position: 'bottom', fontWeight: 600, itemMargin: { horizontal: 10, vertical: 5 } },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: { show: true },
                        value: { show: true, fontSize: '1.5rem', fontWeight: 700 },
                        total: { show: true, label: 'Tổng đơn', formatter: () => (totalOrders || 0).toString() }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        stroke: { show: false }
    };

    const revenueOptions: any = {
        chart: { toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        xaxis: { categories: (revenueByCageType || []).map((r: any) => r._id === 'vip' ? 'Phòng VIP' : (r._id === 'standard' ? 'Tiêu chuẩn' : r._id)) },
        colors: ['#00A76F'],
        plotOptions: { bar: { columnWidth: '25%', borderRadius: 4 } },
        dataLabels: { enabled: false },
        grid: { strokeDashArray: 3 }
    };

    const gridLayout = {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px',
    };

    return (
        <Box p={3}>
            <Box mb={4}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Quản lý công suất chuồng, doanh thu và hiệu quả vận hành mảng Boarding.</Typography>
            </Box>

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
                    mb: 3,
                    '& > *': {
                        '--Grid-parent-rowSpacing': 'calc(3 * var(--spacing))',
                        '--Grid-parent-columnSpacing': 'calc(3 * var(--spacing))',
                        '--Grid-parent-columns': 12,
                    }
                }}
            >
                <Grid sx={{ flexBasis: 'auto', flexGrow: 0, width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }}>
                    <DashboardCard sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', boxShadow: 'var(--customShadows-card)' }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '25%', bgcolor: 'rgba(0, 167, 111, 0.16)', color: '#00a76f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box component="svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 6V4h16v2zm0 14v-6h16v6zm16-8H4V8h16z"></path>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>Tổng đơn đặt</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalOrders || 0}</Typography>
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid sx={{ flexBasis: 'auto', flexGrow: 0, width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }}>
                    <DashboardCard sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', boxShadow: 'var(--customShadows-card)' }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '25%', bgcolor: 'rgba(0, 184, 217, 0.16)', color: '#00b8d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box component="svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 22h20L12 2zm0 3.5l7 14h-14l7-14z"></path>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>Đang lưu trú</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{checkedInOrders || 0}</Typography>
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid sx={{ flexBasis: 'auto', flexGrow: 0, width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }}>
                    <DashboardCard sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', boxShadow: 'var(--customShadows-card)' }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '25%', bgcolor: 'rgba(255, 171, 0, 0.16)', color: '#ffab00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box component="svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14z"></path>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>Đơn sắp tới</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{upcomingOrders || 0}</Typography>
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid sx={{ flexBasis: 'auto', flexGrow: 0, width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }}>
                    <DashboardCard sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', boxShadow: 'var(--customShadows-card)' }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '25%', bgcolor: 'rgba(255, 86, 48, 0.16)', color: '#ff5630', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box component="svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m.31-8.86c-1.77-.45-2.34-.94-2.34-1.67c0-.84.79-1.43 2.1-1.43c1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81c0 1.79 1.49 2.69 3.66 3.21c1.95.46 2.34 1.15 2.34 1.87c0 .53-.39 1.64-2.25 1.64c-1.64 0-2.1-1.03-2.14-1.73H8.04c.05 1.61 1.15 2.62 2.88 2.96V19h2.34v-1.67c1.61-.31 2.87-1.35 2.87-3.08c-.01-2-1.75-2.78-3.82-3.11"></path>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>Doanh thu tháng này</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{(thisMonthRevenue || 0).toLocaleString()} đ</Typography>
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid>

            <Box sx={gridLayout}>
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Xu hướng doanh thu (6 tháng gần nhất)</Typography>
                        <Chart options={trendOptions} series={[{ name: 'Doanh thu', data: trendData }]} type="area" height={320} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Phân bổ trạng thái đơn</Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Chart options={statusOptions} series={statusData} type="donut" height={320} width="100%" />
                        </Box>
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Doanh thu theo Loại chuồng</Typography>
                        <Chart options={revenueOptions} series={[{ name: 'Doanh thu', data: (revenueByCageType || []).map((r: any) => r.total) }]} type="bar" height={320} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <DashboardCard sx={{ p: 3, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(0, 167, 111, 0.08)', borderRadius: 2, flexGrow: 1, textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Thời gian lưu trú trung bình</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', my: 1 }}>{(avgStayDuration || 0).toFixed(1)}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>Ngày / thú cưng</Typography>
                        </Box>
                    </DashboardCard>
                    <DashboardCard sx={{ p: 3, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255, 171, 0, 0.08)', borderRadius: 2, flexGrow: 1, textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Hiệu suất sử dụng chuồng</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', my: 1 }}>{(((occupancyRes || []).reduce((a: number, b: any) => a + (b.count || 0), 0) / 10) * 100).toFixed(1)}%</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>Công suất hiện tại</Typography>
                        </Box>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );
};
