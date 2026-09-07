
// ── QUESTION BANK (IndexedDB) ─────────────────────────────────────────────────
// Persistent, cross-session store of every question/passage/prompt ever served,
// organised per profile + subject + topic + year. Two jobs:
//   1. Seed a genuine "don't repeat these" list into generation prompts, pulled
//      from real past sessions — not just the current one.
//   2. Hard-check newly generated content against EVERYTHING previously served
//      for that exact combo (not just recent ones), with one retry on collision.
// Uses IndexedDB rather than localStorage specifically because a 10,000-per-combo
// cap would blow well past localStorage's ~5-10MB origin quota; IndexedDB has
// much higher practical limits and is still fully client-side (no backend).
// Degrades to a silent no-op if IndexedDB is unavailable, so a restrictive
// browser/environment never breaks question generation — it just loses dedup.
var QBANK_DB_NAME="grammarace_qbank";
var QBANK_STORE="questions";
var QBANK_CAP=10000; // max records kept per profile+subject+topic+year combo
var qbankDbPromise=null;

function qbankAvailable(){
  try{ return typeof indexedDB!=="undefined"&&indexedDB!==null; }catch(e){ return false; }
}

function qbankOpen(){
  if(!qbankAvailable()) return Promise.resolve(null);
  if(qbankDbPromise) return qbankDbPromise;
  qbankDbPromise=new Promise(function(resolve){
    try{
      var req=indexedDB.open(QBANK_DB_NAME,1);
      req.onupgradeneeded=function(e){
        var db=e.target.result;
        if(!db.objectStoreNames.contains(QBANK_STORE)){
          var store=db.createObjectStore(QBANK_STORE,{keyPath:"id",autoIncrement:true});
          store.createIndex("combo","combo",{unique:false});
        }
      };
      req.onsuccess=function(e){ resolve(e.target.result); };
      req.onerror=function(){ console.warn("qbank: IndexedDB open failed — duplicate-checking disabled for this session."); resolve(null); };
    }catch(e){ console.warn("qbank: IndexedDB unavailable",e); resolve(null); }
  });
  return qbankDbPromise;
}

function qbankComboKey(profileId,subject,topic,yearId){
  return profileId+"|"+subject+"|"+topic+"|"+yearId;
}
function qbankNormalize(text){
  return (text||"").toLowerCase().replace(/\s+/g," ").trim();
}
// Small, fast, non-cryptographic string hash — used only to keep NVR-visual
// "signatures" (which embed full SVG markup) compact in storage rather than
// writing kilobytes of markup per record.
function qbankHash(str){
  var h=5381;
  for(var i=0;i<str.length;i++){ h=((h<<5)+h+str.charCodeAt(i))|0; }
  return "h"+(h>>>0).toString(36);
}

function qbankFetchCombo(db,combo){
  return new Promise(function(resolve){
    if(!db){ resolve([]); return; }
    try{
      var tx=db.transaction(QBANK_STORE,"readonly");
      var idx=tx.objectStore(QBANK_STORE).index("combo");
      var req=idx.getAll(combo);
      req.onsuccess=function(){ resolve(req.result||[]); };
      req.onerror=function(){ resolve([]); };
    }catch(e){ resolve([]); }
  });
}

// Up to n most recent RAW texts for this exact combo, most recent first —
// used to seed "avoid repeating these" into a generation prompt.
async function qbankRecentRaw(profileId,subject,topic,yearId,n){
  var db=await qbankOpen();
  if(!db) return [];
  var combo=qbankComboKey(profileId,subject,topic,yearId);
  var rows=await qbankFetchCombo(db,combo);
  rows.sort(function(a,b){ return b.timestamp-a.timestamp; });
  return rows.slice(0,n||8).map(function(r){ return r.raw; });
}

// Checks newly generated content against EVERY record previously stored for
// this combo. If new, records it and trims the combo back to QBANK_CAP if it
// just went over. Returns true if it was a duplicate (caller should retry
// generation), false if it was newly recorded (safe to serve).
async function qbankCheckAndRecord(profileId,subject,topic,yearId,text){
  var db=await qbankOpen();
  if(!db) return false; // dedup unavailable — never block serving a question over a storage issue
  var combo=qbankComboKey(profileId,subject,topic,yearId);
  var rows=await qbankFetchCombo(db,combo);
  var norm=qbankNormalize(text);
  if(rows.some(function(r){ return r.normalized===norm; })) return true;
  try{
    var tx=db.transaction(QBANK_STORE,"readwrite");
    var store=tx.objectStore(QBANK_STORE);
    store.add({combo:combo,normalized:norm,raw:text,timestamp:Date.now()});
    if(rows.length+1>QBANK_CAP){
      var oldest=rows.slice().sort(function(a,b){ return a.timestamp-b.timestamp; }).slice(0,rows.length+1-QBANK_CAP);
      oldest.forEach(function(r){ store.delete(r.id); });
    }
  }catch(e){ console.warn("qbank: write failed",e); }
  return false;
}

// Runs a generator once, checks its dedup-text against the qbank, and retries
// exactly once on a collision before giving up and serving it anyway (so a
// stubborn LLM can never cause an infinite loop or run up API costs).
// genFn: async () => result object (already validated)
// textFn: (result) => the string to check/store for dedup purposes
async function qbankGenerateUnique(profileId,subject,topic,yearId,genFn,textFn){
  var result=await genFn();
  var isDup=await qbankCheckAndRecord(profileId,subject,topic,yearId,textFn(result));
  if(isDup){
    result=await genFn();
    await qbankCheckAndRecord(profileId,subject,topic,yearId,textFn(result));
  }
  return result;
}
