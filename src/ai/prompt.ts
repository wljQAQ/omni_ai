import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

import { systemPromot } from './prompt_v2';

export const getConvertOldCodePrompt = () => {
  {
    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPromot),
      HumanMessagePromptTemplate.fromTemplate(`
将以下旧代码转换为新格式，仅处理 MyLink 方法：

{oldCode}

要求：
1. 仅输出转换后的 MyLink 方法代码
2. 添加必要的代码注释
3. 确保正确处理 openWin 和 openModal 的转换
4. 不要包含任何其他说明文本
5. 将原本 MyLink 方法中的注释移除
6. 不要回复除代码以外的任何文本,也不要使用markdown语法。
    `)
    ]);
  }
};
