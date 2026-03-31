import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Skeleton, Divider } from '@mui/material';
import Chart from 'react-apexcharts';
import { getDetailedServiceStats } from '../../../api/dashboard.api';
import DashboardCard from '../../../components/dashboard/DashboardCard';

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

    const { popularServices, staffPerformance, revenueByCategory } = stats;

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
            <Box mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Thống kê Dịch vụ Pet Grooming & Spa</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phân tích tần suất đặt lịch và hiệu năng xử lý của đội ngũ nhân sự.</Typography>
            </Box>

            <Box sx={gridLayout}>
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

                <Box sx={{ gridColumn: 'span 12' }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Doanh thu theo Danh mục Dịch vụ</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                            {revenueByCategory.map((cat: any) => (
                                <Box key={cat._id} sx={{ p: 3, bgcolor: 'rgba(0, 167, 111, 0.08)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.1, color: 'primary.main' }}>
                                        <svg width="80" height="80" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>{cat._id}</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{cat.total.toLocaleString()}đ</Typography>
                                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>{cat.count} lượt đặt thành công</Typography>
                                </Box>
                            ))}
                        </Box>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );
};
