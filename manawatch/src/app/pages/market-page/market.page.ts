import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SearchResults } from '../../components/search-results/search-results';
import { ToptenList } from '../../components/topten-list/topten-list';
import { TrendingList } from '../../components/trending-list/trending-list';
import { CardDetailPage } from '../card-detail/card-detail.page';
import { Subscription } from 'rxjs';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { NewsComponent } from '../../components/news-component/news-component';

@Component({
  selector: 'app-market-page',
  imports: [SearchResults, ToptenList, TrendingList, CardDetailPage, NewsComponent],
  templateUrl: './market.page.html',
  styleUrl: './market.page.css',
})
export class MarketPage implements OnInit, OnDestroy {

  private cardSelectSub?: Subscription;
  private  cardSelectEvent = inject(SearchqueryEvent);

  pageMode = signal("dash");
  cardId = signal('');

  onBackBtnSelect(){
    this.pageMode.set("dash");
  }

  ngOnInit(): void {
    this.cardSelectSub = this.cardSelectEvent.cardSelect$.subscribe(card =>{
      this.cardId.set(card);
      this.pageMode.set("details");
    });
  }

  ngOnDestroy() {
    if (this.cardSelectSub) {
      this.cardSelectSub.unsubscribe();
    }
  }
}
