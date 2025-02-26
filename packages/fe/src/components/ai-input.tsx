import React from 'react';

import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import { Attachments, AttachmentsProps, Sender, Suggestion } from '@ant-design/x';
import { Button, Flex, Input, Select, type GetProp, type GetRef } from 'antd';

import { ChatMessages, generateMessages, uploadImages2Base64 } from '../utils';
import Test from './Test';

type SuggestionItems = Exclude<GetProp<typeof Suggestion, 'items'>, () => void>;

const suggestions: SuggestionItems = [
  { label: 'Write a report', value: 'report' },
  { label: 'Draw a picture', value: 'draw' },
  {
    label: 'Check some knowledge',
    value: 'knowledge',
    // icon: <OpenAIFilled />,
    children: [
      {
        label: 'About React',
        value: 'react'
      },
      {
        label: 'About Ant Design',
        value: 'antd'
      }
    ]
  }
];

interface AiInputProps {
  onSubmit?: (messages: ChatMessages) => void;
  onChange?: (text: string) => void;
  className?: string;
  value?: string;
  loading?: boolean;
}

const AiInput = ({ onSubmit, className, value, loading, onChange }: AiInputProps) => {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<GetProp<AttachmentsProps, 'items'>>([]);
  const [text, setText] = React.useState(value || '');

  const attachmentsRef = React.useRef<GetRef<typeof Attachments>>(null);

  const senderRef = React.useRef<HTMLDivElement>(null);

  const senderHeader = (
    <Sender.Header
      styles={{
        content: {
          padding: 0
        }
      }}
      open={open}
      onOpenChange={setOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={items}
        onChange={({ fileList }) => setItems(fileList)}
        placeholder={type =>
          type === 'drop'
            ? {
                title: 'Drop file here'
              }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload'
              }
        }
        getDropContainer={() => senderRef.current}
      />
    </Sender.Header>
  );

  return (
    <Suggestion
      items={suggestions}
      onSelect={itemVal => {
        setText(`[${itemVal}]:`);
      }}
    >
      {({ onTrigger, onKeyDown }) => {
        return (
          <Sender
            ref={senderRef}
            header={senderHeader}
            prefix={
              <Button
                type="text"
                icon={<LinkOutlined />}
                onClick={() => {
                  setOpen(!open);
                }}
              />
            }
            components={{
              input: Test
            }}
            value={text}
            onChange={value => {
              if (value === '/') {
                onTrigger();
              } else if (!value) {
                onTrigger(false);
              }
              setText(value);
              onChange?.(value);
            }}
            onPasteFile={file => {
              attachmentsRef.current?.upload(file);
              setOpen(true);
            }}
            onSubmit={async () => {
              const messages = generateMessages(text, await uploadImages2Base64(items));
              setItems([]);
              setText('');
              onSubmit?.(messages);
            }}
            onKeyDown={onKeyDown}
            loading={loading}
          />
        );
      }}
    </Suggestion>
  );
};

export default AiInput;
