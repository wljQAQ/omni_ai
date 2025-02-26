import { UploadFile } from 'antd';

// 添加一个适配器函数来处理不同类型的文件对象
export function getFileFromUploadFile(uploadFile: UploadFile): File | null {
  if (uploadFile.originFileObj) {
    return uploadFile.originFileObj;
  }
  return null;
}

/**
 * 将图片文件转换为 base64
 * @param uploadFiles 图片文件
 * @returns base64 数组
 */
export async function uploadImages2Base64(uploadFiles: UploadFile[]) {
  const base64s: string[] = [];

  for (let i = 0; i < uploadFiles.length; i++) {
    const file = getFileFromUploadFile(uploadFiles[i]);
    if (!file || !file.type.startsWith('image/')) {
      continue;
    }

    // 转换为 base64
    const base64 = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });

    base64s.push(base64);
  }

  return base64s;
}
