import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchqueryEvent {
  private searchSource = new Subject<string>();

  searchQuery$ = this.searchSource.asObservable();

  publishSearch(query: string) {
    if (query) {
      this.searchSource.next(query);
    }
  }
}
