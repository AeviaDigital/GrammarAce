// ══════════════════════════════════════════════════════════════════════════════
// VISUAL NON-VERBAL REASONING ENGINE
// Hand-built SVG shape generator. Every question here is constructed and solved
// by plain geometry/JS, NOT by an LLM — so the correct answer is guaranteed
// correct, unlike the AI-generated text-based subjects elsewhere in the app.
// ══════════════════════════════════════════════════════════════════════════════

var NVR_VISUAL_TOPICS = ["Rotation Series","Odd One Out (Shapes)","Mirror Image","Pattern Matrix"];

var NVR_PALETTE = ["#4361EE","#EF5DA8","#06D6A0","#FFD166","#FF9F1C","#7B2FBE"];
var NVR_STROKE = "#1E2654";

// ── GEOMETRY HELPERS ──────────────────────────────────────────────────────────
function nvrRegularPolygon(sides,cx,cy,r,rotDeg){
  var pts=[], rot=(rotDeg||0)*Math.PI/180;
  for(var i=0;i<sides;i++){
    var theta=rot+i*2*Math.PI/sides-Math.PI/2;
    pts.push([cx+r*Math.cos(theta),cy+r*Math.sin(theta)]);
  }
  return pts;
}
function nvrStar(cx,cy,rOuter,rInner,rotDeg){
  var pts=[], rot=(rotDeg||0)*Math.PI/180, points=5;
  for(var i=0;i<points*2;i++){
    var r=i%2===0?rOuter:rInner;
    var theta=rot+i*Math.PI/points-Math.PI/2;
    pts.push([cx+r*Math.cos(theta),cy+r*Math.sin(theta)]);
  }
  return pts;
}
// Asymmetric "flag" (L-shaped hexagon) — has no rotational or mirror symmetry,
// so rotations and mirror images are always visually distinct from each other.
function nvrFlagBase(){
  return [[16,10],[44,10],[44,26],[28,26],[28,50],[16,50]];
}
function nvrRotatePoints(pts,cx,cy,angleDeg){
  var rad=angleDeg*Math.PI/180;
  return pts.map(function(p){
    var dx=p[0]-cx, dy=p[1]-cy;
    return [cx+dx*Math.cos(rad)-dy*Math.sin(rad), cy+dx*Math.sin(rad)+dy*Math.cos(rad)];
  });
}
function nvrMirrorPoints(pts,cx){
  return pts.map(function(p){return [cx*2-p[0],p[1]];});
}
function nvrPathD(pts){
  return pts.map(function(p,i){return (i===0?"M":"L")+p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ")+" Z";
}
function nvrSvgWrap(inner){
  return '<svg viewBox="0 0 60 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block">'+inner+'</svg>';
}

// ── SHAPE RENDERERS ───────────────────────────────────────────────────────────
// spec: {kind:"flag"|"circleDot"|"poly", sides, rotation, color, mirrored, fillOnly}
function nvrRenderShape(spec){
  var color=spec.color||NVR_PALETTE[0];
  var rot=spec.rotation||0;
  if(spec.kind==="circleDot"){
    var cx=30,cy=30,r=20;
    var rad=(rot-90)*Math.PI/180;
    var dx=cx+r*0.82*Math.cos(rad), dy=cy+r*0.82*Math.sin(rad);
    var fillAttr=spec.fillOnly===false?'fill="none"':'fill="'+color+'22"';
    return nvrSvgWrap(
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" '+fillAttr+' stroke="'+color+'" stroke-width="4"/>'+
      '<circle cx="'+dx.toFixed(1)+'" cy="'+dy.toFixed(1)+'" r="5" fill="'+color+'"/>'
    );
  }
  if(spec.kind==="flag"){
    var base=nvrFlagBase();
    var cx=30,cy=30;
    if(spec.mirrored) base=nvrMirrorPoints(base,cx);
    var pts=nvrRotatePoints(base,cx,cy,rot);
    var fill=spec.fillOnly===false?"none":color;
    return nvrSvgWrap('<path d="'+nvrPathD(pts)+'" fill="'+fill+'" stroke="'+(spec.fillOnly===false?color:NVR_STROKE)+'" stroke-width="2.5"/>');
  }
  if(spec.kind==="star"){
    var pts=nvrStar(30,30,20,8,rot);
    var fill=spec.fillOnly===false?"none":color;
    return nvrSvgWrap('<path d="'+nvrPathD(pts)+'" fill="'+fill+'" stroke="'+(spec.fillOnly===false?color:NVR_STROKE)+'" stroke-width="2.5"/>');
  }
  // regular polygon
  var pts=nvrRegularPolygon(spec.sides||6,30,30,20,rot);
  var fill=spec.fillOnly===false?"none":color;
  return nvrSvgWrap('<path d="'+nvrPathD(pts)+'" fill="'+fill+'" stroke="'+(spec.fillOnly===false?color:NVR_STROKE)+'" stroke-width="2.5"/>');
}

function nvrPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function nvrShuffle(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}
function nvrEasy(yearId){ return yearId==="year1"||yearId==="year2"||yearId==="year3"; }

// ── TEMPLATE: ROTATION SERIES ─────────────────────────────────────────────────
function nvrTplRotation(yearId){
  var easy=nvrEasy(yearId);
  var kind=nvrPick(["flag","circleDot"]);
  var color=nvrPick(NVR_PALETTE);
  var step=easy?nvrPick([90,90,60]):nvrPick([30,45,60]);
  var start=nvrPick([0,15,30,45]);
  var frames=[0,1,2].map(function(i){return nvrRenderShape({kind:kind,color:color,rotation:start+i*step});});
  var correctAngle=(start+3*step)%360;
  var correctSvg=nvrRenderShape({kind:kind,color:color,rotation:correctAngle});
  var usedAngles=[correctAngle];
  var distractors=[];
  var candidates=nvrShuffle([start,(start+step)%360,(start+2*step)%360,(start+4*step)%360,(start+5*step)%360,(start-step+360)%360,(start+step*2+15)%360]);
  for(var i=0;i<candidates.length&&distractors.length<3;i++){
    var a=candidates[i];
    if(usedAngles.indexOf(a)===-1){ usedAngles.push(a); distractors.push(nvrRenderShape({kind:kind,color:color,rotation:a})); }
  }
  while(distractors.length<3){
    var rand=Math.floor(Math.random()*360);
    if(usedAngles.indexOf(rand)===-1){ usedAngles.push(rand); distractors.push(nvrRenderShape({kind:kind,color:color,rotation:rand})); }
  }
  var options=nvrShuffle([{svg:correctSvg,correct:true}].concat(distractors.map(function(d){return {svg:d,correct:false};})));
  return {
    visual:true, kind:"rotation",
    question:"Look at the sequence. Each shape turns by the same amount. Which option comes next?",
    displaySvgs:frames,
    optionsSvg:options.map(function(o){return o.svg;}),
    correctIndex:options.findIndex(function(o){return o.correct;}),
    explanation:"Each shape rotates "+step+"\u00b0 clockwise from the one before it. Continuing that pattern from the third shape gives the correct next rotation.",
    hint:"Watch how far the shape turns between each frame — the next one turns by exactly the same amount.",
    topic:"Rotation Series"
  };
}

// ── TEMPLATE: ODD ONE OUT ─────────────────────────────────────────────────────
function nvrTplOddOneOut(yearId){
  var attr=nvrPick(["shape","color","fill"]);
  var oddIdx=Math.floor(Math.random()*4);
  // Each option gets a guaranteed-distinct rotation so two "matching" options
  // can never render as byte-identical SVGs (which would break the puzzle).
  var rotations=nvrShuffle([0,18,36,54]);
  var options=[], explanation="";
  if(attr==="shape"){
    var shapeChoices=nvrShuffle([{sides:6,name:"hexagon"},{sides:5,name:"pentagon"},{sides:4,name:"square"},{sides:3,name:"triangle"}]);
    var base=shapeChoices[0], odd=shapeChoices[1];
    var color=nvrPick(NVR_PALETTE);
    for(var i=0;i<4;i++) options.push(i===oddIdx?nvrRenderShape({kind:"poly",sides:odd.sides,color:color,rotation:rotations[i]}):nvrRenderShape({kind:"poly",sides:base.sides,color:color,rotation:rotations[i]}));
    explanation="Three shapes are "+base.name+"s (\u200b"+base.sides+" sides), but the odd one out is a "+odd.name+" ("+odd.sides+" sides).";
  }else if(attr==="color"){
    var cols=nvrShuffle(NVR_PALETTE);
    var base=cols[0], odd=cols[1];
    var sides=nvrPick([4,5,6]);
    for(var i=0;i<4;i++) options.push(nvrRenderShape({kind:"poly",sides:sides,color:i===oddIdx?odd:base,rotation:rotations[i]}));
    explanation="Three shapes share the same colour, but the odd one out is a different colour.";
  }else{
    var sides=nvrPick([4,5,6]);
    var color=nvrPick(NVR_PALETTE);
    for(var i=0;i<4;i++) options.push(nvrRenderShape({kind:"poly",sides:sides,color:color,fillOnly:i!==oddIdx,rotation:rotations[i]}));
    explanation="Three shapes are solid (filled in), but the odd one out is an outline only — no fill.";
  }
  return {
    visual:true, kind:"oddOneOut",
    question:"Three of these four shapes share something in common. Which one does NOT belong?",
    displaySvgs:null,
    optionsSvg:options,
    correctIndex:oddIdx,
    explanation:explanation,
    hint:"Compare shape, colour and fill across all four options — three will match on one of those.",
    topic:"Odd One Out (Shapes)"
  };
}

// ── TEMPLATE: MIRROR IMAGE ────────────────────────────────────────────────────
function nvrTplMirror(yearId){
  var color=nvrPick(NVR_PALETTE);
  var rotation=nvrPick([0,20,40,60,80]);
  var shown=nvrRenderShape({kind:"flag",color:color,rotation:rotation,mirrored:false});
  var correctSvg=nvrRenderShape({kind:"flag",color:color,rotation:rotation,mirrored:true});
  var distractorAngles=nvrShuffle([0,90,180,270].filter(function(a){return a!==0;})).slice(0,2);
  distractorAngles.push((rotation+150)%360);
  var distractors=distractorAngles.map(function(a){return nvrRenderShape({kind:"flag",color:color,rotation:(rotation+a)%360,mirrored:false});});
  var options=nvrShuffle([{svg:correctSvg,correct:true}].concat(distractors.map(function(d){return {svg:d,correct:false};})));
  return {
    visual:true, kind:"mirror",
    question:"Which option is the mirror image of the shape shown (flipped left-to-right, not rotated)?",
    displaySvgs:[shown],
    optionsSvg:options.map(function(o){return o.svg;}),
    correctIndex:options.findIndex(function(o){return o.correct;}),
    explanation:"A mirror image is flipped left-to-right like a reflection, not turned. The other options are just the original shape rotated, which changes its orientation but not its 'handedness'.",
    hint:"Imagine holding the shape up to a mirror on its right side — that flipped version is the answer, not a turned version.",
    topic:"Mirror Image"
  };
}

// ── TEMPLATE: PATTERN MATRIX (2x2 grid, one cell missing) ────────────────────
function nvrTplMatrix(yearId){
  var easy=nvrEasy(yearId);
  var kind=nvrPick(["flag","circleDot"]);
  var color=nvrPick(NVR_PALETTE);
  var step=easy?90:nvrPick([45,60,90]);
  var start=nvrPick([0,15,30]);
  var cellA=nvrRenderShape({kind:kind,color:color,rotation:start});
  var cellB=nvrRenderShape({kind:kind,color:color,rotation:start+step});
  var cellC=nvrRenderShape({kind:kind,color:color,rotation:start+2*step});
  var correctAngle=(start+3*step)%360;
  var correctSvg=nvrRenderShape({kind:kind,color:color,rotation:correctAngle});
  var gridSvg='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;width:120px;margin:0 auto;">'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellA+'</div>'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellB+'</div>'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellC+'</div>'+
    '<div style="background:'+CARD+';border:2px dashed '+MUTED+';border-radius:8px;padding:6px;display:flex;align-items:center;justify-content:center;color:'+MUTED+';font-size:26px;font-weight:900;">?</div>'+
  '</div>';
  var usedAngles=[correctAngle];
  var distractors=[];
  var candidates=nvrShuffle([start,(start+step)%360,(start+2*step)%360,(start+4*step)%360,(start-step+360)%360,(start+step+25)%360]);
  for(var i=0;i<candidates.length&&distractors.length<3;i++){
    var a=candidates[i];
    if(usedAngles.indexOf(a)===-1){ usedAngles.push(a); distractors.push(nvrRenderShape({kind:kind,color:color,rotation:a})); }
  }
  while(distractors.length<3){
    var rand=Math.floor(Math.random()*360);
    if(usedAngles.indexOf(rand)===-1){ usedAngles.push(rand); distractors.push(nvrRenderShape({kind:kind,color:color,rotation:rand})); }
  }
  var options=nvrShuffle([{svg:correctSvg,correct:true}].concat(distractors.map(function(d){return {svg:d,correct:false};})));
  return {
    visual:true, kind:"matrix", html:true,
    question:"The grid follows a pattern reading left-to-right, top-to-bottom. Which shape completes the missing cell?",
    displaySvgs:[gridSvg],
    displayIsHtml:true,
    optionsSvg:options.map(function(o){return o.svg;}),
    correctIndex:options.findIndex(function(o){return o.correct;}),
    explanation:"Reading across the grid, the shape rotates "+step+"\u00b0 each step. The missing cell continues that same rotation.",
    hint:"Treat the three visible cells like a rotation sequence — the same rule applies to the missing one.",
    topic:"Pattern Matrix"
  };
}

function generateVisualNVR(topic,yearId){
  var fn=topic==="Odd One Out (Shapes)"?nvrTplOddOneOut
        :topic==="Mirror Image"?nvrTplMirror
        :topic==="Pattern Matrix"?nvrTplMatrix
        :nvrTplRotation;
  return fn(yearId);
}
