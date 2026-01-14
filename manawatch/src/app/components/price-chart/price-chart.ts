// import { Component, Input, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
// import { Chart, registerables, ChartConfiguration, ActiveElement } from 'chart.js';

// Chart.register(...registerables);

// @Component({
//   selector: 'app-price-chart',
//   template: `
//     <div class="chart-container">
//       <canvas style="width: 100%; height: 100%; display: block;" #priceChart></canvas>
//     </div>
//   `,
//   styles: [`
//   .chart-container {
//       position: relative; 
//       height: 60vh; /* Takes up 60% of mobile screen height */
//       width: 100%;
//       max-height: 400px; /* Limits size on desktop */
//     }`]
// })
// export class PriceChartComponent implements OnInit {
//   @Input() title = signal('Price Chart');
//   @Input() labels: string[] = ['Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10'];
//   @Input() dataPoints: number[] = [12.50, 12.75, 12.40, 13.10, 13.50, 13.20, 13.80];

//   @ViewChild('priceChart', { static: true }) chartCanvas!: ElementRef;
//   private chart?: Chart;

//   ngOnInit() {
//     this.createChart();
//   }

//   private createChart() {
//     const config: ChartConfiguration = {
//       type: 'line',
//       data: {
//         labels: this.labels,
//         datasets: [{
//           label: this.title.toString(),
//           data: this.dataPoints,
//           borderColor: 'oklch(67.3% 0.182 276.935)',
//           backgroundColor: 'rgba(59, 130, 246, 0.1)',
//           fill: true,
//           tension: 0.4,
//           pointRadius: 0,
//           pointHitRadius: 20,
//           // Point hover settings are moved into pointHoverRadius in the dataset
//           pointHoverRadius: 6 
//         }]
//       },
//       options: {
//         responsive: true,
//         interaction: {
//           mode: 'index',
//           intersect: false,
//         },
//         plugins: {
//           tooltip: { enabled: true }
//         },
//         scales: {
//           y: { beginAtZero: false, ticks: { callback: (val) => '$' + val } }
//         }
//       },
//       plugins: [{
//         id: 'verticalLine',
//         // Use 'chart' type to help TS identify the context
//         beforeDraw: (chart: any) => {
//           // Check if tooltip exists and has an active element
//           const activeElements = chart.tooltip?.getActiveElements() as ActiveElement[];
          
//           if (activeElements && activeElements.length > 0) {
//             const ctx = chart.ctx;
//             const activePoint = activeElements[0];
//             const x = activePoint.element.x;
//             const topY = chart.scales.y.top;
//             const bottomY = chart.scales.y.bottom;

//             ctx.save();
//             ctx.beginPath();
//             ctx.moveTo(x, topY);
//             ctx.lineTo(x, bottomY);
//             ctx.lineWidth = 1;
//             ctx.strokeStyle = '#94a3b8';
//             ctx.setLineDash([5, 5]);
//             ctx.stroke();
//             ctx.restore();
//           }
//         }
//       }]
//     };

//     this.chart = new Chart(this.chartCanvas.nativeElement, config);
//   }
// }

import { Component, input, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ActiveElement } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-price-chart',
  standalone: true, // Standard for Signal-based apps
  template: `
    <div class="chart-container">
      <canvas style="width: 100%; height: 100%; display: block;" #priceChart></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative; 
      height: 60vh; 
      width: 100%;
      max-height: 400px;
    }
  `]
})
export class PriceChartComponent implements OnInit {
  // 1. Declare inputs using the input() function
  title = input<string>('Price Chart');
  labels = input<string[]>(['Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10']);
  dataPoints = input<number[]>([12.50, 12.75, 12.40, 13.10, 13.50, 13.20, 13.80]);

  @ViewChild('priceChart', { static: true }) chartCanvas!: ElementRef;
  private chart?: Chart;

  constructor() {
    // 2. Setup an effect to react to Signal changes
    effect(() => {
      if (this.chart) {
        // Access signals using ()
        this.chart.data.labels = this.labels();
        this.chart.data.datasets[0].data = this.dataPoints();
        this.chart.data.datasets[0].label = this.title();
        
        // Update the chart visually
        this.chart.update();
      }
    });
  }

  ngOnInit() {
    this.createChart();
  }

  private createChart() {
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.labels(), // Initialize with signal values
        datasets: [{
          label: this.title(),
          data: this.dataPoints(),
          borderColor: 'oklch(67.3% 0.182 276.935)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: 20,
          pointHoverRadius: 6 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: { enabled: true } },
        scales: {
          y: { beginAtZero: false, ticks: { callback: (val) => '$' + val } }
        }
      },
      plugins: [{
        id: 'verticalLine',
        beforeDraw: (chart: any) => {
          const activeElements = chart.tooltip?.getActiveElements() as ActiveElement[];
          if (activeElements && activeElements.length > 0) {
            const ctx = chart.ctx;
            const activePoint = activeElements[0];
            const x = activePoint.element.x;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
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
}