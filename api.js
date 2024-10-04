

const eventSource = new EventSource('http://localhost:3000/ai/convertOldCodeStream');

eventSource.onmessage = event => {
  const data = JSON.parse(event.data);
  if (data.content) {
    // 处理接收到的代码块
    console.log(data.content);
    // 这里可以将代码块添加到 VS Code 编辑器中
  } else if (data.error) {
    console.error('Error:', data.error);
  }
};

eventSource.onerror = error => {
  console.error('EventSource failed:', error);
  eventSource.close();
};
