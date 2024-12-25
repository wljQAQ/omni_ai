import React from 'react';

import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import { Attachments, AttachmentsProps, Sender } from '@ant-design/x';
import { Button, Flex, type GetProp, type GetRef } from 'antd';

interface AiInputProps {
  onSubmit?: (text: string, items: GetProp<AttachmentsProps, 'items'>) => void;
  onChange?: (text: string) => void;
  className?: string;
  value?: string;
  loading?: boolean;
}

const AiInput = ({ onSubmit, className, value, loading, onChange }: AiInputProps) => {
  console.log('AiInput', className);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<GetProp<AttachmentsProps, 'items'>>([]);
  const [text, setText] = React.useState(value || '');

  const attachmentsRef = React.useRef<GetRef<typeof Attachments>>(null);

  const senderRef = React.useRef<HTMLDivElement>(null);

  const senderHeader = (
    <Sender.Header
      title="Attachments"
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
        // Mock not real upload file
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
    <Flex className={className} style={{ height: 220 }} align="end">
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
        value={text}
        onChange={value => {
          setText(value);
          onChange?.(value);
        }}
        onPasteFile={file => {
          attachmentsRef.current?.upload(file);
          setOpen(true);
        }}
        onSubmit={() => {
          setItems([]);
          setText('');
          onSubmit?.(text, items);
        }}
        loading={loading}
      />
    </Flex>
  );
};

export default AiInput;
