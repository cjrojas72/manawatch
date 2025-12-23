import { Component } from '@angular/core';
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

@Component({
  selector: 'app-card-searchbar',
  imports: [ReactiveFormsModule],
  templateUrl: './card-searchbar.html',
  styleUrl: './card-searchbar.css',
})
export class CardSearchbar {
  searchControl = new FormControl('');
  results$: Observable<any[]>;

  constructor(private scryfallService: ScryfallService) {
    this.results$ = this.searchControl.valueChanges.pipe(
      debounceTime(400),        // Wait for user to stop typing
      distinctUntilChanged(),   // Only search if the text actually changed
      tap(query => console.log('Starting search for:', query)),
      switchMap(query =>        // Cancel previous pending requests if a new one starts
        this.scryfallService.searchCards(query || '').pipe(
          catchError(() => of([])) // Local error handling for the stream
        )
      ), 
      tap(cards => console.log('Cards received:', cards)) // Log the results
    );
  }
}
