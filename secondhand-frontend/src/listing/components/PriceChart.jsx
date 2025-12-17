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
      formatDateTime(item.changeDate, 'tr-TR').split(' ')[0]
    );

    const prices = sortedHistory.map(item => item.newPrice);

    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#4F46E5', // Indigo-600
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#4F46E5',
          pointBorderWidth: 2,
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
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const item = priceHistory[context.dataIndex];
            const currencyCode = item?.currency || currency;
            return formatCurrency(context.parsed.y, currencyCode);
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF', font: { size: 10 } }
      },
      y: {
        grid: { color: '#F3F4F6', borderDash: [4, 4] },
        ticks: { 
          color: '#9CA3AF', 
          font: { size: 10 },
          callback: function(value) {
            const currencyCode = priceHistory?.[0]?.currency || currency;
            return formatCurrency(value, currencyCode).replace(/\D00(?=\D*$)/, ''); // Remove .00
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
    <div className="w-full h-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PriceChart;
