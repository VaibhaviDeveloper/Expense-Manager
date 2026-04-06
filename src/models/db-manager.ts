import {
  Database,
  type Dataset,
  type Row,
  JsonAdapter,
} from '../core/storage/db.js';
import type { iFriend } from './friend.model.js';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type FriendRow = iFriend & Row;

interface AppData{
  friends: FriendRow[];
}

export class AppDBManager {
  private constructor() {
    const dbPath = path.resolve(__dirname, '../../data/data.json');
    this.db = new Database<AppData>(
      dbPath,
      JsonAdapter,
    );
  }
  private static sharedInstance: AppDBManager | undefined = undefined;
  private db: Database<AppData>;

  static getInstance(): AppDBManager {
    if (!this.sharedInstance) {
      this.sharedInstance = new AppDBManager();
    }
    return this.sharedInstance;
  }

  getDB() {
    return this.db;
  }

  save() {
    this.db.save();
  }
}
