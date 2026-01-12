import { Injectable } from '@angular/core';
import { collection, getDocs,query, orderBy, limit, doc, setDoc, deleteDoc, where} from "firebase/firestore"; 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from '../../environments/environment.development';
import { getAuth } from "firebase/auth";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private app = initializeApp(environment.firebase);
 // Initialize Cloud Firestore and get a reference to the service
  private db = getFirestore(this.app, "watchlist");
  private auth = getAuth(this.app);

  private userId = "test-user";

  private cardAddedSource = new Subject<void>();
  
  cardAdded$ = this.cardAddedSource.asObservable();

  // Emit event when a card is added to the watchlist
  emitCardAdded() {
    this.cardAddedSource.next();
  }

  async getWatchlistCards(): Promise<Array<any>> {
    if (!this.userId) {
      console.error("No userId found");
      return [];
    }

    const q = query(
      collection(this.db, `users/${this.userId}/watchlists/default/cards`),
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
    
    if (!this.userId) {
      console.error("No userId provided");
      return;
    }

    const cardDocRef = doc(
      this.db, 
      `users/${this.userId}/watchlists/default/cards/${card.id}`
    );

    const checkDocRef = query(
      collection(this.db, `users/${this.userId}/watchlists/default/cards`),
      where("id", "==", card.id),
    );

    try {
      const checkDocSnap = await getDocs(checkDocRef);
      if (!checkDocSnap.empty) {
        console.log("Card already exists in watchlist!");
        alert("Card already exists in watchlist!");
        return;
      }

      await setDoc(cardDocRef, {
        ...card,
        addedAt: new Date(),
      });
     return console.log(`Card ${card.name} added to watchlist.`);
    } catch (error) {
      console.error("Error adding card to watchlist:", error);
      return;
    }
  }

  async removeCardFromWatchlist(cardId: string) {
    if (!this.userId) {
      console.error("No userId provided");
      return;
    } 

    const cardDocRef = doc(
      this.db,
      `users/${this.userId}/watchlists/default/cards/${cardId}`
    );

    try {
      await deleteDoc(cardDocRef);
      console.log(`Card ${cardId} removed from watchlist.`);
    } catch (error) {
      console.error("Error removing card from watchlist:", error);
    }
  }

  
}
