import { Injectable, signal, inject } from '@angular/core';
import { collection, getDocs, query, orderBy, limit, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from '../../environments/environment';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getAuth
} from 'firebase/auth';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  readonly app = initializeApp(environment.firebase);
  private notify = inject(NotificationService);
 // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(this.app, "marketdata");
  auth = getAuth(this.app);

  currentUser = signal<User | null>(null);
  isInitialLoad = signal(true);

  showAuthModal = signal(false);


  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isInitialLoad.set(false);
    });
  }

  openLogin() {
    this.showAuthModal.set(true);
  }


  closeAuth() {
    this.showAuthModal.set(false);
  }


  async getMarketData(){
    try {
      const marketRef = collection(this.db, 'market_trending_pricecharting');
      const q = query(marketRef, orderBy('lastUpdated', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
    } catch (error) {
      console.error("Error fetching latest market data:", error);
    }
    return null;

  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Firebase Sign Up Error:', error);
      this.notify.error("There was an issue during signup. Please try again.");
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.notify.success("You are now signed in!");
    } catch (error: any) {
      this.notify.error("There was an issue during login. Please try again.");
      throw error.message;
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(this.auth, provider);
      this.notify.success("You are now signed in!");
      return result.user;
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error.code);
      this.notify.error("There was an issue during login. Please try again.");
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.notify.info("You are now signed out.");
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateUserPassword(currentPw: string, newPw: string) {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error("No user found");

    const credential = EmailAuthProvider.credential(user.email, currentPw);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      return { success: true };
    } catch (error: any) {
      throw error;
    }
  }

}
