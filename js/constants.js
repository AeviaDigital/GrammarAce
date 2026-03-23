
// ── COLOURS ──────────────────────────────────────────────────────────────────
var BG="#060B20",CARD="#0E1530",BORDER="#1E2654";
var GOLD="#FFD166",ORANGE="#FF9F1C",TEAL="#06D6A0",CORAL="#EF5DA8";
var BLUE="#4361EE",PURPLE="#7B2FBE",RED="#EF4444",WHITE="#E8EEFF",MUTED="#6B7A9E";

// ── SUBJECTS ─────────────────────────────────────────────────────────────────
var SUBJECTS=[
  {id:"maths",   name:"Maths",               icon:"🔢",grad:"linear-gradient(135deg,#4361EE,#7B2FBE)",col:"#4361EE",desc:"Arithmetic, fractions, algebra & problem solving"},
  {id:"english", name:"English & Verbal",    icon:"📖",grad:"linear-gradient(135deg,#EF5DA8,#FF9F1C)",col:"#EF5DA8",desc:"Comprehension, vocabulary & verbal reasoning"},
  {id:"nvr",     name:"Non-Verbal Reasoning",icon:"🔷",grad:"linear-gradient(135deg,#06D6A0,#4361EE)",col:"#06D6A0",desc:"Patterns, sequences & spatial thinking"},
  {id:"writing", name:"Creative Writing",    icon:"✏️", grad:"linear-gradient(135deg,#FF9F1C,#EF5DA8)",col:"#FF9F1C",desc:"1 prompt per session · AI feedback · pause & return"},
  {id:"spelling",name:"Spelling & Speaking", icon:"🔊",grad:"linear-gradient(135deg,#06D6A0,#7B2FBE)",col:"#06D6A0",desc:"Spelling tests with audio · pronunciation check"},
  {id:"typing",  name:"Typing Tutor",        icon:"⌨️", grad:"linear-gradient(135deg,#FFD166,#FF9F1C)",col:"#FFD166",desc:"Touch-type lessons · WPM & accuracy · keyboard required"}
];

// ── TOPICS ────────────────────────────────────────────────────────────────────
var TOPICS={
  maths:  ["Arithmetic","Fractions","Decimals & Percentages","Ratios","Algebra & Sequences","Word Problems","Shape & Space","Data Handling","Time & Measurement","Mental Maths"],
  english:["Reading Comprehension","Vocabulary","Synonyms & Antonyms","Verbal Analogies","Sentence Completion","Grammar & Punctuation","Cloze Passages","Word Relationships","Spelling","Literary Devices"],
  nvr:    ["Number Sequences","Letter Sequences","Pattern Series","Odd One Out","Matrix Patterns","Code Breaking","Spatial Reasoning","Shape Analogies","Letter-Number Codes","Series Completion"],
  writing:["Narrative Story","Descriptive Writing","Character Sketch","Setting Description","Dialogue Writing","Persuasive Letter","Adventure Story","Mystery Story","Nature Writing","Imaginative Scenario"]
};

// ── PRACTICE MODES ────────────────────────────────────────────────────────────
var MODES=[
  {id:"drill",name:"Quick Drill",    icon:"⚡",desc:"10 questions, relaxed pace",      col:"#06D6A0",q:10,timed:false},
  {id:"timed",name:"Speed Challenge",icon:"⏱",desc:"10 questions, 30 or 60 secs each", col:"#EF4444",q:10,timed:true},
  {id:"topic",name:"Topic Focus",    icon:"🎯",desc:"10 questions on one topic",       col:"#7B2FBE",q:10,timed:false},
  {id:"mock", name:"Mock Exam",      icon:"📝",desc:"25-question GL-style simulation", col:"#FF9F1C",q:25,timed:false}
];

// ── YEAR GROUPS ───────────────────────────────────────────────────────────────
var YEARS=[
  {id:"year1",label:"Year 1",age:"5-6", stage:"KS1",       emoji:"🌱"},
  {id:"year2",label:"Year 2",age:"6-7", stage:"KS1",       emoji:"🌿"},
  {id:"year3",label:"Year 3",age:"7-8", stage:"Lower KS2", emoji:"📗"},
  {id:"year4",label:"Year 4",age:"8-9", stage:"Lower KS2", emoji:"📘"},
  {id:"year5",label:"Year 5",age:"9-10",stage:"Upper KS2", emoji:"📙"},
  {id:"year6",label:"Year 6",age:"10-11",stage:"11+ Prep", emoji:"🎓"}
];
var YEAR_LABEL={
  year1:"Year 1 (age 5-6, KS1 - very simple: single-digit numbers, basic phonics)",
  year2:"Year 2 (age 6-7, KS1 - simple: double-digit numbers, common words)",
  year3:"Year 3 (age 7-8, lower KS2 - moderate: multiplication, grammar)",
  year4:"Year 4 (age 8-9, lower KS2 - solid KS2: fractions, comprehension)",
  year5:"Year 5 (age 9-10, upper KS2 - challenging: percentages, vocabulary)",
  year6:"Year 6 (age 10-11, 11+ preparation - full 11+ GL Assessment level)"
};
var STAGE_MAP={year1:"KS1",year2:"KS1",year3:"Lower KS2",year4:"Lower KS2",year5:"Upper KS2",year6:"11+ Prep"};

// ── BADGES ────────────────────────────────────────────────────────────────────
var BADGES=[
  {id:"first",  icon:"⭐",name:"First Steps", desc:"Get your first correct answer",xp:50},
  {id:"s3",     icon:"🔥",name:"Hot Streak",  desc:"3 correct in a row",           xp:75},
  {id:"s10",    icon:"💥",name:"On Fire!",    desc:"10 correct in a row",          xp:250},
  {id:"perfect",icon:"💎",name:"Perfect!",    desc:"100% on a full session",       xp:200},
  {id:"m5",     icon:"🔢",name:"Maths Master",desc:"Complete 5 Maths sessions",   xp:150},
  {id:"e5",     icon:"📖",name:"Word Wizard", desc:"Complete 5 English sessions", xp:150},
  {id:"n5",     icon:"🔷",name:"Pattern Pro", desc:"Complete 5 NVR sessions",     xp:150},
  {id:"w5",     icon:"✏️", name:"Storyteller", desc:"Complete 5 Writing sessions", xp:150},
  {id:"sp5",    icon:"🔊",name:"Spellmaster", desc:"Complete 5 Spelling sessions", xp:150},
  {id:"tp5",    icon:"⌨️", name:"Touch Typist",desc:"Complete 5 Typing sessions",  xp:150},
  {id:"mockAce",icon:"🎓",name:"Mock Ace",    desc:"Score 80%+ in a mock exam",   xp:500},
  {id:"100q",   icon:"💯",name:"Century!",    desc:"Answer 100 questions total",  xp:400},
  {id:"allRnd", icon:"🌟",name:"All Rounder", desc:"Try all 4 subjects",          xp:300}
];

// ── XP / LEVELS ───────────────────────────────────────────────────────────────
var XP_TH=[0,150,400,800,1500,2500,4000,6000,8500,12000,16000];
var LV_NM=["","Beginner","Explorer","Thinker","Scholar","Achiever","Expert","Champion","Master","Legend","Grammar Ace"];
var AVATARS=["🦉","🦊","🐯","🦁","🐼","🐸","🦄","🐲","🦋","🌟","🚀","🎯"];

// ── WORD LISTS ────────────────────────────────────────────────────────────────
var SPELL_WORDS={
  year1:["cat","dog","run","big","hat","sun","top","bed","sit","map","red","cup","hot","wet","lid","box","fun","leg","hen","dig"],
  year2:["bread","clock","dream","floor","fruit","green","light","money","night","plant","sleep","small","smile","stone","train","water","white","world","young","early"],
  year3:["accident","believe","careful","certain","complete","decided","finally","frightened","happened","imagine","improve","kitchen","language","natural","offered","perhaps","quickly","message","enjoyed","announced"],
  year4:["appreciate","beginning","behaviour","committee","conscience","curiosity","definitely","difference","embarrass","environment","especially","exaggerate","fascinated","frequently","government","immediately","independent","knowledge","necessary","beginning"],
  year5:["approximately","circumstances","correspondence","disastrous","extraordinary","familiarity","identification","miserable","mischievous","neighbourhood","particularly","prejudiced","questionnaire","recommendation","twelfth","unnecessary","yacht","accompany","aggressive","amateur"],
  year6:["accommodate","acknowledge","apparent","committee","conscience","conscious","controversy","criticise","desperate","exaggerate","explanation","fascinating","guarantee","harass","hindrance","liaison","millennium","parliament","rhyme","sufficient"]
};
var PRONOUN_WORDS={
  year1:["cat","red","big","sun","top","run","hat","bed"],
  year2:["bread","clock","dream","green","light","water","smile","young"],
  year3:["believe","certain","imagine","kitchen","language","quickly","natural","perhaps"],
  year4:["appreciate","beginning","committee","conscience","difference","environment","especially","knowledge"],
  year5:["approximately","circumstances","extraordinary","miserable","neighbourhood","questionnaire","recommendation","unnecessary"],
  year6:["accommodate","aggressive","controversy","desperate","exaggerate","fascinating","parliament","rhyme"]
};

// ── TYPING LESSONS ────────────────────────────────────────────────────────────
var TYPING_LESSONS=[
  {id:"homerow", name:"Home Row",        minYear:1, text:"add a fad ask lad fall glad flask salad glass hall all saga glad flask half lad",      tip:"Fingers rest on A S D F J K L — never lift your wrists"},
  {id:"toprow",  name:"Top Row",         minYear:1, text:"we were quite top row pet our two were eye pot wire tower pop quit power",              tip:"Reach up from home row — return fingers after each key"},
  {id:"botrow",  name:"Bottom Row",      minYear:1, text:"cab van box mix new jam cab van fox ban nab vim cab jam mix van box ban",               tip:"Reach down — keep other fingers anchored on home row"},
  {id:"caps",    name:"Capital Letters", minYear:3, text:"Alan finds Jack. Kate said Hello. Dogs Run Fast. Every Friday. Santa Claus.",           tip:"Use the OPPOSITE Shift key to the finger typing the letter"},
  {id:"numbers", name:"Numbers",         minYear:3, text:"I have 2 cats and 3 dogs. Room 4 is on floor 5. Call 999 for help. Score 10 of 10.",   tip:"Reach up from top row — return fingers immediately"},
  {id:"words",   name:"Common Words",    minYear:3, text:"the and that have from they what this with will your about which when there their",     tip:"Practise rhythm — common words should feel automatic"},
  {id:"vocab",   name:"11+ Vocabulary",  minYear:5, text:"necessary beginning separate committee environment immediately recommend conscience",    tip:"Build speed on harder words used in exams"},
  {id:"passage", name:"Full Passage",    minYear:5, text:"The ability to communicate clearly is one of the most important skills a person can develop. Precision and confidence will always be valued.",tip:"Accuracy first — aim for 95% before focusing on speed"}
];

// ── FALLBACK QUESTIONS ────────────────────────────────────────────────────────
var FALLBACKS={
  maths:  {question:"What is 3/4 of 48?",options:["A) 24","B) 36","C) 32","D) 40"],correctIndex:1,explanation:"48 / 4 = 12. 12 x 3 = 36. Answer is B) 36.",hint:"Find one quarter first.",topic:"Fractions"},
  english:{question:"Which word is closest in meaning to meticulous?",options:["A) Careless","B) Precise","C) Hasty","D) Vague"],correctIndex:1,explanation:"Meticulous means attention to detail. B) Precise.",hint:"Think about being very careful.",topic:"Vocabulary"},
  nvr:    {question:"What comes next: A, C, E, G, ?",options:["A) H","B) I","C) J","D) K"],correctIndex:1,explanation:"Each letter skips one. Answer is B) I.",hint:"Count the gap between letters.",topic:"Letter Sequences"},
  writing:{question:"Write a story opening about discovering a mysterious door in your school.",type:"writing",guidance:["Hook the reader immediately","Use vivid sensory details","Build tension and mystery"],modelAnswer:"The door had not been there on Monday. Its ancient oak surface stood where the broom cupboard used to be.",explanation:"Examiners reward vivid description and immediate engagement.",hint:"Start with something unexpected.",topic:"Narrative Story"}
};
