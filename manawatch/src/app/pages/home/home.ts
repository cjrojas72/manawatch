import { Component } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';
import { ToptenList } from '../../components/topten-list/topten-list';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header, ToptenList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
