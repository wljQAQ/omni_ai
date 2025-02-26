import React from 'react';

import { Input } from 'antd';

export default function Test(props) {
  console.log(props, 'props');
  return <Input {...props} />;
}
