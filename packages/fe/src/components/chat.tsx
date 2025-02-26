import React, { useEffect } from 'react';

import { CoffeeOutlined, FireOutlined, SmileOutlined } from '@ant-design/icons';
import { Bubble, Prompts, PromptsProps, useXAgent, useXChat, Welcome } from '@ant-design/x';
import { Image, Space, type GetProp } from 'antd';

import markdownit from 'markdown-it';

import { fetchSSE } from '../request';
import { ChatMessages } from '../utils';
import AiInput from './ai-input';

const md = markdownit({ html: true, breaks: true });

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16
      }
    },
    messageRender: (items: any) => {
      return <div className="max-h-[500px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: md.render(items) }}></div>;
    }
  },
  local: {
    placement: 'end',
    // variant: 'shadow',
    messageRender: (items: any) => {
      //处理存在图片的的情况
      const imageItems = (items as ChatMessages).filter(item => item.type === 'image_url');

      const textItems = (items as ChatMessages).find(item => item.type === 'text');
      return (
        <div>
          {imageItems.length > 0 && (
            <div>
              {imageItems.map(item => {
                return <Image src={item.image_url.url} key={item.image_url.url} />;
              })}
            </div>
          )}

          <div key={textItems?.text}>{textItems?.text}</div>
        </div>
      );
    }
  }
};

const promptItems: PromptsProps['items'] = [
  {
    key: '6',
    icon: <CoffeeOutlined style={{ color: '#964B00' }} />,
    description: '插入一个新的区块',
    disabled: false
  },
  {
    key: '7',
    icon: <SmileOutlined style={{ color: '#FAAD14' }} />,
    description: '插入一个vue组件',
    disabled: false
  }
];

const Chat: React.FC = () => {
  const [agent] = useXAgent<ChatMessages>({
    request: async ({}, { onSuccess, onUpdate }) => {
      let content = '';
      const message = [
        {
          type: 'image_url',
          image_url: {
            url: 'https://v0.dev/_next/image?url=https%3A%2F%2Fhebbkx1anhila5yf.public.blob.vercel-storage.com%2Fimage-HNbLp0gVw3SctE5GluPVQ9arpac8OZ.png&w=1920&q=75'
          }
        },
        {
          type: 'text',
          text: '根据图片生成dsl'
        }
      ];

      fetchSSE(
        'http://localhost:3000/ai/chat',
        { messages: message },
        data => {
          content += data.content;

          console.log('content', content);
          onUpdate(content);
        },
        data => {
          onSuccess(content);
          // console.log('success', data);
        }
      );
    }
  });

  const { onRequest, messages } = useXChat({
    agent
  });

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    // loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message
  }));

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

      <div className="absolute bottom-5 left-0 w-full px-4">
        {/* propmt提示 */}
        <Prompts items={promptItems} vertical title="🌟 尝试一下" />
        {/* 🌟 输入框 */}
        <AiInput
          onSubmit={messages => {
            onRequest(messages);
          }}
        />
      </div>
    </div>
  );
};

export default Chat;
