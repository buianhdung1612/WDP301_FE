import { Grid, Box, Typography, useTheme } from "@mui/material";
import Chart from 'react-apexcharts';
import DashboardCard from "../../components/dashboard/DashboardCard";
import AnalyticsWidget from "../../components/dashboard/AnalyticsWidget";

const CurrentVisits = () => {
    const theme = useTheme();
    const chartOptions: any = {
        chart: { type: 'pie' },
        labels: ['America', 'Asia', 'Europe', 'Africa'],
        stroke: { show: true, width: 2, colors: [theme.palette.background.paper] },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontWeight: 500,
            offsetY: 0,
            itemMargin: { horizontal: 10, vertical: 5 },
            markers: { radius: 12, width: 12, height: 12 }
        },
        dataLabels: {
            enabled: true,
            dropShadow: { enabled: false },
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#fff']
            },
            formatter: (val: number) => `${val.toFixed(1)}%`
        },
        plotOptions: {
            pie: {
                customScale: 0.8,
                expandOnClick: true,
                dataLabels: { offset: -10 }
            }
        },
        colors: ['#00a76f', '#ffab00', '#007867', '#FF5630'],
    };

    const series = [18.8, 31.3, 43.8, 6.3];

    return (
        <DashboardCard sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>Current visits</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Chart options={chartOptions} series={series} type="pie" width="100%" height={344} />
            </Box>
        </DashboardCard>
    );
};

const WebsiteVisits = () => {
    const chartOptions: any = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: {
            bar: {
                columnWidth: '32%',
                borderRadius: 4
            }
        },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: 'var(--palette-text-disabled)', fontSize: '12px' } }
        },
        yaxis: {
            labels: {
                show: true,
                style: { colors: 'var(--palette-text-disabled)', fontSize: '12px' }
            }
        },
        grid: { strokeDashArray: 3, borderColor: 'var(--palette-divider)' },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '13px',
            fontWeight: 500,
            markers: { radius: 12, width: 12, height: 12 },
            itemMargin: { horizontal: 10 }
        },
        colors: ['#007867', '#FFAB00'],
        dataLabels: { enabled: false }
    };

    const series = [
        { name: 'Team A', data: [44, 33, 22, 37, 67, 68, 37, 24, 55] },
        { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 26] }
    ];

    return (
        <DashboardCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>Website visits</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>(+43%) than last year</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Chart options={chartOptions} series={series} type="bar" width="100%" height={364} />
            </Box>
        </DashboardCard>
    );
};

export const AnalyticsPage = () => {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 5 }}>
                Hi, Welcome back 👋
            </Typography>

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
                {/* Analytics Widgets (Span 3 each) */}
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 600px)': { width: 'calc(100% * 6 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 6) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' },
                        '@media (min-width: 1200px)': { width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <AnalyticsWidget
                        title="Weekly sales" total="714k" percent={2.6} color="#00a76f" colorType="primary"
                        icon="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/icons/glass/ic-glass-bag.svg"
                        chartData={[20, 41, 63, 33, 28, 35, 50, 46, 11, 26]}
                    />
                </Grid>
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 600px)': { width: 'calc(100% * 6 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 6) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' },
                        '@media (min-width: 1200px)': { width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <AnalyticsWidget
                        title="New users" total="1.35m" percent={-0.1} color="#8e33ff" colorType="secondary"
                        icon="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/icons/glass/ic-glass-users.svg"
                        chartData={[15, 32, 45, 32, 56, 30, 44, 32, 20]}
                    />
                </Grid>
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 600px)': { width: 'calc(100% * 6 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 6) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' },
                        '@media (min-width: 1200px)': { width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <AnalyticsWidget
                        title="Purchase orders" total="1.72m" percent={2.8} color="#ffab00" colorType="warning"
                        icon="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/icons/glass/ic-glass-buy.svg"
                        chartData={[10, 25, 40, 20, 45, 35, 50, 40, 60]}
                    />
                </Grid>
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 600px)': { width: 'calc(100% * 6 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 6) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' },
                        '@media (min-width: 1200px)': { width: 'calc(100% * 3 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 3) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <AnalyticsWidget
                        title="Messages" total="234" percent={3.6} color="#ff5630" colorType="error"
                        icon="https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/icons/glass/ic-glass-message.svg"
                        chartData={[5, 18, 12, 51, 68, 11, 39, 37, 27, 20]}
                    />
                </Grid>

                {/* Current Visits (Span 4) */}
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 900px)': { width: 'calc(100% * 4 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 4) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <CurrentVisits />
                </Grid>

                {/* Website Visits (Span 8) */}
                <Grid
                    sx={{
                        flexBasis: 'auto', flexGrow: 0, width: '100%',
                        '@media (min-width: 900px)': { width: 'calc(100% * 8 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 8) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)))' }
                    }}
                >
                    <WebsiteVisits />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsPage;
