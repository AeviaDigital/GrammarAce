// ══════════════════════════════════════════════════════════════════════════════
// VISUAL NON-VERBAL REASONING — shared helpers
// The actual shape-rendering engine and question templates now live in
// nvr-shapes.js (composite SVG engine, 30 primitives) and nvr-templates-v2.js
// (the 6 question templates: Series, Odd One Out, Mirror Image, Matrix, Shape
// Analogy, Shape Codes). This file just keeps the small set of generic helpers
// those two depend on, plus the topic list app.js checks against.
//
// Superseded: the original single-primitive/binary-fill engine that used to
// live in this file (nvrRenderShape, nvrTplRotation, etc.) has been removed —
// nothing else in the app referenced those functions (checked via grep before
// deleting), so there's no dead-code risk in taking them out entirely.
// ══════════════════════════════════════════════════════════════════════════════

// Topic names here match TOPICS.nvr in constants.js exactly, so the same label
// works whether a question is generated visually (deterministic SVG) or via
// the LLM text-based fallback.
var NVR_VISUAL_TOPICS = ["Series","Odd One Out","Mirror Image","Matrix","Shape Analogy","Shape Codes"];

function nvrPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function nvrShuffle(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function nvrEasy(yearId){ return yearId==="year1"||yearId==="year2"||yearId==="year3"; }
