import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import Chart from 'react-apexcharts';
import { getDetailedOrderStats } from '../../../api/dashboard.api';
import DashboardCard from '../../../components/dashboard/DashboardCard';

export const OrderStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const STATUS_LABELS: Record<string, string> = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',
        'shipped': 'Đã giao',
        'completed': 'Thành công',
        'cancelled': 'Đã hủy',
        'returned': 'Trả hàng',
        'request_cancel': 'Yêu cầu hủy'
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDetailedOrderStats();
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching order stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <Box p={3}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} /></Box>;
    }

    const { revenueByCategory, topProducts, orderDistribution } = stats;

    const donutOptions: any = {
        labels: orderDistribution.map((o: any) => STATUS_LABELS[o._id] || o._id || 'Khác'),
        colors: ['#00A76F', '#FFAB00', '#FF5630', '#00B8D9', '#8E33FF', '#74CAFF', '#FF4842', '#212B36'],
        legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600 },
        plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Tổng đơn' } } } } },
        dataLabels: { enabled: false }
    };

    const barOptions: any = {
        chart: { toolbar: { show: false }, fontFamily: 'Public Sans, sans-serif' },
        xaxis: {
            categories: topProducts.map((p: any) => p.name.length > 20 ? p.name.substring(0, 17) + "..." : p.name),
            labels: { style: { fontSize: '11px' } }
        },
        colors: ['#00B8D9'],
        // Cột nhỏ lại bằng cách tăng columnWidth vừa phải hoặc giảm size biểu đồ
        plotOptions: { bar: { borderRadius: 6, columnWidth: '25%' } },
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
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Phân tích Bán hàng (Orders)</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Báo cáo chi tiết sản phẩm bán chạy, cơ cấu doanh thu và trạng thái đơn hàng.</Typography>
            </Box>

            <Box sx={gridLayout}>
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Trạng thái Đơn hàng</Typography>
                        <Chart options={donutOptions} series={orderDistribution.map((o: any) => o.count)} type="donut" height={380} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
                    <DashboardCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Top 5 Sản phẩm Bán chạy nhất</Typography>
                        <Chart options={barOptions} series={[{ name: 'Số lượng mua', data: topProducts.map((p: any) => p.totalQuantity) }]} type="bar" height={360} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: 'span 12' }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Doanh thu thuần theo Danh mục Sản phẩm</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2 }}>
                            {revenueByCategory.map((cat: any) => (
                                <Box key={cat._id} sx={{ p: 2, bgcolor: 'rgba(0, 184, 217, 0.08)', borderRadius: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>{cat._id || 'Khác'}</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>{cat.total.toLocaleString()}đ</Typography>
                                </Box>
                            ))}
                            {revenueByCategory.length === 0 && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', gridColumn: '1/-1', py: 3, textAlign: 'center' }}>
                                    Chưa có dữ liệu doanh thu theo danh mục trong kỳ này.
                                </Typography>
                            )}
                        </Box>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );
};
