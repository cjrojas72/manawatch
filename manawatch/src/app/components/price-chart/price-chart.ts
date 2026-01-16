import { Component, input, OnInit, ViewChild, ElementRef, effect, inject, signal } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ActiveElement } from 'chart.js';
import { WatchlistService } from '../../services/watchlist.service';
import { MtgJsonService } from '../../services/mtgjson.service';

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

  title = signal('Price Chart Signal');
  labels = signal<string[]>(['Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10']);
  dataPoints = signal<number[]>([12.50, 12.75, 12.40, 13.10, 13.50, 13.20, 13.80]);
  testData = signal<any[]>([]);


  private watchListService = inject(WatchlistService);

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

 

  private createChart() {
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.labels(),
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
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

   ngOnInit() {

    this.watchListService.watchlistItemSelected$.subscribe((cardId) => {
      if (!cardId) return;
      //this.title.set(cardId ? `Price Chart for Card ID: ${cardId}` : 'Price Chart');
      //console.log('Selected card ID in PriceChartComponent:', cardId);
      this.watchListService.getPriceHistory(cardId || '').then(res => {
        console.log('Price history result:', res);
        this.title.set(res?.name || 'Price Chart');
        this.labels.set(res?.prices.map((p: any) => p.date) || []);
        this.dataPoints.set(res?.prices.map((p: any) => p.price) || []);
      });

    });

    this.watchListService.getWatchlistCards().then(cards => {
      const mockData = this.watchListService.getMockWatchlistPriceHistory(cards);
  
      // 1. Use a Map to store { "YYYY-MM-DD": totalSum }
      const totalsByDate = new Map<string, number>();

      mockData.forEach(card => {
        card.dates.forEach((date, index) => {
          const dailyPrice = card.prices[index];
          
          // 2. If the date already exists in the Map, add to it; otherwise, start it
          const currentSum = totalsByDate.get(date) || 0;
          totalsByDate.set(date, currentSum + dailyPrice);
        });
      });

      // 3. Convert the Map back into sorted arrays for the chart
      // We sort the keys to ensure the chart moves chronologically
      const sortedDates = Array.from(totalsByDate.keys()).sort();
      
      const aggregatedDates = sortedDates;
      const aggregatedPrices = sortedDates.map(date => totalsByDate.get(date)!);

      // 4. Update your signals to refresh the chart
      this.title.set('Total Watchlist Value');
      this.labels.set(aggregatedDates);
      this.dataPoints.set(aggregatedPrices);

    });

    this.createChart();
  }
}