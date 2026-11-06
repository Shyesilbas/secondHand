import { useTranslation } from "react-i18next";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { theme } from '../../common/theme/theme.js';
import { formatCurrency } from '../../common/formatters.js';
import { CardEmpty } from './DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const RevenueChart = ({
 data,
 label = 'Revenue'
}) => {
 const {
 t
 } = useTranslation();
 if (!data || data.length === 0) {
 return <CardEmpty>{t('dash_no_trend_data', 'Bu dönemde veri yok.')}</CardEmpty>;
 }
 const chartData = {
 labels: data.map(item => {
 const date = new Date(item.date);
 return date.toLocaleDateString('tr-TR', {
 month: 'short',
 day: 'numeric'
 });
 }),
 datasets: [{
 label: label,
 data: data.map(item => parseFloat(item.revenue || item.spending || 0)),
 borderColor: 'rgb(15, 23, 42)',
 backgroundColor: 'rgba(15, 23, 42, 0.06)',
 fill: true,
 tension: 0.3,
 pointRadius: 0,
 pointHoverRadius: 6,
 pointHoverBackgroundColor: 'rgb(15, 23, 42)',
 pointHoverBorderColor: theme.colors.background.primary,
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
 legend: {
 display: false
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
 cornerRadius: 4,
 borderColor: 'rgba(15, 23, 42, 0.2)',
 borderWidth: 1,
 displayColors: false,
 callbacks: {
 label: function (context) {
 return `${label}: ${formatCurrency(context.parsed.y, DASHBOARD_CURRENCY)}`;
 }
 }
 }
 },
 scales: {
 y: {
 beginAtZero: true,
 border: {
 display: false
 },
 ticks: {
 callback: function (value) {
 if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
 return value.toLocaleString('tr-TR');
 },
 font: {
 size: 10,
 weight: '500'
 },
 color: theme.colors.text.muted,
 padding: 8
 },
 grid: {
 color: 'rgba(148, 163, 184, 0.08)',
 drawBorder: false
 }
 },
 x: {
 border: {
 display: false
 },
 ticks: {
 font: {
 size: 10,
 weight: '500'
 },
 color: theme.colors.text.muted,
 maxTicksLimit: 8,
 padding: 4
 },
 grid: {
 display: false
 }
 }
 }
 };
 return <div style={{
 height: '300px'
 }}>
 <Line data={chartData} options={options} />
 </div>;
};
export default RevenueChart;