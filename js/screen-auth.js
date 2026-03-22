
// ── API KEY SCREEN ────────────────────────────────────────────────────────────
function ApiKeyScreen(p){
  var kSt=React.useState(""),keySt=kSt[0],setKey=kSt[1];
  var eSt=React.useState(""),err=eSt[0],setErr=eSt[1];
  var tSt=React.useState(false),testing=tSt[0],setTest=tSt[1];
  async function save(){
    var k=keySt.trim();
    if(!k){setErr("Please paste your API key.");return;}
    if(!k.startsWith("gsk_")){setErr("Groq keys start with gsk_ — please check.");return;}
    setTest(true);setErr("");
    try{
      await callGroq(k,"Reply with only: {\"ok\":true}");
      localStorage.setItem("ga_groq_key",k);
      p.onSave(k);
    }catch(e){setErr("Connection failed: "+(e.message||"unknown error"));}
    setTest(false);
  }
  return React.createElement("div",{style:{maxWidth:"460px",margin:"0 auto",padding:"28px 18px",animation:"fadeIn .4s ease"}},
    React.createElement("div",{style:{textAlign:"center",marginBottom:"24px"}},
      React.createElement("div",{style:{fontSize:"64px",lineHeight:1.1,filter:"drop-shadow(0 0 18px rgba(255,209,102,.5))",display:"inline-block",animation:"float 3s ease-in-out infinite"}},"🦉"),
      React.createElement("h1",{style:{color:GOLD,fontSize:"24px",fontWeight:"900",margin:"10px 0 3px"}},"GrammarAce"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase"}},"UK Grammar School Prep · Year 1-6")
    ),
    React.createElement("div",{style:cs({marginBottom:"14px"})},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}},
        React.createElement("span",{style:{fontSize:"22px"}},"🔑"),
        React.createElement("h2",{style:{color:WHITE,fontSize:"15px",fontWeight:"800",margin:0}},"Enter Your Free Groq API Key")
      ),
      React.createElement("p",{style:{color:MUTED,fontSize:"12px",lineHeight:"1.65",margin:"0 0 14px"}},"Uses Groq · Llama 3.3 — ",React.createElement("strong",{style:{color:TEAL}},"100% free"),", no credit card needed."),
      React.createElement("input",{type:"password",value:keySt,onChange:function(e){setKey(e.target.value);setErr("");},onKeyDown:function(e){if(e.key==="Enter")save();},placeholder:"Paste your key: gsk_...",style:{width:"100%",background:BG,border:"1px solid "+(err?RED:BORDER),borderRadius:"10px",padding:"11px 13px",color:WHITE,fontSize:"13px",marginBottom:"8px",display:"block"}}),
      err&&React.createElement("p",{style:{color:RED,fontSize:"11px",margin:"0 0 10px",lineHeight:"1.5"}},err),
      React.createElement("button",{onClick:save,disabled:testing,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,opacity:testing?0.7:1,fontSize:"15px",padding:"13px"})},testing?"Testing...":"Start GrammarAce")
    ),
    React.createElement("div",{style:{background:"rgba(6,214,160,.04)",border:"1px solid "+TEAL+"22",borderRadius:"12px",padding:"10px 14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"10px"}},
      React.createElement("span",{style:{fontSize:"18px",flexShrink:0}},"🔒"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"No personal data is collected. All progress and profiles are stored on this device only. ",
        React.createElement("a",{href:"privacy.html",style:{color:TEAL,fontWeight:"700",textDecoration:"none"}},"Privacy Policy")
      )
    ),
    React.createElement("div",{style:cs({background:"rgba(6,214,160,.06)",border:"1px solid "+TEAL+"44"})},
      React.createElement("p",{style:{color:TEAL,fontSize:"12px",fontWeight:"800",margin:"0 0 10px"}},"How to get your FREE key:"),
      [["1","Visit console.groq.com","https://console.groq.com"],["2","Sign up free (no credit card)",null],["3","Click API Keys in the sidebar",null],["4","Create API Key and copy it",null],["5","Paste it above and tap Start!",null]].map(function(s){
        return React.createElement("div",{key:s[0],style:{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"7px"}},
          React.createElement("div",{style:{width:"20px",height:"20px",borderRadius:"50%",background:TEAL,color:BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"900",flexShrink:0,marginTop:"1px"}},s[0]),
          React.createElement("span",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.5"}},s[1],s[2]&&React.createElement("span",null,React.createElement("br"),React.createElement("a",{href:s[2],target:"_blank",rel:"noopener",style:{color:BLUE,fontWeight:"700"}},s[2].replace("https://","")))));
      })
    )
  );
}

// ── PROFILE SELECT ────────────────────────────────────────────────────────────
function ProfileSelect(p){
  var psSt=React.useState(loadProfiles),profiles=psSt[0],setProfiles=psSt[1];
  function pick(pr){localStorage.setItem("ga_active_user",pr.id);p.onSelect(pr);}
  function del(id,name,e){
    e.stopPropagation();
    if(!window.confirm("Are you sure you want to delete all data for "+name+"?\n\nThis includes all progress, history, badges and paused prompts.")) return;
    if(!window.confirm("This CANNOT be undone. There is no way to recover this data once deleted.\n\nHave you exported a backup first?\n\nTap OK to permanently delete.")) return;
    var up=profiles.filter(function(pr){return pr.id!==id;});
    saveProfiles(up);setProfiles(up);
    try{["progress","history","paused"].forEach(function(k){localStorage.removeItem(getKey(id,k));});localStorage.removeItem("ga_typing_"+id);}catch(e){}
  }
  return React.createElement("div",{style:{maxWidth:"460px",margin:"0 auto",padding:"28px 18px",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{textAlign:"center",marginBottom:"24px"}},
      React.createElement("div",{style:{fontSize:"64px",lineHeight:1.1,filter:"drop-shadow(0 0 18px rgba(255,209,102,.5))",display:"inline-block",animation:"float 3s ease-in-out infinite"}},"🦉"),
      React.createElement("h1",{style:{color:GOLD,fontSize:"24px",fontWeight:"900",margin:"10px 0 3px"}},"GrammarAce"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase"}},"Who is practising today?")
    ),
    profiles.length>0&&React.createElement("div",{style:{marginBottom:"16px"}},
      profiles.map(function(pr){
        var prog=loadProgress(pr.id),info=getLvl(prog.xp||0);
        var paused=loadPaused(pr.id);
        return React.createElement("button",{key:pr.id,onClick:function(){pick(pr);},style:cs({display:"flex",alignItems:"center",gap:"14px",width:"100%",marginBottom:"10px",cursor:"pointer",textAlign:"left",border:"1px solid "+BORDER,padding:"14px 16px"})},
          React.createElement("div",{style:{width:"48px",height:"48px",borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}},pr.avatar),
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"15px"}},pr.name),
            React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},"Lv "+info.lv+" · "+(prog.total||0)+" questions answered"),
            paused.length>0&&React.createElement("div",{style:{color:ORANGE,fontSize:"10px",marginTop:"3px",fontWeight:"700"}},"Paused writing: "+paused.length)
          ),
          React.createElement("button",{onClick:function(e){del(pr.id,pr.name,e);},style:{background:"none",border:"none",color:MUTED,fontSize:"16px",cursor:"pointer",padding:"4px 8px",flexShrink:0}},"🗑"),
          React.createElement("span",{style:{color:MUTED,fontSize:"22px",flexShrink:0}},"›")
        );
      })
    ),
    profiles.length<6&&React.createElement("button",{onClick:p.onCreate,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"15px",padding:"14px",borderRadius:"14px"})},profiles.length===0?"Create Your Profile":"Add Another Profile"),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginTop:"12px"}},
      React.createElement("button",{onClick:p.onImport,style:bs(CARD,{width:"100%",border:"1px solid "+TEAL,color:TEAL,fontSize:"11px",padding:"9px"})},"📥 Import Data"),
      React.createElement("button",{onClick:function(){localStorage.removeItem("ga_groq_key");p.onChangeKey();},style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:MUTED,fontSize:"11px",padding:"9px"})},"🔑 Change API Key")
    ),
    React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:"7px",background:"rgba(239,68,68,.06)",border:"1px solid #EF444433",borderRadius:"10px",padding:"9px 12px",marginTop:"10px"}},
      React.createElement("span",{style:{fontSize:"12px",flexShrink:0}},"⚠️"),
      React.createElement("p",{style:{color:MUTED,fontSize:"10px",lineHeight:"1.6",margin:0}},"All data is stored on this device only. Clearing browser cookies or cache will permanently delete all profiles. Export your data from the Dashboard to keep a backup.")
    )
  );
}

// ── PROFILE CREATE ────────────────────────────────────────────────────────────
function ProfileCreate(p){
  var nSt=React.useState(""),name=nSt[0],setName=nSt[1];
  var avSt=React.useState("🦉"),avatar=avSt[0],setAvatar=avSt[1];
  var eSt=React.useState(""),err=eSt[0],setErr=eSt[1];
  var typeSt=React.useState("persistent"),profileType=typeSt[0],setProfileType=typeSt[1];
  function create(){
    var n=name.trim();
    if(!n){setErr("Please enter a name.");return;}
    if(n.length>20){setErr("Name must be 20 characters or less.");return;}
    var prs=loadProfiles();
    if(profileType==="persistent"&&prs.some(function(pr){return pr.name.toLowerCase()===n.toLowerCase();})){setErr("That name is already taken.");return;}
    var pr={id:uid(),name:n,avatar:avatar,createdAt:new Date().toISOString(),type:profileType};
    if(profileType==="persistent"){
      saveProfiles(prs.concat([pr]));
      localStorage.setItem("ga_active_user",pr.id);
    }
    p.onCreated(pr);
  }
  return React.createElement("div",{style:{maxWidth:"460px",margin:"0 auto",padding:"28px 18px",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"Create Profile")
    ),
    React.createElement("div",{style:cs({marginBottom:"14px"})},
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"10px"}},"CHOOSE YOUR AVATAR"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"8px",marginBottom:"18px"}},
        AVATARS.map(function(a){return React.createElement("button",{key:a,onClick:function(){setAvatar(a);},style:{fontSize:"24px",padding:"8px",borderRadius:"10px",border:"2px solid "+(avatar===a?GOLD:BORDER),background:avatar===a?"rgba(255,209,102,.1)":"transparent",cursor:"pointer"}},a);})
      ),
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"10px"}},"PROFILE TYPE"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"16px"}},
        React.createElement("button",{
          onClick:function(){setProfileType("persistent");},
          style:{padding:"12px 8px",borderRadius:"12px",border:profileType==="persistent"?"2px solid "+TEAL:"1px solid "+BORDER,background:profileType==="persistent"?"rgba(6,214,160,.1)":"transparent",cursor:"pointer",textAlign:"center"}
        },
          React.createElement("div",{style:{fontSize:"22px",marginBottom:"4px"}},"💾"),
          React.createElement("div",{style:{color:profileType==="persistent"?TEAL:WHITE,fontWeight:"800",fontSize:"12px"}},"Persistent"),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"3px",lineHeight:"1.4"}},"Progress saved on this device")
        ),
        React.createElement("button",{
          onClick:function(){setProfileType("burner");},
          style:{padding:"12px 8px",borderRadius:"12px",border:profileType==="burner"?"2px solid "+ORANGE:"1px solid "+BORDER,background:profileType==="burner"?"rgba(255,159,28,.1)":"transparent",cursor:"pointer",textAlign:"center"}
        },
          React.createElement("div",{style:{fontSize:"22px",marginBottom:"4px"}},"🔥"),
          React.createElement("div",{style:{color:profileType==="burner"?ORANGE:WHITE,fontWeight:"800",fontSize:"12px"}},"Session Only"),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"3px",lineHeight:"1.4"}},"Deleted when browser closes")
        )
      ),
      profileType==="burner"&&React.createElement("div",{style:{background:"rgba(255,159,28,.07)",border:"1px solid "+ORANGE+"44",borderRadius:"10px",padding:"9px 12px",marginBottom:"14px"}},
        React.createElement("p",{style:{color:ORANGE,fontSize:"11px",fontWeight:"800",margin:"0 0 3px"}},"🔥 Session Only mode"),
        React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"Nothing is saved to this device. Progress, history and badges exist only while the browser is open. Closing the tab or clearing cookies removes everything automatically.")
      ),
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"8px"}},"YOUR NAME"),
      React.createElement("input",{value:name,onChange:function(e){setName(e.target.value);setErr("");},onKeyDown:function(e){if(e.key==="Enter")create();},placeholder:"Enter your first name...",maxLength:20,style:{width:"100%",background:BG,border:"1px solid "+(err?RED:BORDER),borderRadius:"10px",padding:"11px 13px",color:WHITE,fontSize:"14px",fontWeight:"700",marginBottom:"8px",display:"block"}}),
      err&&React.createElement("p",{style:{color:RED,fontSize:"11px",margin:"0 0 10px"}},err),
      name.trim()&&React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",background:"rgba(255,209,102,.07)",borderRadius:"12px",padding:"12px",marginBottom:"14px"}},
        React.createElement("div",{style:{position:"relative"}},
          React.createElement("div",{style:{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}},avatar),
          React.createElement("div",{style:{position:"absolute",bottom:"-2px",right:"-2px",fontSize:"12px"}},profileType==="burner"?"🔥":"💾")
        ),
        React.createElement("div",null,
          React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"15px"}},name.trim()),
          React.createElement("div",{style:{color:profileType==="burner"?ORANGE:TEAL,fontSize:"11px"}},profileType==="burner"?"Session Only — not saved":"Persistent — saved on device")
        )
      ),
      React.createElement("button",{onClick:create,style:bs(profileType==="burner"?"linear-gradient(135deg,"+ORANGE+",#FF6B35)":"linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"15px",padding:"13px"})},profileType==="burner"?"🔥 Start Session (not saved)":"💾 Create Profile & Start")
    )
  );
}
