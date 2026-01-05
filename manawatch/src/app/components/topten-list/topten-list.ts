import { Component, inject, OnInit, signal } from '@angular/core';
import { ScryfallService } from '../../services/scryfall';

@Component({
  selector: 'app-topten-list',
  imports: [],
  templateUrl: './topten-list.html',
  styleUrl: './topten-list.css',
})
export class ToptenList implements OnInit {
  marketHighs = signal<any[]>([]);
  private scryfallService = inject(ScryfallService);

  loadMarketData(){
    this.scryfallService.getTop10Cards().subscribe(res =>{
      console.log(res);
      this.marketHighs.set(res);
    })
  }

  ngOnInit(): void {
    this.loadMarketData();
  }
}
