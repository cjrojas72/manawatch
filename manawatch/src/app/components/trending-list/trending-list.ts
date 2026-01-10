import { Component, inject, OnInit, signal } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';


@Component({
  selector: 'app-trending-list',
  imports: [],
  templateUrl: './trending-list.html',
  styleUrl: './trending-list.css',
})
export class TrendingList implements OnInit {
  marketTrending = signal<any[]>([]);
  private scryfallService = inject(ScryfallService);

  loadMarketData(){
    // this.scryfallService.getTop10Cards().subscribe(res =>{
    //   //console.log(res);
    //   this.marketTrending.set(res);
    // })

    this.scryfallService.getTrendingCards().then(res =>{
      console.log(res);
      this.marketTrending.set(res);
    });

    
  }

  ngOnInit(): void {
    this.loadMarketData();
  }

}
