import { Component, OnInit, inject, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthModal } from './auth/auth-modal/auth-modal';
import { WatchlistService } from './services/watchlist.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{


  private router = inject(Router);
  private watchlistService = inject(WatchlistService);

  ngOnInit() {
    this.watchlistService.refreshWatchlistData();
  }
}
