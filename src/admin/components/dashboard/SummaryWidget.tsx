import { Box, Typography } from "@mui/material";
import { Icon } from '@iconify/react';
import Chart from 'react-apexcharts';
import DashboardCard from "./DashboardCard";

interface SummaryWidgetProps {
    title: string;
    total: string;
    percent: number;
    color?: string;
    chartData: number[];
}

const SummaryWidget = ({ title, total, percent, color = '#00a76f', chartData }: SummaryWidgetProps) => {
    const isLoss = percent < 0;

    const chartOptions: any = {
        chart: {
            sparkline: { enabled: true },
            animations: { enabled: true }
        },
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: {
                colorStops: [
                    { offset: 0, color: color, opacity: 1 },
                    { offset: 100, color: color, opacity: 1 },
                ]
            }
        },
        colors: [color],
        tooltip: { enabled: false },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } }
        },
        grid: { padding: { top: 2, bottom: 2 } }
    };

    return (
        <DashboardCard sx={{ display: 'flex', alignItems: 'center', p: 'calc(3 * var(--spacing))' }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography sx={{ mt: 1.5, mb: 1, fontSize: '2rem', fontWeight: 600, fontFamily: 'Barlow, sans-serif' }}>
                    {total}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: isLoss ? 'rgba(255, 86, 48, 0.16)' : 'rgba(34, 197, 94, 0.16)',
                            color: isLoss ? '#ff5630' : '#22c55e'
                        }}
                    >
                        <Icon
                            icon={isLoss ? "eva:trending-down-fill" : "eva:trending-up-fill"}
                            width={16}
                            height={16}
                        />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {percent > 0 ? `+${percent}` : percent}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)', fontWeight: 400 }}>
                        7 ngày qua
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ width: 100, height: 66 }}>
                <Chart type="line" series={[{ data: chartData }]} options={chartOptions} width={100} height={66} />
            </Box>
        </DashboardCard>
    );
};

export default SummaryWidget;
