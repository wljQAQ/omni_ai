import { XStream } from '@ant-design/x';

export async function fetchSSE(
  url: string,
  params: any,
  onMessage: (data: string) => void,
  onSuccess?: (response: any) => void,
  onFinally?: () => void
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not yet supported in this browser.');
    }

    for await (const chunk of XStream({
      readableStream: response.body
    })) {
      console.log(chunk, 'chunk');
      onMessage(chunk.data);
    }

    onSuccess?.(response);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    onFinally?.();
  }
}
