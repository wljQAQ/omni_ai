import { HttpsProxyAgent } from 'https-proxy-agent';
import OpenAI from 'openai';

const proxyUrl = 'http://127.0.0.1:7890';
const httpsAgent = new HttpsProxyAgent(proxyUrl);

const key = '';
export const openai = new OpenAI({

  apiKey: key,
  //   httpAgent: httpsAgent,
  baseURL: ''
});
