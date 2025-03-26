import {SqlStore} from 'databag-client-sdk';
import SQLite from 'react-native-sqlite-storage';

export class SessionStore implements SqlStore {
  private db: any = null;

  constructor() {
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);
  }

  public async open(path: string) {
    this.db = await SQLite.openDatabase({name: path, location: 'default'});
  }

  public async set(stmt: string, params: (string | number | null)[]): Promise<void> {
    console.log('SET: ', stmt);
    await this.db.executeSql(stmt, params);
  }

  public async get(stmt: string, params: (string | number | null)[]): Promise<any[]> {
    console.log('GET: ', stmt);
    const res = await this.db.executeSql(stmt, params);
    const rows = [];
    if (res[0] && res[0].rows && res[0].rows.length > 0) {
      for (let i = 0; i < res[0].rows.length; i++) {
        rows.push(res[0].rows.item(i));
      }
    }
    return rows;
  }
}
