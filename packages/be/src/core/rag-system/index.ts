import { readFileSync } from 'node:fs';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { codeExamples } from '@/modules/code-transform/example';
import { getTestDataDir } from '@/utils';

import { HuggingFaceEmbedding } from '../embedding-engines';
import { PGVector } from '../vectordb-providers/pgvector';

export class RAGSystem {
  embedding: Embeddings;
  vectorStore: PGVector;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    this.embedding = new HuggingFaceEmbedding();
    this.vectorStore = new PGVector();
    this.isInitialized = true;
  }

  async addDocuments(path?: string) {
    await this.init();

    // const loader = new CSVLoader(path);
    // const docs = await loader.load();
    // const splitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200
    // });
    // const splitDocs = await splitter.splitDocuments(docs);

    // Load JSON examples instead of CSV
    // const examples = JSON.parse(readFileSync(getTestDataDir() + 'code_transform.json', 'utf-8'));

    // Create documents with metadata
    const docs = codeExamples.map(example => {
      return new Document({
        pageContent: `OLD CODE: ${example.oldCode}\nNEW CODE: ${example.newCode}`,
        metadata: {
          pattern_type: example.patternType,
          transformation_rules: example.transformationRules
        }
      });
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const splitDocs = await splitter.splitDocuments(docs);

    const embeds = await this.embedding.embedDocuments(splitDocs.map(doc => doc.pageContent));

    await this.vectorStore.addDocuments(docs, embeds);

    // const embeds = await this.embedding.embedDocuments(splitDocs.map(doc => doc.pageContent));

    // await this.vectorStore.addDocuments(splitDocs, embeds);
  }

  async addCodeTransformExample() {
    await this.init();

    const docs = codeExamples.map(example => {
      return new Document({
        pageContent: example.oldCode,
        metadata: {
          newCode: example.newCode,
          pattern_type: example.patternType,
          transformation_rules: example.transformationRules
        }
      });
    });

    const embeds = await this.embedding.embedDocuments(docs.map(doc => doc.pageContent));
    await this.vectorStore.addDocuments(docs, embeds);
  }

  async similaritySearch(searchText: string, k: number = 3) {
    await this.init();
    const embedding = await this.embedding.embedQuery(searchText);
    const result = await this.vectorStore.similaritySearch(embedding, k);
    return result;
  }
}
