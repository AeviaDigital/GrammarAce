
// ── COLOURS ──────────────────────────────────────────────────────────────────
var BG="#060B20",CARD="#0E1530",BORDER="#1E2654";
var GOLD="#FFD166",ORANGE="#FF9F1C",TEAL="#06D6A0",CORAL="#EF5DA8";
var BLUE="#4361EE",PURPLE="#7B2FBE",RED="#EF4444",WHITE="#E8EEFF",MUTED="#6B7A9E";

// ── SUBJECTS ─────────────────────────────────────────────────────────────────
var SUBJECTS=[
  {id:"maths",   name:"Maths",               icon:"🔢",grad:"linear-gradient(135deg,#4361EE,#7B2FBE)",col:"#4361EE",desc:"Arithmetic, fractions, algebra & problem solving"},
  {id:"english", name:"English",             icon:"📖",grad:"linear-gradient(135deg,#EF5DA8,#FF9F1C)",col:"#EF5DA8",desc:"Reading comprehension, spelling, punctuation & cloze"},
  {id:"verbal",  name:"Verbal Reasoning",    icon:"🧩",grad:"linear-gradient(135deg,#7B2FBE,#EF5DA8)",col:"#7B2FBE",desc:"Letter puzzles, word logic & verbal deduction"},
  {id:"nvr",     name:"Non-Verbal Reasoning",icon:"🔷",grad:"linear-gradient(135deg,#06D6A0,#4361EE)",col:"#06D6A0",desc:"Patterns, sequences & spatial thinking"},
  {id:"writing", name:"Creative Writing",    icon:"✏️", grad:"linear-gradient(135deg,#FF9F1C,#EF5DA8)",col:"#FF9F1C",desc:"1 prompt per session · AI feedback · pause & return"},
  {id:"spelling",name:"Spelling & Speaking", icon:"🔊",grad:"linear-gradient(135deg,#06D6A0,#7B2FBE)",col:"#06D6A0",desc:"Spelling tests with audio · pronunciation check"},
  {id:"typing",  name:"Typing Tutor",        icon:"⌨️", grad:"linear-gradient(135deg,#FFD166,#FF9F1C)",col:"#FFD166",desc:"Touch-type lessons · WPM & accuracy · keyboard required"},
  {id:"grammar", name:"Grammar & Punctuation",icon:"📝",grad:"linear-gradient(135deg,#EF5DA8,#7B2FBE)",col:"#EF5DA8",desc:"Identify · Apply · Terminology · Correct It — NC Appendix 2"}
];

// ── TOPICS ────────────────────────────────────────────────────────────────────
// English and Verbal Reasoning topic lists are aligned to GL Assessment's actual
// familiarisation-paper structure (verified against real English, Verbal Skills,
// Verbal Reasoning, NVR and NVR & Maths papers) rather than generic 11+ topic
// names. NVR topic names are shared between visual (deterministic SVG) and
// text/LLM generation modes — see NVR_VISUAL_TOPICS in nvr-visual.js for which
// of these currently have a deterministic generator.
var TOPICS={
  maths:  ["Arithmetic","Fractions","Decimals & Percentages","Ratios","Algebra & Sequences","Word Problems","Shape & Space","Data Handling","Time & Measurement","Mental Maths"],
  english:["Reading Comprehension","Spelling","Punctuation","Cloze / Best Word"],
  verbal: ["Insert the Letter","Move the Letter","Word Group Analogy","Complete the Pair","Closest in Meaning","Most Opposite","Odd Two Out","Hidden Word (Between Words)","Hidden Word (Inside a Word)","Letter Series","Logic & Deduction"],
  nvr:    ["Series","Shape Analogy","Odd One Out","Matrix","Shape Codes","Mirror Image"],
  writing:["Narrative Story","Descriptive Writing","Character Sketch","Setting Description","Dialogue Writing","Persuasive Letter","Adventure Story","Mystery Story","Nature Writing","Imaginative Scenario"]
};

// ── ANSWER FORMATS (GL Assessment style) ──────────────────────────────────────
// GL 11+ papers mix Multiple Choice and "Standard Format" (write your own answer
// in a box). Only Maths and English support Standard Format here — NVR and
// Creative Writing keep their existing formats.
var ANSWER_FORMATS=[
  {id:"mc",     name:"Multiple Choice", icon:"🔘", desc:"Pick from 4 options — most common 11+ format"},
  {id:"written",name:"Standard Format", icon:"✏️", desc:"Type your own answer, as used in GL Assessment papers"}
];

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
  {id:"vr5",    icon:"🧩",name:"Logic Ace",   desc:"Complete 5 Verbal Reasoning sessions", xp:150},
  {id:"n5",     icon:"🔷",name:"Pattern Pro", desc:"Complete 5 NVR sessions",     xp:150},
  {id:"w5",     icon:"✏️", name:"Storyteller", desc:"Complete 5 Writing sessions", xp:150},
  {id:"sp5",    icon:"🔊",name:"Spellmaster", desc:"Complete 5 Spelling sessions", xp:150},
  {id:"tp5",    icon:"⌨️", name:"Touch Typist",desc:"Complete 5 Typing sessions",  xp:150},
  {id:"mockAce",icon:"🎓",name:"Mock Ace",    desc:"Score 80%+ in a mock exam",   xp:500},
  {id:"100q",   icon:"💯",name:"Century!",    desc:"Answer 100 questions total",  xp:400},
  {id:"allRnd", icon:"🌟",name:"All Rounder", desc:"Try all subjects",            xp:300},
  {id:"gp5",    icon:"📝",name:"Grammarian",  desc:"Complete 5 Grammar sessions",  xp:150}
];

// ── XP / LEVELS ───────────────────────────────────────────────────────────────
var XP_TH=[0,150,400,800,1500,2500,4000,6000,8500,12000,16000];
var LV_NM=["","Beginner","Explorer","Thinker","Scholar","Achiever","Expert","Champion","Master","Legend","Grammar Ace"];
var AVATARS=["🦉","🦊","🐯","🦁","🐼","🐸","🦄","🐲","🦋","🌟","🚀","🎯"];

// ── WORD LISTS ────────────────────────────────────────────────────────────────
var SPELL_WORDS={
  year1:["the","a","do","to","today","of","said","says","are","were","was","is","his","has","you","your","they","be","he","me","she","we","no","go","so","by","my","here","there","where","love","come","some","one","once","ask","friend","school","put","push","pull","full","house","our"],
  year2:["door","floor","poor","because","find","kind","mind","behind","child","children","wild","climb","most","only","both","old","cold","gold","hold","told","every","great","break","steak","pretty","beautiful","after","fast","last","past","father","class","grass","pass","plant","path","bath","hour","move","prove","improve","sure","sugar","eye","could","should","would","who","whole","any","many","clothes","busy","people","water","again","half","money","parents","Christmas"],
  year3:["accident","actually","address","answer","appear","arrive","believe","bicycle","breath","breathe","build","busy","business","calendar","caught","centre","century","certain","circle","complete","consider","continue","decide","describe","different","difficult","disappear","early","earth","eight","eighth","enough","exercise","experience","experiment","extreme","famous","February","forward","fruit","grammar","group","guard","guide","heard","heart","height","history","imagine","increase","important","interest","island","knowledge","learn","length","library","material","medicine","mention","minute","natural","naughty","notice","occasion","often","opposite","ordinary","perhaps","popular","position","possible","pressure","probably","promise","purpose","question","recent","regular","remember","sentence","separate","special","straight","strange","strength","suppose","surprise","therefore","though","through","various","weight","woman","women"],
  year4:["accommodate","accompany","aggressive","amateur","ancient","atmosphere","available","average","awkward","bargain","bruise","category","cemetery","committee","communicate","community","competition","conscience","conscious","controversy","convenience","correspond","criticise","curiosity","definite","desperate","determined","develop","dictionary","disastrous","embarrass","environment","equip","especially","exaggerate","excellent","existence","explanation","familiar","foreign","forty","frequently","government","guarantee","harass","hindrance","immediate","individual","interfere","interrupt","language","leisure","lightning","marvellous","mischievous","muscle","necessary","neighbour","nuisance","occupy","occur","parliament","persuade","physical","prejudice","privilege","profession","programme","pronunciation","queue","recognise","recommend","relevant","restaurant","rhyme","rhythm","sacrifice","secretary","shoulder","signature","sincere","soldier","stomach","sufficient","suggest","symbol","system","temperature","thorough","twelfth","variety","vegetable","vehicle","yacht"],
  year5:["accommodate","accompany","aggressive","amateur","ancient","atmosphere","available","average","awkward","bargain","bruise","category","cemetery","committee","communicate","community","competition","conscience","conscious","controversy","convenience","correspond","criticise","curiosity","definite","desperate","determined","develop","dictionary","disastrous","embarrass","environment","equip","especially","exaggerate","excellent","existence","explanation","familiar","foreign","forty","frequently","government","guarantee","harass","hindrance","immediate","individual","interfere","interrupt","language","leisure","lightning","marvellous","mischievous","muscle","necessary","neighbour","nuisance","occupy","occur","parliament","persuade","physical","prejudice","privilege","profession","programme","pronunciation","queue","recognise","recommend","relevant","restaurant","rhyme","rhythm","sacrifice","secretary","shoulder","signature","sincere","soldier","stomach","sufficient","suggest","symbol","system","temperature","thorough","twelfth","variety","vegetable","vehicle","yacht"],
  year6:["accommodate","accompany","aggressive","amateur","ancient","atmosphere","available","average","awkward","bargain","bruise","category","cemetery","committee","communicate","community","competition","conscience","conscious","controversy","convenience","correspond","criticise","curiosity","definite","desperate","determined","develop","dictionary","disastrous","embarrass","environment","equip","especially","exaggerate","excellent","existence","explanation","familiar","foreign","forty","frequently","government","guarantee","harass","hindrance","immediate","individual","interfere","interrupt","language","leisure","lightning","marvellous","mischievous","muscle","necessary","neighbour","nuisance","occupy","occur","parliament","persuade","physical","prejudice","privilege","profession","programme","pronunciation","queue","recognise","recommend","relevant","restaurant","rhyme","rhythm","sacrifice","secretary","shoulder","signature","sincere","soldier","stomach","sufficient","suggest","symbol","system","temperature","thorough","twelfth","variety","vegetable","vehicle","yacht"]
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
// ── GRAMMAR & PUNCTUATION DATA (NC Appendix 2) ──────────────────────────────
var GRAMMAR_QUESTIONS={
  year1:[
    {q:"Which sentence has the correct punctuation?",opts:["A) the dog ran away","B) The dog ran away.","C) The dog ran away","D) the dog Ran away."],ci:1,exp:"Sentences start with a capital letter and end with a full stop.",topic:"Punctuation",mode:"apply"},
    {q:"Which word is a verb in this sentence: 'The cat jumps over the wall'?",opts:["A) cat","B) wall","C) jumps","D) The"],ci:2,exp:"A verb is a doing or being word. 'Jumps' is what the cat does.",topic:"Word classes",mode:"identify"},
    {q:"Which sentence uses 'and' to join two ideas?",opts:["A) The dog ran.","B) I like cats. I like dogs.","C) I like cats and I like dogs.","D) cats, dogs"],ci:2,exp:"'And' is a conjunction that joins two clauses together.",topic:"Conjunctions",mode:"apply"},
    {q:"Choose the correct plural: 'I have two ___' (wish)",opts:["A) wish","B) wishs","C) wishes","D) wishies"],ci:2,exp:"Words ending in sh, ch, x or s add -es to make the plural.",topic:"Plurals",mode:"apply"},
    {q:"Which is a question?",opts:["A) The sky is blue.","B) Look at that bird!","C) Sit down.","D) Where are you going?"],ci:3,exp:"Questions end with a question mark and usually begin with a question word.",topic:"Punctuation",mode:"identify"}
  ],
  year2:[
    {q:"Which sentence uses an apostrophe correctly?",opts:["A) The girl's book is red.","B) The girls book is red.","C) The girl book's is red.","D) The girls' book is red."],ci:0,exp:"The apostrophe in 'girl's' shows the book belongs to the girl (singular possession).",topic:"Apostrophes",mode:"apply"},
    {q:"Which sentence is a command?",opts:["A) Is the door open?","B) The door is open.","C) What a lovely day!","D) Open the door."],ci:3,exp:"A command tells someone to do something. It usually starts with a verb.",topic:"Sentence types",mode:"identify"},
    {q:"'The butterfly is beautiful.' What type of word is 'beautiful'?",opts:["A) Noun","B) Verb","C) Adjective","D) Adverb"],ci:2,exp:"An adjective describes a noun. 'Beautiful' describes the butterfly.",topic:"Word classes",mode:"terminology"},
    {q:"Which word is an adverb in: 'She ran quickly to school'?",opts:["A) She","B) ran","C) quickly","D) school"],ci:2,exp:"An adverb modifies a verb. 'Quickly' tells us HOW she ran.",topic:"Word classes",mode:"identify"},
    {q:"Choose the correct contraction: 'I am going to the park.'",opts:["A) Im going","B) I'm going","C) I'am going","D) Iam going"],ci:1,exp:"'I'm' is a contraction of 'I am'. The apostrophe shows the missing letter 'a'.",topic:"Apostrophes",mode:"apply"}
  ],
  year3:[
    {q:"'Later that day, I heard the news.' What is 'Later that day'?",opts:["A) A noun phrase","B) A fronted adverbial","C) A subordinate clause","D) A verb phrase"],ci:1,exp:"A fronted adverbial comes at the start of a sentence and is followed by a comma.",topic:"Fronted adverbials",mode:"terminology"},
    {q:"Which sentence uses inverted commas correctly?",opts:["A) She said, I am tired.","B) She said, \u201cI am tired.\u201d","C) She said I am tired.","D) \u201cShe said, I am tired\u201d"],ci:1,exp:"Inverted commas (speech marks) go around the spoken words only.",topic:"Direct speech",mode:"apply"},
    {q:"'He has gone to the shops.' Which tense is this?",opts:["A) Simple past","B) Simple present","C) Present perfect","D) Future"],ci:2,exp:"The present perfect uses 'has/have + past participle'. It links the past to the present.",topic:"Tense",mode:"terminology"},
    {q:"Which conjunction expresses cause?",opts:["A) when","B) although","C) because","D) while"],ci:2,exp:"'Because' introduces a reason/cause. 'When', 'while' and 'although' express time or contrast.",topic:"Conjunctions",mode:"identify"},
    {q:"What is the prefix in 'unhappy'?",opts:["A) un","B) hap","C) happy","D) py"],ci:0,exp:"A prefix is added to the beginning of a word. 'Un-' means 'not', so 'unhappy' means 'not happy'.",topic:"Prefixes",mode:"terminology"}
  ],
  year4:[
    {q:"'The strict maths teacher with curly hair.' What is this an example of?",opts:["A) A verb phrase","B) A fronted adverbial","C) An expanded noun phrase","D) A subordinate clause"],ci:2,exp:"An expanded noun phrase adds detail to a noun using adjectives and preposition phrases.",topic:"Noun phrases",mode:"terminology"},
    {q:"Which pronoun should replace 'Sarah' to avoid repetition? 'Sarah went to the shop. Sarah bought milk.'",opts:["A) It","B) They","C) She","D) Her"],ci:2,exp:"'She' is the subject pronoun used to replace a female person's name.",topic:"Pronouns",mode:"apply"},
    {q:"Where does the comma go? 'After the match ___ we went for pizza.'",opts:["A) No comma needed","B) After 'After'","C) After 'match'","D) After 'we'"],ci:2,exp:"A comma is used after a fronted adverbial. 'After the match' is the fronted adverbial.",topic:"Fronted adverbials",mode:"apply"},
    {q:"'The girls' changing room was clean.' The apostrophe shows:",opts:["A) A missing letter","B) Possession by one girl","C) Possession by more than one girl","D) A plural"],ci:2,exp:"When the noun is already plural (girls), the apostrophe comes AFTER the s.",topic:"Apostrophes",mode:"identify"},
    {q:"Which word is a determiner in: 'Every child must try'?",opts:["A) child","B) Every","C) must","D) try"],ci:1,exp:"A determiner specifies a noun. 'Every' tells us which children are being referred to.",topic:"Determiners",mode:"identify"}
  ],
  year5:[
    {q:"'She might come to the party.' What type of verb is 'might'?",opts:["A) Main verb","B) Auxiliary verb","C) Modal verb","D) Passive verb"],ci:2,exp:"Modal verbs (might, should, could, will, must) indicate possibility or necessity.",topic:"Modal verbs",mode:"terminology"},
    {q:"'The dog, which was very old, slept by the fire.' The underlined part is a:",opts:["A) Main clause","B) Fronted adverbial","C) Relative clause","D) Subordinate clause beginning with because"],ci:2,exp:"A relative clause gives extra information about a noun. It begins with who, which, where, when or whose.",topic:"Relative clauses",mode:"terminology"},
    {q:"Which sentence uses brackets for parenthesis?",opts:["A) My teacher (Mr Smith) is very kind.","B) My teacher, Mr Smith is very kind.","C) My teacher Mr Smith, is very kind.","D) My (teacher) Mr Smith is very kind."],ci:0,exp:"Parenthesis adds extra information. Brackets, dashes or commas can be used to mark it.",topic:"Parenthesis",mode:"apply"},
    {q:"'Perhaps we could try again tomorrow.' What does 'perhaps' indicate?",opts:["A) Certainty","B) A command","C) Degree of possibility","D) Past tense"],ci:2,exp:"Adverbs like 'perhaps', 'possibly', 'definitely' and 'surely' indicate degrees of possibility.",topic:"Modal adverbs",mode:"identify"},
    {q:"Which sentence uses a comma correctly to avoid ambiguity?",opts:["A) Let's eat Grandma!","B) Let's eat, Grandma!","C) Lets eat Grandma!","D) Let's eat; Grandma!"],ci:1,exp:"The comma after 'eat' separates the address from the rest of the sentence, making the meaning clear.",topic:"Commas",mode:"apply"}
  ],
  year6:[
    {q:"'The window was broken by the ball.' This sentence is written in the:",opts:["A) Active voice","B) Passive voice","C) Future tense","D) Present perfect"],ci:1,exp:"The passive voice puts the object first. The subject (ball) comes after 'by'. Active: 'The ball broke the window.'",topic:"Active and passive",mode:"terminology"},
    {q:"It's raining; I'm fed up. What does the semicolon do here?",opts:["A) Introduces a list","B) Marks possession","C) Links two independent clauses","D) Shows a missing letter"],ci:2,exp:"A semicolon links two closely related independent clauses without using a conjunction.",topic:"Semicolons",mode:"identify"},
    {q:"Which is an example of formal vocabulary?",opts:["A) Find out","B) Ask for","C) Commence","D) Go in"],ci:2,exp:"'Commence' is formal vocabulary meaning 'begin'. Formal writing avoids informal phrases like 'find out' or 'go in'.",topic:"Formal and informal",mode:"identify"},
    {q:"'The man-eating shark.' What does the hyphen do?",opts:["A) Shows a missing letter","B) Marks possession","C) Avoids ambiguity","D) Introduces a list"],ci:2,exp:"Without the hyphen, 'man eating shark' could mean a man who is eating a shark. The hyphen clarifies the meaning.",topic:"Hyphens",mode:"apply"},
    {q:"'Were she to arrive early, we could start.' The underlined verb form is:",opts:["A) Simple past","B) Present perfect","C) Subjunctive","D) Passive"],ci:2,exp:"The subjunctive form is used in formal or hypothetical contexts. 'Were she' (not 'was she') is subjunctive.",topic:"Subjunctive",mode:"identify"}
  ]
};
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
// NOTE: defined but not currently wired into any error-handling path anywhere
// in the app — loadQ's catch block shows an error message + retry button
// instead of falling back to these. Kept up to date with the current taxonomy
// in case this gets connected later; flagged for a product decision on
// whether to wire it in or remove it as unused.
var FALLBACKS={
  maths:  {question:"What is 3/4 of 48?",options:["A) 24","B) 36","C) 32","D) 40"],correctIndex:1,explanation:"48 / 4 = 12. 12 x 3 = 36. Answer is B) 36.",hint:"Find one quarter first.",topic:"Fractions"},
  english:{question:"A reading passage and its questions could not be generated. Please retry.",options:["A) Retry","B) Retry","C) Retry","D) Retry"],correctIndex:0,explanation:"This is a placeholder shown only if live question generation fails.",hint:"Retry to load a real question.",topic:"Reading Comprehension"},
  verbal: {question:"Look at this series of letter-pairs: BD, DF, FH, ?\n\nWhich pair of letters comes next?",options:["A) GI","B) HJ","C) HI","D) GJ","E) IJ"],correctIndex:1,explanation:"Each pair moves on by 2 letters. Answer is B) HJ.",hint:"Look at how much each letter shifts along the alphabet.",topic:"Letter Series"},
  nvr:    {question:"Live question generation failed — please retry to load a real shape-based question.",options:["A) Retry","B) Retry","C) Retry","D) Retry"],correctIndex:0,explanation:"This is a placeholder shown only if live question generation fails.",hint:"Retry to load a real question.",topic:"Series"},
  writing:{question:"Write a story opening about discovering a mysterious door in your school.",type:"writing",guidance:["Hook the reader immediately","Use vivid sensory details","Build tension and mystery"],modelAnswer:"The door had not been there on Monday. Its ancient oak surface stood where the broom cupboard used to be.",explanation:"Examiners reward vivid description and immediate engagement.",hint:"Start with something unexpected.",topic:"Narrative Story"}
};
