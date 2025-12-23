import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardSearchbar } from './components/card-searchbar/card-searchbar'


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardSearchbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('manawatch');
}
