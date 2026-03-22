
// ── QUESTION SCREEN ───────────────────────────────────────────────────────────
function QuestionScreen(p){
  var q=p.q;
  var isW=q&&q.type==="writing";
  var isOk=p.answered&&q&&p.sel===q.correctIndex;
  var stage=STAGE_MAP[p.yearId]||"";
  var subj=SUBJECTS.find(function(s){return s.id===p.subjectId;})||SUBJECTS[0];
  function optStyle(i){
    var base={background:CARD,border:"2px solid "+BORDER,borderRadius:"12px",padding:"11px 14px",textAlign:"left",cursor:p.answered?"default":"pointer",color:WHITE,fontSize:"13px",fontWeight:"600",width:"100%",marginBottom:"8px",display:"block",transition:"all .15s"};
    if(!p.answered) return base;
    if(i===q.correctIndex) return Object.assign({},base,{background:"rgba(6,214,160,.12)",borderColor:TEAL});
    if(i===p.sel&&i!==q.correctIndex) return Object.assign({},base,{background:"rgba(239,68,68,.12)",borderColor:RED});
    return Object.assign({},base,{opacity:0.4});
  }
  return React.createElement("div",{style:{padding:"14px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .25s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}},
      React.createElement("button",{onClick:p.onExit,style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",fontWeight:"600",cursor:"pointer"}},"🏠 Home"),
      React.createElement("div",{style:{display:"flex",gap:"8px",alignItems:"center"}},
        p.cStreak>=3&&React.createElement("span",{style:{background:"rgba(255,159,28,.18)",color:ORANGE,borderRadius:"20px",padding:"2px 9px",fontSize:"12px",fontWeight:"800"}},"🔥 "+p.cStreak),
        p.timed&&!p.answered&&!isW&&React.createElement("div",{style:{width:"38px",height:"38px",borderRadius:"50%",border:"3px solid "+(p.timer<=10?RED:TEAL),display:"flex",alignItems:"center",justifyContent:"center",color:p.timer<=10?RED:WHITE,fontWeight:"900",fontSize:"13px"}},p.timer),
        React.createElement("span",{style:{color:MUTED,fontSize:"12px",fontWeight:"700"}},p.qNum+"/"+p.qTotal)
      )
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"12px",overflow:"hidden"}},
      React.createElement("div",{style:{background:subj.grad,width:(p.qNum/p.qTotal*100)+"%",height:"100%",transition:"width .3s"}})
    ),
    React.createElement("div",{style:{display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap"}},
      React.createElement("span",{style:{background:subj.col+"22",color:subj.col,borderRadius:"20px",padding:"2px 11px",fontSize:"11px",fontWeight:"800"}},subj.icon+" "+subj.name),
      q&&q.topic&&React.createElement("span",{style:{background:CARD,color:MUTED,borderRadius:"20px",padding:"2px 11px",fontSize:"11px"}},q.topic),
      stage&&React.createElement("span",{style:{background:"rgba(123,47,190,.15)",color:PURPLE,borderRadius:"20px",padding:"2px 11px",fontSize:"11px",fontWeight:"700"}},stage)
    ),
    p.error&&React.createElement("div",{style:{textAlign:"center",padding:"40px 16px"}},
      React.createElement("div",{style:{fontSize:"44px",marginBottom:"10px"}},"⚠️"),
      React.createElement("p",{style:{color:RED,fontWeight:"800",fontSize:"14px",marginBottom:"8px"}},"Could not load question"),
      React.createElement("p",{style:{color:MUTED,fontSize:"12px",lineHeight:"1.6",margin:"0 0 18px"}},p.error),
      React.createElement("button",{onClick:p.onRetry,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{color:BG,padding:"11px 22px"})},"Try Again")
    ),
    !p.error&&p.loading&&React.createElement("div",{style:{textAlign:"center",padding:"50px 0"}},
      React.createElement("div",{style:{fontSize:"56px",lineHeight:1,animation:"float 2s ease-in-out infinite",filter:"drop-shadow(0 0 14px rgba(255,209,102,.4))"}},"🦉"),
      React.createElement("p",{style:{color:MUTED,marginTop:"12px",fontSize:"13px",fontWeight:"600"}},"Archie is crafting your question..."),
      React.createElement("div",{style:{display:"flex",gap:"6px",justifyContent:"center",marginTop:"10px"}},[0,1,2].map(function(i){return React.createElement("div",{key:i,style:{width:"7px",height:"7px",borderRadius:"50%",background:GOLD,animation:"pulse 1s "+(i*.2)+"s ease-in-out infinite"}});}))
    ),
    !p.error&&!p.loading&&q&&React.createElement("div",null,
      React.createElement("div",{style:cs({marginBottom:"12px"})},
        React.createElement("p",{style:{color:WHITE,fontSize:"14px",fontWeight:"700",lineHeight:"1.7",margin:0}},q.question)
      ),
      isW&&React.createElement(WritingAnswerPanel,{
        question:q.question,guidance:q.guidance,modelAnswer:q.modelAnswer,
        yearId:p.yearId,apiKey:p.apiKey,
        onFeedback:p.onWritingFeedback,
        onPause:p.onPause,
        onSkip:p.onFinish,
        onDone:p.onFinish
      }),
      !isW&&React.createElement("div",null,
        !p.answered&&React.createElement("button",{onClick:p.onHint,style:{background:"none",border:"1px dashed "+PURPLE,color:PURPLE,borderRadius:"10px",padding:"7px 13px",fontSize:"12px",fontWeight:"700",cursor:"pointer",marginBottom:"12px",display:"block",textAlign:"left",width:"100%",lineHeight:"1.5"}},p.hintShown?("💡 "+(q.hint||"")):"💡 Need a hint? Tap to reveal"),
        (q.options||[]).map(function(opt,i){
          return React.createElement("button",{key:i,onClick:function(){if(!p.answered)p.onAnswer(i);},style:optStyle(i)},
            opt,
            p.answered&&i===q.correctIndex&&React.createElement("span",{style:{float:"right",color:TEAL,fontWeight:"900"}},"✓ Correct"),
            p.answered&&i===p.sel&&i!==q.correctIndex&&React.createElement("span",{style:{float:"right",color:RED,fontWeight:"900"}},"✗ Your answer")
          );
        }),
        p.answered&&React.createElement("div",{style:Object.assign(cs({marginBottom:"12px"}),{border:"1px solid "+(isOk?TEAL:RED),background:isOk?"rgba(6,214,160,.06)":"rgba(239,68,68,.06)"})},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}},
            React.createElement("span",{style:{fontSize:"18px"}},isOk?"🎉":p.sel===-1?"⏰":"💭"),
            React.createElement("span",{style:{color:isOk?TEAL:RED,fontWeight:"900",fontSize:"14px"}},isOk?"Correct!":p.sel===-1?"Time's up!":"Not quite...")
          ),
          React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.65",margin:0}},q.explanation)
        ),
        p.answered&&React.createElement("button",{onClick:p.onNext,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"14px",padding:"13px"})},p.qNum>=p.qTotal?"See My Results":"Next Question")
      )
    )
  );
}

// ── RESULTS SCREEN ────────────────────────────────────────────────────────────
function ResultsScreen(p){
  var pct=Math.round(p.correct/p.total*100);
  var emoji=pct>=90?"🌟":pct>=75?"🎉":pct>=60?"👍":pct>=40?"💪":"📚";
  var msg=pct>=90?"Outstanding!":pct>=75?"Excellent!":pct>=60?"Good Work!":pct>=40?"Keep Going!":"Keep Practising";
  var col=pct>=90?GOLD:pct>=75?TEAL:pct>=60?BLUE:pct>=40?ORANGE:MUTED;
  return React.createElement("div",{style:{padding:"24px",maxWidth:"480px",margin:"0 auto",textAlign:"center",paddingTop:"36px",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{fontSize:"60px",marginBottom:"8px",animation:"pop .4s ease"}},emoji),
    React.createElement("h2",{style:{color:col,fontSize:"26px",fontWeight:"900",margin:"0 0 4px"}},msg),
    React.createElement("p",{style:{color:MUTED,fontSize:"12px",marginBottom:"22px"}},"Session complete · "+(p.subjectName||"")),
    React.createElement("div",{style:cs({marginBottom:"14px"})},
      React.createElement("div",{style:{fontSize:"56px",fontWeight:"900",color:col,lineHeight:1,margin:"6px 0"}},pct+"%"),
      React.createElement("div",{style:{color:MUTED,fontSize:"13px"}},p.correct+" correct out of "+p.total),
      React.createElement("div",{style:{background:BORDER,borderRadius:"6px",height:"9px",marginTop:"12px",overflow:"hidden"}},
        React.createElement("div",{style:{background:col,width:pct+"%",height:"100%",borderRadius:"6px",transition:"width 1s ease .3s"}})
      )
    ),
    React.createElement("div",{style:Object.assign(cs({marginBottom:"18px"}),{background:"linear-gradient(135deg,rgba(255,209,102,.1),rgba(255,159,28,.08)"})},
      React.createElement("div",{style:{color:GOLD,fontSize:"34px",fontWeight:"900"}},"+"+p.xpEarned+" XP"),
      React.createElement("div",{style:{color:MUTED,fontSize:"12px",marginTop:"2px"}},"earned this session")
    ),
    React.createElement("button",{onClick:p.onRetry,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",marginBottom:"8px",color:BG})},"Try Again"),
    React.createElement("button",{onClick:p.onHistory,style:bs(PURPLE,{width:"100%",marginBottom:"8px",color:WHITE})},"Review This Session"),
    React.createElement("button",{onClick:p.onHome,style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:WHITE})},"Home")
  );
}
