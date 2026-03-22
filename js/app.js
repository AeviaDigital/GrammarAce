
// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function App(){
  var apiKeySt=React.useState(function(){return localStorage.getItem("ga_groq_key")||"";});
  var apiKey=apiKeySt[0], setApiKey=apiKeySt[1];
  var profileSt=React.useState(function(){
    var aid=localStorage.getItem("ga_active_user");
    if(!aid) return null;
    return loadProfiles().find(function(pr){return pr.id===aid;})||null;
  });
  var profile=profileSt[0], setProfile=profileSt[1];
  var profViewSt=React.useState("select"), profView=profViewSt[0], setProfView=profViewSt[1];
  var screenSt=React.useState("home"),  screen=screenSt[0],  setScreen=screenSt[1];
  var xpSt=React.useState(0),           xp=xpSt[0],          setXp=xpSt[1];
  var strkSt=React.useState(0),         streak=strkSt[0],    setStreak=strkSt[1];
  var totSt=React.useState(0),          total=totSt[0],      setTotal=totSt[1];
  var badgSt=React.useState([]),        badges=badgSt[0],    setBadges=badgSt[1];
  var cntSt=React.useState({maths:0,english:0,nvr:0,writing:0,spelling:0,typing:0}),counts=cntSt[0],setCounts=cntSt[1];
  var diffSt=React.useState(""),        diff=diffSt[0],      setDiff=diffSt[1];
  var qSt=React.useState(null),         q=qSt[0],            setQ=qSt[1];
  var ldSt=React.useState(false),       loading=ldSt[0],     setLoading=ldSt[1];
  var errSt=React.useState(""),         genError=errSt[0],   setGenError=errSt[1];
  var ansSt=React.useState(false),      answered=ansSt[0],   setAnswered=ansSt[1];
  var selSt=React.useState(null),       sel=selSt[0],        setSel=selSt[1];
  var hntSt=React.useState(false),      hintShown=hntSt[0],  setHintShown=hntSt[1];
  var qnSt=React.useState(1),           qNum=qnSt[0],        setQNum=qnSt[1];
  var qtSt=React.useState(10),          qTotal=qtSt[0],      setQTotal=qtSt[1];
  var scSt=React.useState(0),           sessCor=scSt[0],     setSessCor=scSt[1];
  var sxSt=React.useState(0),           sessXP=sxSt[0],      setSessXP=sxSt[1];
  var csSt=React.useState(0),           cStreak=csSt[0],     setCStreak=csSt[1];
  var tmrSt=React.useState(30),         timer=tmrSt[0],      setTimer=tmrSt[1];
  var tonSt=React.useState(false),      timerOn=tonSt[0],    setTimerOn=tonSt[1];
  var toastSt=React.useState(null),     toast=toastSt[0],    setToast=toastSt[1];
  var subjSt=React.useState(null),      subject=subjSt[0],   setSubject=subjSt[1];
  var modeSt=React.useState(null),      mode=modeSt[0],      setMode=modeSt[1];
  var topicSt=React.useState(null),     topic=topicSt[0],    setTopic=topicSt[1];
  var frSt=React.useState(false),       fromRes=frSt[0],     setFromRes=frSt[1];
  var pmSt=React.useState(null),        pendingMode=pmSt[0], setPendingMode=pmSt[1];

  var apiKeyRef=React.useRef(apiKey);
  var profRef=React.useRef(profile);
  var diffRef=React.useRef(diff);  // starts as ""
  var modeRef=React.useRef(mode);
  var subjRef=React.useRef(subject);
  var topicRef=React.useRef(topic);
  var scRef=React.useRef(0);
  var csRef=React.useRef(0);
  var xpRef=React.useRef(0);
  var totRef=React.useRef(0);
  var badRef=React.useRef([]);
  var cntRef=React.useRef({maths:0,english:0,nvr:0,writing:0,spelling:0,typing:0});
  var prevRef=React.useRef([]);
  var timerRef=React.useRef(null);
  var qnRef=React.useRef(1);
  var qtRef=React.useRef(10);
  var histRef=React.useRef([]);

  apiKeyRef.current=apiKey; profRef.current=profile;
  diffRef.current=diff; modeRef.current=mode;
  subjRef.current=subject; topicRef.current=topic;

  React.useEffect(function(){
    if(!profile) return;
    var d=loadProgress(profile.id);
    histRef.current=loadHistory(profile.id);
    var px=d.xp||0, pt=d.total||0, pb=d.badges||[];
    var pc=d.counts||{maths:0,english:0,nvr:0,writing:0,spelling:0,typing:0};
    var pd=d.diff||"";
    setXp(px); xpRef.current=px;
    setTotal(pt); totRef.current=pt;
    setStreak(d.streak||0);
    setBadges(pb); badRef.current=pb;
    setCounts(pc); cntRef.current=pc;
    setDiff(pd); diffRef.current=pd;
  },[profile&&profile.id]);

  React.useEffect(function(){
    if(timerOn&&timer>0){ timerRef.current=setTimeout(function(){setTimer(function(t){return t-1;});},1000); }
    else if(timerOn&&timer===0){ clearTimeout(timerRef.current); setTimerOn(false); setAnswered(true); setSel(-1); recordScore(-1,null); }
    return function(){clearTimeout(timerRef.current);};
  },[timer,timerOn]);

  function persist(ex){
    if(!profRef.current) return;
    saveProgress(profRef.current.id,Object.assign({xp:xpRef.current,total:totRef.current,streak:streak,badges:badRef.current,counts:cntRef.current,diff:diffRef.current},ex||{}));
  }
  function showToast(b){setToast(b);setTimeout(function(){setToast(null);},3500);}
  function award(earned,id){
    if(!earned.includes(id)){
      earned.push(id);
      return BADGES.find(function(b){return b.id===id;});
    }
    return null;
  }

  function recordScore(idx,qData){
    var isW=qData&&qData.type==="writing";
    var ok=isW?true:qData?idx===qData.correctIndex:false;
    var newCS=ok?csRef.current+1:0; csRef.current=newCS; setCStreak(newCS);
    var newT=totRef.current+1; totRef.current=newT; setTotal(newT);
    var xpPQ={year1:6,year2:8,year3:10,year4:15,year5:20,year6:25};
    var gain=ok?((xpPQ[diffRef.current]||20)+(newCS>=3?5:0)):0;
    var newXp=xpRef.current+gain; xpRef.current=newXp; setXp(newXp);
    setSessXP(function(prev){return prev+gain;});
    var newSC=scRef.current+(ok?1:0); scRef.current=newSC; setSessCor(newSC);
    var earned=badRef.current.slice(); var got=null;
    if(ok)        got=award(earned,"first")||got;
    if(newCS>=3)  got=award(earned,"s3")||got;
    if(newCS>=10) got=award(earned,"s10")||got;
    if(newT>=100) got=award(earned,"100q")||got;
    if(Object.keys(cntRef.current).every(function(k){return (cntRef.current[k]||0)>0;})) got=award(earned,"allRnd")||got;
    badRef.current=earned; setBadges(earned);
    if(got) showToast(got);
    if(qData&&profRef.current){
      var entry={
        date:new Date().toISOString(),
        subject:subjRef.current?subjRef.current.id:"",
        subjectName:subjRef.current?subjRef.current.name:"",
        topic:qData.topic||"",
        stage:STAGE_MAP[diffRef.current]||"",
        yearId:diffRef.current,
        type:qData.type||"mcq",
        question:qData.question||"",
        options:qData.options||null,
        correctIndex:qData.correctIndex!=null?qData.correctIndex:null,
        userAnswer:idx,
        correct:ok,
        explanation:qData.explanation||"",
        hint:qData.hint||"",
        modelAnswer:qData.modelAnswer||null,
        studentAnswer:null,
        writingFeedback:null,
        writingScore:null
      };
      var nh=histRef.current.concat([entry]);
      histRef.current=nh; saveHistory(profRef.current.id,nh);
    }
    persist({xp:newXp,total:newT,badges:earned});
  }

  function handleWritingFeedback(studentAnswer,fb){
    if(!profRef.current||histRef.current.length===0) return;
    var last=histRef.current[histRef.current.length-1];
    if(last.type==="writing"){
      var updated=Object.assign({},last,{studentAnswer:studentAnswer,writingFeedback:fb,writingScore:fb.score!=null?fb.score:null,correct:true});
      var nh=histRef.current.slice(0,-1).concat([updated]);
      histRef.current=nh; saveHistory(profRef.current.id,nh);
    }
  }

  function handlePause(){
    if(!profRef.current||!q) return;
    var paused={
      id:uid(), savedAt:new Date().toISOString(), type:"writing",
      question:q.question, topic:q.topic||topicRef.current||"",
      guidance:q.guidance||[], modelAnswer:q.modelAnswer||"",
      hint:q.hint||"", explanation:q.explanation||"",
      yearId:diffRef.current,
      subjectId:subjRef.current?subjRef.current.id:"writing"
    };
    addPaused(profRef.current.id,paused);
    setScreen("home");
  }

  function handleResume(pausedPrompt){
    if(profRef.current) removePaused(profRef.current.id,pausedPrompt.id);
    var writingSub=SUBJECTS.find(function(s){return s.id==="writing";})||SUBJECTS[3];
    setSubject(writingSub); subjRef.current=writingSub;
    setMode(MODES[0]); modeRef.current=MODES[0];
    setSessCor(0); scRef.current=0; setSessXP(0);
    setCStreak(0); csRef.current=0;
    setQNum(1); qnRef.current=1;
    setQTotal(1); qtRef.current=1;
    prevRef.current=[];
    setTopic(pausedPrompt.topic); topicRef.current=pausedPrompt.topic;
    if(pausedPrompt.yearId){setDiff(pausedPrompt.yearId);diffRef.current=pausedPrompt.yearId;}
    var restoredQ=Object.assign({type:"writing"},pausedPrompt);
    setQ(restoredQ);
    setGenError(""); setAnswered(false); setSel(null); setHintShown(false); setLoading(false);
    recordScore(0,restoredQ);
    setScreen("question");
  }

  async function loadQ(subId,tp,yearId){
    setLoading(true); setQ(null); setGenError(""); setAnswered(false); setSel(null); setHintShown(false);
    if(modeRef.current&&modeRef.current.timed&&subId!=="writing"){
      var secs=(subId==="english"||subId==="nvr")?60:30;
      setTimer(secs); setTimerOn(true);
    }
    try{
      var text=await callGroq(apiKeyRef.current,buildPrompt(subId,tp,yearId,prevRef.current));
      var parsed=validateQuestion(JSON.parse(text));
      // Option 2: maths arithmetic check (instant, no API call)
      if(subId==="maths") parsed=tryMathsValidate(parsed);
      // Option 1: double-pass AI validation for English & NVR
      if(subId==="english"||subId==="nvr"){
        setGenError("double-checking");
        parsed=await doublePassValidate(apiKeyRef.current,parsed);
        setGenError("");
      }
      if(parsed.question) prevRef.current=prevRef.current.concat([parsed.question]).slice(-20);
      setQ(parsed);
      if(parsed.type==="writing") recordScore(0,parsed);
    }catch(e){ console.error("Q error:",e); setGenError(e.message||"Unknown error — please retry."); }
    setLoading(false);
  }

  function handleAnswer(i){
    if(answered) return;
    clearTimeout(timerRef.current); setTimerOn(false);
    setSel(i); setAnswered(true); recordScore(i,q);
  }

  function finishSession(){
    var sub=subjRef.current;
    var nc=Object.assign({},cntRef.current);
    nc[sub.id]=(nc[sub.id]||0)+1;
    cntRef.current=nc; setCounts(nc);
    var earned=badRef.current.slice(); var got=null;
    if((nc.maths||0)>=5)    got=award(earned,"m5")||got;
    if((nc.english||0)>=5)  got=award(earned,"e5")||got;
    if((nc.nvr||0)>=5)      got=award(earned,"n5")||got;
    if((nc.writing||0)>=5)  got=award(earned,"w5")||got;
    if((nc.spelling||0)>=5) got=award(earned,"sp5")||got;
    if((nc.typing||0)>=5)   got=award(earned,"tp5")||got;
    if(scRef.current===qtRef.current) got=award(earned,"perfect")||got;
    if(modeRef.current&&modeRef.current.id==="mock"&&scRef.current/qtRef.current>=0.8) got=award(earned,"mockAce")||got;
    badRef.current=earned; setBadges(earned);
    if(got) showToast(got);
    persist({counts:nc,badges:earned});
    setFromRes(true); setScreen("results");
  }

  function handleNext(){
    var qt=qtRef.current, qn=qnRef.current;
    if(qn>=qt){ finishSession(); return; }
    var next=qn+1; qnRef.current=next; setQNum(next);
    var sub=subjRef.current;
    var nt=modeRef.current&&modeRef.current.id==="topic"?topicRef.current:randItem(TOPICS[sub.id]);
    setTopic(nt); topicRef.current=nt;
    loadQ(sub.id,nt,diffRef.current);
  }

  function startSession(sub,m){
    if(!diffRef.current){ alert("Please select a year group first."); return; }
    setSubject(sub); subjRef.current=sub;
    setMode(m); modeRef.current=m;
    setSessCor(0); scRef.current=0; setSessXP(0);
    setCStreak(0); csRef.current=0;
    setQNum(1); qnRef.current=1;
    var qt=sub.id==="writing"?1:m.q;
    setQTotal(qt); qtRef.current=qt;
    prevRef.current=[];
    var t=randItem(TOPICS[sub.id]);
    setTopic(t); topicRef.current=t;
    setScreen("question"); loadQ(sub.id,t,diffRef.current);
  }

  function startCustomSession(customQuestion,m){
    var writingSub=SUBJECTS.find(function(s){return s.id==="writing";})||SUBJECTS[3];
    setSubject(writingSub); subjRef.current=writingSub;
    setMode(m); modeRef.current=m;
    setSessCor(0); scRef.current=0; setSessXP(0);
    setCStreak(0); csRef.current=0;
    setQNum(1); qnRef.current=1;
    setQTotal(1); qtRef.current=1;
    prevRef.current=[];
    var tp="Custom Prompt"; setTopic(tp); topicRef.current=tp;
    var customQ={type:"writing",question:customQuestion,topic:"Custom Prompt",guidance:["Address the prompt directly","Use vivid language and descriptive detail","Structure with a clear beginning, middle and end"],modelAnswer:"",hint:"Re-read the prompt carefully before you start writing.",explanation:"Your answer will be evaluated on vocabulary, structure, creativity and detail."};
    setQ(customQ); setGenError(""); setAnswered(false); setSel(null); setHintShown(false); setLoading(false);
    recordScore(0,customQ);
    setScreen("question");
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  if(!apiKey) return React.createElement(ApiKeyScreen,{onSave:function(k){setApiKey(k);}});
  if(!profile){
    if(profView==="create") return React.createElement(ProfileCreate,{onBack:function(){setProfView("select");},onCreated:function(pr){setProfile(pr);setProfView("select");}});
    return React.createElement(ProfileSelect,{onSelect:function(pr){setProfile(pr);},onCreate:function(){setProfView("create");},onChangeKey:function(){setApiKey("");}});
  }

  return React.createElement("div",{style:{background:BG,minHeight:"100vh",fontFamily:"Nunito,sans-serif",color:WHITE,overflowY:"auto"}},
    React.createElement(Toast,{badge:toast}),
    screen==="home"&&React.createElement(HomeScreen,{
      profile:profile,xp:xp,streak:streak,total:total,badges:badges,diff:diff,
      onDiff:function(d){setDiff(d);diffRef.current=d;persist({diff:d});},
      onGo:setScreen,
      onSwitch:function(){localStorage.removeItem("ga_active_user");setProfile(null);},
      onChangeKey:function(){localStorage.removeItem("ga_groq_key");setApiKey("");},
      onNeedYear:function(){
        var el=document.getElementById("year-group-section");
        if(el) el.scrollIntoView({behavior:"smooth"});
      }
    }),
    screen==="subjects"&&React.createElement(SubjectsScreen,{
      onBack:function(){setScreen("home");},
      onHome:function(){setScreen("home");},
      onPick:function(s){
        setSubject(s); subjRef.current=s;
        if(s.id==="spelling"){ setScreen("spelling"); }
        else if(s.id==="typing"){ setScreen("typing"); }
        else{ setScreen("modes"); }
      }
    }),
    screen==="modes"&&React.createElement(ModesScreen,{
      subject:subject,
      onBack:function(){setScreen("subjects");},
      onHome:function(){setScreen("home");},
      onPick:function(m){startSession(subject,m);},
      onCustomPrompt:function(){setPendingMode(MODES[0]);setScreen("customprompt");}
    }),
    screen==="customprompt"&&React.createElement(CustomPromptScreen,{
      onBack:function(){setScreen("modes");},
      onSubmit:function(q){startCustomSession(q,pendingMode||MODES[0]);}
    }),
    screen==="question"&&React.createElement(QuestionScreen,{
      q:q,loading:loading,error:genError,answered:answered,sel:sel,hintShown:hintShown,
      onHint:function(){setHintShown(true);},
      onAnswer:handleAnswer,onNext:handleNext,onFinish:finishSession,
      onRetry:function(){loadQ(subjRef.current.id,topicRef.current,diffRef.current);},
      onExit:function(){setScreen("home");},
      onPause:handlePause,
      qNum:qNum,qTotal:qTotal,subjectId:subject?subject.id:"",yearId:diff,
      timed:mode&&mode.timed,timer:timer,cStreak:cStreak,
      apiKey:apiKey,onWritingFeedback:handleWritingFeedback
    }),
    screen==="results"&&React.createElement(ResultsScreen,{
      correct:sessCor,total:qTotal,subjectName:subject?subject.name:"",xpEarned:sessXP,
      onHome:function(){setFromRes(false);setScreen("home");},
      onRetry:function(){startSession(subjRef.current,modeRef.current);},
      onHistory:function(){setScreen("history");}
    }),
    screen==="history"&&React.createElement(HistoryScreen,{
      userId:profile.id,
      onBack:function(){setScreen(fromRes?"results":"home");},
      onResume:handleResume,
      apiKey:apiKey,
      onVersionSaved:function(nh){histRef.current=nh;}
    }),
    screen==="parent"&&React.createElement(DashboardScreen,{
      profile:profile,xp:xp,streak:streak,total:total,counts:counts,badges:badges,diff:diff,
      onBack:function(){setScreen("home");}
    }),
    screen==="leaderboard"&&React.createElement(LeaderboardScreen,{
      profile:profile,xp:xp,total:total,
      onBack:function(){setScreen("home");}
    }),
    screen==="achievements"&&React.createElement(AchievementsScreen,{
      earned:badges,
      onBack:function(){setScreen("home");}
    }),
    screen==="spelling"&&React.createElement(SpellingScreen,{
      yearId:diff,apiKey:apiKey,
      onBack:function(){setScreen("subjects");},
      onFinish:function(sc){
        var sub=subjRef.current||SUBJECTS.find(function(s){return s.id==="spelling";});
        if(sub){
          var nc=Object.assign({},cntRef.current); nc[sub.id]=(nc[sub.id]||0)+1;
          cntRef.current=nc; setCounts(nc);
          var earned=badRef.current.slice(); var got=award(earned,"sp5");
          if(got){badRef.current=earned;setBadges(earned);showToast(got);}
          persist({counts:nc,badges:earned});
        }
        setScreen("subjects");
      }
    }),
    screen==="typing"&&React.createElement(TypingTutorScreen,{
      userId:profile.id,
      onBack:function(){setScreen("subjects");},
      onFinish:function(){
        var sub=subjRef.current||SUBJECTS.find(function(s){return s.id==="typing";});
        if(sub){
          var nc=Object.assign({},cntRef.current); nc[sub.id]=(nc[sub.id]||0)+1;
          cntRef.current=nc; setCounts(nc);
          var earned=badRef.current.slice(); var got=award(earned,"tp5");
          if(got){badRef.current=earned;setBadges(earned);showToast(got);}
          persist({counts:nc,badges:earned});
        }
        setScreen("subjects");
      }
    })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
