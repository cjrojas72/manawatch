import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';
import { ToptenList } from '../../components/topten-list/topten-list';
import { TrendingList } from '../../components/trending-list/trending-list';
import { SearchResults } from '../../components/search-results/search-results';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { WatchlistList } from '../../components/watchlist-list/watchlist-list';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header, ToptenList,TrendingList, SearchResults, WatchlistList],
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