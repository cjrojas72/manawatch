import { effect, inject, Injectable, signal, HostListener, computed } from '@angular/core';
import { collection, getDocs,query, orderBy, limit, doc, setDoc, deleteDoc, where} from "firebase/firestore"; 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from '../../environments/environment.development';
import { getAuth } from "firebase/auth";
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MtgJsonService } from './mtgjson.service';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { HotToastService } from '@ngxpert/hot-toast';


type mockData = {
    name: string;
    id: string;
    dates: string[];
    prices: number[];
}

@Injectable({
  providedIn: 'root',
})

export class WatchlistService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app, "watchlist");
  private auth = getAuth(this.app);
  private firebaseService = inject(FirebaseService);
  private toast = inject(HotToastService);

  private mtgJsonService = new MtgJsonService();

 

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

    console.log(rawData);
    console.log(startDate);
    if (!startDate) return [];

    // Map through cards and filter their internal prices array
    return rawData.map(card => ({
      ...card,
      prices: (card.prices || []).filter((p: any) => {
        const priceDate = new Date(p.date).getTime();
        return priceDate >= startDate;
      })
    }));
  });


  readonly totalWatchlistValue = computed(() => {
    const data = this._watchlistPricingData();
    return data.reduce((acc, card) => {
      // Access the latest price from the provider array
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

  async getWatchlistPriceHistory(sids: any[]): Promise<any>{
      try {
      const response = await this.mtgJsonService.getWatchlistPriceHistory(sids);
      
      if (!response?.cards) return [];

      return response.cards.map((card: any) => {
        return {
          ...card,
          prices: (card.prices || [])
            .filter((p: any) => p.provider.toLowerCase() === 'tcgplayer')
            .sort((a: any, b:any) => 
              new Date(a.date).getTime() - new Date(b.date).getTime())};
      });
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

  // getMockWatchlistPriceHistory(data: any[]): mockData[] {
  //   if (!this.userId()) {
  //     console.error("No userId found");
  //     return [];
  //   }

  //   const mockWatchlistData: mockData[] = [];

  //   data.forEach(card => {
  //     const dateRunner = card.addedAt.toDate();
  //     let currentPrice = card.priceAtTimeOfAdding || 10;
  //     const today = new Date();

  //     //console.log(dateRunner, today);

  //     const cardHistory = {
  //       name: card.name,
  //       id: card.id,
  //       dates: [] as string[],
  //       prices: [] as number[]
  //     };

  //     while (dateRunner <= today) {
  //       // 3. The Random Walk: 
  //       // Multiplies price by a factor between 0.98 (-2%) and 1.03 (+3%)
  //       const fluctuation = 1 + (Math.random() * 0.05 - 0.02);
  //       currentPrice = parseFloat((currentPrice * fluctuation).toFixed(2));

  //       // 4. Store the daily "snapshot"
  //       // Format as YYYY-MM-DD for consistency
  //       cardHistory.dates.push(dateRunner.toISOString().split('T')[0]);
  //       cardHistory.prices.push(currentPrice);

  //       // 5. Increment the day
  //       dateRunner.setDate(dateRunner.getDate() + 1);
  //     }

  //     mockWatchlistData.push(cardHistory);
  //   });

  //   return mockWatchlistData;
  // }


  async getWatchlistCards(): Promise<Array<any>> {
    if (!this.userId()) {
      console.error("No userId found");
      return [];
    }

    const q = query(
      collection(this.db, `users/${this.userId()}/watchlists/default/cards`),
      // orderBy('addedAt', 'desc'), 
      // limit(100)
    );

    try {
      const querySnapshot = await getDocs(q);
      const collectionList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      //console.log("Retrieved watchlist cards:", collectionList);
      return collectionList;
    } catch (error) {
      console.error("Error fetching watchlist cards:", error);
      return [];
    }
  }

  async addCardToWatchlist(card: any) {
    
    if (!this.userId()) {
      this.errorToast('You must be logged in to add a card');
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
        console.log("Card already exists in watchlist!");
        //alert("Card already exists in watchlist!");
        this.errorToast('Card already exists in watchlist!');
        return;
      }

      await setDoc(cardDocRef, {
        ...card,
        addedAt: new Date(),
        priceAtTimeOfAdding: card.foil ? card.prices?.usd_foil : card.prices?.usd,
        provider: "tcgplayer"
      });
      
      await this.refreshWatchlistData();
      this.toast.success('Added to watchlist!');
      return;
     
    } catch (error) {
      console.error("Error adding card to watchlist:", error);
      this.errorToast('Could not add card. Try again.');
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
      //console.log(`Card ${cardId} removed from watchlist.`);
      await this.refreshWatchlistData();
      this.updateWatchlistItem(null);
      this.infoToast('Card removed from watchlist');
    } catch (error) {
      console.error("Error removing card from watchlist:", error);
      this.errorToast('Error removing card');
      return;
    }
  }

  successToast(msg: string){
    this.toast.success( msg, {
        style: {
            background: 'hsl(143, 85%, 96%)',
            borderColor: 'hsl(145, 92%, 87%)',
            color: 'hsl(140, 100%, 27%)',
          },
          iconTheme: {
            primary: 'hsl(140, 100%, 27%)',
            secondary: 'hsl(143, 85%, 96%)',
          },
          icon: '<i class="fa-regular fa-circle-check"></i>'
    })
  }

  infoToast(msg: string){
    this.toast.info( msg, {
       style: {
            background: 'hsl(208, 100%, 97%)',
            borderColor: 'hsl(221, 91%, 93%)',
            color: 'hsl(210, 92%, 45%)',
          },
          iconTheme: {
            primary: 'hsl(210, 92%, 45%)',
            secondary: 'hsl(208, 100%, 97%)',
          },
          icon: '<i class="fa-solid fa-circle-info"></i>',
    })
  }

  errorToast(msg: string){
    this.toast.error( msg, {
        style: {
            background: 'hsl(359, 100%, 97%)',
            borderColor: 'hsl(359, 100%, 94%)',
            color: 'hsl(360, 100%, 45%)',
          },
          iconTheme: {
            primary: 'hsl(360, 100%, 45%)',
            secondary: 'hsl(359, 100%, 97%)',
          },
          icon: '<i class="fa-solid fa-circle-info"></i>',
    })
  }
  
}
