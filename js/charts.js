/**
 * Charts Engine using Chart.js
 */

export const FinanceCharts = {
  compChart: null,
  curveChart: null,

  destroyAll() {
    if (this.compChart) {
      this.compChart.destroy();
      this.compChart = null;
    }
    if (this.curveChart) {
      this.curveChart.destroy();
      this.curveChart = null;
    }
  },

  renderComparisonChart(canvasId, flatData, effData, annData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (this.compChart) this.compChart.destroy();

    const labels = ['Bunga Flat', 'Bunga Efektif (Sliding)', 'Bunga Anuitas'];
    const principalData = [flatData.principal, effData.principal, annData.principal];
    const interestData = [flatData.totalInterest, effData.totalInterest, annData.totalInterest];

    this.compChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Pokok Pinjaman',
            data: principalData,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Total Beban Bunga',
            data: interestData,
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            borderColor: 'rgb(220, 38, 38)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Inter', sans-serif", size: 12, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                return context.dataset.label + ': Rp ' + Math.round(val).toLocaleString('id-ID');
              }
            }
          }
        },
        scales: {
          x: { stacked: false, grid: { display: false } },
          y: {
            stacked: false,
            ticks: {
              callback: function(value) {
                if (value >= 1e9) return 'Rp ' + (value / 1e9).toFixed(1) + 'M';
                if (value >= 1e6) return 'Rp ' + (value / 1e6).toFixed(0) + 'Jt';
                return 'Rp ' + value.toLocaleString('id-ID');
              }
            }
          }
        }
      }
    });
  },

  renderAmortizationCurveChart(canvasId, flatData, effData, annData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (this.curveChart) this.curveChart.destroy();

    const n = flatData.nMonths;
    const step = n > 36 ? Math.ceil(n / 24) : 1;
    const labels = [0];
    const flatPoints = [flatData.principal];
    const effPoints = [effData.principal];
    const annPoints = [annData.principal];

    for (let i = 1; i <= n; i++) {
      if (i % step === 0 || i === n) {
        labels.push('Bln ' + i);
        flatPoints.push(flatData.schedule[i - 1].remainingBalance);
        effPoints.push(effData.schedule[i - 1].remainingBalance);
        annPoints.push(annData.schedule[i - 1].remainingBalance);
      }
    }

    this.curveChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Baki Debet Flat',
            data: flatPoints,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: n > 36 ? 0 : 3
          },
          {
            label: 'Baki Debet Efektif',
            data: effPoints,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            tension: 0.1,
            pointRadius: n > 36 ? 0 : 3
          },
          {
            label: 'Baki Debet Anuitas',
            data: annPoints,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 2.5,
            tension: 0.1,
            pointRadius: n > 36 ? 0 : 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Inter', sans-serif", size: 12, weight: '600' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                return context.dataset.label + ': Rp ' + Math.round(val).toLocaleString('id-ID');
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: {
              callback: function(value) {
                if (value >= 1e9) return 'Rp ' + (value / 1e9).toFixed(1) + 'M';
                if (value >= 1e6) return 'Rp ' + (value / 1e6).toFixed(0) + 'Jt';
                return 'Rp ' + value.toLocaleString('id-ID');
              }
            }
          }
        }
      }
    });
  }
};
