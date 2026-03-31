import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
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

    const { occupancyRes, revenueByCageType, avgStayDuration } = stats;

    const occupancyOptions: any = {
        labels: occupancyRes.map((o: any) => o._id || 'Khác'),
        colors: ['#00A76F', '#FFAB00', '#FF5630', '#00B8D9'],
        legend: { position: 'bottom', fontWeight: 600 },
        plotOptions: { pie: { expandOnClick: true } }
    };

    const revenueOptions: any = {
        chart: { toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        xaxis: { categories: revenueByCageType.map((r: any) => r._id) },
        colors: ['#FF5630'],
        plotOptions: { bar: { columnWidth: '25%', borderRadius: 4 } },
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
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Phân tích Khách sạn Thú cưng</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Quản lý công suất chuồng, thời gian lưu trú và hiệu quả kinh doanh mảng Boarding.</Typography>
            </Box>

            <Box sx={gridLayout}>
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Công suất (Checked-in)</Typography>
                        <Chart options={occupancyOptions} series={occupancyRes.map((o: any) => o.count)} type="pie" height={380} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Doanh thu thuần theo Loại chuồng</Typography>
                        <Chart options={revenueOptions} series={[{ name: 'Doanh thu', data: revenueByCageType.map((r: any) => r.total) }]} type="bar" height={345} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                    <DashboardCard sx={{ p: 4 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4, textAlign: 'center' }}>
                            <Box sx={{ p: 3, bgcolor: 'rgba(0, 167, 111, 0.08)', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Thời gian lưu trú trung bình</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', my: 1 }}>{avgStayDuration.toFixed(1)}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Ngày / thú cưng</Typography>
                            </Box>

                            <Box sx={{ p: 3, bgcolor: 'rgba(255, 171, 0, 0.08)', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Hiệu suất sử dụng phòng</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main', my: 1 }}>{((occupancyRes.reduce((a: number, b: number) => a + b, 0) / 10) * 100).toFixed(1)}%</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Trên tổng công suất</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    💡 Gợi ý: Hãy cân nhắc tạo thêm gói combo lưu trú dài hạn cho các chuồng VIP vào mùa lễ để tối ưu hóa doanh thu.
                                </Typography>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );
};
