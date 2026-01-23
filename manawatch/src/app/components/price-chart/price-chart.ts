import { Component, input, OnInit, ViewChild, ElementRef, effect, inject, signal, Input, OnDestroy } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ActiveElement } from 'chart.js';
import { WatchlistService } from '../../services/watchlist.service';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';


Chart.register(...registerables);

@Component({
  selector: 'app-price-chart',
  imports: [DecimalPipe],
  standalone: true,
  template: `
    <div 
      [class.animate-pulse]="isloading() == true"
      class="bg-[#16161a] border border-white/5 rounded-3xl p-8 shadow-2xl">
       <div class="flex items-start justify-between mb-8">
                <div>
                  <h2 class="text-2xl font-black text-white tracking-tight leading-none mb-3">
                    {{ title() }} 

                    @if(setCode()){
                      - <span class="text-slate-400 text-lg"> {{ setCode() }} </span>
                    }
                  </h2>
                  <p class="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                    As of {{ lastestDate() }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-mono font-black text-white leading-none mb-1">
                    $\{{ todayValue() | number:"1.2-2" }}
                  </p>
                  <p class="text-s font-bold text-emerald-400 font-mono"
                    [class.text-emerald-400]="priceDiffStyle() == 'plus'"
                    [class.text-red-400]="priceDiffStyle() == 'minus'"
                  >
                    {{ priceDiff() }}
                  </p>
                </div>
      </div>
      <div class="relative w-full h-[350px] mb-8" style="max-width: 800px;">
        <canvas #priceChart></canvas>
      </div>
      <div class="flex items-center justify-center mb-8">
        <div id="filter-group" class="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md">
            <button 
              (click)="setFilterRange('3m')" 
              class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer"
              [class.bg-indigo-600]="filterRange() == '3m'"
              [class.text-white]="filterRange() == '3m'"
              >
                3M
            </button>

            <button 
              (click)="setFilterRange('1m')" 
              class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer"
              [class.bg-indigo-600]="filterRange() == '1m'"
              [class.text-white]="filterRange() == '1m'"
              >
                1M
            </button>

            <button 
              (click)="setFilterRange('1w')" 
              class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer"
              [class.bg-indigo-600]="filterRange() == '1w'"
              [class.text-white]="filterRange() == '1w'"
              >
                1W
            </button>

            <button 
              (click)="setFilterRange('1d')" 
              class="filter-btn px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white cursor-pointer"
              [class.bg-indigo-600]="filterRange() == '1d'"
              [class.text-white]="filterRange() == '1d'"
              >
                1d
            </button>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-6 pt-8 border-t border-white/5">
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">90 Day High</span>
                  <span class="text-sm font-mono font-bold text-white">$\{{ maxValue() | number:"1.2-2" }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1">90 Day Low</span>
                  <span class="text-sm font-mono font-bold text-white">$\{{ minValue() | number:"1.2-2" }}</span>
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
                  <span class="text-sm font-mono font-bold">$\{{ todayValue() | number:"1.2-2" }}</span>
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
export class PriceChartComponent implements OnInit, OnDestroy {

  private _cardId: string = '';
  @Input() set cardId(value: string | undefined) {
    //console.log('Setter received:', value);
    if (!value) return;
    this._cardId = value;
    this.refreshChart(value);
  }
  get cardId(): string { return this._cardId; }

  @Input() mode: 'watchlist' | 'detail' = 'watchlist';


  title = signal('');
  setCode = signal('');
  labels = signal<string[]>([]);
  dataPoints = signal<number[]>([]);

  filteredLabels = signal<string[]>([]);
  filteredDataPoints = signal<number[]>([]);
  filterRange = signal('');
  // testData = signal<any[]>([]);

  maxValue = signal(0);
  minValue = signal(0);
  todayValue = signal(0);
  lastestDate = signal(new Date().getDate().toString());
  priceDiff = signal("");
  
  priceDiffStyle = signal("plus");
  isloading = signal(false);



  private watchListService = inject(WatchlistService);
  private watchlistSub?: Subscription;
  private firebaseService = inject(FirebaseService)
  

  @ViewChild('priceChart', { static: true }) chartCanvas!: ElementRef;
  private chart?: Chart;

  constructor() {
    effect(() => {
      if (this.chart) {
        const labels = this.filteredLabels();
        const data = this.filteredDataPoints();
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
      }
    });

    effect(() => {
      const user = this.firebaseService.currentUser();
      if (user && this.mode === 'watchlist') {
        this.loadWatchlistAll('all');
      } else if (!user && this.mode === 'watchlist') {
        this.title.set('Total Watchlist Value');
        this.setCode.set('');
        this.maxValue.set(0);
        this.minValue.set(0);
        this.todayValue.set(0);
        this.lastestDate.set(new Date().getDate().toString());
        this.priceDiff.set("");
        this.chart?.clear();
        
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
          borderColor: this.mode == 'detail' ? 'oklch(76.9% 0.184 81.3)' : 'oklch(67.3% 0.182 276.935)',
          backgroundColor: this.mode == 'detail' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
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

      //console.log(cards.length);

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

      this.title.set('Total Watchlist Value');
      this.labels.set(aggregatedDates);
      this.dataPoints.set(aggregatedPrices);
      this.setCode.set('');

      this.maxValue.set(Math.max(...this.dataPoints()));
      this.minValue.set(Math.min(...this.dataPoints()));
      
      const currentPrices = this.dataPoints();
      const currentDate = this.labels();
      this.todayValue.set(currentPrices[currentPrices.length -1]);
      this.lastestDate.set(currentDate[currentDate.length - 1]);

      const todayVal = this.todayValue();
      this.calcDiff(todayVal);
      //console.log('showing ' + this.lastestDate());
      this.setFilterRange('all');
    });
  }

  async refreshChart(id: string) {
    this.isloading.set(true);
    try {
      const res = await this.watchListService.getPriceHistory(id);
      if (res) {
        this.setCardData(res);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      this.isloading.set(false);
    }
  }

  setCardData(res: any){
    const prices = res?.prices.map((p: any) => p.price) || [];
    const dates = res?.prices.map((p: any) => p.date) || [];

    this.title.set(res?.name || 'Price Chart');
    this.setCode.set(res?.setCode);
    this.labels.set(dates);
    this.dataPoints.set(prices);

    if (prices.length > 0) {
      this.maxValue.set(Math.max(...prices));
      this.minValue.set(Math.min(...prices));
      this.todayValue.set(prices[prices.length - 1]);
      this.lastestDate.set(dates[dates.length - 1]);
      this.calcDiff(this.todayValue());
    }

    this.setFilterRange('all');
  }

  calcDiff(currentPrice: number){
    const history = this.dataPoints();
    if (history.length < 2) return;

    const prevPrice = history[history.length - 2];
    const diff = currentPrice - prevPrice;
    const percent = ((diff / prevPrice) * 100).toFixed(2);
    const absDiff = Math.abs(diff).toFixed(2);

    this.priceDiffStyle.set(diff >= 0 ? 'plus' : 'minus');
    this.priceDiff.set(`${diff >= 0 ? '+' : '-'} $${absDiff} (${percent}%)`);
  }

  setFilterRange(range:string){
    
    if(range == 'all'){
      this.setFilterRange('3m');
    } else{
      this.filterRange.set(range);
    }
    
    const allLabels = this.labels();
    const allData = this.dataPoints();
  
    let pointsToSlice = allLabels.length; 
    

    switch (range.toLowerCase()) {
      case '1d': pointsToSlice = 2; break;
      case '1w': pointsToSlice = 7; break;
      case '1m': pointsToSlice = 30; break;
      case '3m': pointsToSlice = allLabels.length; break;
      case 'all': pointsToSlice = allLabels.length; break;
    }

    const slicedLabels = allLabels.slice(-pointsToSlice);
    const slicedData = allData.slice(-pointsToSlice);

    this.filteredLabels.set(slicedLabels);
    this.filteredDataPoints.set(slicedData);
  }

   ngOnInit() {

    this.createChart();
    if (this.mode === 'watchlist') {
      this.watchlistSub = this.watchListService.watchlistItemSelected$.subscribe(id => {
        if (id) this.refreshChart(id);
      });

      const addSub = this.watchListService.cardAdded$.subscribe(() => {
        this.loadWatchlistAll('all');
      });
      this.watchlistSub.add(addSub);

      this.loadWatchlistAll('all');
    }

    this.setFilterRange('3m');
  }

  ngOnDestroy() {
    if (this.watchlistSub) {
      this.watchlistSub.unsubscribe();
    }
    
    if (this.chart) {
      this.chart.destroy();
    }
  }
}