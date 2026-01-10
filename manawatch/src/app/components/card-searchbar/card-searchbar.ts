import { Component, ElementRef, HostListener, inject, OnInit, signal, ViewChild, viewChild } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { FormControl } from '@angular/forms';
import { 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  catchError,
  tap 
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'
import { SearchqueryEvent } from '../../services/searchquery.event';

@Component({
  selector: 'app-card-searchbar',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './card-searchbar.html',
  styleUrl: './card-searchbar.css',
})
export class CardSearchbar implements OnInit {
  searchControl = new FormControl('');
  results$: Observable<any[]> | undefined;
  suggestions$: Observable<any[]> | undefined;
  isLoading = signal(false);
  suggestions = signal<string[]>([]);
  hasExecutedSearch = false;
  showSuggestions = signal(false);

  private scryFallService = inject(ScryfallService);
  private searchqueryEvent = inject(SearchqueryEvent);


  @ViewChild('searchContainer', { static: true }) searchContainer!: ElementRef;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target as Node)) {
      this.showSuggestions.set(false);
    }
  }

  constructor(private scryfallService: ScryfallService) {
    this.suggestions$ = this.searchControl.valueChanges.pipe(
      tap(val => {
        this.showSuggestions.set(true);
      }),
      debounceTime(200), // Fast response for typing
      distinctUntilChanged(),
      tap(query => console.log('Searching for things that have: ', query)),
      switchMap(query => this.scryfallService.getAutocomplete(query || '').pipe(
           catchError(() => of([])) // Local error handling for the stream
      )),
      tap(suggestions => console.log(suggestions))
    );

    this.suggestions$.subscribe();
  }

  onSelectionChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedName = input.value;

  if (selectedName) {
    // We call our executeSearch function to update the results$ stream
    this.executeSearch(selectedName);
  }
}

  async executeSearch(query: string) {
    console.log(query);
    this.hasExecutedSearch = true;
    this.isLoading.set(true);

    await this.searchqueryEvent.publishSearch(query);
    this.isLoading.set(false);
    this.showSuggestions.set(false);
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.hasExecutedSearch = false;
        this.isLoading.set(true);
      }),
      switchMap(query => this.scryFallService.getAutocomplete(String(query)))
    ).subscribe(res => {
      this.suggestions.set(res);
      this.isLoading.set(false)
    });
  }

  ngOnInit(): void {
    this.setupSearch();
  }
}


