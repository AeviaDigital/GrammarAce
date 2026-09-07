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
  var cntSt=React.useState({maths:0,english:0,verbal:0,nvr:0,writing:0,spelling:0,typing:0,grammar:0}),counts=cntSt[0],setCounts=cntSt[1];
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
  var bkSt=React.useState(false),       showBackup=bkSt[0],  setShowBackup=bkSt[1];
  var impSt=React.useState(false),      showImport=impSt[0], setShowImport=impSt[1];
  var impMsgSt=React.useState(""),      importMsg=impMsgSt[0],setImportMsg=impMsgSt[1];
  var afmtSt=React.useState("mc"),      answerFormat=afmtSt[0], setAnswerFormat=afmtSt[1];
  var nvrfSt=React.useState("visual"),  nvrFormat=nvrfSt[0],  setNvrFormat=nvrfSt[1];

  var apiKeyRef=React.useRef(apiKey);
  var profRef=React.useRef(profile);
  var diffRef=React.useRef(diff);
  var modeRef=React.useRef(mode);
  var subjRef=React.useRef(subject);
  var topicRef=React.useRef(topic);
  var scRef=React.useRef(0);
  var csRef=React.useRef(0);
  var xpRef=React.useRef(0);
  var totRef=React.useRef(0);
  var badRef=React.useRef([]);
  var cntRef=React.useRef({maths:0,english:0,verbal:0,nvr:0,writing:0,spelling:0,typing:0,grammar:0});
  var prevRef=React.useRef([]);
  var passageBatchRef=React.useRef(null); // {passage, passageTitle, questions:[...], nextIdx}
  var timerRef=React.useRef(null);
  var qnRef=React.useRef(1);
  var qtRef=React.useRef(10);
  var histRef=React.useRef([]);
  var isLeavingRef=React.useRef(false);
  var afmtRef=React.useRef("mc");
  var nvrfRef=React.useRef("visual");

  apiKeyRef.current=apiKey; profRef.current=profile;
  diffRef.current=diff; modeRef.current=mode;
  subjRef.current=subject; topicRef.current=topic;
  afmtRef.current=answerFormat; nvrfRef.current=nvrFormat;

  // beforeunload - only on actual close, not internal navigation
  React.useEffect(function(){
    function handleBeforeUnload(e){
      if(isLeavingRef.current) return;
      e.preventDefault();
      e.returnValue="Have you exported your GrammarAce data? Closing without exporting may lose data if you clear your cache.";
      return e.returnValue;
    }
    function handleClick(e){
      var a=e.target.closest&&e.target.closest("a[href]");
      if(a&&a.href&&a.href.indexOf(window.location.hostname)>=0){
        isLeavingRef.current=true;
        setTimeout(function(){isLeavingRef.current=false;},500);
      }
    }
    window.addEventListener("beforeunload",handleBeforeUnload);
    document.addEventListener("click",handleClick);
    return function(){
      window.removeEventListener("beforeunload",handleBeforeUnload);
      document.removeEventListener("click",handleClick);
    };
  },[]);

  React.useEffect(function(){
    if(!profile) return;
    var d=loadProgress(profile.id);
    histRef.current=loadHistory(profile.id);
    var px=d.xp||0, pt=d.total||0, pb=d.badges||[];
    var pc=d.counts||{maths:0,english:0,verbal:0,nvr:0,writing:0,spelling:0,typing:0,grammar:0};
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

  function isBurner(){ return profRef.current&&profRef.current.type==="burner"; }

  function persist(ex){
    if(!profRef.current||isBurner()) return;
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

  function recordScore(idx,qData,explicitOk){
    var isW=qData&&qData.type==="writing";
    var ok=isW?true:(explicitOk!==undefined?explicitOk:(qData?idx===qData.correctIndex:false));
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
    if(qData&&profRef.current&&!isBurner()){
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
        passage:qData.passage||null,
        passageTitle:qData.passageTitle||null,
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
    if(!profRef.current||histRef.current.length===0||isBurner()) return;
    var last=histRef.current[histRef.current.length-1];
    if(last.type==="writing"){
      var updated=Object.assign({},last,{studentAnswer:studentAnswer,writingFeedback:fb,writingScore:fb.score!=null?fb.score:null,correct:true});
      var nh=histRef.current.slice(0,-1).concat([updated]);
      histRef.current=nh; saveHistory(profRef.current.id,nh);
    }
  }

  function handlePause(){
    if(!profRef.current||!q||isBurner()) return;
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
    var profId=profRef.current&&profRef.current.id;
    // Visual NVR: generated locally by plain JS geometry, not the LLM — instant,
    // no API call, but still checked against the qbank so two very similar
    // visual questions can't land back-to-back in the same session.
    if(subId==="nvr"&&nvrfRef.current==="visual"&&NVR_VISUAL_TOPICS.indexOf(tp)!==-1){
      var visQ=await qbankGenerateUnique(profId,"nvr",tp,yearId,
        function(){ return generateVisualNVR(tp,yearId); },
        function(r){ return qbankHash(r.topic+"|"+(r.optionsSvg?r.optionsSvg.join(""):JSON.stringify(r.options||[]))); }
      );
      setQ(visQ); setLoading(false);
      return;
    }
    // Letter Series: pure alphabet-position arithmetic, generated locally by
    // plain JS — no LLM call needed, same reasoning as visual NVR.
    if(subId==="verbal"&&tp==="Letter Series"){
      var lsQ=await qbankGenerateUnique(profId,"verbal",tp,yearId,
        function(){ return generateLetterSeries(yearId); },
        function(r){ return r.question; }
      );
      setQ(lsQ); setLoading(false);
      return;
    }
    if(modeRef.current&&modeRef.current.timed&&subId!=="writing"){
      var secs=(subId==="english"||subId==="verbal"||subId==="nvr")?60:30;
      setTimer(secs); setTimerOn(true);
    }
    // Reading Comprehension, Spelling, Punctuation, Cloze: each is one shared
    // passage with several linked questions, generated in a single call and
    // served one at a time from a local batch — matches GL's real paper
    // structure instead of a fresh unrelated passage per question. Always
    // multiple-choice; no written-answer format for these, since GL's real
    // versions of these exercises are never free-text.
    if(subId==="english"&&ENGLISH_PASSAGE_TOPICS.indexOf(tp)!==-1){
      var batch=passageBatchRef.current;
      if(batch&&batch.topic===tp&&batch.nextIdx<batch.questions.length){
        var sub=batch.questions[batch.nextIdx];
        var served=Object.assign({},sub,{
          topic:tp,
          passage:batch.passage,
          passageTitle:batch.passageTitle,
          passageIndex:batch.nextIdx+1,
          passageTotal:batch.questions.length
        });
        batch.nextIdx+=1;
        if(batch.nextIdx>=batch.questions.length) passageBatchRef.current=null;
        if(served.question) prevRef.current=prevRef.current.concat([served.question]).slice(-20);
        setQ(served); setLoading(false);
        return;
      }
      try{
        var qbankAvoid=await qbankRecentRaw(profId,"english",tp,yearId,6);
        var avoidList=prevRef.current.concat(qbankAvoid);
        var freshBatch=await qbankGenerateUnique(profId,"english",tp,yearId,
          function(){ return generateEnglishPassageBatch(tp,apiKeyRef.current,yearId,avoidList); },
          function(r){ return r.passage; }
        );
        passageBatchRef.current={topic:tp,passage:freshBatch.passage,passageTitle:freshBatch.passageTitle,questions:freshBatch.questions,nextIdx:1};
        var first=Object.assign({},freshBatch.questions[0],{
          topic:tp,
          passage:freshBatch.passage,
          passageTitle:freshBatch.passageTitle,
          passageIndex:1,
          passageTotal:freshBatch.questions.length
        });
        if(freshBatch.questions.length<=1) passageBatchRef.current=null;
        if(first.question) prevRef.current=prevRef.current.concat([first.question]).slice(-20);
        setQ(first);
      }catch(e){ console.error("Passage error:",e); setGenError(e.message||"Unknown error — please retry."); }
      setLoading(false);
      return;
    }
    var fmt=(subId==="maths"||subId==="english")?afmtRef.current:"mc";
    try{
      var qbankAvoid2=await qbankRecentRaw(profId,subId,tp,yearId,6);
      var avoidList2=prevRef.current.concat(qbankAvoid2);
      var parsed=await qbankGenerateUnique(profId,subId,tp,yearId,
        async function(){
          if(subId==="verbal"){
            // Verbal Reasoning uses its own 5-option (A-E) prompt/validator —
            // matches GL's real format, distinct from the generic 4-option path.
            var vtext=await callGroq(apiKeyRef.current,buildVerbalPrompt(tp,yearId,avoidList2));
            var vp=validateVerbalQuestion(JSON.parse(vtext));
            setGenError("double-checking");
            vp=await doublePassValidate(apiKeyRef.current,vp,4);
            setGenError("");
            return vp;
          }
          var text=await callGroq(apiKeyRef.current,buildPrompt(subId,tp,yearId,avoidList2,fmt));
          var p=validateQuestion(JSON.parse(text));
          if(subId==="maths") p=tryMathsValidate(p);
          if((subId==="english"||subId==="nvr")&&p.type!=="written"){
            setGenError("double-checking");
            p=await doublePassValidate(apiKeyRef.current,p);
            setGenError("");
          }
          return p;
        },
        function(r){ return r.question||""; }
      );
      if(parsed.question) prevRef.current=prevRef.current.concat([parsed.question]).slice(-20);
      setQ(parsed);
      if(parsed.type==="writing") recordScore(0,parsed);
    }catch(e){ console.error("Q error:",e); setGenError(e.message||"Unknown error — please retry."); }
    setLoading(false);
  }

  function handleWrittenAnswer(userText){
    if(answered) return;
    clearTimeout(timerRef.current); setTimerOn(false);
    var ok=checkWrittenAnswer(userText,q);
    setSel(userText); setAnswered(true); recordScore(userText,q,ok);
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
    if((nc.verbal||0)>=5)   got=award(earned,"vr5")||got;
    if((nc.nvr||0)>=5)      got=award(earned,"n5")||got;
    if((nc.writing||0)>=5)  got=award(earned,"w5")||got;
    if((nc.spelling||0)>=5) got=award(earned,"sp5")||got;
    if((nc.typing||0)>=5)   got=award(earned,"tp5")||got;
    if((nc.grammar||0)>=5)  got=award(earned,"gp5")||got;
    if(scRef.current===qtRef.current) got=award(earned,"perfect")||got;
    if(modeRef.current&&modeRef.current.id==="mock"&&scRef.current/qtRef.current>=0.8) got=award(earned,"mockAce")||got;
    badRef.current=earned; setBadges(earned);
    if(got) showToast(got);
    var totalSessions=Object.values(nc).reduce(function(a,b){return a+(b||0);},0);
    if(totalSessions>0&&totalSessions%10===0) setShowBackup(true);
    persist({counts:nc,badges:earned});
    setFromRes(true); setScreen("results");
  }

  function topicPoolFor(subId){
    if(subId==="nvr"&&nvrfRef.current==="visual") return NVR_VISUAL_TOPICS;
    return TOPICS[subId];
  }

  function handleNext(){
    var qt=qtRef.current, qn=qnRef.current;
    if(qn>=qt){ finishSession(); return; }
    var next=qn+1; qnRef.current=next; setQNum(next);
    var sub=subjRef.current;
    // If an English passage batch (Reading Comprehension / Spelling / Punctuation
    // / Cloze) still has unanswered linked questions, keep serving from it rather
    // than randomly jumping to a different topic — otherwise a single passage
    // would only ever yield 1 question instead of the full linked set.
    var batch=passageBatchRef.current;
    var continuingPassage=sub.id==="english"&&batch&&batch.nextIdx<batch.questions.length;
    var nt=continuingPassage?batch.topic:(modeRef.current&&modeRef.current.id==="topic"?topicRef.current:randItem(topicPoolFor(sub.id)));
    setTopic(nt); topicRef.current=nt;
    loadQ(sub.id,nt,diffRef.current);
  }

  function startSession(sub,m){
    if(!diffRef.current){ alert("Please select a year group first."); return; }
    passageBatchRef.current=null; // clear any leftover passage batch from a previous session
    setSubject(sub); subjRef.current=sub;
    setMode(m); modeRef.current=m;
    setSessCor(0); scRef.current=0; setSessXP(0);
    setCStreak(0); csRef.current=0;
    setQNum(1); qnRef.current=1;
    var qt=sub.id==="writing"?1:m.q;
    setQTotal(qt); qtRef.current=qt;
    prevRef.current=[];
    var t=randItem(topicPoolFor(sub.id));
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

  // ── IMPORT DATA HANDLER ───────────────────────────────────────────────────
  function handleImportFile(e){
    var file=e.target.files&&e.target.files[0];
    if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);
        if(!data.version||!data.type){setImportMsg("Invalid file format.");return;}
        var toImport=[];
        if(data.type==="single"&&data.profile){
          toImport=[{profile:data.profile,progress:data.progress,history:data.history,paused:data.paused,typing:data.typing}];
        } else if(data.type==="all"&&Array.isArray(data.profiles)){
          toImport=data.profiles;
        } else {setImportMsg("Could not read file.");return;}
        var names=toImport.map(function(p){return p.profile.name;}).join(", ");
        if(!window.confirm("Import "+toImport.length+" profile(s): "+names+"?\n\nIf a profile name already exists you will be asked whether to replace it.")) return;
        var existing=loadProfiles();
        var updated=existing.slice();
        toImport.forEach(function(item){
          var pr=item.profile;
          var existIdx=updated.findIndex(function(e){return e.name.toLowerCase()===pr.name.toLowerCase();});
          if(existIdx>=0){
            if(!window.confirm("Profile " + pr.name + " already exists on this device. Replace it? (tap Cancel to keep both)")) {
              pr=Object.assign({},pr,{id:uid(),name:pr.name+" (imported)"});
            } else {
              var oldId=updated[existIdx].id;
              updated.splice(existIdx,1);
              try{["progress","history","paused"].forEach(function(k){localStorage.removeItem(getKey(oldId,k));});localStorage.removeItem("ga_typing_"+oldId);}catch(ex){}
            }
          }
          updated.push(pr);
          try{
            if(item.progress) localStorage.setItem(getKey(pr.id,"progress"),JSON.stringify(item.progress));
            if(item.history)  localStorage.setItem(getKey(pr.id,"history"), JSON.stringify(item.history));
            if(item.paused)   localStorage.setItem(getKey(pr.id,"paused"),  JSON.stringify(item.paused));
            if(item.typing)   localStorage.setItem("ga_typing_"+pr.id,      JSON.stringify(item.typing));
          }catch(ex){}
        });
        saveProfiles(updated);
        setImportMsg("Import successful! "+toImport.length+" profile(s) restored.");
        setShowImport(false);
        setProfile(null);
        localStorage.removeItem("ga_active_user");
      }catch(err){setImportMsg("Import failed: "+(err.message||"unknown error"));}
    };
    reader.readAsText(file);
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  if(!apiKey) return React.createElement(ApiKeyScreen,{onSave:function(k){setApiKey(k);}});

  if(!profile){
    if(showBackup) return React.createElement("div",{style:{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}},
      React.createElement("div",{style:{maxWidth:"420px",width:"100%",background:CARD,border:"1px solid "+ORANGE+"55",borderRadius:"16px",padding:"24px",textAlign:"center"}},
        React.createElement("div",{style:{fontSize:"48px",marginBottom:"12px"}},"💾"),
        React.createElement("h2",{style:{color:ORANGE,fontSize:"18px",fontWeight:"900",margin:"0 0 10px"}},"Back Up Your Data"),
        React.createElement("p",{style:{color:MUTED,fontSize:"13px",lineHeight:"1.7",margin:"0 0 12px"}},"Before switching profiles, consider exporting your data. Clearing browser cookies or cache permanently deletes all progress with no recovery option."),
        React.createElement("div",{style:{background:"rgba(6,214,160,.07)",border:"1px solid "+TEAL+"44",borderRadius:"12px",padding:"10px 14px",marginBottom:"16px"}},
          React.createElement("p",{style:{color:TEAL,fontSize:"12px",fontWeight:"800",margin:"0 0 4px"}},"Two ways to back up:"),
          React.createElement("p",{style:{color:MUTED,fontSize:"12px",lineHeight:"1.7",margin:0}},
            "1. Tap the ",React.createElement("span",{style:{color:TEAL,fontWeight:"700"}},"📥 Export"),
            " button next to your profile name on the home screen.",
            React.createElement("br"),
            "2. Go to the ",React.createElement("span",{style:{color:GOLD,fontWeight:"700"}},"Parent/Teacher Dashboard"),
            " and tap Export My Data."
          )
        ),
        React.createElement("button",{onClick:function(){setShowBackup(false);},style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"14px",padding:"13px",marginBottom:"8px"})},"✅ I understand, continue"),
        React.createElement("a",{href:"privacy.html",style:{color:MUTED,fontSize:"11px",textDecoration:"none"}},"Privacy Policy")
      )
    );

    if(profView==="create") return React.createElement(ProfileCreate,{
      onBack:function(){setProfView("select");},
      onCreated:function(pr,showWelcome){
        setProfile(pr);
        setProfView("select");
        if(showWelcome){
          var msg=pr.type==="burner"
            ?"Session started for "+pr.name+"! Nothing is saved — enjoy your practice."
            :"Profile created! Welcome, "+pr.name+"! Progress is saved automatically on this device.";
          setToast({icon:pr.type==="burner"?"🔥":"✅",name:msg,desc:"",xp:0});
          setTimeout(function(){setToast(null);},4000);
        }
      }
    });

    var importInputId="ga-import-input";
    return React.createElement("div",null,
      React.createElement("input",{type:"file",id:importInputId,accept:".json",onChange:handleImportFile,style:{display:"none"}}),
      importMsg&&React.createElement("div",{style:{position:"fixed",top:"14px",left:"50%",transform:"translateX(-50%)",zIndex:9999,background:CARD,border:"1px solid "+TEAL,borderRadius:"12px",padding:"12px 20px",color:TEAL,fontSize:"13px",fontWeight:"700",boxShadow:"0 4px 20px rgba(0,0,0,.4)",maxWidth:"320px",textAlign:"center"}},
        importMsg,
        React.createElement("button",{onClick:function(){setImportMsg("");},style:{background:"none",border:"none",color:MUTED,marginLeft:"10px",cursor:"pointer",fontSize:"14px"}},"✕")
      ),
      React.createElement(ProfileSelect,{
        onSelect:function(pr){setProfile(pr);},
        onCreate:function(){setProfView("create");},
        onChangeKey:function(){setApiKey("");},
        onImport:function(){
          var inp=document.getElementById(importInputId);
          if(inp){inp.value="";inp.click();}
        },
        onQuickStart:function(){
          var guestPr={id:"guest_"+Date.now(),name:"Guest",avatar:"🦉",type:"burner",createdAt:new Date().toISOString()};
          setProfile(guestPr);
        }
      })
    );
  }

  return React.createElement("div",{style:{background:BG,minHeight:"100vh",fontFamily:"Nunito,sans-serif",color:WHITE,overflowY:"auto"}},
    React.createElement(Toast,{badge:toast}),
    screen==="home"&&React.createElement(HomeScreen,{
      profile:profile,xp:xp,streak:streak,total:total,badges:badges,diff:diff,
      onDiff:function(d){setDiff(d);diffRef.current=d;persist({diff:d});},
      onGo:setScreen,
      onSwitch:function(){
        if(profRef.current&&profRef.current.type!=="burner") setShowBackup(true);
        localStorage.removeItem("ga_active_user");setProfile(null);
      },
      onChangeKey:function(){localStorage.removeItem("ga_groq_key");setApiKey("");},
      onNeedYear:function(){
        var el=document.getElementById("year-group-section");
        if(el) el.scrollIntoView({behavior:"smooth"});
      },
      onExport:function(){
        if(!profRef.current) return;
        if(profRef.current.type==="burner"){
          setToast({icon:"🔥",name:"Session Only profiles cannot be exported",desc:"Create a Persistent profile to enable export",xp:0});
          setTimeout(function(){setToast(null);},3500);
          return;
        }
        exportProfile(profRef.current.id,profRef.current.name);
        setToast({icon:"📥",name:"Data exported!",desc:"Check your downloads folder for the backup file",xp:0});
        setTimeout(function(){setToast(null);},3500);
      }
    }),
    screen==="subjects"&&React.createElement(SubjectsScreen,{
      onBack:function(){setScreen("home");},
      onHome:function(){setScreen("home");},
      onPick:function(s){
        setSubject(s); subjRef.current=s;
        if(s.id==="spelling"){ setScreen("spelling"); }
        else if(s.id==="typing"){ setScreen("typing"); }
        else if(s.id==="grammar"){ setScreen("grammar"); }
        else{ setScreen("modes"); }
      }
    }),
    screen==="modes"&&React.createElement(ModesScreen,{
      subject:subject,
      answerFormat:answerFormat,onAnswerFormat:function(f){setAnswerFormat(f);afmtRef.current=f;},
      nvrFormat:nvrFormat,onNvrFormat:function(f){setNvrFormat(f);nvrfRef.current=f;},
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
      apiKey:apiKey,onWritingFeedback:handleWritingFeedback,
      onWrittenAnswer:handleWrittenAnswer
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
      onFinish:function(){
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
      yearId:diff,
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
    }),
    screen==="grammar"&&React.createElement(GrammarScreen,{
      yearId:diff,apiKey:apiKey,
      onBack:function(){setScreen("subjects");},
      onHome:function(){setScreen("home");},
      onAnswer:function(correct){
        var newT=totRef.current+1; totRef.current=newT; setTotal(newT);
        var xpPQ={year1:6,year2:8,year3:10,year4:15,year5:20,year6:25};
        var gain=correct?(xpPQ[diffRef.current]||20):0;
        var newXp=xpRef.current+gain; xpRef.current=newXp; setXp(newXp);
        var earned=badRef.current.slice();
        if(correct){var got=award(earned,"first");if(got){badRef.current=earned;setBadges(earned);showToast(got);}}
        persist({xp:newXp,total:newT});
      }
    })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
