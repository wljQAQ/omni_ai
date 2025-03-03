import { join } from 'node:path';

export const getRootDir = () => {
  return process.cwd();
};

export const getModelsDir = () => {
  return join(getRootDir(), '/models/');
};

export const getTestDataDir = () => {
  return join(getRootDir(), '/test-data/');
};
