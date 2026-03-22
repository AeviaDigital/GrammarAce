
// ── GROQ API CALL ─────────────────────────────────────────────────────────────
async function callGroq(apiKey,prompt){
  var res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],max_tokens:1024,temperature:0.8})
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
function buildPrompt(subj,topic,yearId,prevQs){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var avoid=prevQs.length>0?" Do NOT repeat: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  if(subj==="writing"){
    return "You are a UK exam question writer. Create one creative writing task for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\nRespond with ONLY a valid JSON object, no markdown:\n{\"question\":\"2-3 sentence writing prompt\",\"type\":\"writing\",\"guidance\":[\"tip1\",\"tip2\",\"tip3\"],\"modelAnswer\":\"strong 2-sentence example opening\",\"explanation\":\"what 11+ examiners look for\",\"hint\":\"one key technique\",\"topic\":\""+topic+"\"}";
  }
  var sn=subj==="nvr"?"Non-Verbal Reasoning (text-based: sequences, codes, analogies only)":subj==="english"?"English and Verbal Reasoning":"Mathematics";
  return "You are a UK exam question writer. Create one "+sn+" multiple choice question for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\n\nSTEP 1 — Work out the correct answer yourself first, showing your working.\nSTEP 2 — Write 4 options (A B C D) where exactly one is correct.\nSTEP 3 — Set correctIndex to match the correct option (0=A, 1=B, 2=C, 3=D).\nSTEP 4 — Write the explanation starting with the correct letter, e.g. \"The answer is B) 2 because...\".\nSTEP 5 — Double-check: does your explanation letter match your correctIndex number? If not, fix it before responding.\n\nCRITICAL RULES:\n- correctIndex MUST match the option your explanation identifies as correct\n- For "+yr+" difficulty — keep arithmetic simple and age-appropriate\n- Options must be clearly different from each other\n\nRespond with ONLY a valid JSON object, no markdown, no preamble:\n{\"question\":\"question text\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"correctIndex\":1,\"explanation\":\"The answer is [LETTER]) [VALUE] because [WORKING]\",\"hint\":\"hint without giving answer\",\"topic\":\""+topic+"\"}";
}

function buildFeedbackPrompt(question,answer,yearId){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  return "You are an experienced UK 11+ examiner marking creative writing for "+yr+".\n\nWriting prompt: "+question+"\n\nStudent answer:\n"+answer+"\n\nEvaluate against 11+ criteria. Be encouraging but specific.\nRespond with ONLY a valid JSON object, no markdown:\n{\"score\":7,\"scoreOutOf\":10,\"grade\":\"Good\",\"praise\":\"2-3 specific sentences\",\"improvements\":\"2-3 specific improvements\",\"examinerComment\":\"1-2 sentences overall\",\"vocabulary\":6,\"structure\":7,\"creativity\":8,\"detail\":6}\ngrade must be one of: Excellent, Good, Developing, Needs Work.";
}

// ── QUESTION VALIDATOR ────────────────────────────────────────────────────────
function validateQuestion(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(p.type==="writing") return p;
  if(!p.question) throw new Error("Missing question text");
  if(!Array.isArray(p.options)||p.options.length!==4) throw new Error("Expected exactly 4 options");
  var ci=parseInt(p.correctIndex,10);
  if(isNaN(ci)||ci<0||ci>3) throw new Error("Invalid correctIndex: "+p.correctIndex);
  p.correctIndex=ci;

  // Reconciliation: scan explanation for "The answer is X)" or "answer is X)" pattern
  // and override correctIndex if it disagrees with the stated letter
  if(p.explanation){
    var expl=p.explanation.toUpperCase();
    // Look for patterns like "answer is A)", "is B)", "option C)", "correct is D)"
    var patterns=[
      /(?:THE\s+)?(?:CORRECT\s+)?ANSWER\s+IS\s+([ABCD])\s*\)/i,
      /(?:CORRECT\s+)?OPTION\s+IS\s+([ABCD])\s*\)/i,
      /^([ABCD])\s*\)\s+IS\s+CORRECT/i,
      /THEREFORE\s+([ABCD])\s*\)/i,
      /SO\s+THE\s+ANSWER\s+IS\s+([ABCD])\s*\)/i
    ];
    var letterMap={A:0,B:1,C:2,D:3};
    for(var k=0;k<patterns.length;k++){
      var m=p.explanation.match(patterns[k]);
      if(m){
        var foundLetter=m[1].toUpperCase();
        var foundIdx=letterMap[foundLetter];
        if(foundIdx!==undefined&&foundIdx!==p.correctIndex){
          console.warn("correctIndex mismatch: JSON says "+p.correctIndex+" but explanation says "+foundLetter+"("+foundIdx+"). Using explanation value.");
          p.correctIndex=foundIdx;
        }
        break;
      }
    }
  }
  return p;
}

// ── MATHS ARITHMETIC VALIDATOR (Option 2) ────────────────────────────────────
function tryMathsValidate(p){
  // Only attempt if we have a question and 4 numeric-ish options
  if(!p||!p.question||p.type==="writing") return p;
  var q=p.question;
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
async function doublePassValidate(apiKey,p){
  if(!p||p.type==="writing") return p;
  try{
    var prompt="You are checking a multiple choice exam question for accuracy.\n\nQuestion: "+p.question+"\nOptions:\n"+p.options.join("\n")+"\nMarked correct answer: option index "+p.correctIndex+" which is: "+p.options[p.correctIndex]+"\n\nIs this the correct answer? Think carefully.\nReply with ONLY a valid JSON object, no markdown:\n{\"correct\":true}\nOR if wrong:\n{\"correct\":false,\"correctIndex\":1,\"reason\":\"brief reason\"}\ncorrectIndex must be 0=A, 1=B, 2=C, 3=D.";
    var raw=await callGroq(apiKey,prompt);
    var result=JSON.parse(raw);
    if(result.correct===false&&typeof result.correctIndex==="number"&&result.correctIndex>=0&&result.correctIndex<=3&&result.correctIndex!==p.correctIndex){
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
      model:"meta-llama/llama-4-scout-17b-16e-instruct",
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
