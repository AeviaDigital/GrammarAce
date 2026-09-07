
// ── HISTORY SCREEN ────────────────────────────────────────────────────────────
function HistoryScreen(p){
  var fSt=React.useState("all"),   filter=fSt[0],    setFilter=fSt[1];
  var rSt=React.useState("all"),   rFilter=rSt[0],   setRFilter=rSt[1];
  var exSt=React.useState(null),   expanded=exSt[0], setExpanded=exSt[1];
  var dfSt=React.useState(""),     dateFrom=dfSt[0], setDateFrom=dfSt[1];
  var dtSt=React.useState(""),     dateTo=dtSt[0],   setDateTo=dtSt[1];
  var paSt=React.useState(function(){return loadPaused(p.userId);}),paused=paSt[0],setPaused=paSt[1];
  var history=loadHistory(p.userId).slice().reverse();

  function setPreset(preset){
    var now=new Date();
    function pad(n){return String(n).padStart(2,"0");}
    function fmt(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
    if(preset==="all"){setDateFrom("");setDateTo("");return;}
    if(preset==="today"){var t=fmt(now);setDateFrom(t);setDateTo(t);return;}
    if(preset==="week"){var mon=new Date(now);mon.setDate(now.getDate()-now.getDay()+1);setDateFrom(fmt(mon));setDateTo(fmt(now));return;}
    if(preset==="month"){var first=new Date(now.getFullYear(),now.getMonth(),1);setDateFrom(fmt(first));setDateTo(fmt(now));return;}
  }

  var filtered=history.filter(function(h){
    if(filter!=="all"&&h.subject!==filter) return false;
    if(rFilter==="correct"&&!h.correct) return false;
    if(rFilter==="wrong"&&h.correct) return false;
    if(dateFrom){try{if(new Date(h.date)<new Date(dateFrom)) return false;}catch(e){}}
    if(dateTo){try{var to=new Date(dateTo);to.setHours(23,59,59,999);if(new Date(h.date)>to) return false;}catch(e){}}
    return true;
  });

  function fmt2(iso){
    try{var d=new Date(iso);return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});}catch(e){return "";}
  }

  function saveVersion(histIdx,studentAnswer,fb){
    var allHist=loadHistory(p.userId);
    var origIdx=allHist.length-1-histIdx;
    if(origIdx<0) return;
    var entry=allHist[origIdx];
    var versions=entry.versions||[];
    if(versions.length===0&&entry.studentAnswer){
      versions.push({version:1,date:entry.date,studentAnswer:entry.studentAnswer,writingFeedback:entry.writingFeedback,writingScore:entry.writingScore});
    }
    versions.push({version:versions.length+1,date:new Date().toISOString(),studentAnswer:studentAnswer,writingFeedback:fb,writingScore:fb&&fb.score!=null?fb.score:null});
    allHist[origIdx]=Object.assign({},entry,{versions:versions,studentAnswer:studentAnswer,writingFeedback:fb,writingScore:fb&&fb.score!=null?fb.score:null,correct:true});
    saveHistory(p.userId,allHist);
    if(p.onVersionSaved) p.onVersionSaved(allHist);
  }

  function deletePaused(id){
    if(!window.confirm("Remove this paused prompt?")) return;
    removePaused(p.userId,id);
    setPaused(loadPaused(p.userId));
  }

  function activePreset(){
    if(!dateFrom&&!dateTo) return "all";
    var now=new Date();
    function pad(n){return String(n).padStart(2,"0");}
    function fmt(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
    var today=fmt(now);
    if(dateFrom===today&&dateTo===today) return "today";
    var mon=new Date(now);mon.setDate(now.getDate()-now.getDay()+1);
    var first=new Date(now.getFullYear(),now.getMonth(),1);
    if(dateFrom===fmt(mon)&&dateTo===today) return "week";
    if(dateFrom===fmt(first)&&dateTo===today) return "month";
    return "custom";
  }
  var preset=activePreset();

  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"📋 Answer History")
    ),
    paused.length>0&&React.createElement("div",{style:cs({marginBottom:"16px",border:"1px solid "+ORANGE+"55",background:"rgba(255,159,28,.05)"})},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}},
        React.createElement("span",{style:{fontSize:"18px"}},"📌"),
        React.createElement("div",null,
          React.createElement("div",{style:{color:ORANGE,fontWeight:"800",fontSize:"13px"}},"Paused Writing Prompts"),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px"}},paused.length+" saved")
        )
      ),
      paused.map(function(pr,i){
        return React.createElement("div",{key:pr.id,style:{background:BG,borderRadius:"12px",padding:"10px 12px",marginBottom:i<paused.length-1?"8px":"0",border:"1px solid "+BORDER}},
          React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"700",marginBottom:"4px",lineHeight:"1.5"}},pr.question),
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"6px",flexWrap:"wrap",gap:"6px"}},
            React.createElement("div",null,
              React.createElement("span",{style:{color:ORANGE,fontSize:"10px",fontWeight:"700"}},"✏️ "+pr.topic),
              React.createElement("span",{style:{color:MUTED,fontSize:"10px",marginLeft:"8px"}},"Saved "+fmtDate(pr.savedAt))
            ),
            React.createElement("div",{style:{display:"flex",gap:"6px"}},
              React.createElement("button",{onClick:function(){p.onResume(pr);},style:bs("linear-gradient(135deg,"+ORANGE+","+GOLD+")",{color:BG,fontSize:"11px",padding:"6px 12px",borderRadius:"8px"})},"Resume"),
              React.createElement("button",{onClick:function(){deletePaused(pr.id);},style:bs(CARD,{border:"1px solid "+BORDER,color:MUTED,fontSize:"11px",padding:"6px 10px",borderRadius:"8px"})},"Remove")
            )
          )
        );
      })
    ),
    React.createElement("div",{style:cs({marginBottom:"12px"})},
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"9px"}},"FILTER BY DATE"),
      React.createElement("div",{style:{display:"flex",gap:"6px",marginBottom:"10px",flexWrap:"wrap"}},
        [["all","All Time"],["today","Today"],["week","This Week"],["month","This Month"]].map(function(item){
          var active=preset===item[0];
          return React.createElement("button",{key:item[0],onClick:function(){setPreset(item[0]);},style:{padding:"5px 12px",borderRadius:"20px",border:"1px solid "+(active?BLUE:BORDER),background:active?"rgba(67,97,238,.15)":"transparent",color:active?BLUE:MUTED,fontSize:"11px",fontWeight:"700",cursor:"pointer"}},item[1]);
        })
      ),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}},
        React.createElement("div",null,
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginBottom:"4px"}},"From"),
          React.createElement("input",{type:"date",value:dateFrom,onChange:function(e){setDateFrom(e.target.value);},style:{width:"100%",background:BG,border:"1px solid "+BORDER,borderRadius:"8px",padding:"7px 9px",color:WHITE,fontSize:"12px",colorScheme:"dark"}})
        ),
        React.createElement("div",null,
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginBottom:"4px"}},"To"),
          React.createElement("input",{type:"date",value:dateTo,onChange:function(e){setDateTo(e.target.value);},style:{width:"100%",background:BG,border:"1px solid "+BORDER,borderRadius:"8px",padding:"7px 9px",color:WHITE,fontSize:"12px",colorScheme:"dark"}})
        )
      )
    ),
    React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"8px"}},"FILTER BY SUBJECT"),
    React.createElement("div",{style:{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}},
      [{id:"all",icon:"",name:"All"}].concat(SUBJECTS).map(function(s){
        var label=s.icon?s.icon+" "+s.name:s.name;
        return React.createElement("button",{key:s.id,onClick:function(){setFilter(s.id);setExpanded(null);},style:{padding:"5px 12px",borderRadius:"20px",border:"1px solid "+(filter===s.id?GOLD:BORDER),background:filter===s.id?"rgba(255,209,102,.1)":"transparent",color:filter===s.id?GOLD:MUTED,fontSize:"11px",fontWeight:"700",cursor:"pointer"}},label);
      })
    ),
    React.createElement("div",{style:{display:"flex",gap:"6px",marginBottom:"10px"}},
      [["all","All Results"],["correct","Correct"],["wrong","Wrong"]].map(function(f){
        return React.createElement("button",{key:f[0],onClick:function(){setRFilter(f[0]);setExpanded(null);},style:{padding:"5px 12px",borderRadius:"20px",border:"1px solid "+(rFilter===f[0]?TEAL:BORDER),background:rFilter===f[0]?"rgba(6,214,160,.1)":"transparent",color:rFilter===f[0]?TEAL:MUTED,fontSize:"11px",fontWeight:"700",cursor:"pointer"}},f[1]);
      })
    ),
    React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginBottom:"10px"}},filtered.length+" result"+(filtered.length!==1?"s":"")+(filtered.length!==history.length?" (filtered from "+history.length+")":"")),
    filtered.length===0&&React.createElement("div",{style:{textAlign:"center",padding:"40px 0"}},
      React.createElement("div",{style:{fontSize:"44px",marginBottom:"10px"}},"📋"),
      React.createElement("p",{style:{color:MUTED,fontSize:"13px"}},history.length===0?"No history yet — start practising!":"No results match your filters.")
    ),
    filtered.map(function(h,i){
      var isExp=expanded===i;
      var subj=SUBJECTS.find(function(s){return s.id===h.subject;})||SUBJECTS[0];
      var isW=h.type==="writing";
      var versions=h.versions||[];
      var hasAnswer=!!(h.studentAnswer||(versions.length>0));
      var latestScore=versions.length>0?versions[versions.length-1].writingScore:h.writingScore;
      return React.createElement("div",{key:i,style:Object.assign(cs({marginBottom:"8px",padding:"12px 14px",cursor:"pointer"}),{border:"1px solid "+(h.correct?TEAL+"44":isW?PURPLE+"44":RED+"44")}),onClick:function(){setExpanded(isExp?null:i);}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"10px"}},
          React.createElement("span",{style:{fontSize:"18px",flexShrink:0}},h.correct?"✅":isW?"✏️":"❌"),
          React.createElement("div",{style:{flex:1,minWidth:0}},
            React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"700",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},h.question),
            React.createElement("div",{style:{display:"flex",gap:"6px",marginTop:"3px",flexWrap:"wrap"}},
              React.createElement("span",{style:{color:subj.col,fontSize:"10px",fontWeight:"700"}},subj.icon+" "+h.topic),
              h.stage&&React.createElement("span",{style:{color:PURPLE,fontSize:"10px"}},h.stage),
              isW&&latestScore!=null&&React.createElement("span",{style:{color:ORANGE,fontSize:"10px",fontWeight:"700"}},"Score: "+latestScore+"/10"+(versions.length>1?" (v"+versions.length+")":"")),
              isW&&!hasAnswer&&React.createElement("span",{style:{color:MUTED,fontSize:"10px",fontStyle:"italic"}},"No answer uploaded"),
              React.createElement("span",{style:{color:MUTED,fontSize:"10px"}},fmt2(h.date))
            )
          ),
          React.createElement("span",{style:{color:MUTED,fontSize:"14px",flexShrink:0}},isExp?"▲":"▼")
        ),
        isExp&&React.createElement("div",{style:{borderTop:"1px solid "+BORDER,marginTop:"10px",paddingTop:"10px"}},
          React.createElement("p",{style:{color:WHITE,fontSize:"13px",fontWeight:"600",marginBottom:"10px",lineHeight:"1.6"}},h.question),
          !isW&&h.options&&React.createElement("div",{style:{marginBottom:"10px"}},
            h.options.map(function(opt,oi){
              var isOk=oi===h.correctIndex, isWrong=oi===h.userAnswer&&!isOk;
              return React.createElement("div",{key:oi,style:{padding:"8px 11px",borderRadius:"10px",marginBottom:"5px",background:isOk?"rgba(6,214,160,.1)":isWrong?"rgba(239,68,68,.1)":"transparent",border:"1px solid "+(isOk?TEAL:isWrong?RED:BORDER),display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}},
                React.createElement("span",{style:{color:isOk?TEAL:isWrong?RED:MUTED,fontSize:"12px",fontWeight:isOk||isWrong?"700":"400",flex:1}},opt),
                React.createElement("div",{style:{display:"flex",gap:"5px",flexShrink:0}},
                  isOk&&React.createElement("span",{style:{background:TEAL,color:BG,borderRadius:"6px",padding:"2px 7px",fontSize:"10px",fontWeight:"800"}},"Correct"),
                  isWrong&&React.createElement("span",{style:{background:RED,color:WHITE,borderRadius:"6px",padding:"2px 7px",fontSize:"10px",fontWeight:"800"}},"Your answer")
                )
              );
            })
          ),
          !isW&&h.explanation&&React.createElement("div",{style:Object.assign(cs({}),{background:"rgba(255,209,102,.06)",border:"1px solid "+GOLD+"33"})},
            React.createElement("div",{style:{color:GOLD,fontSize:"11px",fontWeight:"800",marginBottom:"5px"}},"Explanation:"),
            React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.65",margin:0}},h.explanation)
          ),
          isW&&React.createElement("div",null,
            versions.length>0&&React.createElement("div",{style:{marginBottom:"10px"}},
              React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",marginBottom:"8px"}},"ANSWER VERSIONS ("+versions.length+")"),
              versions.slice().reverse().map(function(v,vi){
                var gc={Excellent:TEAL,Good:BLUE,Developing:ORANGE,"Needs Work":RED}[v.writingFeedback&&v.writingFeedback.grade]||PURPLE;
                return React.createElement("div",{key:vi,style:cs({marginBottom:"8px",border:"1px solid "+BORDER+"88",padding:"10px 12px"})},
                  React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}},
                    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px"}},
                      React.createElement("span",{style:{background:PURPLE,color:WHITE,borderRadius:"6px",padding:"2px 8px",fontSize:"10px",fontWeight:"800"}},"v"+v.version),
                      v.writingScore!=null&&React.createElement("span",{style:{background:gc+"22",color:gc,borderRadius:"6px",padding:"2px 8px",fontSize:"10px",fontWeight:"800"}},v.writingScore+"/10"),
                      v.writingFeedback&&v.writingFeedback.grade&&React.createElement("span",{style:{color:gc,fontSize:"10px",fontWeight:"700"}},v.writingFeedback.grade)
                    ),
                    React.createElement("span",{style:{color:MUTED,fontSize:"10px"}},fmt2(v.date))
                  ),
                  v.studentAnswer&&React.createElement("div",{style:{background:BG,borderRadius:"8px",padding:"8px 10px",marginBottom:v.writingFeedback?"8px":"0",border:"1px solid "+BORDER}},
                    React.createElement("div",{style:{color:ORANGE,fontSize:"10px",fontWeight:"700",marginBottom:"4px"}},"Written answer:"),
                    React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.7",margin:0,fontStyle:"italic"}},v.studentAnswer)
                  ),
                  v.writingFeedback&&React.createElement("div",null,
                    v.writingFeedback.praise&&React.createElement("div",{style:Object.assign(cs({marginBottom:"6px",padding:"8px 10px"}),{background:"rgba(6,214,160,.06)",border:"1px solid "+TEAL+"44"})},
                      React.createElement("div",{style:{color:TEAL,fontSize:"10px",fontWeight:"800",marginBottom:"3px"}},"What you did well:"),
                      React.createElement("p",{style:{color:WHITE,fontSize:"11px",lineHeight:"1.6",margin:0}},v.writingFeedback.praise)
                    ),
                    v.writingFeedback.improvements&&React.createElement("div",{style:Object.assign(cs({padding:"8px 10px"}),{background:"rgba(255,209,102,.05)",border:"1px solid "+GOLD+"33"})},
                      React.createElement("div",{style:{color:GOLD,fontSize:"10px",fontWeight:"800",marginBottom:"3px"}},"How to improve:"),
                      React.createElement("p",{style:{color:WHITE,fontSize:"11px",lineHeight:"1.6",margin:0}},v.writingFeedback.improvements)
                    )
                  )
                );
              })
            ),
            versions.length===0&&h.studentAnswer&&React.createElement("div",{style:cs({marginBottom:"8px",background:"rgba(255,159,28,.05)",border:"1px solid "+ORANGE+"33"})},
              React.createElement("div",{style:{color:ORANGE,fontSize:"11px",fontWeight:"800",marginBottom:"6px"}},"Your answer:"),
              React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.7",margin:0,fontStyle:"italic"}},h.studentAnswer),
              h.writingFeedback&&h.writingFeedback.praise&&React.createElement("div",{style:{marginTop:"8px",color:TEAL,fontSize:"11px"}},h.writingFeedback.praise)
            ),
            versions.length===0&&!h.studentAnswer&&React.createElement("p",{style:{color:MUTED,fontSize:"11px",fontStyle:"italic",marginBottom:"8px"}},"No answer uploaded yet."),
            React.createElement(WritingVersionPanel,{
              question:h.question,guidance:h.guidance||[],modelAnswer:h.modelAnswer||"",
              yearId:h.yearId||"year5",apiKey:p.apiKey,
              hasAnswer:hasAnswer,
              versionCount:versions.length||(h.studentAnswer?1:0),
              onVersion:function(sa,fb){
                saveVersion(i,sa,fb);
                setExpanded(null);
                setTimeout(function(){setExpanded(i);},50);
              }
            })
          )
        )
      );
    })
  );
}
