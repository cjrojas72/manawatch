import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-search-results',
  imports: [],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit, OnDestroy {
  searchResults = signal<any[]>([]);
  scryFallService = inject(ScryfallService);
  watchlistService = inject(WatchlistService);
  showResults = signal(false);

  private searchSub?: Subscription;
  private searchEvent = inject(SearchqueryEvent); 

  executeSearch(queryStr: string) {
    if (!queryStr){
      // this.clearResults();
      return;
    }
    this.scryFallService.searchCards(queryStr).subscribe(cards => {
      this.searchResults.set(cards);
      console.log(cards);
    });

    this.showResults.set(true);
  }

  clearResults() {
    this.searchResults.set([]);
    this.showResults.set(false);
  }

  async addCardToWatchlist(card: any) {
    // Placeholder for adding card to watchlist functionality
    console.log('Adding card to watchlist:', card);
    await this.watchlistService.addCardToWatchlist(card);
    this.watchlistService.emitCardAdded();
  }

  ngOnInit(): void {
    this.searchSub = this.searchEvent.searchQuery$.subscribe(query => {
      this.executeSearch(query);
    });
  }

  ngOnDestroy(): void {

    if (this.searchSub) { 
      this.searchSub?.unsubscribe();
    }
  }
}