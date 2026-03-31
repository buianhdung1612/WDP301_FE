import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Stack, IconButton, Skeleton, Divider } from '@mui/material';
import Chart from 'react-apexcharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getEcommerceStats } from '../../../api/dashboard.api';
import DashboardCard from '../../../components/dashboard/DashboardCard';
import { Icon } from '@iconify/react';

const SummaryWidget = ({ title, total, percent, color, subtitle }: any) => {
    return (
        <DashboardCard sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{total}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                <Box sx={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: percent >= 0 ? 'rgba(34, 197, 94, 0.16)' : 'rgba(255, 86, 48, 0.16)',
                    color: percent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(255, 86, 48)'
                }}>
                    <Icon icon={percent >= 0 ? "solar:double-alt-arrow-up-bold-duotone" : "solar:double-alt-arrow-down-bold-duotone"} width={16} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: percent >= 0 ? 'success.main' : 'error.main' }}>
                    {percent >= 0 ? '+' : ''}{percent.toFixed(1)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{subtitle}</Typography>
            </Stack>
        </DashboardCard>
    );
};

export const GeneralStatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getEcommerceStats();
            setData(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading || !data) {
        return (
            <Box p={3}><Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} /></Box>
        );
    }

    const { summary, yearlyRevenueChart, topCategories } = data;

    const chartOptions: any = {
        chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'Public Sans, sans-serif' },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] } },
        xaxis: {
            categories: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        colors: ['#00A76F'],
        grid: { strokeDashArray: 3, borderColor: 'rgba(145, 158, 171, 0.2)' },
        tooltip: { theme: 'light', y: { formatter: (val: number) => val.toLocaleString() + 'đ' } }
    };

    const categoryOptions: any = {
        labels: topCategories.map((cat: any) => cat.label),
        colors: ['#00A76F', '#FFAB00', '#00B8D9', '#FF5630', '#0052CC'],
        stroke: { colors: ['transparent'] },
        legend: { position: 'bottom', horizontalAlign: 'center', fontWeight: 600 },
        plotOptions: { pie: { donut: { size: '85%', labels: { show: true, total: { show: true, label: 'Tổng thu', formatter: (w: any) => w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0).toLocaleString() + 'đ' } } } } },
        dataLabels: { enabled: false }
    };

    const gridLayout = {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '24px',
    };

    return (
        <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Thống kê Doanh thu thuần</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Báo cáo lợi nhuận thực tế sau khi đã loại bỏ phí vận chuyển.</Typography>
                </Box>
                <IconButton onClick={fetchData} sx={{ bgcolor: 'rgba(0, 167, 111, 0.08)', color: 'primary.main' }}>
                    <RefreshIcon />
                </IconButton>
            </Stack>

            <Box sx={gridLayout}>
                {/* 4 thẻ Summary trên cùng 1 hàng (Mỗi thẻ chiếm 3 cột) */}
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                    <SummaryWidget title="Doanh thu tháng này" total={summary.monthlyRevenue.toLocaleString() + 'đ'} percent={summary.revenueMonthPercent} subtitle="so với tháng trước" />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                    <SummaryWidget title="Tổng đơn hàng" total={summary.totalOrders} percent={5.2} subtitle="đơn hàng mới" />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                    <SummaryWidget title="Đơn dịch vụ Spa" total={summary.totalServiceBookings} percent={2.1} subtitle="lịch đặt thành công" />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                    <SummaryWidget title="Đặt phòng Hotel" total={summary.totalBoardingBookings} percent={-1.4} subtitle="lưu trú hoàn thành" />
                </Box>

                {/* Hàng 2: Xu hướng doanh thu (8 cột) và Cơ cấu danh mục (4 cột) */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
                    <DashboardCard sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Xu hướng Doanh thu hàng tháng</Typography>
                        <Chart options={chartOptions} series={[{ name: 'Doanh thu thuần', data: yearlyRevenueChart }]} type="area" height={350} />
                    </DashboardCard>
                </Box>

                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                    <DashboardCard sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Cơ cấu theo Danh mục</Typography>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Chart options={categoryOptions} series={topCategories.map((c: any) => c.total)} type="donut" width="100%" height={320} />
                        </Box>
                        <Divider sx={{ borderStyle: 'dashed', my: 3 }} />
                        <Stack spacing={2}>
                            {topCategories.slice(0, 3).map((item: any, index: number) => (
                                <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: categoryOptions.colors[index] }} />
                                    <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 600 }}>{item.label}</Typography>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{item.total.toLocaleString()}đ</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </DashboardCard>
                </Box>
            </Box>
        </Box>
    );
};
