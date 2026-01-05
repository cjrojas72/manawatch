import { Component, inject, OnInit, signal } from '@angular/core';
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

  private scryFallService = inject(ScryfallService);

  constructor(private scryfallService: ScryfallService) {
    this.suggestions$ = this.searchControl.valueChanges.pipe(
      tap(val => console.log(val)),
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

  executeSearch(query: string) {

    console.log(query);
    // this.results$ = this.scryfallService.searchCards(query).pipe(
    //   catchError(() => of([]))
    // );
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


