function MyLink(m,zdm,value){
    var MyID=getObj("mytext_"+m+"_id").value;
    if (zdm=="id"){
       var MyURL='BBmain.aspx?bid=1364&dqmenuid='+MyID+"&m_name="+getObj("mytext_"+m+"_m_name").value;
       openModal(MyURL);
    }
    else if (zdm=="m_counter"){
       var MyURL='BBmain.aspx?bid=1366&dqmenuid='+MyID+'&menumc='+getObj("mytext_"+m+"_m_name").value;
       openWin(MyURL);
    }
    else if (zdm=="mymove"){
       openModal('BBmain.aspx?bid=2824&treevar1='+MyID+'&treevar2='+getObj("mytext_"+m+"_m_name").value ,380,500)
       MyForm.submit();
    }
    else if (zdm=="myhlp"){openModal('BBmain.aspx?bid=2842&MyBBeditid='+MyID ,680,600)}
    else if (zdm=="mysm"){openModal('BBmain.aspx?bid=3193&MyBBeditid='+MyID ,680,600)}
    else if (zdm=="rtx"){
       var MyURL='BBmain.aspx?bid=2831&menuid1='+MyID+'&menumc='+getObj("mytext_"+m+"_m_name").value+'&send_text=【'+getObj("mytext_"+m+"_m_name").value+'】有变化！'
       openModal(MyURL,460,300)
    }
    else if (zdm=="cxsq"){
       var MyURL='BBmain.aspx?bid=16159&dqmenuid='+MyID+"&m_name="+getObj("mytext_"+m+"_m_name").value;
       openModal(MyURL);
    }
    else if (zdm=="myshow"){
       openWin(getObj("mytext_"+m+"_m_asp").value);
    }
    else if (zdm=="flow_sz"){
       var MyURL='BBmain.aspx?bid=23505&dqmenuid='+MyID+"&m_name="+getObj("mytext_"+m+"_m_name").value;
       openModal(MyURL,500,500);
    }
 }
 
  
 