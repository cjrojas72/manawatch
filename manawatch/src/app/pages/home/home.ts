import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { WatchlistPage } from '../watchlist.page/watchlist.page';
import { MarketPage } from '../market-page/market.page';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header, MarketPage, WatchlistPage],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  activeTab = signal<string>('portfolio');

  private tabSelectSub?: Subscription;
  private tabEvent = inject(SearchqueryEvent); 

  selectTab(tabName: string) {
    this.tabEvent.selectTab(tabName);
  }

  ngOnInit() {
    this.tabSelectSub = this.tabEvent.tabChange$.subscribe(targetTab => {
      this.activeTab.set(targetTab);
    });

    this.selectTab('portfolio');
  }

  ngOnDestroy() {
    if (this.tabSelectSub) {
      this.tabSelectSub.unsubscribe();
    }
  }

}