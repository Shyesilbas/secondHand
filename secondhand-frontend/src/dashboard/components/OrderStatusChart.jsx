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
      <div className="bg-white rounded-lg border border-gray-200/60 p-6 flex items-center justify-center h-64">
        <p className="text-gray-500 text-xs font-medium">No data available</p>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'rgb(245, 158, 11)',      // amber
    CONFIRMED: 'rgb(59, 130, 246)',   // blue
    PROCESSING: 'rgb(139, 92, 246)',  // violet
    SHIPPED: 'rgb(14, 165, 233)',      // cyan
    DELIVERED: 'rgb(16, 185, 129)',    // green
    COMPLETED: 'rgb(34, 197, 94)',     // emerald green
    CANCELLED: 'rgb(239, 68, 68)',     // red
    REFUNDED: 'rgb(156, 163, 175)',    // gray
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
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 12,
          font: {
            size: 10,
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 12,
          weight: '600',
        },
        color: '#111827',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
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
    <div className="bg-white rounded-lg border border-gray-200/60 p-6">
      <div style={{ height: '320px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OrderStatusChart;

