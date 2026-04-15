import { Component, inject, signal, computed, model } from '@angular/core';
import { WatchlistService } from '../../services/watchlist.service';
import { SearchqueryEvent } from '../../services/searchquery.event';

@Component({
  selector: 'app-watchlist-list',
  imports: [],
  templateUrl: './watchlist-list.html',
  styleUrl: './watchlist-list.css',
})
export class WatchlistList {

  private watchlistService = inject(WatchlistService);
  private searchQueryEvent = inject(SearchqueryEvent);

  selectedCardId = model<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(5);
  isLoading = signal(false);

  watchlist = this.watchlistService.watchlistCards;

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

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  selectItem(cardId: string | null) {
    this.selectedCardId.set(cardId);
    this.watchlistService.updateWatchlistItem(cardId);
  }

  navigateToCardDetails(cardId: string) {
    this.searchQueryEvent.selectCard(cardId);
    this.searchQueryEvent.selectTab("market");
  }

  handleShowAll() {
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
}
