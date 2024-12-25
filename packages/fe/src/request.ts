export async function fetchSSE(
  url: string,
  params: any,
  onMessage: (data: any) => void,
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onMessage(data);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    onSuccess?.(response);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    onFinally?.();
  }
}
