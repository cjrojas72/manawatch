import { Component, input, OnInit, ViewChild, ElementRef, effect, inject, signal, Input } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ActiveElement } from 'chart.js';
import { WatchlistService } from '../../services/watchlist.service';
import { DecimalPipe } from '@angular/common';


Chart.register(...registerables);

@Component({
  selector: 'app-price-chart',
  imports: [DecimalPipe],
  standalone: true, // Standard for Signal-based apps
  template: `
    <div class="bg-[#16161a] border border-white/5 rounded-3xl p-8 shadow-2xl">
       <div class="flex items-start justify-between mb-8">
                <div>
                  <h2 class="text-2xl font-black text-white tracking-tight leading-none mb-3">
                    {{ title() }}
                  </h2>
                  <p class="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                    As of {{ lastestDate() }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-mono font-black text-white leading-none mb-1">
                    $\{{ todayValue() | number:"3.2-2" }}
                  </p>
                  <p class="text-s font-bold text-emerald-400 font-mono"
                    [class.text-emerald-400]="priceDiffStyle() == 'plus'"
                    [class.text-red-400]="priceDiffStyle() == 'minus'"
                  >
                    {{ priceDiff() }}
                  </p>
                </div>
      </div>
      <div class="relative w-full h-[350px] mb-8">
        <canvas #priceChart></canvas>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-6 pt-8 border-t border-white/5">
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">90 Day High</span>
                  <span class="text-sm font-mono font-bold text-white">$\{{ maxValue() | number:"3.2-2" }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">90 Day Low</span>
                  <span class="text-sm font-mono font-bold text-white">$\{{ minValue() | number:"3.2-2" }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">CCY</span>
                  <span class="text-sm font-bold text-white">USD</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">Price Provider</span>
                  <span class="text-sm font-bold text-white">TCGPlayer</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">Today</span>
                  <span class="text-sm font-mono font-bold">$\{{ todayValue() | number:"3.2-2" }}</span>
                </div>
              </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative; 
      height: 60vh; 
      width: 100%;
      max-height: 400px;
      background-color: #16161a;
    }
  `]
})
export class PriceChartComponent implements OnInit {

  @Input() mode: 'watchlist' | 'detail' = 'watchlist';
  @Input() detailCardId?: string;

  title = signal('Price Chart Signal');
  labels = signal<string[]>(['Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10']);
  dataPoints = signal<number[]>([12.50, 12.75, 12.40, 13.10, 13.50, 13.20, 13.80]);
  // testData = signal<any[]>([]);

  maxValue = signal(90);
  minValue = signal(10);
  todayValue = signal(50);
  lastestDate = signal(new Date().getDate().toString());
  priceDiff = signal("+ $142.50 (4.2%)");
  
  priceDiffStyle = signal("plus");


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
        // this.chart.data.datasets[0].label = this.title();
        
        // Update the chart visually
        this.chart.update();
      }
    });
  }

 

  private createChart() {
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.labels(),
        datasets: [{
          //label: this.title(),
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
        plugins: { 
          tooltip: { enabled: true }, 
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: false, ticks: { callback: (val) => '$' + val } }
        },
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

  loadWatchlistAll(all: string){

    if(all.toLowerCase() !== 'all') return console.log("param must be all");

    this.watchListService.getWatchlistCards().then(cards => {

      console.log(cards.length);

      if(cards.length < 1){
        this.title.set('Total Watchlist Value');
        this.labels.set([]);
        this.dataPoints.set([]);

        return
      }

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
      // Sort keys to ensure the chart moves chronologically
      const sortedDates = Array.from(totalsByDate.keys()).sort();
      
      const aggregatedDates = sortedDates;
      const aggregatedPrices = sortedDates.map(date => totalsByDate.get(date)!);

      // 4. Update signals to refresh the chart
      this.title.set('Total Watchlist Value');
      this.labels.set(aggregatedDates);
      this.dataPoints.set(aggregatedPrices);

      this.maxValue.set(Math.max(...this.dataPoints()));
      this.minValue.set(Math.min(...this.dataPoints()));
      
      const currentPrices = this.dataPoints();
      const currentDate = this.labels();
      this.todayValue.set(currentPrices[currentPrices.length -1]);
      this.lastestDate.set(currentDate[currentDate.length - 1]);

      const todayVal = this.todayValue();
      this.calcDiff(todayVal);
      //console.log('showing ' + this.lastestDate());

    });
  }

  calcDiff(currentPrice: number){
    const prevPrice = this.dataPoints()[this.dataPoints().length - 2];

    let priceDiffVal = Math.abs((currentPrice - prevPrice)).toFixed(2);
    let percentChange = (((currentPrice - prevPrice)/prevPrice) * 100).toFixed(2);

    if(currentPrice > prevPrice){
      this.priceDiff.set(` + ${priceDiffVal} (${percentChange}%)`);
      this.priceDiffStyle.set('plus');
    } else if(currentPrice < prevPrice){
      this.priceDiff.set(` - ${priceDiffVal} (${percentChange}%)`);
      this.priceDiffStyle.set('minus');
    } else if(currentPrice === prevPrice){
      this.priceDiff.set(` + ${priceDiffVal} (${percentChange}%)`);
      this.priceDiffStyle.set('plus');
    }
  }

   ngOnInit() {

    if(this.mode == "watchlist"){
       this.watchListService.watchlistItemSelected$.subscribe((cardId) => {
      if (!cardId) return;
      //this.title.set(cardId ? `Price Chart for Card ID: ${cardId}` : 'Price Chart');
      //console.log('Selected card ID in PriceChartComponent:', cardId);
      this.watchListService.getPriceHistory(cardId || '').then(res => {
        console.log('Price history result:', res);
        this.title.set(res?.name || 'Price Chart');
        this.labels.set(res?.prices.map((p: any) => p.date) || []);
        this.dataPoints.set(res?.prices.map((p: any) => p.price) || []);

        this.maxValue.set(Math.max(...this.dataPoints()));
        this.minValue.set(Math.min(...this.dataPoints()));
        
        const currentPrices = this.dataPoints();
        const currentDate = this.labels();

        this.todayValue.set(currentPrices[currentPrices.length -1]);
        this.lastestDate.set(currentDate[currentDate.length - 1]);

        const todayVal = this.todayValue();
        
        this.calcDiff(todayVal);
        //console.log(this.lastestDate());
        
      });

    });

    this.loadWatchlistAll('all');

    } else if(this.mode == "detail"){
      this.watchListService.getPriceHistory(this.detailCardId ? this.detailCardId: '').then(res =>{
        console.log('Price history result:', res);
        this.title.set(res?.name || 'Price Chart');
        this.labels.set(res?.prices.map((p: any) => p.date) || []);
        this.dataPoints.set(res?.prices.map((p: any) => p.price) || []);
        this.lastestDate.set(this.labels()[this.labels.length - 1]);
        console.log('showing ' + this.lastestDate());
      });
    }

   

    

    this.createChart();
  }
}