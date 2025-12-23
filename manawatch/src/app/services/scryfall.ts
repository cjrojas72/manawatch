import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScryfallService {
  private readonly BASE_URL = 'https://api.scryfall.com';
  private readonly FAKE_API_KEY = 'sk_test_123456789mtg';

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
    const params = new HttpParams().set('q', query);

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.FAKE_API_KEY}`,
      // It's good practice to identify your app to Scryfall
      'User-Agent': 'MTGWatchlistApp/1.0'
    });

    return this.http.get<any>(`${this.BASE_URL}/cards/search`, { params, headers }).pipe(
      map(response => response.data), // Scryfall wraps the array in a 'data' property
      catchError(error => {
        // Scryfall returns a 404 if no cards match the query.
        // We treat this as an empty list rather than a breaking error.
        if (error.status === 404) {
          return of([]);
        }
        return throwError(() => new Error(error.message || 'Server Error'));
      })
    );
  }
}