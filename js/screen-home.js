
// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen(p){
  var paused=loadPaused(p.profile.id);
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"10px"}},
        React.createElement("div",{style:{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}},p.profile.avatar),
        React.createElement("div",null,
          React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"13px"}},p.profile.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},"Lv "+getLvl(p.xp).lv+" · "+getLvl(p.xp).name)
        )
      ),
      React.createElement("button",{onClick:p.onSwitch,style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"10px",padding:"5px 11px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}},"Switch User")
    ),
    React.createElement("div",{style:{textAlign:"center",padding:"4px 0 6px"}},
      React.createElement("div",{style:{fontSize:"56px",lineHeight:1.1,filter:"drop-shadow(0 0 18px rgba(255,209,102,.5))",display:"inline-block",animation:"float 3s ease-in-out infinite"}},"🦉"),
      React.createElement("h1",{style:{color:GOLD,fontSize:"22px",fontWeight:"900",margin:"6px 0 2px"}},"GrammarAce"),
      React.createElement("p",{style:{color:MUTED,fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"}},"UK Grammar School Prep"),
      React.createElement("span",{style:{display:"inline-flex",alignItems:"center",gap:"5px",background:"rgba(6,214,160,.1)",border:"1px solid "+TEAL+"44",borderRadius:"20px",padding:"3px 10px"}},
        React.createElement("span",{style:{width:"6px",height:"6px",borderRadius:"50%",background:TEAL,display:"inline-block"}}),
        React.createElement("span",{style:{color:TEAL,fontSize:"10px",fontWeight:"700"}},"Powered by Groq · Free")
      )
    ),
    React.createElement("div",{style:{margin:"10px 0"}},React.createElement(LevelBar,{xp:p.xp})),
    React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:"8px",background:"rgba(239,68,68,.06)",border:"1px solid #EF444433",borderRadius:"12px",padding:"10px 12px",marginBottom:"10px"}},
      React.createElement("span",{style:{fontSize:"14px",flexShrink:0}},"⚠️"),
      React.createElement("p",{style:{color:"#6B7A9E",fontSize:"10px",lineHeight:"1.6",margin:0}},
        "All data is stored on this device only. Clearing browser cookies or cache will permanently delete all profiles and progress. Use Export in the Dashboard to back up. ",
        React.createElement("a",{href:"privacy.html",style:{color:"#4361EE",fontWeight:"700",textDecoration:"none"}},"Privacy Policy")
      )
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}},
      [[p.streak+"🔥","Streak",ORANGE],[p.total+"","Questions",TEAL],[p.badges.length+"/"+BADGES.length,"Badges",PURPLE]].map(function(item){
        return React.createElement("div",{key:item[1],style:cs({textAlign:"center",padding:"10px 6px"})},
          React.createElement("div",{style:{color:item[2],fontWeight:"900",fontSize:"16px"}},item[0]),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"2px"}},item[1])
        );
      })
    ),
    React.createElement("button",{onClick:function(){if(!p.diff){p.onNeedYear();return;}p.onGo("subjects");},style:bs(!p.diff?"linear-gradient(135deg,"+MUTED+",#4a5270)":"linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",fontSize:"16px",padding:"14px",borderRadius:"14px",marginBottom:"10px",boxShadow:p.diff?"0 4px 20px rgba(255,209,102,.3)":"none",color:BG,cursor:p.diff?"pointer":"default"})},"🚀 Start Practising"),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}},
      [["🏆","Leaderboard","leaderboard"],["🎖️","Badges","achievements"],["📋","History","history"],["📊","Parent/Teacher","parent"]].map(function(item){
        return React.createElement("button",{key:item[2],onClick:function(){p.onGo(item[2]);},style:cs({cursor:"pointer",textAlign:"center",padding:"10px 4px",border:"1px solid "+BORDER})},
          React.createElement("div",{style:{fontSize:"20px"}},item[0]),
          React.createElement("div",{style:{color:WHITE,fontSize:"9px",fontWeight:"700",marginTop:"4px"}},item[1])
        );
      })
    ),
    React.createElement("div",{style:cs({marginBottom:"10px",border:!p.diff?"1px solid "+ORANGE+"66":"1px solid "+BORDER,background:!p.diff?"rgba(255,159,28,.04)":"transparent"})},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"9px"}},
        React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px"}},"YEAR GROUP"),
        !p.diff&&React.createElement("div",{style:{color:ORANGE,fontSize:"10px",fontWeight:"700"}},"Please select to start")
      ),
      !p.diff&&React.createElement("p",{style:{color:MUTED,fontSize:"11px",margin:"0 0 10px",lineHeight:"1.5"}},"Select your child's year group before starting a session:"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"7px"}},
        YEARS.map(function(y){
          var active=p.diff===y.id;
          return React.createElement("button",{key:y.id,onClick:function(){p.onDiff(y.id);},style:{padding:"8px 4px",borderRadius:"10px",border:active?"2px solid "+GOLD:"1px solid "+BORDER,background:active?"rgba(255,209,102,.1)":"transparent",color:active?GOLD:MUTED,cursor:"pointer",fontWeight:"700",fontSize:"10px",transition:"all .2s",lineHeight:"1.4",textAlign:"center"}},
            y.emoji+" "+y.label,React.createElement("br"),
            React.createElement("span",{style:{fontSize:"9px",fontWeight:"400",color:active?GOLD+"bb":BORDER}},y.age)
          );
        })
      )
    ),
    React.createElement("div",{style:cs({marginBottom:"10px",textAlign:"center"})},
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:"0 0 10px"}},"If GrammarAce has helped your child, I would love a coffee!"),
      React.createElement("a",{href:"https://buymeacoffee.com/kaulsays",target:"_blank",rel:"noopener",style:{display:"inline-flex",alignItems:"center",gap:"8px",background:"#FFDD00",color:"#000",borderRadius:"10px",padding:"10px 20px",fontSize:"13px",fontWeight:"800",textDecoration:"none"}},"☕ Buy me a coffee")
    ),
    React.createElement("button",{onClick:function(){localStorage.removeItem("ga_groq_key");p.onChangeKey();},style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:MUTED,fontSize:"11px",padding:"9px"})},"Change API Key"),
    React.createElement("div",{style:{textAlign:"center",marginTop:"14px",paddingTop:"14px",borderTop:"1px solid "+BORDER}},
      React.createElement("a",{href:"privacy.html",style:{color:MUTED,fontSize:"11px",textDecoration:"none",fontWeight:"600"}},"🔒 Privacy Policy"),
      React.createElement("span",{style:{color:BORDER,margin:"0 8px"}},"|"),
      React.createElement("span",{style:{color:MUTED,fontSize:"11px"}},"All data stored on this device only"),
      React.createElement("br"),
      React.createElement("span",{style:{color:BORDER,fontSize:"10px",marginTop:"4px",display:"block"}},"© 2026 Kaulsays Consulting"),
      React.createElement("a",{href:"mailto:Kaul.Says+G.Ace@gmail.com",style:{color:MUTED,fontSize:"10px",textDecoration:"none",display:"block",marginTop:"2px"}},"Kaul.Says+G.Ace@gmail.com")
    )
  );
}

// ── SUBJECTS SCREEN ───────────────────────────────────────────────────────────
function SubjectsScreen(p){
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",flex:1,margin:0}},"Choose a Subject"),
      React.createElement("button",{onClick:p.onHome,style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"10px",padding:"7px 13px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}},"🏠 Home")
    ),
    SUBJECTS.map(function(s){
      return React.createElement("button",{key:s.id,onClick:function(){p.onPick(s);},style:cs({display:"flex",alignItems:"center",gap:"14px",textAlign:"left",marginBottom:"10px",width:"100%",cursor:"pointer",border:"1px solid "+BORDER,padding:"14px 16px"})},
        React.createElement("div",{style:{width:"50px",height:"50px",borderRadius:"14px",background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0}},s.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"14px"}},s.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"12px",marginTop:"2px"}},s.desc)
        ),
        React.createElement("span",{style:{color:MUTED,fontSize:"22px"}},"›")
      );
    }),
    React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:"8px",background:"rgba(255,159,28,.07)",border:"1px solid "+ORANGE+"44",borderRadius:"12px",padding:"12px 14px",marginTop:"6px"}},
      React.createElement("span",{style:{fontSize:"16px",flexShrink:0}},"⚠️"),
      React.createElement("div",null,
        React.createElement("p",{style:{color:ORANGE,fontSize:"11px",fontWeight:"800",margin:"0 0 3px"}},"AI-Generated Content"),
        React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"All questions and answers are generated by AI and may occasionally contain errors. Parents and teachers should review questions regularly for accuracy.")
      )
    )
  );
}

// ── MODES SCREEN ──────────────────────────────────────────────────────────────
function ModesScreen(p){
  var isW=p.subject&&p.subject.id==="writing";
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("button",{onClick:p.onHome,style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"10px",padding:"7px 13px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}},"🏠 Home")
    ),
    React.createElement("div",{style:{background:p.subject.grad,borderRadius:"16px",padding:"18px",marginBottom:"12px",textAlign:"center"}},
      React.createElement("div",{style:{fontSize:"32px"}},p.subject.icon),
      React.createElement("div",{style:{color:"#fff",fontWeight:"900",fontSize:"18px",marginTop:"6px"}},p.subject.name)
    ),
    isW&&React.createElement("div",{style:cs({marginBottom:"14px",background:"rgba(255,159,28,.06)",border:"1px solid "+ORANGE+"44"})},
      React.createElement("p",{style:{color:ORANGE,fontSize:"12px",fontWeight:"800",margin:"0 0 4px"}},"Creative Writing sessions"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"1 prompt per session. Type or photograph your answer for AI feedback. You can pause and come back later.")
    ),
    React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"10px"}},"CHOOSE PRACTICE MODE"),
    MODES.map(function(m){
      return React.createElement("button",{key:m.id,onClick:function(){p.onPick(m);},style:cs({display:"flex",alignItems:"center",gap:"12px",textAlign:"left",marginBottom:"9px",width:"100%",cursor:"pointer",border:"1px solid "+BORDER,padding:"14px 16px"})},
        React.createElement("div",{style:{width:"44px",height:"44px",borderRadius:"12px",background:m.col+"22",border:"2px solid "+m.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}},m.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{color:WHITE,fontWeight:"700",fontSize:"13px"}},m.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},isW?"1 writing prompt + AI feedback":m.desc)
        ),
        React.createElement("div",{style:{background:m.col+"22",color:m.col,borderRadius:"8px",padding:"4px 9px",fontSize:"11px",fontWeight:"800",flexShrink:0}},isW?"1Q":m.q+"Q")
      );
    }),
    isW&&React.createElement("button",{onClick:function(){p.onCustomPrompt();},style:cs({display:"flex",alignItems:"center",gap:"12px",textAlign:"left",width:"100%",cursor:"pointer",border:"1px solid "+PURPLE,padding:"14px 16px",background:"rgba(123,47,190,.06)",marginTop:"4px"})},
      React.createElement("div",{style:{width:"44px",height:"44px",borderRadius:"12px",background:PURPLE+"22",border:"2px solid "+PURPLE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}},"✍️"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{color:WHITE,fontWeight:"700",fontSize:"13px"}},"My Own Prompt"),
        React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},"Type your own writing question")
      ),
      React.createElement("div",{style:{background:PURPLE+"22",color:PURPLE,borderRadius:"8px",padding:"4px 9px",fontSize:"11px",fontWeight:"800",flexShrink:0}},"Custom")
    )
  );
}

// ── CUSTOM PROMPT SCREEN ──────────────────────────────────────────────────────
function CustomPromptScreen(p){
  var tSt=React.useState(""),text=tSt[0],setText=tSt[1];
  var eSt=React.useState(""),err=eSt[0],setErr=eSt[1];
  function submit(){
    var t=text.trim();
    if(!t){setErr("Please enter your writing question.");return;}
    if(t.length<10){setErr("Please enter a more complete question.");return;}
    p.onSubmit(t);
  }
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"Your Own Prompt")
    ),
    React.createElement("div",{style:cs({marginBottom:"14px"})},
      React.createElement("p",{style:{color:MUTED,fontSize:"12px",lineHeight:"1.7",margin:"0 0 14px"}},"Type your own creative writing question below. All the usual options apply — type or photograph your answer, get AI feedback, and pause to come back later."),
      React.createElement("textarea",{
        value:text,
        onChange:function(e){setText(e.target.value);setErr("");},
        placeholder:"e.g. Write a story about a child who discovers they can talk to animals...",
        rows:5,
        style:{width:"100%",background:BG,border:"1px solid "+(err?RED:BORDER),borderRadius:"12px",padding:"12px",color:WHITE,fontSize:"13px",lineHeight:"1.7",display:"block",marginBottom:"8px"}
      }),
      err&&React.createElement("p",{style:{color:RED,fontSize:"11px",margin:"0 0 10px"}},err),
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",textAlign:"right",marginBottom:"14px"}},text.trim().length+" characters"),
      React.createElement("button",{onClick:submit,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"15px",padding:"13px"})},"Use This Question")
    )
  );
}
