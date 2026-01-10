import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';

@Component({
  selector: 'app-search-results',
  imports: [],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit, OnDestroy {
  searchResults = signal<any[]>([]);
  scryFallService = inject(ScryfallService);

  private searchSub?: Subscription;
  private searchEvent = inject(SearchqueryEvent); 

  executeSearch(queryStr: string) {
    if (!queryStr){
      this.clearResults();
      return;
    }
    this.scryFallService.searchCards(queryStr).subscribe(cards => {
      this.searchResults.set(cards);
    });
  }

  clearResults() {
    this.searchResults.set([]);
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