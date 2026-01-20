import { effect, inject, Injectable, signal, Signal } from '@angular/core';
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
 // Initialize Cloud Firestore and get a reference to the service
  private db = getFirestore(this.app, "watchlist");
  private auth = getAuth(this.app);
  private firebaseService = inject(FirebaseService);
  private toast = inject(HotToastService);

  private mtgJsonService = new MtgJsonService();

  private userId = signal<string | null>(null);

  private cardAddedSource = new Subject<void>();
  private watchlistItemSelected = new BehaviorSubject<string | null>(null);
  

  cardAdded$ = this.cardAddedSource.asObservable();
  watchlistItemSelected$ = this.watchlistItemSelected.asObservable();

  
  constructor() {
    effect(() => {
      const user = this.firebaseService.currentUser();
      this.userId.set(user ? user.uid : null);
      
      if (user) {
        console.log("WatchlistService: User switched to", user.uid);
      }
    });
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

  async getPriceHistory(sId: string): Promise<any> {
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

  getMockWatchlistPriceHistory(data: any[]): mockData[] {
    if (!this.userId()) {
      console.error("No userId found");
      return [];
    }

    const mockWatchlistData: mockData[] = [];

    data.forEach(card => {
      const dateRunner = card.addedAt.toDate();
      let currentPrice = card.priceAtTimeOfAdding || 10;
      const today = new Date();

      //console.log(dateRunner, today);

      const cardHistory = {
        name: card.name,
        id: card.id,
        dates: [] as string[],
        prices: [] as number[]
      };

      while (dateRunner <= today) {
        // 3. The Random Walk: 
        // Multiplies price by a factor between 0.98 (-2%) and 1.03 (+3%)
        const fluctuation = 1 + (Math.random() * 0.05 - 0.02);
        currentPrice = parseFloat((currentPrice * fluctuation).toFixed(2));

        // 4. Store the daily "snapshot"
        // Format as YYYY-MM-DD for consistency
        cardHistory.dates.push(dateRunner.toISOString().split('T')[0]);
        cardHistory.prices.push(currentPrice);

        // 5. Increment the day
        dateRunner.setDate(dateRunner.getDate() + 1);
      }

      mockWatchlistData.push(cardHistory);
    });

    return mockWatchlistData;
  }


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
        alert("Card already exists in watchlist!");
        this.errorToast('Card already exists in watchlist!');
        return;
      }

      await setDoc(cardDocRef, {
        ...card,
        addedAt: new Date(),
        priceAtTimeOfAdding: card.foil ? card.prices?.usd_foil : card.prices?.usd,
        provider: "tcgplayer"
      });
      
      this.emitCardAdded();
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
      console.log(`Card ${cardId} removed from watchlist.`);
      this.infoToast('Card removed from watchlist');
      this.emitCardAdded();
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
