import React, { useEffect } from 'react';

import { Bubble, useXAgent, useXChat, Welcome } from '@ant-design/x';
import { Space, type GetProp } from 'antd';
import { createStyles } from 'antd-style';

import { fetchSSE } from '../request';
import AiInput from './ai-input';

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `
  };
});

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16
      }
    }
  },
  local: {
    placement: 'end',
    variant: 'shadow'
  }
};

const Chat: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================

  const [content, setContent] = React.useState('');

  // ==================== Runtime ====================
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      let content = '';
      fetchSSE('/ai/chat', { messages: '你好' }, data => {
        content += data;
        console.log('content', content);
      });
      console.log('message', message);
      onSuccess(`Mock success return. You said: ${message}`);
    }
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent
  });

  // ==================== Event ====================
  const onSubmit = async (nextContent: string, files: any) => {
    if (!nextContent) return;
    console.log(files, 111);

    // 如果 items 中包含文件
    if (files?.length > 0) {
      const file = files[0].originFileObj;

      // 检查是否为图片
      if (!file.type.startsWith('image/')) {
        return;
      }

      // 转换为 base64
      const base64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });

      let content = '';
      // 发送请求
      fetchSSE('http://localhost:3000/ai/generateVueCodeFromImage', { imageBase64: base64 }, data => {
        content += data.content;
        console.log('data', content);
      });
      return;
    }
    onRequest('');
    setContent('');
  };

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message
  }));

  // ==================== Render =================
  return (
    <div className="relative h-full w-full px-4">
      {items.length > 0 ? (
        <Bubble.List items={items} roles={roles} />
      ) : (
        <div className="w-full text-xl font-bold">
          <div>你好</div>
          <div>有什么可以帮到你?</div>
        </div>
      )}

      {/* 🌟 输入框 */}
      <div className="absolute bottom-5 left-0 w-full px-4">
        <AiInput onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default Chat;
