import { ChatOllama } from '@langchain/ollama';

import type { BaseModelProvider } from './interface';

// export class OllamaModel implements BaseModelProvider<ChatOllama> {
//   model: ChatOllama;

//   createModel() {
//     this.model = new ChatOllama({
//       baseUrl: 'http://localhost:11434',
//       model: 'llama3.2-vision:11b',
//       temperature: 0.2
//     });

//     return this.model;
//   }
// }
