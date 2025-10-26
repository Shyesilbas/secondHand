import React from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { Line } from 'react-chartjs-2';

const PriceChart = ({ priceHistory, currency }) => {
  const prepareChartData = () => {
    if (!priceHistory || priceHistory.length === 0) return null;

    const sortedHistory = [...priceHistory].sort((a, b) => 
      new Date(a.changeDate) - new Date(b.changeDate)
    );

    const labels = sortedHistory.map(item => 
      formatDateTime(item.changeDate, 'tr-TR')
    );

    const prices = sortedHistory.map(item => item.newPrice);

    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#3B82F6',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const item = priceHistory[context.dataIndex];
            const currencyCode = item?.currency || currency;
            return `${formatCurrency(context.parsed.y, currencyCode)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price',
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            const currencyCode = priceHistory?.[0]?.currency || currency;
            return formatCurrency(value, currencyCode);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const chartData = prepareChartData();
  
  if (!chartData) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Price Trend</h4>
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PriceChart;
