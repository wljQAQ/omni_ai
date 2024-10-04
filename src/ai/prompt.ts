import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

export const getConvertOldCodePrompt = () => {
  return ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(`
          你是一位专业的前端高级工程师，精通 JavaScript 代码重构和现代化。
          因为旧代码是在很久之前写的，所以以前大部分都是直接操作dom的
          你的任务是将旧的 JavaScript 代码转换为新的、更现代的形式，并且将旧代码的作用域改成新的作用域。
          只需处理 MyLink 方法及其引用的其他方法。
      
          旧的作用域如下：
          /**
           * 点击表格链接处理事件
           * @param m 当前第几行   再新环境下应该不使用了，因为新环境不需要去获取dom然后拿到数据
           * @param field 当前列名称
           * @params value 当前点击的link的值
          */
          function MyLink(m,field,value){{
            // 里面有很多内置的方法现在 不需要使用的
            // getObj 用于获取dom元素 作用是获取dom元素 然后拿到对于的单元格的值
            // getVal 用于获取dom元素的值 作用是获取dom元素的值  跟getObj 差不多 他就是 getObj().value的缩写
            // openWin()用于打开一个新的窗口 需要改成window.open
          }}
      
          新的作用域如下:
          /**
           * 点击表格链接处理事件
           * @param {{Api}} e 表格ag-grid的作用域
          */
      
          interface Api{{
            value: any; //当前单元格的值
            data:Object; //当前行数据
            colDef:Object; //当前列的配置  colDef.field可以拿到当前列名称
          }}
          function MyLink(e){{
          }}
      
          在转换过程中，请遵循以下原则：
          1. 使用现代 JavaScript 语法和最佳实践。
          2. 保持代码的功能不变，但提高其可读性和可维护性。
          3. 只关注需要转换的方法，不要修改其他部分。
          4. 提供简洁的解释，说明你所做的更改。
      
          我提供几个例子你参考  比如
      
          第一个例子如下：
      
          旧：
           function MyLink(m,field,value){{
            var ryid=getObj("mytext_"+m+"_id").value;
            var MyURL="";
            MyURL="bbMain.aspx?bid=6964&ryid="+ryid+"&ryxm="+value+"&MyBBeditid="+ryid+"&dqtz="+getVal("dqtz");
            openWin(MyURL);
          }}
      
          function FaceManage(){{
              openWin("bbMain.aspx?bid=25457");
          }}
      
          转为
      
          新：
          function MyLink(e){{
              const ryid = e.data.ryid;
              const MyURL = "";
              MyURL = "bbMain.aspx?bid=6964&ryid=" + ryid + "&ryxm=" + e.data.ryxm + "&MyBBeditid=" + ryid + "&dqtz=" + e.data.dqtz;
              window.open(MyURL);
          }}
      
          第二个例子如下：
      
          旧：
            function MyLink(m,field,value){{
              if (zdm == 'mymove') {{
                  var MyURL = 'BBmain.aspx?bid=19024&treevar1=' + getObj('mytext_' + m + '_id').value + '&treevar2=' + getObj('mytext_' + m + '_mc').value;
                  var rtn = openModal(MyURL, 307, 550, 'ifra');
                  if (typeof rtn == 'string' && rtn == 'iframe') return;
                  setData('ifra', rtn);
              }}
            }}
      
          转为
      
          新：
          function MyLink(e){{
            //点击列mymove
            if(e.colDef.field == 'mymove'){{
              const MyURL = 'BBmain.aspx?bid=19024&treevar1=' + e.data.ryid + '&treevar2=' + e.data.ryxm;
              // 打开弹窗
              this.$util.openModal({{
                iframeSrc:MyURL,
                option:{{
                  width:307,
                  height:550
                }}
              }});
            }}
          }}
        `),
    HumanMessagePromptTemplate.fromTemplate(`
          请将以下旧代码转换为新的形式，只处理 MyLink 方法：{oldCode}
          并且再代码中添加注释
          Please do not reply with any text other than the code, and do not use markdown syntax
        `)
  ]);
};
