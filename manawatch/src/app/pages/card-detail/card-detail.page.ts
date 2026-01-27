import { Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
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
export class CardDetailPage implements OnInit, OnDestroy {

  private searchQueryEvent = inject(SearchqueryEvent);
  private scryFallService = inject(ScryfallService);
  private watchlistService = inject(WatchlistService);

  selectedTf = signal('1M');
  cardDetails = signal<any>([]);
  isLoading = signal(false);
  chartLoading = signal(false);
  printings = signal<any>([]);
  disableBtn = signal(false);
  

  chartData = signal<any>({ labels: [], points: [], title: '', color: 'oklch(76.9% 0.184 81.3)' });

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
      this.checkWatchlistStatus();
      this.fetchPriceHistory(value);
    }
  }
  get cardId() { return this._cardId; }


  async fetchPriceHistory(id: string) {
    this.chartLoading.set(true);
    try {
      const res: any = await this.watchlistService.getPriceHistory(id);
      if (res && res.prices) {
        this.chartData.set({
          title: res.name || 'Price History',
          labels: res.prices.map((p: any) => p.date),
          points: res.prices.map((p: any) => parseFloat(p.price) || 0),
          color: 'oklch(76.9% 0.184 81.3)' // Detail Orange
        });
      }
    } catch (err) {
      console.error("Error fetching price history:", err);
    } finally {
      this.chartLoading.set(false);
    }
  }

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

  async checkWatchlistStatus() {
    const cards = await this.watchlistService.getWatchlistCards();
    const exists = cards.some(c => c.id === this.cardId);
    this.disableBtn.set(exists);
  }

  async addCardToWatchlist(card: any){
    await this.watchlistService.addCardToWatchlist(card);
    this.checkWatchlistStatus();
  }

  selectCard(id: string){
    this.searchQueryEvent.selectCard(id);
  }

  ngOnInit(): void {

    if(this.cardId){
      this.fetchCardData(this.cardId);
      this.fetchPriceHistory(this.cardId);
      this.checkWatchlistStatus();
      this.watchlistService.cardAdded$.subscribe(() => {
        this.checkWatchlistStatus();
      });
    }
  }

  ngOnDestroy(): void {
    
  }


  
}
