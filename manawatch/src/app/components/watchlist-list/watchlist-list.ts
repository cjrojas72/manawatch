import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { WatchlistService } from '../../services/watchlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-watchlist-list',
  imports: [],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistList implements OnInit, OnDestroy {

   private watchlistService = inject(WatchlistService);
   private subscription!: Subscription;

   watchlist = signal<any[]>([
     { id: '1', name: 'Sheoldred, the Apocalypse', set_name: 'DMU', price: '94.50', change: '+$12.40 (15%)', image: '' },
    { id: '2', name: 'Mox Amber', set_name: 'DOM', price: '48.20', change: '+$8.15 (20%)', image: '' },
    { id: '3', name: 'The One Ring', set_name: 'LTR', price: '102.00', change: '+$5.50 (5%)', image: '' },
    { id: '4', name: 'Orcish Bowmasters', set_name: 'LTR', price: '42.10', change: '+$4.20 (11%)', image: '' },
    { id: '5', name: 'Ancient Tomb', set_name: 'TMP', price: '89.00', change: '+$3.90 (4%)', image: '' },
    { id: '6', name: 'Esper Sentinel', set_name: 'MH2', price: '34.90', change: '+$3.10 (9%)', image: '' },
    { id: '7', name: 'Ragavan, Nimble Pilferer', set_name: 'MH2', price: '44.50', change: '+$2.80 (6%)', image: '' },
    { id: '8', name: 'Dockside Extortionist', set_name: 'C19', price: '98.00', change: '+$2.50 (3%)', image: '' }
   ]);

   async getWatchlist() {
    const cards = await this.watchlistService.getWatchlistCards();
    this.watchlist.set(cards);
   }

   async removeCard(cardId: string) {
    await this.watchlistService.removeCardFromWatchlist(cardId);
    this.getWatchlist();
   }

   ngOnInit(): void {
    this.getWatchlist();

    this.subscription = this.watchlistService.cardAdded$.subscribe(() => {
      this.getWatchlist();
    });
   }

   ngOnDestroy(): void {
     if (this.subscription) {
       this.subscription.unsubscribe();
     }
   }
}
