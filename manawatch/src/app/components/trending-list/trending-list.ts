import { Component, inject, OnInit, signal } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';
import { SearchqueryEvent } from '../../services/searchquery.event';


@Component({
  selector: 'app-trending-list',
  imports: [],
  templateUrl: './trending-list.html',
  styleUrl: './trending-list.css',
})
export class TrendingList implements OnInit {
  marketTrending = signal<any[]>([]);
  private scryfallService = inject(ScryfallService);
  private cardSelectService = inject(SearchqueryEvent);

  loadMarketData(){
    this.scryfallService.getTrendingCards().then(res =>{
      console.log(res);
      this.marketTrending.set(res);
    });

    
  }

  onCardSelect(cardId: string){
    this.cardSelectService.selectCard(cardId);
  }

  ngOnInit(): void {
    this.loadMarketData();
  }

}
