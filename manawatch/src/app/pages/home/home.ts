import { Component } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';
import { ToptenList } from '../../components/topten-list/topten-list';
import { TrendingList } from '../../components/trending-list/trending-list';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header, ToptenList,TrendingList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
