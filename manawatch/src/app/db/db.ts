import Dexie, { Table } from 'dexie';

export interface WatchlistCard {
  id: string; // MTGJSON ID
  name: string;
  prices: {
    provider: string,
      date: string,
      cardType: string,
      listType: string,
      price: number,
  }[];
  lastUpdated: number; 
}

export class AppDatabase extends Dexie {
  watchlist!: Table<WatchlistCard>;

  constructor() {
    super('ManaWatchDB');
    this.version(1).stores({
      watchlist: 'id, name, lastUpdated' 
    });
  }
}

export const db = new AppDatabase();