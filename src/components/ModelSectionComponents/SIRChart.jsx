import { createEffect, createSignal, onCleanup } from 'solid-js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function SIRChart(props) {
  let chartCanvas;
  let chartInstance;
  const [logScale, setLogScale] = createSignal(true);
  let todayDayRef = null;

  createEffect(() => {
    const data = props.results();
    const isLog = logScale();
    todayDayRef = props.todayMarker?.() ?? null;
    if (!chartCanvas || data.length === 0) return;

    const labels = data.map((d) => d.day);
    const config = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Susceptible (S)',
            data: data.map((d) => d.susceptible),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Exposed (E)',
            data: data.map((d) => d.exposed || 0),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Infectious (I)',
            data: data.map((d) => d.infectious),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2.5,
          },
          {
            label: 'Recovered (R)',
            data: data.map((d) => d.recovered),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Deaths (D)',
            data: data.map((d) => d.deaths),
            borderColor: '#6b7280',
            backgroundColor: 'rgba(107,114,128,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
            borderDash: [5, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { family: "'Inter', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Inter', sans-serif", weight: '600' },
            bodyFont: { family: "'Inter', sans-serif" },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Days', font: { family: "'Inter', sans-serif", weight: '500' } },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
          },
          y: {
            type: isLog ? 'logarithmic' : 'linear',
            title: { display: true, text: 'Population', font: { family: "'Inter', sans-serif", weight: '500' } },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
              callback: isLog
                ? (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v)
                : (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
            },
          },
        },
      },
      plugins: [{
        id: 'todayLine',
        afterDraw(chart) {
          const day = todayDayRef;
          if (day == null) return;
          const { ctx, chartArea, scales } = chart;
          const x = scales.x.getPixelForValue(day);
          if (x < chartArea.left || x > chartArea.right) return;

          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 2;
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = "600 12px 'Inter', sans-serif";
          ctx.fillStyle = '#6b7280';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(x, (chartArea.top + chartArea.bottom) / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(`You are here (${day} days since 1st case)`, 0, 8);

          ctx.restore();
        },
      }],
    };

    if (chartInstance) {
      chartInstance.data = config.data;
      chartInstance.options = config.options;
      chartInstance.update('none');
    } else {
      chartInstance = new Chart(chartCanvas, config);
    }
  });

  onCleanup(() => {
    if (chartInstance) chartInstance.destroy();
  });

  return (
    <div class="bg-white border border-surface-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
      <div class="flex items-center justify-end mb-3">
        <div class="flex bg-surface-100 rounded-lg p-0.5">
          <button
            onClick={() => setLogScale(false)}
            class={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              !logScale() ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setLogScale(true)}
            class={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              logScale() ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Log
          </button>
        </div>
      </div>
      <div class="h-[400px] sm:h-[450px]">
        <canvas ref={chartCanvas} id="sir-chart" />
      </div>
    </div>
  );
}
