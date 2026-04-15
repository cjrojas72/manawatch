import { Component, inject, OnInit, signal } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { SearchqueryEvent } from '../../services/searchquery.event';

@Component({
  selector: 'app-topten-list',
  imports: [],
  templateUrl: './topten-list.html',
  styleUrl: './topten-list.css',
})
export class ToptenList implements OnInit {
  marketHighs = signal<any[]>([]);
  private scryfallService = inject(ScryfallService);
  private cardSelectService = inject(SearchqueryEvent);

  loadMarketData() {
    this.scryfallService.getTop10Cards().subscribe(res => {
      this.marketHighs.set(res);
    });
  }

  onCardSelect(cardId: string){
    this.cardSelectService.selectCard(cardId);
  }

  ngOnInit(): void {
    this.loadMarketData();
  }
}
