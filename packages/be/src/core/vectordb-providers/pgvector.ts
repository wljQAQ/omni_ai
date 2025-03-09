import { PGlite } from '@electric-sql/pglite';
//@ts-ignore
import { vector } from '@electric-sql/pglite/vector';
import { Document } from '@langchain/core/documents';
import { Client } from 'pg';
//@ts-ignore
import { createServer } from 'pglite-server';

import { getTestDataDir } from '@/utils';

export class PGVector {
  private db: PGlite;
  private tableName = 'doc_oldcode_embeddings';
  private embeddingDimension = 384;
  private dataDir = getTestDataDir() + 'pgdata';

  constructor() {}

  async init() {
    if (this.db) return;

    try {
      this.db = new PGlite({
        dataDir: this.dataDir,
        extensions: {
          vector
        }
      });

      //   console.log(Client, 'pg');

      //   this.db = new Client({
      //     host: '192.168.35.106',
      //     port: 5432,
      //     user: 'root',
      //     password: 'Password123@postgres',
      //     database: 'postgres'
      //   });

      //   await this.db.connect();

      //   创建 vector 扩展
      await this.db.query(`CREATE EXTENSION IF NOT EXISTS vector`);

      await this.db.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding VECTOR(${this.embeddingDimension})
      )
    `);

      // 创建向量索引以加速相似性搜索  hnsw https://github.com/pgvector/pgvector?tab=readme-ov-file#hnsw
      //   await this.db.sql`
      //       CREATE INDEX IF NOT EXISTS ${tableName}_vector_hnsw_idx
      //       ON ${tableName}
      //       USING hnsw (embedding vector_l2_ops)
      //     `;

      // 创建向量索引以加速相似性搜索  IVFFlat https://github.com/pgvector/pgvector?tab=readme-ov-file#ivfflat
      await this.db.query(`
            CREATE INDEX IF NOT EXISTS ${this.tableName}_vector_ivfflat_idx
            ON ${this.tableName}
            USING ivfflat (embedding vector_l2_ops)
          `);

      // 启动 pglite-server
      const server = await createServer(this.db);
      server.listen(5432, () => {
        console.log(`PGVector 数据库已启动: http://localhost:${server.port}`);
      });
    } catch (error) {
      console.error('初始化PGVector失败:', error);
      throw error; // 重新抛出错误以便上层处理
    }
  }

  /**
   * 添加文档及其嵌入向量到数据库
   * @param documents 文档对象数组
   * @param embeddings 嵌入向量数组
   * @returns Promise<void>
   */
  async addDocuments(documents: Document[], embeddings: number[][]): Promise<void> {
    await this.init();
    if (documents.length !== embeddings.length) {
      throw new Error('文档数量与嵌入向量数量不匹配');
    }

    try {
      // 批量插入文档和嵌入
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const embedding = embeddings[i];

        if (embedding.length !== this.embeddingDimension) {
          throw new Error(`嵌入向量维度不匹配: 预期${this.embeddingDimension}，实际${embedding.length}`);
        }

        console.log(embedding.length, 111);

        await this.db.query(
          `INSERT INTO "${this.tableName}" (content, metadata, embedding) 
             VALUES ($1, $2, $3)`,
          [doc.pageContent, JSON.stringify(doc.metadata), JSON.stringify(embedding)]
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async similaritySearch(embedding: number[], k: number = 3) {
    await this.init();
    const result = await this.db.query(
      `
        SELECT   
          id, 
          content, 
          metadata
          FROM "${this.tableName}" 
          ORDER BY embedding <=> $1 
          LIMIT $2`,
      [JSON.stringify(embedding), k]
    );

    return result.rows;
  }
}
