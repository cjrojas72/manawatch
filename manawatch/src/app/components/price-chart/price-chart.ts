import { DecimalPipe } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, signal, computed, effect, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartData {
  labels: string[];
  points: number[];
  title?: string;
  setCode?: string;
  color?: string;
}

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './price-chart.html',
  styles: [`
    .chart-container {
      position: relative; 
      height: 100%; 
      width: 100%;
      max-height: 400px;
      background-color: #16161a;
    }
  `]
})

export class PriceChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('priceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  private _inputData = signal<ChartData>({ labels: [], points: [], title: 'Price Chart' });
  @Input({ required: true }) set data(value: ChartData) {
    this._inputData.set(value);
  }

  filterRange = signal<string>('3m');
  isLoading = signal(false);

  displayData = computed(() => {
    // console.log(this._inputData());
    const { labels, points, title, setCode } = this._inputData();
    const range = this.filterRange();
    
    let sliceCount = labels.length;
    if (range === '1d') sliceCount = 2;
    else if (range === '1w') sliceCount = 7;
    else if (range === '1m') sliceCount = 30;

    const slicedLabels = labels.slice(-sliceCount);
    const slicedPoints = points.slice(-sliceCount);

    const today = slicedPoints[slicedPoints.length - 1] || 0;
    const prev = slicedPoints[slicedPoints.length - 2] || today;
    const diff = today - prev;
    const percent = prev !== 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';

    return {
      labels: slicedLabels,
      points: slicedPoints,
      title: title,
      setCode: setCode,
      color: this._inputData().color || 'oklch(67.3% 0.182 276.935)',
      today,
      max: points.length ? Math.max(...points) : 0,
      min: points.length ? Math.min(...points) : 0,
      date: slicedLabels[slicedLabels.length - 1] || 'N/A',
      diffText: `${diff >= 0 ? '+' : '-'} $${Math.abs(diff).toFixed(2)} (${percent}%)`,
      diffStyle: diff >= 0 ? 'plus' : 'minus'
    };
  });

  constructor() {
    effect(() => {
      const uiData = this.displayData();
      if (this.chart) {
        this.chart.data.labels = uiData.labels;
        this.chart.data.datasets[0].data = uiData.points;
        this.chart.data.datasets[0].borderColor = uiData.color;
        this.chart.update('none'); 
      }
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  setFilterRange(range: string) {
    this.filterRange.set(range);
  }

  private createChart() {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [],
          borderColor: this.displayData().color,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { 
          tooltip: { enabled: true }, 
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false, ticks: { callback: (val: any) => '$' + val } }
        },
      },
      plugins: [{
        id: 'verticalLine',
        beforeDraw: (chart: any) => {
          const activeElements = chart.tooltip?.getActiveElements();
          if (activeElements?.length > 0) {
            const ctx = chart.ctx;
            const x = activeElements[0].element.x;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, chart.scales.y.top);
            ctx.lineTo(x, chart.scales.y.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#94a3b8';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();
          }
        }
      }]
    };
    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}