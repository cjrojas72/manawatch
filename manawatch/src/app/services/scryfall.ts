import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScryfallService {
  private readonly BASE_URL = 'https://api.scryfall.com';
  private readonly FAKE_API_KEY = 'sk_test_123456789mtg';
  private firebaseService = inject(FirebaseService);

  constructor(private http: HttpClient) {}

  /**
   * Search for cards using the Scryfall search syntax
   * @param query e.g., "c:white mv=1"
   */
  searchCards(query: string): Observable<any[]> {
    if (!query.trim()) {
      return of([]);
    }

    // Scryfall expects the 'q' parameter for searches
    const params = new HttpParams().set('q', query).set('unique', 'prints');

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'User-Agent': 'MTGWatchlistApp/1.0'
    });

    return this.http.get<any>(`${this.BASE_URL}/cards/search`, { params, headers }).pipe(
      map(response => response.data),
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        return throwError(() => new Error(error.message || 'Server Error'));
      })
    );
  }

  getAutocomplete(query: string): Observable<string[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any>(`${this.BASE_URL}/cards/autocomplete`, { params }).pipe(
      map(res => res.data || []),
      catchError(() => of([]))
    );
  }

  getTop10Cards(): Observable<string[]>{
    return this.http.get<any>(`${this.BASE_URL}/cards/search?q=not:reprint+usd>40&order=usd&dir=desc`).pipe(
      map(res => res.data.slice(0, 10) || []), 
      catchError(() => of([]))
    );
  }

  async getTrendingCards(): Promise<any[]> {
  const data: any[] = [];
  const latestMarketDoc = await this.firebaseService.getMarketData();

  if (latestMarketDoc && latestMarketDoc['cards']) {
    // 2. Use a standard for...of loop or for loop
    // Note: Array.forEach does not handle 'await' correctly inside its callback
    for (const scrapedCard of latestMarketDoc['cards']) {
      try {
        // 3. WAIT for the observable to emit the first value and convert to Promise
        const cardDetails = await firstValueFrom(this.getCardById(scrapedCard.scryfall_id));

        if (cardDetails) {
          data.push({
            ...cardDetails,
            price: scrapedCard.price,
            changePercent: scrapedCard.changePercent,
          });
        }
      } catch (err) {
        console.error(`Could not find card ${scrapedCard.scryfall_id}:`, err);
      }
    }
  }
  return data.slice(0, 10);
}

  getCardById(cardId: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/cards/${cardId}`).pipe(
      catchError(error => throwError(() => new Error(error.message || 'Server Error')))
    );
  }
}