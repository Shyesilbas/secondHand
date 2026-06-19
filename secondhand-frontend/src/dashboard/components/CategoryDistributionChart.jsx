import { useTranslation } from "react-i18next";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
const CATEGORY_COLORS = ['rgb(99, 102, 241)',
// indigo
'rgb(16, 185, 129)',
// emerald
'rgb(245, 158, 11)',
// amber
'rgb(236, 72, 153)',
// pink
'rgb(14, 165, 233)',
// sky
'rgb(168, 85, 247)',
// purple
'rgb(251, 146, 60)',
// orange
'rgb(20, 184, 166)' // teal
];
const CategoryDistributionChart = ({
  data,
  title = 'Category Distribution'
}) => {
  const {
    t
  } = useTranslation();
  if (!data || Object.keys(data).length === 0) {
    return <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-xs font-medium">{t("no_data_available_for_this_period")}</p>
      </div>;
  }
  const labels = Object.keys(data);
  const values = Object.values(data).map(v => parseFloat(v || 0));
  const chartData = {
    labels: labels.map(label => {
      return label.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [{
      data: values,
      backgroundColor: CATEGORY_COLORS.slice(0, labels.length),
      borderColor: 'rgba(255,255,255,0.8)',
      borderWidth: 2,
      hoverOffset: 6
    }]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 16,
          font: {
            size: 11,
            weight: '500'
          },
          color: '#475569',
          usePointStyle: true,
          pointStyleWidth: 8
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: {
          x: 14,
          y: 10
        },
        titleFont: {
          size: 11,
          weight: '600'
        },
        bodyFont: {
          size: 12,
          weight: '700'
        },
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = (value / total * 100).toFixed(1);
            return `${label}: ${value.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} TRY (${percentage}%)`;
          }
        }
      }
    }
  };
  return <div style={{
    height: '300px'
  }}>
      <Pie data={chartData} options={options} />
    </div>;
};
export default CategoryDistributionChart;