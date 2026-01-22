import { Component, effect, inject, signal } from '@angular/core';
import { PriceChartComponent } from '../../components/price-chart/price-chart';
import { WatchlistList } from '../../components/watchlist-list/watchlist-list';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-watchlist-page',
  imports: [PriceChartComponent, WatchlistList],
  templateUrl: './watchlist.page.html',
  styleUrl: './watchlist.page.css',
})
export class WatchlistPage {
  
  isAuth = signal(false);
  selectedCardId = signal<string | ''>('');
  private authService = inject(FirebaseService);




  constructor(){
     effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.isAuth.set(true);
      } else {
        this.isAuth.set(false);
      }
    });
  }

  logChange(cardId: string | null) {
    console.log('Selected card ID changed to:', cardId);
  }

  openAuthModal(){
    this.authService.openLogin();
  }

}