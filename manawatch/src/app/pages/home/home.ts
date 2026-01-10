import { Component } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';
import { ToptenList } from '../../components/topten-list/topten-list';
import { TrendingList } from '../../components/trending-list/trending-list';
import { SearchResults } from '../../components/search-results/search-results';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header, ToptenList,TrendingList, SearchResults],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
