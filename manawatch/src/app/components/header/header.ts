import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { DecimalPipe } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthModal } from '../../auth/auth-modal/auth-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [DecimalPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {

  
  private tabEvent = inject(SearchqueryEvent);
  public authService = inject(FirebaseService);
  private watchlistService = inject(WatchlistService);

  private subscription!: Subscription;

  watchlistValue = signal(0.00);
  user = signal<any>("");

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        const identifier = currentUser.displayName || currentUser.email || 'user' + currentUser.uid;
        this.user.set(identifier);
        this.getWatchListValue();
      } else {
        this.user.set("");
        this.watchlistValue.set(0);
      }
    });
  }

  handleLogout(){
    this.authService.signOut();
  }

  handleLogin(){
    this.authService.openLogin();
  }

  selectTab(tabName: string) {
    this.tabEvent.selectTab(tabName);
  }

  getWatchListValue(){
    this.watchlistService.getWatchlistCards().then(cards => {
      const total = cards.reduce((acc, card) => {
        const price = parseFloat(card.priceAtTimeOfAdding) || 0;
        return acc + price;
      }, 0);
      this.watchlistValue.set(total);
    });
  } 

  ngOnInit(): void {
    this.subscription = this.watchlistService.cardAdded$.subscribe(() => {
      this.getWatchListValue();
    });
  }

}
