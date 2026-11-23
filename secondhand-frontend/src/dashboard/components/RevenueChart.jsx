import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { resolveChartColors } from '../../common/theme/themeTokens.js';
import { useColorScheme } from '../../common/hooks/useColorScheme.js';
import { formatCurrency } from '../../common/formatters.js';
import { CardEmpty } from './DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RevenueChart = ({
  data,
  label = 'Revenue'
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();

  if (!data || data.length === 0) {
    return <CardEmpty>{t('dash_no_trend_data', 'Bu dönemde veri yok.')}</CardEmpty>;
  }

  const colors = resolveChartColors();

  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('tr-TR', {
        month: 'short',
        day: 'numeric'
      });
    }),
    datasets: [{
      label,
      data: data.map((item) => parseFloat(item.revenue || item.spending || 0)),
      borderColor: colors.line,
      backgroundColor: colors.areaSoft,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: colors.line,
      pointHoverBorderColor: colors.pointFill,
      pointHoverBorderWidth: 2,
      borderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        padding: { x: 14, y: 10 },
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 12, weight: '700' },
        cornerRadius: 4,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `${label}: ${formatCurrency(context.parsed.y, DASHBOARD_CURRENCY)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        ticks: {
          callback: (value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toLocaleString('tr-TR')),
          font: { size: 10, weight: '500' },
          color: colors.tick,
          padding: 8
        },
        grid: {
          color: colors.grid,
          drawBorder: false
        }
      },
      x: {
        border: { display: false },
        ticks: {
          font: { size: 10, weight: '500' },
          color: colors.tick,
          maxTicksLimit: 8,
          padding: 4
        },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Line key={colorScheme} data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;