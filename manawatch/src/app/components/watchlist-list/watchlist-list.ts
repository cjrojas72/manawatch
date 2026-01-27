import { Component, inject, OnDestroy, OnInit, signal, computed, model, effect } from '@angular/core';
import { WatchlistService } from '../../services/watchlist.service';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-watchlist-list',
  imports: [],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistList {

  private watchlistService = inject(WatchlistService);
  // private subscription!: Subscription;
  
  // private firebaseService = inject(FirebaseService);
  private searchQueryEvent = inject(SearchqueryEvent);

  selectedCardId = model<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(5);
  isLoading = signal(false);


  watchlist = this.watchlistService.watchlistCards;

  // constructor() {
  //   effect(() => {
  //     const user = this.firebaseService.currentUser();
  //     if (user) {
  //       this.getWatchlist();
  //     } else {
  //       this.watchlist.set([]);
  //     }
  //   });
  // }

  paginatedWatchlist = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.watchlist().slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.watchlist().length / this.pageSize()));

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  prevPage(){
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  selectItem(cardId: string | null) {
    this.selectedCardId.set(cardId);
    this.watchlistService.updateWatchlistItem(cardId);
  }

  navigateToCardDetails(cardId: string){
    this.searchQueryEvent.selectCard(cardId);
    this.searchQueryEvent.selectTab("market");
  }


  // getWatchlist() {
  //   this.isLoading.set(true);
  //   this.watchlistService.getWatchlistCards()
  //     .then(cards => {
  //       this.watchlist.set(cards);
  //       this.isLoading.set(false);
  //     })
  //     .catch(() => this.isLoading.set(false));
  // }

  handleShowAll(){
    this.watchlistService.updateWatchlistItem(null);
  }

  async removeCard(cardId: string) {
    if (this.selectedCardId() === cardId) {
      this.selectedCardId.set(null);
    }
    await this.watchlistService.removeCardFromWatchlist(cardId);

    if (this.paginatedWatchlist().length === 0 && this.currentPage() > 1) {
      this.prevPage();
    }
  }

  // ngOnInit(): void {
  //   this.subscription = this.watchlistService.cardAdded$.subscribe(() => {
  //     this.getWatchlist();
  //   });
  // }

  // ngOnDestroy(): void {
  //    if (this.subscription) {
  //      this.subscription.unsubscribe();
  //    }
  // }
}
