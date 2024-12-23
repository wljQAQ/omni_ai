// 前端调用示例
import { readFileSync } from 'fs';

const baseUrl = 'http://localhost:3000/ai';

const message = [
  {
    type: 'system',
    content: '你是一个专业的助手'
  },
  {
    type: 'human',
    content: '你好，请介绍一下自己'
  }
];

const image = readFileSync('./image.png').toString('base64');

const base64_url = `data:image/png;base64,${image}`;

const image_message = [
  {
    role: 'system',
    content: `你是一个专业的前端开发者，精通 Vue.js。
请根据用户提供的图片设计内容：
1. 分析图片中的UI元素和布局
2. 生成对应的Vue3组件代码
3. 使用Element Plus UI库的组件
4. 代码要包含基础的样式
5. 只输出代码，不要解释说明
6. 确保代码可以直接使用`
  },
  {
    role: 'human',
    content: [
      {
        type: 'image_url',
        image_url: { url: base64_url }
      },
      {
        type: 'text',
        text: '请根据这张图片设计一个Vue组件，使用Element Plus组件库。'
      }
    ]
  }
];

async function main() {
  const response = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: image_message
    })
  });

  const result = await response.json();
  console.log(result);
}

main();
