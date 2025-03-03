import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Embeddings } from '@langchain/core/embeddings';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { HuggingFaceEmbedding } from '../embedding-engines';
import { PGVector } from '../vectordb-providers/pgvector';

export class RAGSystem {
  embedding: Embeddings;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    this.embedding = new HuggingFaceEmbedding();
    this.isInitialized = true;
  }

  async addDocuments(path: string) {
    const pgVector = new PGVector();
    pgVector.init();
    return;
    await this.init();

    const loader = new CSVLoader(path);
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const splitDocs = await splitter.splitDocuments(docs);

    const embeds = await this.embedding.embedDocuments(splitDocs.map(doc => doc.pageContent));
  }
}
