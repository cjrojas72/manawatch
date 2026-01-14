import { Injectable } from '@angular/core';
import { collection, getDocs,query, orderBy, limit } from "firebase/firestore"; 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from '../../environments/environment.development';
import { getAuth } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private app = initializeApp(environment.firebase);
 // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(this.app, "marketdata");
  auth = getAuth(this.app)



  async getMarketData(){
    try {
      const marketRef = collection(this.db, 'market_trending_pricecharting');
      const q = query(marketRef, orderBy('lastUpdated', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot .docs[0].data();
      }
    } catch (error) {
      console.error("Error fetching latest market data:", error);
    }
    return null;

  }


}
