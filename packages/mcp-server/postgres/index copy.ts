#!/usr/bin/env node
// 指定使用Node.js运行此脚本
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// 导入MCP SDK中的Server类，用于创建MCP服务器

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// 导入StdioServerTransport类，用于通过标准输入/输出进行通信

import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
// 导入MCP请求的模式定义，用于验证和处理不同类型的请求

import pg from 'pg';

// 导入PostgreSQL客户端库

const server = new Server(
  {
    name: 'example-servers/postgres', // 指定服务器名称
    version: '0.1.0' // 指定服务器版本号
  },
  {
    capabilities: {
      resources: {}, // 声明支持资源功能
      tools: {} // 声明支持工具功能
    }
  }
);
// 创建MCP服务器实例，指定服务器名称、版本和支持的能力（resources和tools）

const args = process.argv.slice(2);
// 获取命令行参数，去除前两个元素（node可执行文件路径和脚本路径）

if (args.length === 0) {
  console.error('Please provide a database URL as a command-line argument');
  process.exit(1);
}
// 检查是否提供了数据库URL参数，如果没有则输出错误并退出程序

const databaseUrl = args[0];
// 获取第一个命令行参数作为数据库URL

const resourceBaseUrl = new URL(databaseUrl);
resourceBaseUrl.protocol = 'postgres:';
resourceBaseUrl.password = '';
// 创建资源基础URL，修改协议为postgres，并清除密码（出于安全考虑）

const pool = new pg.Pool({
  connectionString: databaseUrl
});
// 创建PostgreSQL连接池，使用提供的数据库URL

const SCHEMA_PATH = 'schema';
// 定义模式路径常量，用于构建资源URI

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // 设置处理ListResources请求的处理程序，用于列出可用的资源（数据库表）
  const client = await pool.connect();
  // 从连接池获取数据库连接
  try {
    const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    // 查询数据库中public模式下的所有表名
    return {
      resources: result.rows.map(row => ({
        uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
        // 为每个表构建资源URI
        mimeType: 'application/json',
        // 设置资源的MIME类型为JSON
        name: `"${row.table_name}" database schema`
        // 设置资源的显示名称
      }))
    };
    // 将每个表转换为MCP资源对象并返回，包含URI、MIME类型和名称
  } finally {
    client.release();
    // 释放数据库连接回连接池，确保无论成功还是失败都会释放
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  // 设置处理ReadResource请求的处理程序，用于读取特定资源（表结构）的内容
  const resourceUrl = new URL(request.params.uri);
  // 从请求参数中解析资源URL

  const pathComponents = resourceUrl.pathname.split('/');
  // 分割URL路径为组件数组
  const schema = pathComponents.pop();
  // 获取最后一个路径组件（应该是schema）
  const tableName = pathComponents.pop();
  // 获取倒数第二个路径组件（应该是表名）

  if (schema !== SCHEMA_PATH) {
    throw new Error('Invalid resource URI');
  }
  // 验证schema路径是否正确，不正确则抛出错误

  const client = await pool.connect();
  // 从连接池获取数据库连接
  try {
    const result = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', [tableName]);
    // 查询指定表的列名和数据类型

    return {
      contents: [
        {
          uri: request.params.uri,
          // 设置资源URI
          mimeType: 'application/json',
          // 设置内容的MIME类型为JSON
          text: JSON.stringify(result.rows, null, 2)
          // 将查询结果格式化为JSON字符串，缩进为2个空格
        }
      ]
    };
    // 返回表结构信息，格式化为JSON字符串
  } finally {
    client.release();
    // 释放数据库连接回连接池
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  // 设置处理ListTools请求的处理程序，用于列出服务器提供的工具
  return {
    tools: [
      {
        name: 'query',
        // 工具名称
        description: 'Run a read-only SQL query',
        // 工具描述
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string' }
            // 定义sql参数为字符串类型
          }
        }
        // 定义工具输入参数的JSON Schema
      }
    ]
  };
  // 返回工具列表，此服务器只提供一个"query"工具，用于执行只读SQL查询
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  // 设置处理CallTool请求的处理程序，用于执行客户端请求的工具
  if (request.params.name === 'query') {
    // 检查请求的工具名称是否为"query"
    const sql = request.params.arguments?.sql as string;
    // 从请求参数中获取SQL查询语句

    const client = await pool.connect();
    // 从连接池获取数据库连接
    try {
      await client.query('BEGIN TRANSACTION READ ONLY');
      // 开始只读事务，确保不会修改数据库
      const result = await client.query(sql);
      // 执行SQL查询
      return {
        content: [
          {
            type: 'text',
            // 设置返回内容类型为文本
            text: JSON.stringify(result.rows, null, 2)
            // 将查询结果格式化为JSON字符串，缩进为2个空格
          }
        ],
        isError: false
        // 表示执行成功，没有错误
      };
      // 返回查询结果，格式化为JSON字符串
    } catch (error) {
      throw error;
      // 出错时抛出异常
    } finally {
      client.query('ROLLBACK').catch(error => console.warn('Could not roll back transaction:', error));
      // 回滚事务，确保不会有任何改变被提交到数据库
      // 即使回滚失败也只是警告，不会中断程序

      client.release();
      // 释放数据库连接回连接池
    }
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
  // 如果请求的工具名称不是"query"，则抛出未知工具错误
});

async function runServer() {
  // 定义运行服务器的异步函数
  const transport = new StdioServerTransport();
  // 创建标准输入/输出传输实例，用于通信
  await server.connect(transport);
  // 将服务器连接到传输层，开始监听请求
}

runServer().catch(console.error);
// 运行服务器，捕获并打印任何错误
