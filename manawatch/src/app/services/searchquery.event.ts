import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchqueryEvent {
  private searchSource = new Subject<string>();
  searchQuery$ = this.searchSource.asObservable();

  private tabChangeSource = new Subject<string>();
  tabChange$ = this.tabChangeSource.asObservable();

  private cardSelectSource = new Subject<string>();
  cardSelect$ = this.cardSelectSource.asObservable();

  publishSearch(query: string) {
    if (query) {
      this.searchSource.next(query);
    }
  }

  selectTab(tabName: string) {
    this.tabChangeSource.next(tabName);
  }

  selectCard(cardId: string){
    //console.log("Selected: " + cardId);
    this.cardSelectSource.next(cardId);
  }

  
}
