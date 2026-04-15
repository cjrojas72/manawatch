import { effect, inject, Injectable, signal, computed } from '@angular/core';
import { collection, getDocs, query, doc, setDoc, deleteDoc, where } from "firebase/firestore";
import { BehaviorSubject, Subject } from 'rxjs';
import { MtgJsonService } from './mtgjson.service';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root',
})

export class WatchlistService {
  private firebaseService = inject(FirebaseService);
  private mtgJsonService = inject(MtgJsonService);
  private notify = inject(NotificationService);

  private db = this.firebaseService.db;

  private cardAddedSource = new Subject<void>();
  private watchlistItemSelected = new BehaviorSubject<string | null>(null);
  

  cardAdded$ = this.cardAddedSource.asObservable();
  watchlistItemSelected$ = this.watchlistItemSelected.asObservable();
  
  
  private _watchlistCards = signal<any[]>([]);
  private _watchlistPricingData = signal<any[]>([]);
  private userId = computed(() => this.firebaseService.currentUser()?.uid || null);

  readonly watchlistCards = this._watchlistCards.asReadonly();
  readonly watchlistPricingData = computed(() => {
    const rawData = this._watchlistPricingData();
    const startDate = this.earliestAddDate();

    if (!startDate || rawData.length === 0) return [];
      const latestPriceStr = rawData[0]?.prices?.[rawData[0].prices.length - 1]?.date;
      const latestPriceDate = latestPriceStr ? new Date(latestPriceStr).getTime() : 0;
      const isNewUserGap = latestPriceDate < startDate;
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const oneDayBuffer = startDate - 86400000;

    return rawData.map(card => {
      const allPrices = card.prices || [];
      
      const filteredPrices = allPrices.filter((p: any) => {
        const priceDate = new Date(p.date).getTime();

        if (isNewUserGap) {
          return priceDate >= thirtyDaysAgo;
        } else {
          return priceDate >= oneDayBuffer;
        }
      });

      return {
        ...card,
        prices: filteredPrices
      };
    });
  });


  readonly totalWatchlistValue = computed(() => {
    const data = this._watchlistPricingData();
    return data.reduce((acc, card) => {
      const prices = card.prices || [];
      const latestPrice = prices.length > 0 ? parseFloat(prices[prices.length - 1].price) : 0;
      return acc + latestPrice;
    }, 0);
  });
  
  constructor() {
    effect(() => {
    if (this.userId()) {
      this.refreshWatchlistData();
    } else {
      this._watchlistCards.set([]);
      this._watchlistPricingData.set([]);
    }
  });
  }

  
  async refreshWatchlistData() {
    const cards = await this.getWatchlistCards();
    this._watchlistCards.set(cards);

    if (cards.length > 0) {
      const sids = cards.map(c => c.id);
      await this.loadWatchlistPricing(sids);
    } else {
      this._watchlistPricingData.set([]);
    }
  }

  private earliestAddDate = computed(() => {
    const cards = this._watchlistCards();
    if (cards.length === 0) return null;

    const timestamps = cards.map(c => {
      let d: Date;
      if (c.addedAt?.seconds) {
        d = new Date(c.addedAt.seconds * 1000);
      } else {
        d = new Date(c.addedAt);
      }
      
      d.setHours(0, 0, 0, 0); 
      return d.getTime();
    }).filter(t => !isNaN(t));

    return timestamps.length ? Math.min(...timestamps) : null;
  });

  setWatchlistCards(data: any[]) {
    this._watchlistCards.set(data);
  }

  emitCardAdded() {
    this.cardAddedSource.next();
  }

  getCurrentWatchlistItem() {
    return this.watchlistItemSelected.getValue();
  }

  updateWatchlistItem(newParams: any) {
    this.watchlistItemSelected.next(newParams);
  }

  async getPriceHistory(sId: string): Promise<any[]> {
    const response = await this.mtgJsonService.getCardPriceHistory(sId);
    const filteredCards = response?.cards?.map((card: any) => {
      return {
        ...card,
        prices: (card.prices || [])
          .filter((p: any) => 
            p.provider.toLowerCase() === 'tcgplayer'
          )
          .sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      };
    }) || [];

    return filteredCards[0];
  }

  async getWatchlistPriceHistory(sids: any[]): Promise<any> {
    try {
      const response = await this.mtgJsonService.getWatchlistPriceHistory(sids);

      if (!response?.cards) return [];

      return response.cards.map((card: any) => ({
        ...card,
        prices: (card.prices || [])
          .filter((p: any) => p.provider.toLowerCase() === 'tcgplayer')
          .sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime())
      }));
    } catch (error) {
      console.error('Error fetching bulk watchlist prices:', error);
      return [];
    }
  }

  async loadWatchlistPricing(sids: any[]): Promise<any> {
    try {
      const freshData = await this.getWatchlistPriceHistory(sids);
      this._watchlistPricingData.set(freshData);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  }

  async getWatchlistCards(): Promise<Array<any>> {
    if (!this.userId()) {
      console.error("No userId found");
      return [];
    }

    const q = query(
      collection(this.db, `users/${this.userId()}/watchlists/default/cards`)
    );

    try {
      const querySnapshot = await getDocs(q);
      const collectionList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return collectionList;
    } catch (error) {
      console.error("Error fetching watchlist cards:", error);
      return [];
    }
  }

  async addCardToWatchlist(card: any) {
    
    if (!this.userId()) {
      this.notify.error('You must be logged in to add a card');
      console.error("No userId provided");
      return;
    }

    const cardDocRef = doc(
      this.db, 
      `users/${this.userId()}/watchlists/default/cards/${card.id}`
    );

    const checkDocRef = query(
      collection(this.db, `users/${this.userId()}/watchlists/default/cards`),
      where("id", "==", card.id),
    );

    try {
      const checkDocSnap = await getDocs(checkDocRef);
      if (!checkDocSnap.empty) {
        this.notify.error('Card already exists in watchlist!');
        return;
      }

      await setDoc(cardDocRef, {
        ...card,
        addedAt: new Date(),
        priceAtTimeOfAdding: card.foil ? card.prices?.usd_foil : card.prices?.usd,
        provider: "tcgplayer"
      });
      
      await this.refreshWatchlistData();
      this.notify.success('Added to watchlist!');
      return;
     
    } catch (error) {
      console.error("Error adding card to watchlist:", error);
      this.notify.error('Could not add card. Try again.');
      return;
    }
  }

  async removeCardFromWatchlist(cardId: string) {
    if (!this.userId()) {
      console.error("No userId provided");
      return;
    } 

    const cardDocRef = doc(
      this.db,
      `users/${this.userId()}/watchlists/default/cards/${cardId}`
    );

    try {
      await deleteDoc(cardDocRef);
      await this.refreshWatchlistData();
      this.updateWatchlistItem(null);
      this.notify.info('Card removed from watchlist');
    } catch (error) {
      console.error("Error removing card from watchlist:", error);
      this.notify.error('Error removing card');
      return;
    }
  }

}
