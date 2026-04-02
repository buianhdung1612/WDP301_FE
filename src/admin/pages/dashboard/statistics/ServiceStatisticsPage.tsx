import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import Chart from 'react-apexcharts';
import { getDetailedServiceStats } from '../../../api/dashboard.api';
import DashboardCard from '../../../components/dashboard/DashboardCard';
import SummaryWidget from '../../../components/dashboard/SummaryWidget';

export const ServiceStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDetailedServiceStats();
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching service stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <Box p={3}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} /></Box>;
    }

    const {
        popularServices, staffPerformance, totalBookings,
        pendingBookings, confirmedBookings, thisMonthRevenue, revenueTrend,
        recentRevenueSources
    } = stats;

    const trendOptions: any = {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        xaxis: { categories: (revenueTrend || []).map((t: any) => t.month) },
        colors: ['#FFAB00'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] } },
        grid: { strokeDashArray: 3 }
    };

    const barOptions: any = {
        chart: { toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '50%' } },
        xaxis: { categories: popularServices.map((s: any) => s._id) },
        colors: ['#00A76F'],
        grid: { strokeDashArray: 3 }
    };

    const staffOptions: any = {
        chart: { toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        plotOptions: { bar: { columnWidth: '35%', borderRadius: 4 } },
        xaxis: { categories: staffPerformance.map((s: any) => s.name) },
        colors: ['#FFAB00'],
        grid: { strokeDashArray: 3 }
    };

    const gridLayout = {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px',
    };

    return (
        <Box p={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 4 }}>
                <SummaryWidget
                    title="Tổng lịch đặt"
                    total={totalBookings}
                    percent={5.2}
                    color="#FFAB00"
                    chartData={revenueTrend?.map((t: any) => t.total)}
                />
                <SummaryWidget
                    title="Chờ xử lý"
                    total={pendingBookings}
                    percent={-2.1}
                    color="#00B8D9"
                    chartData={revenueTrend?.map((t: any) => t.total)}
                />
                <SummaryWidget
                    title="Đã xác nhận"
                    total={confirmedBookings}
                    percent={1.4}
                    color="#00A76F"
                    chartData={revenueTrend?.map((t: any) => t.total)}
                />
                <SummaryWidget
                    title="Doanh thu tháng này"
                    total={(thisMonthRevenue || 0).toLocaleString() + 'đ'}
                    percent={12.5}
                    color="#FF5630"
                    chartData={revenueTrend?.map((t: any) => t.total)}
                    recentSources={recentRevenueSources}
                />
            </Box>

            <Box sx={gridLayout}>
                <Box sx={{ gridColumn: 'span 12' }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Xu hướng doanh thu (6 tháng gần nhất)</Typography>
                        <Chart options={trendOptions} series={[{ name: 'Doanh thu', data: (revenueTrend || []).map((t: any) => t.total) }]} type="area" height={300} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Dịch vụ phổ biến nhất</Typography>
                        <Chart options={barOptions} series={[{ name: 'Lượt đặt', data: popularServices.map((s: any) => s.count) }]} type="bar" height={380} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Hiệu suất Nhân viên</Typography>
                        <Chart options={staffOptions} series={[{ name: 'Dịch vụ hoàn thành', data: staffPerformance.map((s: any) => s.count) }]} type="bar" height={380} />
                    </DashboardCard>
                </Box>

            </Box>
        </Box>
    );
};
