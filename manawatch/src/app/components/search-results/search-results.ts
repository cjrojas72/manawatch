import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScryfallService } from '../../services/scryfall';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-search-results',
  imports: [],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit {
  private scryFallService = inject(ScryfallService);
  private watchlistService = inject(WatchlistService);
  private searchEvent = inject(SearchqueryEvent);
  private destroyRef = inject(DestroyRef);

  searchResults = signal<any[]>([]);
  showResults = signal(false);
  isLoading = signal(false);

  executeSearch(queryStr: string) {
    if (!queryStr) {
      return;
    }
    this.isLoading.set(true);
    this.scryFallService.searchCards(queryStr)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(cards => {
        this.searchResults.set(cards);
        this.isLoading.set(false);
      });

    this.showResults.set(true);
  }

  selectCardDetails(cardId: string) {
    this.searchEvent.selectCard(cardId);
    this.showResults.set(false);
  }

  clearResults() {
    this.searchResults.set([]);
    this.showResults.set(false);
  }

  async addCardToWatchlist(card: any) {
    await this.watchlistService.addCardToWatchlist(card);
    this.watchlistService.emitCardAdded();
  }

  ngOnInit(): void {
    this.searchEvent.searchQuery$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.executeSearch(query));
  }
}
