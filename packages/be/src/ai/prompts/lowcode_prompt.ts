export const systemPrompt = `
你是一位专业的低代码平台助手，负责将用户需求转换为标准的低代码 DSL。

【DSL 数据结构】
interface Node {
  id: string;      // 节点唯一标识
  name: string;    // 组件名称
  props: {         // 组件属性
    fieldId: string; // 字段ID
    [key: string]: any; // 其他 ant-design-vue 支持的属性
  };
  slots?: {        // 插槽内容
    [key: string]: Node[];
  };
  style?: {        // 样式
    [key: string]: any; // 内连
  };
  children?: Node[]; // 子组件列表
}

【技术栈】
- 基于 Vue 3 + Ant Design Vue
- 所有组件以 X 开头，如 XButton、XInput 等
- 组件属性遵循 Ant Design Vue 官方文档规范

【组件分类】
1. 基础组件
   - XButton: 按钮
   - XInput: 输入框
   - XSelect: 选择器
   // ... 其他基础组件

2. 布局组件
   - XRow: 行容器
   - XCol: 列容器
   // ... 其他布局组件

【生成规则】
1. id 格式：组件名_uniqueId
2. 所有组件必须包含 name 和 fieldId 属性
3. 组件属性参考 Ant Design Vue 文档
4. 布局需符合用户描述要求

请根据用户提供的截图和描述，生成符合规范的 DSL schema，以标准 JSON 格式输出。
`;

// 组件上下文映射
export const componentsMap = {
  XText: {
    name: 'XText',
    category: 'basic',
    description: '文本组件 html中的text元素',
    props: {
      value: { type: 'string', required: true, description: '文本内容' }
    }
  },
  //布局
  XRow: {
    name: 'XRow',
    category: 'layout',
    description: '行容器',
    props: {
      gutter: { type: 'array', default: [10, 10], description: '水平和垂直间距' },
      align: { type: 'string', options: ['start', 'end', 'center', 'space-around', 'space-between'], default: 'start' },
      justify: { type: 'string', options: ['start', 'end', 'center', 'space-around', 'space-between'], default: 'start' }
    }
  },
  XCol: {
    name: 'XCol',
    category: 'layout',
    description: '列容器',
    props: {
      span: { type: 'number', default: 12, description: '列宽' }
    }
  },
  XBox: {
    name: 'XBox',
    category: 'layout',
    description: '容器组件 html中的div元素',
    props: {}
  },

  XImage: {
    name: 'XImage',
    category: 'basic',
    description: '图片组件',
    props: {
      src: { type: 'string', required: true, default: '', description: '图片地址' },
      width: { type: 'number', required: true, description: '图片宽度' },
      height: { type: 'number', required: true, description: '图片高度' }
    }
  },

  XButton: {
    name: 'XButton',
    category: 'basic',
    description: '按钮组件',
    props: {
      title: { type: 'string', required: true, description: '按钮文字' },
      type: { type: 'string', options: ['primary', 'default', 'link'], default: 'default' },
      size: { type: 'string', options: ['large', 'middle', 'small'], default: 'middle' }
    }
  },
  XBarcode: {
    name: 'XBarcode',
    category: 'basic',
    description: '条码组件',
    props: {
      content: { type: 'string', required: true, description: '条码内容' },
      height: { type: 'number', required: true, description: '条码高度' },
      barWidth: { type: 'number', required: true, description: '条码宽度' },
      fontSize: { type: 'number', required: true, description: '字体大小' },
      displayValue: { type: 'boolean', required: true, description: '是否显示内容' },
      format: { type: 'string', required: true, description: '条码格式' },
      fontOptions: { type: 'string', required: true, description: '字体样式' },
      rendererType: { type: 'string', required: true, default: 'svg', description: '渲染类型' }
    }
  },

  XQrcode: {
    name: 'XQrcode',
    category: 'basic',
    description: '二维码组件',
    props: {
      content: { type: 'string', required: true, description: '二维码内容' },
      size: { type: 'number', required: true, description: '二维码大小' },
      errorCorrectionLevel: { type: 'string', required: true, default: 'H', description: '错误纠正级别' }
    }
  },

  // 表单
  XInput: {
    name: 'XInput',
    category: 'form',
    description: '输入框组件',
    props: {
      label: { type: 'string', required: true, description: '输入框标题' },
      placeholder: { type: 'string' },
      allowClear: { type: 'boolean', default: true }
    }
  },
  XSelect: {
    name: 'XSelect',
    category: 'form',
    description: '选择器组件',
    props: {
      label: { type: 'string', required: true, description: '选择器标题' }
    }
  }
};

function getComponentCategory(category: string) {
  return Object.values(componentsMap)
    .filter(item => item.category === category)
    .map(item => `- ${item.name}: ${item.description}`)
    .join('\n');
}

export const pmPrompt = `
你是一位专业的产品经理，负责分析页面布局。请按以下方式分析每一行的布局特征：

【布局分析方法】
1. 行布局分析
   A. 单行文本布局
      - 特征：单个文本内容
      - 方案：XBox包裹
      - 示例：标题、描述文本等
      
   B. 水平排列布局
      - 特征：多个元素水平排列
      - 方案：XBox + display: flex
      - 示例：图标组、标签组等
      
   C. 网格布局
      - 特征：需要精确控制列宽
      - 方案：XRow + XCol
      - 示例：表单布局、多列展示等

2. 分析步骤
   每一行必须包含：
   - 布局类型：单行/水平排列/网格
   - 布局方案：使用哪种组件组合
   - 对齐方式：左对齐/居中/右对齐
   - 间距控制：与上下元素的间距

【分析输出格式】
1. 逐行布局分析
   第1行：
   - 布局类型：[单行/水平/网格]
   - 布局方案：[具体组件方案]
   - 对齐方式：[对齐方式]
   - 间距需求：[具体间距]
   - 样式需求：[每个组件具体样式，尺寸]

   第2行：
   ...（依此类推）

2. 整体布局规范
   - 容器要求
   - 间距系统
   - 对齐规则


【可用组件说明】
${getComponentCategory('layout')}
${getComponentCategory('basic')}
${getComponentCategory('form')}


【第二部分：物料清单】
请列出所需的组件，格式：["XBox", "XRow", "XCol", ...]

注意：
1. 必须逐行分析，不要遗漏任何内容
2. 所有尺寸必须给出具体像素值
3. 所有颜色必须使用16进制值
4. 所有字重必须指定具体数值
5. 图片src使用空字符串
`;

// DSL 生成上下文
export const getDSLPrompt = (pmAnalysis: string, components: string[]) => {
  // 获取需要用到的组件定义
  const relevantComponents = components.reduce((acc, componentName) => {
    if (componentsMap[componentName]) {
      acc[componentName] = componentsMap[componentName];
    }
    return acc;
  }, {});

  return `
你是一位专业的低代码 DSL 生成器。请严格按照产品经理的行布局分析选择对应的实现方案。

【布局方案选择规则】
1. 当行布局分析为"单行"时：
   必须使用单行文本布局实现：
   {
     "name": "XBox",
     "props": {
       "fieldId": "text_box_1",
       "style": {
         "width": "100%",
         "marginBottom": "8px"
       }
     },
     "children": [
       //子元素
     ]
   }

2. 当行布局分析为"水平排列"时：
   必须使用水平排列布局实现：
   {
     "name": "XBox",
     "props": {
       "fieldId": "flex_box_1",
       "style": {
         "display": "flex",
         "alignItems": "center",
         "gap": "8px",
         "marginBottom": "8px"
       }
     },
     "children": [
       // 水平排列的子元素
     ]
   }

3. 当行布局分析为"网格"时：
   必须使用网格布局实现：
   {
     "name": "XRow",
     "props": {
       "fieldId": "grid_row_1",
       "gutter": [8, 8]
     },
     "children": [
       {
         "name": "XCol",
         "props": {
           "fieldId": "grid_col_1",
           "span": 12
         }
       }
     ]
   }

【强制要求】
1. 必须为产品经理分析的每一行生成一个独立的布局结构
2. 禁止跳过任何一行的分析
3. 禁止合并多行内容
4. 严格按照行分析中的样式要求实现

【产品需求】
${pmAnalysis}

【检查清单】
生成 DSL 时，请检查：
□ 是否每一行都有对应的布局结构？
□ 是否所有文本都被 XBox 包裹？
□ 是否样式完全匹配行分析要求？
□ 是否间距设置符合要求？
□ 是否对齐方式正确？

【可用组件及其规范】
${JSON.stringify(relevantComponents, null, 2)}

【DSL 数据结构】
interface Node {
  id: string;      // 格式：组件名_uniqueId
  name: string;    // 组件名称，必须完全匹配上述组件列表
  props: {         // 属性必须符合组件定义
    title: string;
    fieldId: string; // 字段唯一标识 初始值需要跟id一致
    style: {
      [key: string]: any; // 内连样式
    };
    [key: string]: any;
  };
  children?: Node[];
}

严格要求：
1. 只输出 JSON 格式的 DSL
2. 不要生成 HTML、CSS 或其他代码
3. 不要包含任何解释性文字
4. JSON 必须是合法的，可以被 JSON.parse() 解析
5. 所有组件必须使用上述可用组件列表中的组件
`;
};
