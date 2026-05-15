import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusChart = ({ data, title = 'Order Status Distribution' }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-xs font-medium">No order data available</p>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'rgb(245, 158, 11)',
    CONFIRMED: 'rgb(59, 130, 246)',
    PROCESSING: 'rgb(139, 92, 246)',
    SHIPPED: 'rgb(14, 165, 233)',
    DELIVERED: 'rgb(16, 185, 129)',
    COMPLETED: 'rgb(34, 197, 94)',
    CANCELLED: 'rgb(239, 68, 68)',
    REFUNDED: 'rgb(156, 163, 175)',
  };

  const labels = Object.keys(data);
  const values = Object.values(data).map(v => Number(v || 0));

  const chartData = {
    labels: labels.map(label => {
      return label.charAt(0) + label.slice(1).toLowerCase();
    }),
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(label => statusColors[label] || 'rgb(156, 163, 175)'),
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 14,
          font: { size: 11, weight: '500' },
          color: '#475569',
          usePointStyle: true,
          pointStyleWidth: 8,
        },
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
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default OrderStatusChart;
