import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap
} from 'rxjs/operators';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-card-searchbar',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './card-searchbar.html',
  styleUrl: './card-searchbar.css',
})
export class CardSearchbar {

  searchControl = new FormControl('');
  searchQuery = signal('');
  isLoading = signal(false);
  showSuggestions = signal(false);
  hasExecutedSearch = false;

  private scryFallService = inject(ScryfallService);
  private searchqueryEvent = inject(SearchqueryEvent);


  @ViewChild('searchContainer', { static: true }) searchContainer!: ElementRef;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target as Node)) {
      this.showSuggestions.set(false);
    }
  }

  suggestions = toSignal(
    this.searchControl.valueChanges.pipe(
      tap(val => {
        this.searchQuery.set(val || '');
        this.showSuggestions.set(true);
        this.isLoading.set(true);
      }),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query =>
        this.scryFallService.getAutocomplete(query || '').pipe(
          tap(() => this.isLoading.set(false)),
          catchError(() => {
            this.isLoading.set(false);
            return of([]);
          })
        )
      )
    ),
    { initialValue: [] as string[] }
  );

  onSelectionChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedName = input.value;

    if (selectedName) {
      this.executeSearch(selectedName);
    }
  }

  async executeSearch(query: string) {
    this.searchQuery.set(query ? query : this.searchQuery());

    const finalQuery = this.searchQuery().toLowerCase().trim();
    if (!finalQuery) return;

    this.hasExecutedSearch = true;
    this.isLoading.set(true);
    this.searchControl.setValue(finalQuery, { emitEvent: false });

    await this.searchqueryEvent.publishSearch(finalQuery);

    this.isLoading.set(false);
    this.showSuggestions.set(false);
    this.searchqueryEvent.selectTab('market');
  }
}
