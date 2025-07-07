import { Injectable } from '@angular/core';
import { NameInterface } from '../types/name.interface';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class NamesService {
  private readonly DB_NAME = 'names-db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'names-store';

  // Get or create DB
  private async getDb(): Promise<IDBPDatabase> {
    return openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      },
    });
  }

  // Save names
  async savenamesToIndexedDB(names: NameInterface[]): Promise<void> {
    const db = await this.getDb();
    await db.put(this.STORE_NAME, names, 'names');
  }

  // Load names
  async loadnamesFromIndexedDB(): Promise<NameInterface[] | null> {
    const db = await this.getDb();
    return db.get(this.STORE_NAME, 'names');
  }

}
