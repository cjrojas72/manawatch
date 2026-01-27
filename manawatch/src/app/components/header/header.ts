import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { SearchqueryEvent } from '../../services/searchquery.event';
import { DecimalPipe } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthModal } from '../../auth/auth-modal/auth-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [DecimalPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  
  private tabEvent = inject(SearchqueryEvent);
  public authService = inject(FirebaseService);
  private watchlistService = inject(WatchlistService);

  watchlistValue = this.watchlistService.totalWatchlistValue;
  user = computed(() => {
    const user = this.authService.currentUser();

    if(!user) return "";
    
    return user.displayName || user.email || 'user' + user.uid;
  });

  handleLogout(){
    this.authService.signOut();
  }

  handleLogin(){
    this.authService.openLogin();
  }

  selectTab(tabName: string) {
    this.tabEvent.selectTab(tabName);
  }

}
