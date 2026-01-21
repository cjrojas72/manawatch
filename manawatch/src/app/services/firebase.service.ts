import { Injectable, signal, computed, inject } from '@angular/core';
import { collection, getDocs,query, orderBy, limit } from "firebase/firestore"; 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from '../../environments/environment.development';
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
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private app = initializeApp(environment.firebase);
  private toastService = inject(HotToastService);
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
        return querySnapshot .docs[0].data();
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
      this.errorToast("There was an issue during signup. Please try again.");
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.successToast("You are now signed in!");
    } catch (error: any) {
      this.errorToast("There was an issue during login. Please try again.");
      throw error.message;
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(this.auth, provider);
      this.successToast("You are now signed in!");
      return result.user;
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error.code);
      this.errorToast("There was an issue during login. Please try again.");
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.infoToast("You are now signed out.");
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

  successToast(msg: string){
    this.toastService.success( msg, {
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
    this.toastService.info( msg, {
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
    this.toastService.error( msg, {
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
