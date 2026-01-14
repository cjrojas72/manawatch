import { Component, signal } from '@angular/core';
import { PriceChartComponent } from '../../components/price-chart/price-chart';
import { WatchlistList } from '../../components/watchlist-list/watchlist-list';

@Component({
  selector: 'app-watchlist-page',
  imports: [PriceChartComponent, WatchlistList],
  templateUrl: './watchlist.page.html',
  styleUrl: './watchlist.page.css',
})
export class WatchlistPage {
  selectedCardId = signal<string | ''>('');


  logChange(cardId: string | null) {
    console.log('Selected card ID changed to:', cardId);
  }

}