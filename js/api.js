
// ── GROQ API CALL ─────────────────────────────────────────────────────────────
async function callGroq(apiKey,prompt,maxTokens){
  var res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({model:"openai/gpt-oss-120b",messages:[{role:"user",content:prompt}],max_tokens:maxTokens||1024,temperature:0.8})
  });
  var data=await res.json();
  if(data.error) throw new Error(data.error.message);
  var text=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"";
  var clean=text.replace(/```json|```/g,"").trim();
  var s=clean.indexOf("{"), e=clean.lastIndexOf("}");
  if(s===-1||e===-1) throw new Error("No JSON found in response");
  return clean.slice(s,e+1);
}

// ── PROMPT BUILDERS ───────────────────────────────────────────────────────────
function buildPrompt(subj,topic,yearId,prevQs,answerFormat){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var avoid=prevQs.length>0?" Do NOT repeat: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  if(subj==="writing"){
    return "You are a UK exam question writer. Create one creative writing task for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\nRespond with ONLY a valid JSON object, no markdown:\n{\"question\":\"2-3 sentence writing prompt\",\"type\":\"writing\",\"guidance\":[\"tip1\",\"tip2\",\"tip3\"],\"modelAnswer\":\"strong 2-sentence example opening\",\"explanation\":\"what 11+ examiners look for\",\"hint\":\"one key technique\",\"topic\":\""+topic+"\"}";
  }
  var sn=subj==="nvr"?"Non-Verbal Reasoning (text-based: sequences, codes, analogies only)":subj==="english"?"English (reading comprehension, spelling, punctuation or cloze)":subj==="verbal"?"Verbal Reasoning (letter puzzles and word-logic, GL Assessment style — NOT vocabulary or comprehension)":"Mathematics";
  if(answerFormat==="written"&&(subj==="maths"||subj==="english")){
    // GL Assessment "Standard Format": the child writes their own short answer
    // into a box rather than picking from options.
    return "You are a UK exam question writer, writing in the style of GL Assessment's 'Standard Format' papers (the child writes their own answer, not multiple choice). Create one "+sn+" question for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\n\nSTEP 1 — Work out the correct answer yourself first, showing your working.\nSTEP 2 — The correct answer must be SHORT: a single number, word, or short phrase (no more than a few words) — something a child could write in a small answer box.\nSTEP 3 — List 2-3 acceptableAnswers covering reasonable alternative phrasings or formats (e.g. \"12\" and \"twelve\"; do not include the question text itself as an acceptable answer).\nSTEP 4 — Write the explanation showing the correct working and stating the correct answer clearly.\n\nCRITICAL RULES:\n- Do NOT provide multiple-choice options — this is a written-answer format\n- The correctAnswer must be short enough to type into a small text box\n- For "+yr+" difficulty — keep arithmetic simple and age-appropriate\n\nRespond with ONLY a valid JSON object, no markdown, no preamble:\n{\"question\":\"question text\",\"type\":\"written\",\"correctAnswer\":\"short answer\",\"acceptableAnswers\":[\"alt1\",\"alt2\"],\"explanation\":\"full working and the correct answer restated\",\"hint\":\"hint without giving answer\",\"topic\":\""+topic+"\"}";
  }
  return "You are a UK exam question writer. Create one "+sn+" multiple choice question for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\n\nSTEP 1 — Work out the correct answer yourself first, showing your working.\nSTEP 2 — Write 4 options (A B C D) where exactly one is correct.\nSTEP 3 — Set correctIndex to match the correct option (0=A, 1=B, 2=C, 3=D).\nSTEP 4 — Write the explanation starting with the correct letter, e.g. \"The answer is B) 2 because...\".\nSTEP 5 — Double-check: does your explanation letter match your correctIndex number? If not, fix it before responding.\n\nCRITICAL RULES:\n- correctIndex MUST match the option your explanation identifies as correct\n- For "+yr+" difficulty — keep arithmetic simple and age-appropriate\n- Options must be clearly different from each other\n\nRespond with ONLY a valid JSON object, no markdown, no preamble:\n{\"question\":\"question text\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"correctIndex\":1,\"explanation\":\"The answer is [LETTER]) [VALUE] because [WORKING]\",\"hint\":\"hint without giving answer\",\"topic\":\""+topic+"\"}";
}

// ── VERBAL REASONING ───────────────────────────────────────────────────────────
// 10 of the 11 GL Verbal Reasoning mechanics are language/lexical puzzles (letter
// insertion, hidden words, analogies, synonyms, logic) that need real semantic
// judgment — built here as LLM generation with the same reconciliation safety
// net used everywhere else. "Letter Series" is pure alphabet-position arithmetic
// with no words involved at all, so it's built fully deterministic instead (see
// generateLetterSeries below) — same reasoning as the NVR visual engine: clean
// formal structure gets built and validated in code rather than trusted from
// the LLM; language meaning does not have that option.
var VERBAL_TOPIC_INSTRUCTIONS={
  "Insert the Letter":"Write two word-fragments, each with exactly one missing letter shown as (_) in the middle (e.g. a fragment like 'wor(_)en'). There is exactly ONE letter that, placed in BOTH gaps, completes a real English word in each fragment. The question text should show both fragments clearly. The 5 options are 5 different single letters, only one of which correctly completes both fragments.",
  "Move the Letter":"Write two real English words. If exactly ONE specific letter is removed from the first word and inserted somewhere into the second word (not necessarily at the end), BOTH results become new, different, real English words. The question should show the two starting words and ask which letter moves. The 5 options are 5 different single letters, only one of which works for both words.",
  "Word Group Analogy":"Write a group of exactly 3 words that clearly share a category or relationship (e.g. all belong to the same type of thing, or relate to each other the same way). Then write a second, different group with only 2 words shown, following the SAME kind of relationship as the first group but about a different topic. Ask which of 5 word options completes the second group so that it follows the same relationship as the first group.",
  "Complete the Pair":"Write 2 complete word-pairs that both follow the exact same relationship to each other (for example: opposites, part-and-whole, a consistent category link — you choose, but keep it consistent across both pairs). Then write a 3rd pair with only the first word shown. Ask which of 5 word options completes the 3rd pair using that same relationship.",
  "Closest in Meaning":"Pick one target word appropriate for the year group. Write 5 candidate words (A-E), only one of which is closest in meaning (a synonym) to the target word. The other 4 should be plausible but clearly wrong once you think about the actual meaning.",
  "Most Opposite":"Pick one target word appropriate for the year group. Write 5 candidate words (A-E), only one of which is most nearly opposite in meaning (an antonym) to the target word. The other 4 should be plausible but clearly wrong once you think about the actual meaning.",
  "Odd Two Out":"Write exactly 5 words where 3 of them clearly share a category or relationship and the other 2 do NOT belong with that group (and are not necessarily related to each other either). List the 5 words clearly in the question text, labelled 1-5. The 5 options must each name a PAIR from that list, written like 'Word1 and Word2' — only one of the 5 option-pairs correctly names the two words that do not belong.",
  "Hidden Word (Between Words)":"Write one short, natural sentence (at least 6 words). Somewhere in it, a hidden word of 4 or more letters is formed by joining the END of one word to the START of the very next word. State the sentence in the question text. The 5 options are 5 different pairs of adjacent words taken from the sentence (written like 'word1 word2'), only one of which actually contains the hidden word when joined together.",
  "Hidden Word (Inside a Word)":"Write one short, natural sentence containing one longer word (7+ letters). If exactly 3 consecutive letters are removed from the middle of that long word, the remaining letters (kept in order, joined together) form a different, valid, shorter English word. State the sentence in the question text, and ask the student to find the longer word this applies to. The 5 options are 5 different words taken from the sentence, only one of which has this property.",
  "Logic & Deduction":"Write one short logic-reasoning or numeric word-problem puzzle appropriate for the year group (for example: a deduction from 2-3 short statements, or a simple numeric reasoning problem solvable through logical steps rather than a formula). Write 5 possible answers (A-E), only one correct."
};
function buildVerbalPrompt(topic,yearId,prevQs){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var avoid=prevQs.length>0?" Do NOT repeat or closely resemble: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  var instructions=VERBAL_TOPIC_INSTRUCTIONS[topic]||VERBAL_TOPIC_INSTRUCTIONS["Logic & Deduction"];
  return "You are a UK 11+ exam question writer, writing in the style of GL Assessment's Verbal Reasoning papers. Topic: "+topic+". Audience: "+yr+". Seed:"+seed+avoid+"\n\n"+
    "STEP 1 — "+instructions+"\n"+
    "STEP 2 — Set correctIndex to match the correct option (0=A, 1=B, 2=C, 3=D, 4=E).\n"+
    "STEP 3 — Write an explanation starting with the correct letter, e.g. \"The answer is C) ... because ...\", explaining the reasoning clearly enough for an 11-year-old to follow.\n"+
    "STEP 4 — Double-check: does your explanation's letter match correctIndex? Fix any mismatch before responding.\n\n"+
    "CRITICAL RULES:\n- This is a Verbal Reasoning puzzle about letters, words, or logic — NOT a reading comprehension or vocabulary-definition question.\n- All 5 options must be clearly different from each other, and only one may be correct.\n- Keep vocabulary appropriate for "+yr+".\n\n"+
    "Respond with ONLY a valid JSON object, no markdown, no preamble:\n"+
    "{\"question\":\"question text, including any words/fragments/sentence needed\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\",\"E) ...\"],\"correctIndex\":2,\"explanation\":\"The answer is [LETTER]) ... because ...\",\"hint\":\"hint without giving the answer away\",\"topic\":\""+topic+"\"}";
}
function validateVerbalQuestion(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(!p.question) throw new Error("Missing question text");
  if(!Array.isArray(p.options)||p.options.length!==5) throw new Error("Expected exactly 5 options (A-E)");
  var ci=parseInt(p.correctIndex,10);
  if(isNaN(ci)||ci<0||ci>4) throw new Error("Invalid correctIndex: "+p.correctIndex);
  p.correctIndex=ci;
  return reconcileCorrectIndex(p,"ABCDE");
}

// ── LETTER SERIES (deterministic — pure alphabet-position arithmetic) ────────
// No words or dictionary involved at all, so this is generated and checked
// entirely in code rather than trusted from an LLM, the same reasoning used for
// NVR's geometric puzzles.
function generateLetterSeries(yearId){
  var A=65;
  function idxToLetter(i){ return String.fromCharCode(A+i); }
  var attempts=0,step1,step2,startA,startB,seq;
  do{
    attempts++;
    step1=1+Math.floor(Math.random()*3); // +1..+3
    step2=1+Math.floor(Math.random()*3);
    startA=Math.floor(Math.random()*10); // keep starting positions low so 4 steps of up to +3 each stay in bounds
    startB=startA+1+Math.floor(Math.random()*4);
    seq=[];
    for(var i=0;i<4;i++){
      var a=startA+step1*i, b=startB+step2*i;
      seq.push([a,b]);
    }
  }while((seq[3][0]>25||seq[3][1]>25)&&attempts<50);

  var shown=seq.slice(0,3).map(function(p){ return idxToLetter(p[0])+idxToLetter(p[1]); });
  var correctPair=seq[3];
  var correctStr=idxToLetter(correctPair[0])+idxToLetter(correctPair[1]);

  var distractors=[
    idxToLetter(correctPair[0])+idxToLetter(correctPair[1]-1), // second letter one short
    idxToLetter(correctPair[0]-1)+idxToLetter(correctPair[1]), // first letter one short
    idxToLetter(correctPair[1])+idxToLetter(correctPair[0])    // reversed order
  ].filter(function(d,i,arr){ return d!==correctStr&&arr.indexOf(d)===i; });
  while(distractors.length<4){
    var jitter=idxToLetter(Math.max(0,Math.min(25,correctPair[0]+ (Math.random()<0.5?1:-1)*(1+Math.floor(Math.random()*2)))) )+
               idxToLetter(Math.max(0,Math.min(25,correctPair[1]+ (Math.random()<0.5?1:-1)*(1+Math.floor(Math.random()*2)))) );
    if(jitter!==correctStr&&distractors.indexOf(jitter)===-1) distractors.push(jitter);
  }
  distractors=distractors.slice(0,4);

  var pool=[{text:correctStr,correct:true}].concat(distractors.map(function(d){ return {text:d,correct:false}; }));
  for(var i=pool.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  var letters=["A","B","C","D","E"];
  var options=pool.map(function(p,i){ return letters[i]+") "+p.text; });
  var correctIndex=pool.findIndex(function(p){ return p.correct; });

  return {
    question:"Look at this series of letter-pairs: "+shown.join(", ")+", ?\n\nWhich pair of letters comes next?",
    options:options,
    correctIndex:correctIndex,
    explanation:"Each pair moves on by "+step1+" letter"+(step1>1?"s":"")+" for the first letter and "+step2+" letter"+(step2>1?"s":"")+" for the second letter. Following that pattern, the next pair is "+correctStr+".",
    hint:"Look at how much each letter shifts along the alphabet from one pair to the next.",
    topic:"Letter Series"
  };
}

// ── PASSAGE-BASED READING COMPREHENSION ──────────────────────────────────────
// GL Assessment's real English papers use ONE shared passage with many linked
// questions (5 options, A-E), not one isolated question per passage. This builds
// a whole passage + question set in a single call rather than one question at a
// time, so the reading material stays consistent across a batch of questions.
function buildPassagePrompt(yearId,prevQs,numQuestions){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var n=numQuestions||6;
  var avoid=prevQs.length>0?" The passage must be entirely new and not reuse ideas from these previous questions: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  return "You are a UK 11+ exam question writer, writing in the style of GL Assessment's English comprehension papers. Write ONE original short passage (250-350 words, fiction or non-fiction, appropriate for "+yr+") and "+n+" linked multiple-choice questions about it. Seed:"+seed+avoid+"\n\n"+
    "STEP 1 — Write the passage first. It must be entirely original (do NOT reuse or lightly rephrase any existing published book, story or article) and self-contained — a student who has never seen it before must be able to answer every question using only the passage.\n"+
    "STEP 2 — Write "+n+" questions about the passage, covering a MIX of: literal recall (what happened), inference (why/what does this suggest), vocabulary-in-context (what does word X mean here), main idea or author's purpose, and a language/structure question (e.g. what technique is used in a given phrase).\n"+
    "STEP 3 — Each question needs exactly 5 options (A-E) with only one correct.\n"+
    "STEP 4 — Set each correctIndex to match the correct option (0=A, 1=B, 2=C, 3=D, 4=E).\n"+
    "STEP 5 — Write each explanation starting with the correct letter, e.g. \"The answer is C) ... because ...\", quoting or referring to the exact part of the passage that supports it.\n"+
    "STEP 6 — Double-check every question: does its explanation letter match its correctIndex number? Fix any mismatch before responding.\n\n"+
    "CRITICAL RULES:\n- Every question must be answerable from the passage alone — no outside knowledge required.\n- correctIndex MUST match the option letter named in that question's explanation.\n- Keep vocabulary and sentence complexity appropriate for "+yr+".\n- All 5 options per question must be clearly different from each other.\n\n"+
    "Respond with ONLY a valid JSON object, no markdown, no preamble:\n"+
    "{\"passageTitle\":\"short title\",\"passage\":\"the full passage text\",\"questions\":[{\"question\":\"question text\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\",\"E) ...\"],\"correctIndex\":2,\"explanation\":\"The answer is [LETTER]) ... because ...\",\"hint\":\"hint without giving the answer away\"}, ... ("+n+" items total)]}";
}

// ── PASSAGE-BASED ERROR-SPOTTING (Spelling / Punctuation) ────────────────────
// GL's real spelling/punctuation exercises are one continuous passage split into
// numbered lines, each divided into 4 word-group segments (A-D); the student
// finds which segment has the error, or marks N if the line has none.
function buildErrorSpotPrompt(yearId,prevQs,numLines,errorType){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var n=numLines||8;
  var avoid=prevQs.length>0?" The passage must be entirely new, not reusing ideas from: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  return "You are a UK 11+ exam question writer, writing in the style of GL Assessment's "+errorType+" error-spotting exercises. Write ONE continuous, original short passage (150-220 words, appropriate for "+yr+") made of "+n+" consecutive lines. Seed:"+seed+avoid+"\n\n"+
    "STEP 1 — Split each line into exactly 4 consecutive word-group segments. The 4 segments, joined in order with a single space between them, must reproduce that line's exact text — do not lose, add, or duplicate any words.\n"+
    "STEP 2 — In roughly half the lines, deliberately introduce exactly ONE "+errorType+" mistake inside exactly one of the 4 segments (a mistake a "+yr+" student should be able to spot). The other lines must be completely free of errors.\n"+
    "STEP 3 — For each line, set correctIndex to: 0/1/2/3 for which segment (A/B/C/D) contains the mistake, or 4 if the line has no mistake at all (this represents option N).\n"+
    "STEP 4 — Write each explanation starting with the correct letter, e.g. \"The answer is C) ... because ...\" for a mistake, or \"The answer is N) there is no mistake in this line.\" if there is none.\n"+
    "STEP 5 — Double-check every line: does the explanation's letter match correctIndex? Fix any mismatch before responding.\n\n"+
    "CRITICAL RULES:\n- Never put more than one mistake in the same line.\n- Segments must be non-empty and must reconstruct the original line exactly when joined.\n- Keep vocabulary and sentence complexity appropriate for "+yr+".\n\n"+
    "Respond with ONLY a valid JSON object, no markdown, no preamble:\n"+
    "{\"passageTitle\":\"short title\",\"lines\":[{\"segments\":[\"...\",\"...\",\"...\",\"...\"],\"correctIndex\":2,\"explanation\":\"The answer is [LETTER]) ... because ...\"}, ... ("+n+" items total)]}";
}

// ── PASSAGE-BASED CLOZE / BEST WORD ───────────────────────────────────────────
// GL's real cloze exercises are one continuous passage with several numbered
// blanks embedded inline; each blank has its own set of options.
function buildClozePrompt(yearId,prevQs,numBlanks){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var n=numBlanks||6;
  var avoid=prevQs.length>0?" The passage must be entirely new, not reusing ideas from: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  return "You are a UK 11+ exam question writer, writing in the style of GL Assessment's cloze ('best word') exercises. Write ONE continuous, original short passage (150-250 words, appropriate for "+yr+") containing exactly "+n+" numbered blanks marked inline as [1], [2], [3] etc, in the exact position where a word or short phrase has been removed. Seed:"+seed+avoid+"\n\n"+
    "STEP 1 — Write the passage with the "+n+" blank markers embedded inline, in order, each used exactly once.\n"+
    "STEP 2 — For each blank, write 5 options (A-E) that are grammatically similar (same part of speech, similar length) so the student must use context and grammar — not just guess by elimination — to find the one that fits best.\n"+
    "STEP 3 — Set each correctIndex to match the correct option (0=A, 1=B, 2=C, 3=D, 4=E).\n"+
    "STEP 4 — Write each explanation starting with the correct letter, e.g. \"The answer is B) ... because ...\".\n"+
    "STEP 5 — Double-check every blank: does the explanation's letter match correctIndex? Fix any mismatch before responding.\n\n"+
    "CRITICAL RULES:\n- Use each of [1].."+"["+n+"]"+" exactly once, in numeric order, inline in the passage text.\n- All 5 options per blank must be clearly different from each other.\n- Keep vocabulary and sentence complexity appropriate for "+yr+".\n\n"+
    "Respond with ONLY a valid JSON object, no markdown, no preamble:\n"+
    "{\"passageTitle\":\"short title\",\"passageTemplate\":\"passage text with [1] [2] ... blank markers embedded inline\",\"blanks\":[{\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\",\"E) ...\"],\"correctIndex\":1,\"explanation\":\"The answer is [LETTER]) ... because ...\"}, ... ("+n+" items total, in order)]}";
}
function normalizeAnswer(s){
  return String(s==null?"":s).toLowerCase().trim().replace(/[.,!?'"£$%]/g,"").replace(/\s+/g," ");
}
function checkWrittenAnswer(userText,q){
  var user=normalizeAnswer(userText);
  if(!user) return false;
  var candidates=[q.correctAnswer].concat(q.acceptableAnswers||[]).filter(Boolean).map(normalizeAnswer);
  if(candidates.indexOf(user)!==-1) return true;
  // numeric tolerance match — use the RAW text (normalizeAnswer strips periods,
  // which would break decimal comparisons like "2.5").
  var userNum=parseFloat(String(userText).trim().replace(/[^0-9.\-]/g,""));
  if(!isNaN(userNum)){
    var rawCandidates=[q.correctAnswer].concat(q.acceptableAnswers||[]).filter(Boolean);
    for(var i=0;i<rawCandidates.length;i++){
      var candNum=parseFloat(String(rawCandidates[i]).trim().replace(/[^0-9.\-]/g,""));
      if(!isNaN(candNum)&&Math.abs(candNum-userNum)<0.001) return true;
    }
  }
  return false;
}

function buildFeedbackPrompt(question,answer,yearId){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  return "You are an experienced UK 11+ examiner marking creative writing for "+yr+".\n\nWriting prompt: "+question+"\n\nStudent answer:\n"+answer+"\n\nEvaluate against 11+ criteria. Be encouraging but specific.\nRespond with ONLY a valid JSON object, no markdown:\n{\"score\":7,\"scoreOutOf\":10,\"grade\":\"Good\",\"praise\":\"2-3 specific sentences\",\"improvements\":\"2-3 specific improvements\",\"examinerComment\":\"1-2 sentences overall\",\"vocabulary\":6,\"structure\":7,\"creativity\":8,\"detail\":6}\ngrade must be one of: Excellent, Good, Developing, Needs Work.";
}

// ── LETTER RECONCILIATION (shared by 4-option and 5-option validators) ───────
// Scans an explanation string for phrases like "the answer is C)" and overrides
// correctIndex if it disagrees with what the explanation actually states —
// catches the common LLM failure mode of getting correctIndex and explanation
// out of sync with each other.
function reconcileCorrectIndex(p,letters){
  if(!p.explanation) return p;
  var letterClass="["+letters+"]";
  var patterns=[
    new RegExp("(?:THE\\s+)?(?:CORRECT\\s+)?ANSWER\\s+IS\\s+("+letterClass+")\\s*\\)","i"),
    new RegExp("(?:CORRECT\\s+)?OPTION\\s+IS\\s+("+letterClass+")\\s*\\)","i"),
    new RegExp("^("+letterClass+")\\s*\\)\\s+IS\\s+CORRECT","i"),
    new RegExp("THEREFORE\\s+("+letterClass+")\\s*\\)","i"),
    new RegExp("SO\\s+THE\\s+ANSWER\\s+IS\\s+("+letterClass+")\\s*\\)","i")
  ];
  var letterMap={}; for(var i=0;i<letters.length;i++) letterMap[letters[i]]=i;
  for(var k=0;k<patterns.length;k++){
    var m=p.explanation.match(patterns[k]);
    if(m){
      var foundIdx=letterMap[m[1].toUpperCase()];
      if(foundIdx!==undefined&&foundIdx!==p.correctIndex){
        console.warn("correctIndex mismatch: JSON says "+p.correctIndex+" but explanation says "+m[1].toUpperCase()+"("+foundIdx+"). Using explanation value.");
        p.correctIndex=foundIdx;
      }
      break;
    }
  }
  return p;
}

// ── QUESTION VALIDATOR ────────────────────────────────────────────────────────
function validateQuestion(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(p.type==="writing") return p;
  if(!p.question) throw new Error("Missing question text");
  if(p.type==="written"){
    if(!p.correctAnswer) throw new Error("Missing correctAnswer for written question");
    if(!Array.isArray(p.acceptableAnswers)) p.acceptableAnswers=[];
    return p;
  }
  if(!Array.isArray(p.options)||p.options.length!==4) throw new Error("Expected exactly 4 options");
  var ci=parseInt(p.correctIndex,10);
  if(isNaN(ci)||ci<0||ci>3) throw new Error("Invalid correctIndex: "+p.correctIndex);
  p.correctIndex=ci;
  return reconcileCorrectIndex(p,"ABCD");
}

// ── PASSAGE-SET VALIDATOR (Reading Comprehension) ────────────────────────────
// Shared by anything that validates a list of 5-option sub-questions each with
// their own correctIndex/explanation — Reading Comprehension and Cloze both use
// this shape directly; Error-Spotting uses a variant (see below) since its 5th
// option is "N" rather than a genuine 5th choice.
function validateFiveOptionSubs(subs,letters){
  if(!Array.isArray(subs)||subs.length<3) throw new Error("Expected a list of linked questions");
  subs.forEach(function(sub,i){
    if(!Array.isArray(sub.options)||sub.options.length!==5) throw new Error("Question "+(i+1)+" must have exactly 5 options");
    var ci=parseInt(sub.correctIndex,10);
    if(isNaN(ci)||ci<0||ci>4) throw new Error("Question "+(i+1)+" has an invalid correctIndex: "+sub.correctIndex);
    sub.correctIndex=ci;
    reconcileCorrectIndex(sub,letters||"ABCDE");
  });
  return subs;
}
function validatePassageSet(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(!p.passage||typeof p.passage!=="string"||p.passage.trim().length<100) throw new Error("Missing or too-short passage");
  p.questions.forEach(function(sub,i){ if(!sub.question) throw new Error("Question "+(i+1)+" is missing its text"); });
  validateFiveOptionSubs(p.questions,"ABCDE");
  return p;
}

// ── ERROR-SPOT SET VALIDATOR (Spelling / Punctuation) ────────────────────────
function validateErrorSpotSet(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(!Array.isArray(p.lines)||p.lines.length<3) throw new Error("Expected a list of lines");
  p.lines.forEach(function(line,i){
    if(!Array.isArray(line.segments)||line.segments.length!==4) throw new Error("Line "+(i+1)+" must have exactly 4 segments");
    if(line.segments.some(function(s){return !s||typeof s!=="string"||!s.trim();})) throw new Error("Line "+(i+1)+" has an empty segment");
    var ci=parseInt(line.correctIndex,10);
    if(isNaN(ci)||ci<0||ci>4) throw new Error("Line "+(i+1)+" has an invalid correctIndex: "+line.correctIndex);
    line.correctIndex=ci;
    reconcileCorrectIndex(line,"ABCDN");
  });
  return p;
}

// ── CLOZE SET VALIDATOR ───────────────────────────────────────────────────────
function validateClozeSet(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(!p.passageTemplate||typeof p.passageTemplate!=="string"||p.passageTemplate.trim().length<80) throw new Error("Missing or too-short passage template");
  if(!Array.isArray(p.blanks)) throw new Error("Missing blanks list");
  var n=p.blanks.length;
  if(n<3) throw new Error("Expected a list of blanks");
  for(var i=1;i<=n;i++){
    if(p.passageTemplate.indexOf("["+i+"]")===-1) throw new Error("Passage is missing blank marker ["+i+"]");
  }
  validateFiveOptionSubs(p.blanks,"ABCDE");
  return p;
}

// ── ENGLISH PASSAGE-TOPIC DISPATCHER ──────────────────────────────────────────
// Normalizes all four English "shared passage, many linked questions" topics
// into one common shape: {passage, passageTitle, questions:[{question,options,
// correctIndex,explanation,hint}]} — so app.js's batch-serving logic doesn't
// need to know which topic it's dealing with once a batch exists.
var ENGLISH_PASSAGE_TOPICS=["Reading Comprehension","Spelling","Punctuation","Cloze / Best Word"];
async function generateEnglishPassageBatch(topic,apiKey,yearId,prevQs){
  if(topic==="Reading Comprehension"){
    var raw=await callGroq(apiKey,buildPassagePrompt(yearId,prevQs,6),3000);
    var parsed=validatePassageSet(JSON.parse(raw));
    return {passage:parsed.passage,passageTitle:parsed.passageTitle||"",questions:parsed.questions.map(function(q){
      return {question:q.question,options:q.options,correctIndex:q.correctIndex,explanation:q.explanation,hint:q.hint};
    })};
  }
  if(topic==="Spelling"||topic==="Punctuation"){
    var raw=await callGroq(apiKey,buildErrorSpotPrompt(yearId,prevQs,8,topic.toLowerCase()),3000);
    var parsed=validateErrorSpotSet(JSON.parse(raw));
    var fullPassage=parsed.lines.map(function(l){return l.segments.join(" ");}).join(" ");
    return {passage:fullPassage,passageTitle:parsed.passageTitle||"",questions:parsed.lines.map(function(l,i){
      var labels=["A","B","C","D"];
      var lineText=labels.map(function(lab,idx){return "["+lab+"] "+l.segments[idx];}).join("  ");
      return {
        question:"Line "+(i+1)+" — find the group of words with the mistake, or choose N if there is no mistake:\n\n"+lineText,
        options:["A","B","C","D","N"],
        correctIndex:l.correctIndex,
        explanation:l.explanation,
        hint:"Read the line slowly, segment by segment — check "+(topic==="Spelling"?"each word's spelling":"the punctuation marks")+" in turn."
      };
    })};
  }
  if(topic==="Cloze / Best Word"){
    var raw=await callGroq(apiKey,buildClozePrompt(yearId,prevQs,6),3000);
    var parsed=validateClozeSet(JSON.parse(raw));
    return {passage:parsed.passageTemplate,passageTitle:parsed.passageTitle||"",questions:parsed.blanks.map(function(b,i){
      return {
        question:"Choose the best word or phrase for blank ["+(i+1)+"] in the passage above.",
        options:b.options,correctIndex:b.correctIndex,explanation:b.explanation,
        hint:"Read the whole sentence around ["+(i+1)+"] first — the right answer has to fit the grammar as well as the meaning."
      };
    })};
  }
  throw new Error("Unknown English passage topic: "+topic);
}

// Shared helper: try to compute a numeric answer directly from the question text
// using a handful of common 11+ arithmetic patterns. Returns null if no pattern matched.
function computeFromQuestionText(q){
  var computed=null;

  // Pattern: "X/Y of N" or "X/Y of N" e.g. "1/2 of 48", "3/4 of 20"
  var fracOf=q.match(/(\d+)\s*\/\s*(\d+)\s*of\s*(\d+)/i);
  if(fracOf){
    computed=(parseInt(fracOf[1])/parseInt(fracOf[2]))*parseInt(fracOf[3]);
  }

  // Pattern: "N% of M" e.g. "25% of 80"
  if(computed===null){
    var pctOf=q.match(/(\d+)\s*%\s*of\s*(\d+)/i);
    if(pctOf) computed=(parseInt(pctOf[1])/100)*parseInt(pctOf[2]);
  }

  // Pattern: simple "A + B", "A - B", "A x B", "A * B", "A ÷ B", "A / B"
  if(computed===null){
    var arith=q.match(/(\d+)\s*([+\-x×*÷\/])\s*(\d+)/);
    if(arith){
      var a=parseInt(arith[1]),op=arith[2],b=parseInt(arith[3]);
      if(op==="+") computed=a+b;
      else if(op==="-") computed=a-b;
      else if(op==="x"||op==="×"||op==="*") computed=a*b;
      else if(op==="÷"||op==="/") computed=b!==0?a/b:null;
    }
  }

  // Pattern: "half of N" / "double N" / "twice N"
  if(computed===null){
    var halfOf=q.match(/half\s+of\s+(\d+)/i);
    if(halfOf) computed=parseInt(halfOf[1])/2;
  }
  if(computed===null){
    var doubleN=q.match(/(?:double|twice)\s+(\d+)/i);
    if(doubleN) computed=parseInt(doubleN[1])*2;
  }
  return (computed!==null&&!isNaN(computed))?computed:null;
}

// ── MATHS ARITHMETIC VALIDATOR (Option 2) ────────────────────────────────────
function tryMathsValidate(p){
  // Only attempt if we have a question and either 4 numeric-ish options or a written answer
  if(!p||!p.question||p.type==="writing") return p;
  var q=p.question;

  if(p.type==="written"){
    var computedW=computeFromQuestionText(q);
    if(computedW!==null){
      var stated=parseFloat(String(p.correctAnswer).replace(/[^0-9.\-]/g,""));
      if(isNaN(stated)||Math.abs(stated-computedW)>0.001){
        console.warn("Maths validator: overriding written correctAnswer from "+p.correctAnswer+" to "+computedW);
        p.correctAnswer=String(computedW);
        if(!p.acceptableAnswers) p.acceptableAnswers=[];
      }
    }
    return p;
  }

  var opts=p.options;

  // Extract all numbers from an option string e.g. "A) 12" -> 12
  function optVal(opt){
    var m=opt.match(/[\d.]+/g);
    return m?parseFloat(m[0]):null;
  }

  // Try to find which option index matches a computed answer
  function matchOpt(answer){
    if(answer===null||isNaN(answer)) return -1;
    for(var i=0;i<opts.length;i++){
      var v=optVal(opts[i]);
      if(v!==null&&Math.abs(v-answer)<0.001) return i;
    }
    return -1;
  }

  var computed=computeFromQuestionText(q);

  // If we computed an answer, find matching option
  if(computed!==null&&!isNaN(computed)){
    var matchedIdx=matchOpt(computed);
    if(matchedIdx>=0&&matchedIdx!==p.correctIndex){
      console.warn("Maths validator: overriding correctIndex from "+p.correctIndex+" to "+matchedIdx+" (computed="+computed+")");
      p.correctIndex=matchedIdx;
    }
  }
  return p;
}

// ── DOUBLE-PASS VALIDATOR FOR ENGLISH & NVR (Option 1) ───────────────────────
async function doublePassValidate(apiKey,p,maxIndex){
  if(!p||p.type==="writing"||p.type==="written"||!Array.isArray(p.options)) return p;
  var maxI=typeof maxIndex==="number"?maxIndex:3;
  var letterList=["0=A","1=B","2=C","3=D","4=E"].slice(0,maxI+1).join(", ");
  try{
    var prompt="You are checking a multiple choice exam question for accuracy.\n\nQuestion: "+p.question+"\nOptions:\n"+p.options.join("\n")+"\nMarked correct answer: option index "+p.correctIndex+" which is: "+p.options[p.correctIndex]+"\n\nIs this the correct answer? Think carefully.\nReply with ONLY a valid JSON object, no markdown:\n{\"correct\":true}\nOR if wrong:\n{\"correct\":false,\"correctIndex\":1,\"reason\":\"brief reason\"}\ncorrectIndex must be "+letterList+".";
    var raw=await callGroq(apiKey,prompt);
    var result=JSON.parse(raw);
    if(result.correct===false&&typeof result.correctIndex==="number"&&result.correctIndex>=0&&result.correctIndex<=maxI&&result.correctIndex!==p.correctIndex){
      console.warn("Double-pass validator: overriding correctIndex from "+p.correctIndex+" to "+result.correctIndex+". Reason: "+(result.reason||"none given"));
      p.correctIndex=result.correctIndex;
    }
  }catch(e){
    console.warn("Double-pass validator failed (using original):",e.message);
  }
  return p;
}


// ── OCR VIA GROQ VISION ───────────────────────────────────────────────────────// ── OCR VIA GROQ VISION ───────────────────────────────────────────────────────
async function runOCR(imageFile,apiKey,onProgress){
  if(onProgress) onProgress(20);
  var base64=await new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){ resolve(reader.result.split(",")[1]); };
    reader.onerror=function(){ reject(new Error("Could not read image file")); };
    reader.readAsDataURL(imageFile);
  });
  if(onProgress) onProgress(50);
  var mtype=imageFile.type||"image/jpeg";
  var res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({
      model:"qwen/qwen3.6-27b",
      messages:[{role:"user",content:[
        {type:"image_url",image_url:{url:"data:"+mtype+";base64,"+base64}},
        {type:"text",text:"Transcribe all handwritten text in this image exactly as written. Return only the transcribed text, no commentary. Preserve line breaks."}
      ]}],
      max_tokens:1024,
      temperature:0.1
    })
  });
  if(onProgress) onProgress(90);
  var data=await res.json();
  if(data.error) throw new Error(data.error.message);
  var text=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"";
  if(onProgress) onProgress(100);
  return text.trim();
}
