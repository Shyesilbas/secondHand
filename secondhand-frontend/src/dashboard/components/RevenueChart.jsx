import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data, title = 'Revenue Trend', label = 'Revenue' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-xs font-medium">No data available for this period</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: label,
        data: data.map(item => parseFloat(item.revenue || item.spending || 0)),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(99, 102, 241)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: { x: 14, y: 10 },
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 12, weight: '700' },
        cornerRadius: 10,
        borderColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${label}: ${parseFloat(context.parsed.y).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} TRY`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        ticks: {
          callback: function(value) {
            if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value.toLocaleString('tr-TR');
          },
          font: { size: 10, weight: '500' },
          color: '#94a3b8',
          padding: 8,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
          drawBorder: false,
        },
      },
      x: {
        border: { display: false },
        ticks: {
          font: { size: 10, weight: '500' },
          color: '#94a3b8',
          maxTicksLimit: 8,
          padding: 4,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
