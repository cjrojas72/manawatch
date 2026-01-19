import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { PriceChartComponent } from '../../components/price-chart/price-chart';
import { KeyValuePipe } from '@angular/common';
import { tap, switchMap } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { WatchlistService } from '../../services/watchlist.service';

@Component({
  selector: 'app-card-detail-page',
  imports: [PriceChartComponent, KeyValuePipe],
  templateUrl: './card-detail.page.html',
  styleUrl: './card-detail.page.css',
})
export class CardDetailPage implements OnInit {

  private searchQueryEvent = inject(SearchqueryEvent);
  private scryFallService = inject(ScryfallService);
  private watchlistService = inject(WatchlistService);

  selectedTf = signal('1M');
  cardDetails = signal<any>([]);
  isLoading = signal(false);
  printings = signal<any>([]);

  sales = [
    { id: 1, condition: 'Near Mint', date: 'JAN 16', platform: 'TCGPLAYER', price: 14250.00 },
    { id: 2, condition: 'Lightly Played', date: 'JAN 15', platform: 'EBAY', price: 11900.50 },
    { id: 3, condition: 'Near Mint', date: 'JAN 13', platform: 'CARDMARKET', price: 15100.00 },
    { id: 4, condition: 'Moderately Played', date: 'JAN 09', platform: 'HERITAGE', price: 9200.00 },
  ];
   

  private _cardId?: string;
  @Input() set cardId(value: string | undefined) {
    this._cardId = value;
    if (value) {
      this.fetchCardData(value);
    }
  }
  get cardId() { return this._cardId; }

  fetchCardData(id: string) {
    this.isLoading.set(true);

    this.scryFallService.getCardById(id).pipe(
      tap(card => this.cardDetails.set(card)),
      switchMap(card => this.scryFallService.fetchPrintings(card.oracle_id))
    ).subscribe({
        next: (printings) => {
          this.printings.set(printings);
          //console.log("Printings updated:", this.printings());
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Error fetching card data:", err);
          this.isLoading.set(false);
        }
    });
  }

  addCardToWatchlist(card: any){
    this.watchlistService.addCardToWatchlist(card);
    this.watchlistService.emitCardAdded();
  }

  selectCard(id: string){
    this.searchQueryEvent.selectCard(id);
  }

  ngOnInit(): void {

    if(this.cardId){
      this.fetchCardData(this.cardId);
    }
  }
  
}
