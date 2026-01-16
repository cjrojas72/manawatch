import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MtgJsonService {
  private http = inject(HttpClient);
  private readonly API_PATH = '../../api/mtgjson';

  async getCardPriceHistory(sId: string) {
    const gqlQuery = {
      query: `
        query GetPriceByScryfall($sId: String!) { 
          cards(filter: { identifiers: { scryfallId_eq: $sId } } page: { take: 100, skip: 0 }) { 
            name 
            uuid 
            setCode 
            prices { 
              price 
              date 
              listType 
              cardType 
              provider 
            }
          }
        }`,
      variables: { sId } 
    };

    try {
      const response = await lastValueFrom(
        this.http.post<any>(this.API_PATH, gqlQuery)
      );
      return response.data;
    } catch (error) {
      console.error('GraphQL Error:', error);
      return [];
    }
  }
}