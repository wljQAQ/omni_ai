export const codeExamples = [
  //1
  {
    oldCode: `function MyLink(m,field,value) {{
  var ryid = getObj("mytext_"+m+"_id").value;
  var dqbm = getVal("dqbm");
  var MyURL = "bbMain.aspx?bid=6964&ryid="+ryid+"&dqbm="+dqbm;
  openWin(MyURL);
}}`,
    newCode: `function MyLink(e) {{
  // 直接从行数据中获取值，无需 DOM 操作
  this.$util.openWin({{
    pid: 6964,
    params: {{
      ryid: e.data.ryid,
      dqbm: e.data.dqbm
    }}
  }});
}}
`,
    transformationRules: ['Replace getObj with e.data', 'Convert URL string to structured params', 'Use this.$util.openWin'],
    patternType: 'basic_window_open'
  },
  //2
  {
    oldCode: `function MyLink(m,field,value) {{
  if (field === "detail") {{
    var id = getObj("mytext_"+m+"_id").value;
    var name = getObj("mytext_"+m+"_name").value;
    var MyURL = "detail.aspx?bid=1234&id="+id+"&name="+name;
    openModal(MyURL, 800, 600);
  }}
}}`,
    newCode: `function MyLink(e) {{
  // 使用 colDef.field 判断列
  if (e.colDef.field === "detail") {{
    this.$util.openModal({{
      pid: 1234,
      params: {{
        id: e.data.id,
        name: e.data.name
      }},
      option: {{
        width: 800,
        height: 600
      }}
    }});
  }}
}}`,
    transformationRules: ['Replace field string comparison with e.colDef.field', 'Use openModal with structured params'],
    patternType: 'conditional_modal'
  },
  //3
  {
    oldCode: `function MyLink(m,field,value) {{
  if (field === "edit") {{
    var id = getObj("mytext_"+m+"_id").value;
    if (!id) return;
    var type = getVal("type");
    var status = getObj("mytext_"+m+"_status").value;
    if (status === "1") {{
      var MyURL = "edit.aspx?bid=5678&id="+id+"&type="+type;
      openWin(MyURL);
    }}
  }}
}}`,
    newCode: `function MyLink(e) {{
  // 使用现代条件判断和数据获取方式
  if (e.colDef.field === "edit") {{
    const {{ id, status }} = e.data;
    if (!id) return;
    
    if (status === "1") {{
      this.$util.openWin({{
        pid: 5678,
        params: {{
          id,
          type: e.data.type
        }}
      }});
    }}
  }}
}}`,
    transformationRules: ['Replace field string comparison with e.colDef.field', 'Use openModal with structured params'],
    patternType: 'conditional_modal'
  }, 
  //4
  {
    oldOld: `function MyLink(m,field,value){
    var sskhid=getObj("mytext_"+m+"_sskhid").value;
    var sskhdm=getObj("mytext_"+m+"_sskhdm").value;
    var sskhmc=getObj("mytext_"+m+"_sskhmc").value;
    var ty=getObj("ty").value;
    var ssty=getObj("ssty").value;
    var ksrq=getObj("ksrq").value;
    var jsrq=getObj("jsrq").value;
    var khid=getObj("khid").value;
    var sjkhfl=getObj("sjkhfl").value;
    var xjkhfl=getObj("xjkhfl").value;
    var hty=getObj("hty").vlaue;
    var cw = getObj("cw").value;
    var cwtzid = getObj("cwtzid").value;
    var xjkhid=getObj("mytext_"+m+"_khid").value;
    var kfbh=getObj("kkfbh").value;
    var xzkfbh=getObj("xzkfbh").value;
    var hztj=getObj("hztj").value;
    var qtlx=getObj("qtlx").value;
    var xzsplb=getObj("xzsplb").value;
    var ssplb=getObj("ssplb").value;
    var tshh=getObj("tshh").value;
    var djlb=getObj("djlb").value;
    var dzbbpx=getObj("dzbbpx").value;
    var tssplb=getObj("tssplb").value;
    var tstjtj=getObj("tstjtj").value;
    var bid="26033";
    if ( sskhid==xjkhid ){
        var cxtj ="and a.gxid="+sskhid ;
        hztj="a.khid";
    }else{
        var cxtj="and a.gxid="+sskhid+" and b.gxid="+xjkhid+" ";
        hztj="a.khid";
        bid="26034";
        //sskhid=xjkhid;
    }
    var tj="&ty"+ty+"&ssty="+ssty+"&ksrq="+ksrq+"&khid="+xjkhid+"&sjkhfl="+sjkhfl+"&xjkhfl="+xjkhfl+"&hty="+hty+"&jsrq="+jsrq+"&sskhid="+sskhid+"&MyBBisfind=yes ";
      tj += "&kkfbh="+kfbh+"&kfbh="+kfbh+"&xzkfbh="+xzkfbh+"&hztj="+hztj+"&qtlx="+qtlx+"&tssplb="+tssplb+"&tstjtj="+tstjtj+" ";
      tj += "&cxtj="+cxtj+"&tshh="+tshh+"&xzsplb="+xzsplb+"&ssplb="+ssplb+"&lsdjlb="+djlb+"&dzbbpx="+dzbbpx+" "; 
    if (field=='khdm'){
      var MyURL="bbmain.aspx?bid=26030"+tj+"&cw="+cw+"&cwtzid="+cwtzid+" ";
      openWin(MyURL); 
    }if (field=='khmc'){
      var MyURL="bbmain.aspx?bid="+bid+""+tj+"&cw="+cw+"&cwtzid="+cwtzid+"&khmc="+value;
      openWin(MyURL); 
    }
}`,
    newCode: `
      const obj = this.commonTable.params.bizData.params;
  let pid = '';
  let cxtj = '';
  let hztj = obj.hztj;
  let params = {};

  //逻辑处理参数
  if (type == 'khdm') {
    pid = '26030';
  } else {
    pid = e.data.sskhid == e.data.xjkhid ? '26033' : '26034';
    cxtj =
      e.data.sskhid == e.data.xjkhid
        ? ' and a.gxid=' + e.data.sskhid + ' '
        : ' and a.gxid=' + e.data.sskhid + ' and b.gxid=' + e.data.xjkhid + ' ';
    hztj = 'a.khid';
    params.khmc = e.data.khmc;
    params.dataFlag = true;
  }

  //逻辑处理多选开发编号传值
  const kfbhArray = this.state.getKfbh;
  let kfbh = obj.kkfbh;
  let result = kfbhArray.filter(obj => kfbh.includes(obj.value));
  let concatenatedString = result.reduce((accumulator, currentObject, index, array) => {
    if (index === array.length - 1) {
      return accumulator + currentObject.label;
    }
    return accumulator + currentObject.label + ',';
  }, '');

  //构造参数
  params.ty = obj.ty;
  params.ssty = obj.ssty;
  params.ksrq = obj.ksrq;
  params.jsrq = obj.jsrq;
  params.sjkhfl = obj.sjkhfl;
  params.xjkhfl = obj.xjkhfl;
  params.hty = obj.hty;
  params.kkfbh = obj.kkfbh;
  params.kfbh = obj.kkfbh;
  params.xzkfbh = concatenatedString == '' ? '全部' : concatenatedString;
  params.qtlx = obj.qtlx;
  params.tssplb = obj.tssplb;
  params.tstjtj = obj.tstjtj;
  params.tshh = obj.tshh;
  params.lsdjlb = obj.djlb;
  params.dzbbpx = obj.dzbbpx;
  params.cw = obj.cw;
  params.cwtzid = obj.cwtzid;
  params.cxtj = cxtj;
  params.hztj = hztj;
  params.khid = e.data.khid;
  params.sskhid = e.data.sskhid;

  //跳转
  this.$util.openWin({ pid: pid, props: params });
    `
  },
  //5
  {
    oldCode: `function MyLink(m,filed,value)
{
   var kfbh=getObj("kfbh").value;
   var khfl=getObj("mytext_"+m+"_khfl").value;
   var ksrq=getObj("ksrq").value;
   var jsrq=getObj("jsrq").value; 
   var spdlid=getObj("spdlid").value;
   var qyfl=getObj("qyfl").value;     

   if (filed=='fldm')
   {
       var MyURL="bbmain.aspx?bid=4984&khbbs=fldm&kfbh="+kfbh+"&khfl="+khfl+"&ksrq="+ksrq+"&jsrq="+jsrq+"&spdlid="+spdlid+"&qyfl="+qyfl;
       openWin(MyURL);
   }
   else if(filed=='flmc')
   {
       var MyURL="bbmain.aspx?bid=5311&khbbs=flmc&kfbh="+kfbh+"&khfl="+khfl+"&ksrq="+ksrq+"&jsrq="+jsrq+"&spdlid="+spdlid;
       openWin(MyURL);
   }
   else if(filed=='sl')
   {
       var MyURL="bbmain.aspx?bid=4986&&khbbs=sl&kfbh="+kfbh+"&khfl="+khfl+"&ksrq="+ksrq+"&jsrq="+jsrq+"&spdlid="+spdlid;
       openWin(MyURL);
   }
   else if(filed=='je')
   {
       var MyURL="bbmain.aspx?bid=4987&kfbh="+kfbh+"&khfl="+khfl+"&ksrq="+ksrq+"&jsrq="+jsrq+"&spdlid="+spdlid;
       openWin(MyURL);
   }
}`,
    newCode: `
function MyLink(e, type) {
  let pid = '';
  let khbbs = '';
  //表单参数
  const obj = this.commonTable.params.bizData.params;
  switch (type) {
    case 'fldm':
      pid = '4984';
      khbbs = 'fldm';
      break;
    case 'flmc':
      pid = '5311';
      khbbs = 'flmc';
      break;
    case 'sl':
      pid = '4986';
      khbbs = 'sl';
      break;
    case 'je':
      pid = '4987';
      khbbs = 'je';
      break;
  }
  this.$util.openWin({
    pid: pid,
    params: {
      ksrq: obj.ksrq,
      jsrq: obj.jsrq,
      kfbh: obj.kfbh,
      qyfl: obj.qyfl,
      spdlid: obj.spdlid,
      khfl: e.data.khfl,
      khbbs: khbbs
    }
  });
}

`
  }
];
