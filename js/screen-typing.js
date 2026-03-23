

// ── KEYBOARD DIAGRAM ──────────────────────────────────────────────────────────
var FINGER_MAP={
  // Top row
  q:"lp",w:"lr",e:"lm",r:"li",t:"li",y:"ri",u:"ri",i:"rm",o:"rr",p:"rp",
  // Home row
  a:"lp",s:"lr",d:"lm",f:"li",g:"li",h:"ri",j:"ri",k:"rm",l:"rr",";":"rp",
  // Bottom row
  z:"lp",x:"lr",c:"lm",v:"li",b:"li",n:"ri",m:"ri",",":"rm",".":"rr","/":"rp",
  " ":"thumb"
};
var FINGER_COLORS={
  lp:{bg:"#D6E8FF",border:"#3B7DD8",text:"#0C2D6B"},
  lr:{bg:"#FFF3CD",border:"#D4900A",text:"#5C3A00"},
  lm:{bg:"#D4EDDA",border:"#2E7D46",text:"#0D3B1F"},
  li:{bg:"#F3D9FF",border:"#8A38C8",text:"#3A0066"},
  ri:{bg:"#FFE0CC",border:"#CC5500",text:"#5C1F00"},
  rm:{bg:"#D0F0F8",border:"#0A89B0",text:"#003A4F"},
  rr:{bg:"#FFDDE8",border:"#C02060",text:"#500020"},
  rp:{bg:"#E8E8E8",border:"#555555",text:"#111111"},
  thumb:{bg:"#F0F0F0",border:"#888888",text:"#333333"}
};
var FINGER_LABELS={lp:"LP",lr:"LR",lm:"LM",li:"LI",ri:"RI",rm:"RM",rr:"RR",rp:"RP",thumb:""};
var HOME_KEYS=["a","s","d","f","g","h","j","k","l",";"];
var BUMP_KEYS=["f","j"];
var KB_ROWS=[
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l",";"],
  ["z","x","c","v","b","n","m",",",".","/"]
];

function KeyboardDiagram(p){
  var nextChar=p.nextChar?(p.nextChar.toLowerCase()):"";
  var isTouch=p.isTouch;
  var s=isTouch?24:28; // key size
  var gap=isTouch?3:4;
  var fsKey=isTouch?9:10;
  var fsFinger=isTouch?6:7;

  function Key(props){
    var ch=props.ch;
    var finger=FINGER_MAP[ch]||"rp";
    var col=FINGER_COLORS[finger];
    var isHome=HOME_KEYS.indexOf(ch)>=0;
    var isBump=BUMP_KEYS.indexOf(ch)>=0;
    var isNext=nextChar===ch&&!isTouch;
    var isWide=props.wide;
    var w=isWide?(s*1.5+gap):s;
    var label=props.label||ch.toUpperCase();
    return React.createElement("div",{
      style:{
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        width:w+"px",height:s+"px",borderRadius:"4px",
        background:isNext?"#8A38C8":col.bg,
        border:(isHome?"2px":"1.5px")+" solid "+(isNext?"#5A18A8":col.border),
        color:isNext?"#fff":col.text,
        fontSize:fsKey+"px",fontWeight:"500",flexShrink:0,position:"relative",
        animation:isNext?"kbPulse 0.7s ease-in-out infinite":"none",
        boxShadow:isNext?"0 0 0 3px "+col.border+"44":"none",
        transition:"all .15s"
      }
    },
      React.createElement("span",{style:{fontSize:fsKey+"px",lineHeight:1}},label),
      !isTouch&&FINGER_LABELS[finger]&&React.createElement("span",{style:{fontSize:fsFinger+"px",lineHeight:1,opacity:0.7}},FINGER_LABELS[finger]),
      isBump&&React.createElement("div",{style:{position:"absolute",bottom:"3px",left:"50%",transform:"translateX(-50%)",width:"5px",height:"2px",borderRadius:"1px",background:"currentColor",opacity:0.5}})
    );
  }

  var rowOffsets=[s*0.35,s*0.52,s*0.75];

  return React.createElement("div",{style:{marginTop:"12px"}},
    // pulse keyframe via inline style hack
    React.createElement("style",null,"@keyframes kbPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.14);}}"),
    // Rows
    [0,1,2].map(function(ri){
      return React.createElement("div",{key:ri,style:{display:"flex",justifyContent:"center",gap:gap+"px",marginBottom:gap+"px",paddingLeft:rowOffsets[ri]+"px"}},
        KB_ROWS[ri].map(function(ch){
          return React.createElement(Key,{key:ch,ch:ch});
        })
      );
    }),
    // Space bar row
    React.createElement("div",{style:{display:"flex",justifyContent:"center",gap:gap+"px",marginTop:gap+"px"}},
      React.createElement("div",{style:{
        width:(s*6)+"px",height:s+"px",borderRadius:"4px",
        background:nextChar===" "?"#8A38C8":"#F0F0F0",
        border:"1.5px solid "+(nextChar===" "?"#5A18A8":"#888888"),
        color:nextChar===" "?"#fff":"#333",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:fsKey+"px",fontWeight:"500",
        animation:nextChar===" "?"kbPulse 0.7s ease-in-out infinite":"none"
      }},"Space — both thumbs")
    ),
    // Legend
    !isTouch&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:"5px",justifyContent:"center",marginTop:"10px"}},
      Object.keys(FINGER_COLORS).filter(function(f){return f!=="thumb";}).map(function(f){
        var col=FINGER_COLORS[f];
        return React.createElement("div",{key:f,style:{display:"flex",alignItems:"center",gap:"4px",fontSize:"10px",color:"#666"}},
          React.createElement("div",{style:{width:"18px",height:"14px",borderRadius:"3px",background:col.bg,border:"1.5px solid "+col.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:"500",color:col.text}},FINGER_LABELS[f]),
          f==="lp"?"L.Pinky":f==="lr"?"L.Ring":f==="lm"?"L.Mid":f==="li"?"L.Index":f==="ri"?"R.Index":f==="rm"?"R.Mid":f==="rr"?"R.Ring":"R.Pinky"
        );
      })
    ),
    isTouch&&React.createElement("div",{style:{textAlign:"center",fontSize:"10px",color:"#6B7A9E",marginTop:"6px"}},"Reference only — keyboard required to type")
  );
}

// ── YEAR NUMBER HELPER ───────────────────────────────────────────────────────
function yearNum(yearId){
  if(!yearId) return 5;
  var m=yearId.match(/(\d+)/);
  return m?parseInt(m[1]):5;
}

// ── TYPING TUTOR SCREEN ───────────────────────────────────────────────────────
function TypingTutorScreen(p){
  var hasKeyboard=(function(){
    var coarse=window.matchMedia&&window.matchMedia("(pointer:coarse)").matches;
    var touch=navigator.maxTouchPoints>0;
    var narrow=window.screen&&window.screen.width<768;
    return !(coarse&&touch&&narrow);
  })();

  var viewSt=React.useState("menu"),   view=viewSt[0],    setView=viewSt[1];
  var lsSt=React.useState(null),       lesson=lsSt[0],    setLesson=lsSt[1];
  var typSt=React.useState(""),        typed=typSt[0],    setTyped=typSt[1];
  var stSt=React.useState(null),       startTime=stSt[0], setStartTime=stSt[1];
  var finSt=React.useState(false),     finished=finSt[0], setFinished=finSt[1];
  var wpmSt=React.useState(0),         wpm=wpmSt[0],      setWpm=wpmSt[1];
  var accSt=React.useState(100),       accuracy=accSt[0], setAcc=accSt[1];
  var errSt=React.useState(0),         errors=errSt[0],   setErrors=errSt[1];
  var progSt=React.useState(function(){return loadTypingProgress(p.userId);}),progress=progSt[0],setProgress=progSt[1];
  var inputRef=React.useRef(null);

  function saveTypingProg(lessonId,newWpm,newAcc){
    var updated=Object.assign({},progress);
    var prev=updated[lessonId]||{bestWpm:0,bestAcc:0,attempts:0};
    updated[lessonId]={bestWpm:Math.max(prev.bestWpm,newWpm),bestAcc:Math.max(prev.bestAcc,newAcc),attempts:prev.attempts+1,lastDate:new Date().toISOString()};
    setProgress(updated);
    saveTypingProgress(p.userId,updated);
  }

  function startLesson(ls){
    setLesson(ls); setTyped(""); setStartTime(null); setFinished(false);
    setWpm(0); setAcc(100); setErrors(0); setView("lesson");
    setTimeout(function(){if(inputRef.current)inputRef.current.focus();},100);
  }

  function handleTyping(e){
    var val=e.target.value;
    if(finished) return;
    if(!startTime&&val.length===1) setStartTime(Date.now());
    setTyped(val);
    if(startTime){
      var elapsed=(Date.now()-startTime)/1000/60;
      var words=val.trim().split(/\s+/).length;
      setWpm(elapsed>0?Math.round(words/elapsed):0);
    }
    var errs=0;
    for(var i=0;i<val.length;i++){if(val[i]!==(lesson.text[i]||"")) errs++;}
    setErrors(errs);
    var acc=val.length>0?Math.round((1-errs/val.length)*100):100;
    setAcc(Math.max(0,acc));
    if(val.length>=lesson.text.length){
      setFinished(true);
      var elapsed2=(Date.now()-(startTime||Date.now()))/1000/60;
      var finalWpm=elapsed2>0?Math.round(val.trim().split(/\s+/).length/elapsed2):0;
      var finalAcc=Math.max(0,Math.round((1-errs/val.length)*100));
      setWpm(finalWpm); setAcc(finalAcc);
      saveTypingProg(lesson.id,finalWpm,finalAcc);
      if(p.onFinish) p.onFinish();
    }
  }

  function renderText(){
    var chars=lesson.text.split("");
    return React.createElement("div",{style:{fontFamily:"monospace",fontSize:"16px",lineHeight:"1.9",letterSpacing:"1px",userSelect:"none",marginBottom:"16px",padding:"14px",background:BG,borderRadius:"12px",border:"1px solid "+BORDER,wordBreak:"break-word"}},
      chars.map(function(ch,i){
        var col=MUTED, bg2="transparent";
        if(i<typed.length){if(typed[i]===ch){col=TEAL;}else{col=RED;bg2="rgba(239,68,68,.2)";}}
        else if(i===typed.length){bg2="rgba(255,209,102,.25)";col=WHITE;}
        return React.createElement("span",{key:i,style:{color:col,background:bg2,borderRadius:"2px"}},ch);
      })
    );
  }

  if(!hasKeyboard) return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"⌨️ Typing Tutor")
    ),
    React.createElement("div",{style:cs({textAlign:"center",padding:"32px 16px"})},
      React.createElement("div",{style:{fontSize:"64px",marginBottom:"16px"}},"⌨️"),
      React.createElement("h3",{style:{color:GOLD,fontSize:"18px",fontWeight:"800",marginBottom:"12px"}},"Keyboard Required"),
      React.createElement("p",{style:{color:MUTED,fontSize:"13px",lineHeight:"1.7",marginBottom:"16px"}},"The Typing Tutor is designed for use with a physical keyboard on a laptop or desktop computer."),
      React.createElement("p",{style:{color:MUTED,fontSize:"13px",lineHeight:"1.7"}},"Open GrammarAce on your laptop or PC to use this feature.")
    )
  );

  if(view==="menu") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"⌨️ Typing Tutor")
    ),
    React.createElement("div",{style:cs({marginBottom:"14px",background:"rgba(255,209,102,.05)",border:"1px solid "+GOLD+"33"})},
      React.createElement("p",{style:{color:GOLD,fontSize:"12px",fontWeight:"800",margin:"0 0 4px"}},"How to use"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"Work through lessons in order. Aim for 95%+ accuracy before focusing on speed. Your best WPM and accuracy are saved per lesson.")
    ),
    (function(){
      var userYear=yearNum(p.yearId);
      var availCount=TYPING_LESSONS.filter(function(ls){return userYear>=ls.minYear;}).length;
      return React.createElement("div",null,
        userYear<3&&React.createElement("p",{style:{color:ORANGE,fontSize:"11px",lineHeight:"1.5",margin:"0 0 10px",background:"rgba(255,159,28,.07)",border:"1px solid "+ORANGE+"44",borderRadius:"10px",padding:"8px 12px"}},
          "Starting with keyboard basics. More lessons unlock from Year 3 onwards."
        ),
        userYear>=3&&userYear<5&&React.createElement("p",{style:{color:TEAL,fontSize:"11px",lineHeight:"1.5",margin:"0 0 10px",background:"rgba(6,214,160,.07)",border:"1px solid "+TEAL+"44",borderRadius:"10px",padding:"8px 12px"}},
          "11+ vocabulary and full passage lessons unlock from Year 5."
        ),
        TYPING_LESSONS.map(function(ls,i){
          var prog2=progress[ls.id];
          var done=prog2&&prog2.attempts>0;
          var locked=userYear<ls.minYear;
          return React.createElement("button",{
            key:ls.id,
            onClick:function(){if(!locked)startLesson(ls);},
            style:cs({display:"flex",alignItems:"center",gap:"12px",textAlign:"left",marginBottom:"8px",width:"100%",
              cursor:locked?"not-allowed":"pointer",
              border:"1px solid "+(locked?BORDER+"55":done?GOLD+"44":BORDER),
              padding:"12px 14px",opacity:locked?0.45:1})
          },
            React.createElement("div",{style:{width:"36px",height:"36px",borderRadius:"10px",
              background:locked?BORDER+"44":done?"rgba(255,209,102,.15)":BORDER,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:locked?"16px":"14px",fontWeight:"900",
              color:locked?MUTED:done?GOLD:MUTED,flexShrink:0}},
              locked?"🔒":i+1
            ),
            React.createElement("div",{style:{flex:1}},
              React.createElement("div",{style:{color:locked?MUTED:WHITE,fontWeight:"700",fontSize:"13px"}},ls.name),
              React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},
                locked?"Unlocks from Year "+ls.minYear:ls.tip
              )
            ),
            !locked&&done&&React.createElement("div",{style:{textAlign:"right",flexShrink:0}},
              React.createElement("div",{style:{color:GOLD,fontSize:"12px",fontWeight:"800"}},prog2.bestWpm+" WPM"),
              React.createElement("div",{style:{color:TEAL,fontSize:"10px"}},prog2.bestAcc+"%")
            ),
            !locked&&!done&&React.createElement("span",{style:{color:MUTED,fontSize:"11px",flexShrink:0}},"Not started")
          );
        })
      );
    })()
  );

  if(view==="lesson"&&lesson) return React.createElement("div",{style:{padding:"18px",maxWidth:"580px",margin:"0 auto",animation:"fadeIn .25s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}},
      React.createElement("button",{onClick:function(){setView("menu");},style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",cursor:"pointer"}},"Exit"),
      React.createElement("h3",{style:{color:WHITE,fontSize:"15px",fontWeight:"800",margin:0}},lesson.name)
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"14px"}},
      [[wpm+" WPM","Speed",GOLD],[accuracy+"%","Accuracy",accuracy>=95?TEAL:accuracy>=80?ORANGE:RED],[errors+" errors","Errors",errors===0?TEAL:errors<5?ORANGE:RED]].map(function(item){
        return React.createElement("div",{key:item[1],style:cs({textAlign:"center",padding:"10px 6px"})},
          React.createElement("div",{style:{color:item[2],fontWeight:"900",fontSize:"18px"}},item[0]),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"2px"}},item[1])
        );
      })
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"14px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(90deg,"+GOLD+","+ORANGE+")",width:Math.min(100,typed.length/lesson.text.length*100)+"%",height:"100%",transition:"width .1s"}})
    ),
    lesson.tip&&React.createElement("p",{style:{color:PURPLE,fontSize:"11px",marginBottom:"10px",fontStyle:"italic"}},lesson.tip),
    renderText(),
    !finished&&React.createElement("textarea",{ref:inputRef,value:typed,onChange:handleTyping,placeholder:"Start typing here...",rows:3,style:{width:"100%",background:BG,border:"2px solid "+BORDER,borderRadius:"12px",padding:"12px",color:WHITE,fontSize:"16px",fontFamily:"monospace",letterSpacing:"1px",display:"block",resize:"none"}}),
    React.createElement(KeyboardDiagram,{
      nextChar:(!finished&&lesson&&typed.length<lesson.text.length)?lesson.text[typed.length]:"",
      isTouch:!hasKeyboard
    }),
    finished&&React.createElement("div",{style:Object.assign(cs({textAlign:"center",padding:"24px"}),{border:"1px solid "+GOLD,background:"rgba(255,209,102,.06)"})},
      React.createElement("div",{style:{fontSize:"48px",marginBottom:"8px",animation:"pop .4s ease"}},accuracy>=95?"🌟":accuracy>=80?"🎉":"👍"),
      React.createElement("div",{style:{color:GOLD,fontSize:"22px",fontWeight:"900",marginBottom:"4px"}},wpm+" WPM"),
      React.createElement("div",{style:{color:accuracy>=95?TEAL:ORANGE,fontSize:"16px",fontWeight:"700",marginBottom:"16px"}},accuracy+"% accuracy"),
      React.createElement("div",{style:{display:"flex",gap:"8px",justifyContent:"center"}},
        React.createElement("button",{onClick:function(){startLesson(lesson);},style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{color:BG})},"Try Again"),
        React.createElement("button",{onClick:function(){setView("menu");},style:bs(CARD,{border:"1px solid "+BORDER,color:WHITE})},"Lessons")
      )
    )
  );

  return null;
}
