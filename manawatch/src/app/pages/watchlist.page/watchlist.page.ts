import { Component, computed, effect, inject, signal } from '@angular/core';
import { PriceChartComponent } from '../../components/price-chart/price-chart';
import { WatchlistList } from '../../components/watchlist-list/watchlist-list';
import { FirebaseService } from '../../services/firebase.service';
import { WatchlistService } from '../../services/watchlist.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-watchlist-page',
  imports: [PriceChartComponent, WatchlistList],
  templateUrl: './watchlist.page.html',
  styleUrl: './watchlist.page.css',
})

export class WatchlistPage {
  private watchlistService = inject(WatchlistService);
  private authService = inject(FirebaseService);
  
  selectedCardId = toSignal(this.watchlistService.watchlistItemSelected$, { initialValue: null });
  
  private detailCardData = signal<any>(null);
  isAuth = signal(false);
  isLoading = signal(false);
  chartLoading = signal(false);

  ChartData = computed(() => {
    const id = this.selectedCardId();
    if (id) {
      const data = this.detailCardData();
      return {
        labels: data?.labels || [],
        points: data?.points || [],
        title: data?.title || 'Loading Card...',
        color: 'oklch(76.9% 0.184 81.3)' 
      };
    }

    const pricing = this.watchlistService.watchlistPricingData();
    const totalsByDate = new Map<string, number>();
    // console.log("Pricing data to chart is: " + pricing.toString());

    pricing.forEach(card => {
      (card.prices || []).forEach((p: any) => {
        const current = totalsByDate.get(p.date) || 0;
        totalsByDate.set(p.date, current + (parseFloat(p.price) || 0));
      });
    });

    const sortedDates = Array.from(totalsByDate.keys()).sort();
    return {
      labels: sortedDates,
      points: sortedDates.map(d => totalsByDate.get(d)!),
      title: 'Total Watchlist Value',
      color: 'oklch(67.3% 0.182 276.935)'
    };
  });

  constructor() {
    effect(() => {
      this.isAuth.set(!!this.authService.currentUser());
    });

    effect(async () => {
      const id = this.selectedCardId();
      if (id) {
        this.chartLoading.set(true);
        const res: any = await this.watchlistService.getPriceHistory(id);
        if (res) {
          this.detailCardData.set({
            title: res.name,
            labels: res.prices.map((p: any) => p.date),
            points: res.prices.map((p: any) => parseFloat(p.price) || 0)
          });
        }
        this.chartLoading.set(false);
      } else {
        this.detailCardData.set(null);
      }
    });
  }

  async refreshData() {
    this.watchlistService.updateWatchlistItem(null); 
    await this.watchlistService.refreshWatchlistData(); 
  }

  openAuthModal() {
    this.authService.openLogin();
  }
}