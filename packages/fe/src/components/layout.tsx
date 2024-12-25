import React from 'react';

import { Flex, Splitter, Typography } from 'antd';

import Chat from './chat';

export default function layout() {
  return (
    <Splitter className="h-full w-full">
      <Splitter.Panel defaultSize="50%" min="20%" max="100%">
        <Chat />
      </Splitter.Panel>
      <Splitter.Panel>2</Splitter.Panel>
    </Splitter>
  );
}
