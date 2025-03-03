/**
 * 代码转换
 * 旧通用报表转新低代码js
 */

import { join } from 'node:path';
import { Controller, Get, Post } from '@nestjs/common';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { HuggingFaceEmbedding } from '@/core/embedding-engines';
import { RAGSystem } from '@/core/rag-system';
import { getModelsDir, getTestDataDir } from '@/utils/path';

import { TransformService } from './transform.service';

@Controller('ai/code-transform')
export class TransformController {
  constructor(private readonly transformService: TransformService) {}

  @Get('report')
  async transformReport() {
    //1.导入知识库
    const docPath = join(getTestDataDir(), 'export.csv');
    const ragSystem = new RAGSystem();
    await ragSystem.addDocuments(docPath);
    // const loader = new CSVLoader(docPath);
    // const docs = await loader.load();
    // //2.文本切割
    // const splitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200
    // });
    // const splitDocs = await splitter.splitDocuments(docs);
    // //3.向量转换
    // const embedding = new HuggingFaceEmbedding();
    // const embeds = await embedding.embedDocuments(splitDocs.map(doc => doc.pageContent));
    // //4.向量存储
    // const vectorStore = new Chroma(embedding, {
    //   collectionName: 'a-test-collection'
    // });
    // return 11;
    // return this.transformService.transformReport();
  }
}
