import { PGlite } from '@electric-sql/pglite';
//@ts-ignore
import { vector } from '@electric-sql/pglite/vector';

import { getTestDataDir } from '@/utils';

export class PGVector {
  private db: PGlite;

  constructor() {}

  async init() {
    console.log(getTestDataDir() + 'db.sqlite');

    try {
      this.db = new PGlite({
        dataDir: getTestDataDir() + 'pgdata',
        extensions: {
          vector
        }
      });

      //   // 等待数据库初始化完成
      //   await this.db.connect();

      //   创建 vector 扩展
      await this.db.sql`CREATE EXTENSION IF NOT EXISTS vector`;

      console.log('PGVector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PGVector:', error);
      throw error; // 重新抛出错误以便上层处理
    }

    // this.db.sql`CREATE EXTENSION IF NOT EXISTS vector`;
    // console.log(this.db);
  }
}
