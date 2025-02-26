import { HttpsProxyAgent } from 'https-proxy-agent';
import OpenAI from 'openai';

const proxyUrl = 'http://127.0.0.1:7890';
const httpsAgent = new HttpsProxyAgent(proxyUrl);

const key = '';
export const openai = new OpenAI({
  apiKey: 'sk-cf2dc2b6f64f4e01a3778626e97be615',
  //   httpAgent: httpsAgent,
  // baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  baseURL: 'https://api.deepseek.com'
});
