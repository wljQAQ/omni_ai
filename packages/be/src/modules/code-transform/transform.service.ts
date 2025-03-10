import { writeFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';

import { parse } from '@babel/parser';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { connect, query } from 'mssql';

import { DeepseekModel } from '@/core/models/deepseek';
import { ModelProvider } from '@/core/models/model.provider';
import { getTestDataDir } from '@/utils';

@Injectable()
export class TransformService {
  constructor(private readonly modelProvider: ModelProvider) {
    // this.connectDB();
    //吧 bid mylink 写入到文件中省的要一直去数据库查询
    // writeFileSync(getTestDataDir() + 'test.js', `export const test = '111';`);
    // console.log(2224);
  }

  async transformReport(message: Array<HumanMessage | SystemMessage>) {
    const model = this.modelProvider.createModel('deepseek');

    return model.invoke(message);
  }

  // 获取bbcode并写入到本地文件中省的每次都去查询
  async getBBCodeByBids() {
    const result = await query`SELECT bid,myFunc from t_rltable WHERE myFunc LIKE '%MyLink%'`;
    // const startIdx = Math.floor(Math.random() * 999);
    // const record = result.recordset.slice(startIdx, startIdx + 1);
    const record = result.recordset;

    const jserrbid = [];

    record.forEach(item => {
      item.myFunc = item.myFunc.replace(/\^/g, `"`);

      try {
        const ast = parse(item.myFunc, {
          attachComment: false
        });

        const mylinkDec = ast.program.body.find(i => i.type === 'FunctionDeclaration' && i.id.name === 'MyLink');

        const { start, end } = mylinkDec;

        item.myFunc = item.myFunc.substring(start, end);
      } catch (error) {
        jserrbid.push(item.bid);
        item.myFunc = '';
      }
    });

    console.log(jserrbid, 'jserrbid');

    writeFileSync(getTestDataDir() + 'test.js', `export const test = ${JSON.stringify(record.filter(i => i.myFunc))};`);
    return record;
  }

  async connectDB() {
    try {
      const option = {
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        database: process.env.MSSQL_DATABASE,
        server: process.env.MSSQL_SERVER,
        options: {
          encrypt: false
        }
      };

      await connect(option);
    } catch (error) {
      console.log(error, '连接失败');
    }

    // return 1;

    // const result = await pool.request().query('select * from bb_code');
    // return result.recordset;
  }
}
