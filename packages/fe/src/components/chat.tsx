import React, { useEffect } from 'react';

import { Bubble, useXAgent, useXChat, Welcome } from '@ant-design/x';
import { Space, type GetProp } from 'antd';
import { createStyles } from 'antd-style';

import { fetchSSE } from '../request';
import AiInput from './ai-input';

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
    console.log(files, 111, nextContent);

    fetchSSE('http://localhost:3000/study/chat', { messages: '你叫什么名字' }, data => {
      console.log('data', data);
    });

    return;
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
        <div className="flex w-full pt-2 text-xl font-bold">
          <div className="-mt-1 mr-1">
            <img
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png"
              alt="Waving Hand"
              width="35"
              height="35"
            />
          </div>
          <div className="">
            <div>您好</div>
            <div>有什么可以帮到您?</div>
          </div>
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
