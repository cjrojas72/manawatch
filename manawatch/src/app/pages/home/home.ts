import { Component } from '@angular/core';
import { CardSearchbar } from '../../components/card-searchbar/card-searchbar';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-home',
  imports: [CardSearchbar, Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
