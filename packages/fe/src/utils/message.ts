export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image_url'
}

export interface BaseMessage {
  type: MessageType;
}

export interface TextMessage extends BaseMessage {
  type: MessageType.TEXT;
  text: string;
}

export interface ImageMessage extends BaseMessage {
  type: MessageType.IMAGE;
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

export type ChatMessages = (TextMessage | ImageMessage)[];

export function generateMessages(text: string, images?: string[]): ChatMessages {
  const messages: ChatMessages = [generateTextMessage(text)];

  if (images?.length) {
    const imageMessages = images.map(url => generateImageMessage(url));
    messages.push(...imageMessages);
  }

  return messages;
}

export function generateTextMessage(text: string): TextMessage {
  return {
    type: MessageType.TEXT,
    text
  };
}

export function generateImageMessage(url: string): ImageMessage {
  return {
    type: MessageType.IMAGE,
    image_url: {
      url
    }
  };
}
