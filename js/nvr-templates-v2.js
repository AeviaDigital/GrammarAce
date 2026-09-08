// ══════════════════════════════════════════════════════════════════════════════
// NVR TEMPLATES v2 — rewritten on the nvr-shapes.js composite engine.
// Assumes nvrPick/nvrShuffle/nvrEasy (from nvr-visual.js) and CARD/BORDER/MUTED/
// WHITE (from constants.js) are already in scope, same as the templates they
// replace. Order matches the original file: Series, Odd One Out, Mirror, Matrix,
// Shape Analogy, Shape Codes.
// ══════════════════════════════════════════════════════════════════════════════

// Primitives with NO rotational symmetry — safe for rotation-based templates
// (Series/Matrix/Mirror), same reasoning the old code used to exclude regular
// polygons from those templates.
var NVR_ASYMMETRIC = ["blobA","blobB","arrow","lshape","chevron","teardrop","house","keyhole",
  "pacman","zigzag","plusUneven","lshape2","pennant"]; // trapezoid & heart excluded: both are bilaterally
  // symmetric, so mirroring them is a no-op — confirmed by direct render check, not assumed.
var NVR_PATTERN_CYCLE = ["outline","hatch","dots","solid"];

// Renders a spec to SVG and returns it; used for de-dup checks across options.
function nvrSvgOf(spec){ return nvrRenderSingle(spec); }

// Given a list of candidate specs (already containing the correct one at index
// 0), dedupes by rendered-SVG string and — if collisions leave us short — backs
// fills with small random rotation nudges until 4 visually-distinct options
// exist. Returns {options:[svg...], correctIndex}.
function nvrBuildOptions(specs){
  var seen={}, keep=[];
  specs.forEach(function(s,i){
    if(keep.length>=4) return; // cap: never exceed 4 options; correct (i===0) is processed first so it's always kept
    var svg=nvrSvgOf(s);
    if(!seen[svg]){ seen[svg]=true; keep.push({spec:s,svg:svg,correct:i===0}); }
  });
  var guard=0;
  while(keep.length<4 && guard<40){
    guard++;
    var base=Object.assign({},specs[specs.length-1]);
    base.rotation=((base.rotation||0)+15+Math.floor(Math.random()*300))%360;
    var svg=nvrSvgOf(base);
    if(!seen[svg]){ seen[svg]=true; keep.push({spec:base,svg:svg,correct:false}); }
  }
  var shuffled=nvrShuffle(keep);
  return { options:shuffled.map(function(k){return k.svg;}), correctIndex:shuffled.findIndex(function(k){return k.correct;}) };
}

function nvrBox(svg){
  return '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;width:52px;height:52px;flex-shrink:0;">'+svg+'</div>';
}
function nvrQBox(){
  return '<div style="background:'+CARD+';border:2px dashed '+MUTED+';border-radius:8px;padding:6px;width:52px;height:52px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:'+MUTED+';font-size:22px;font-weight:900;">?</div>';
}
function nvrArrowSep(){ return '<span style="color:'+MUTED+';font-size:18px;padding:0 4px;">\u2192</span>'; }

// ── TEMPLATE: SERIES (rotation, optionally combined with pattern cycling) ────
function nvrTplRotation2(yearId){
  var easy=nvrEasy(yearId);
  var shape=nvrPick(NVR_ASYMMETRIC);
  var color=nvrPick(NVR_PALETTE2);
  var rotStep=easy?nvrPick([60,90]):nvrPick([30,40,45,60]);
  var start=nvrPick([0,20,40]);
  var alsoPattern=!easy && Math.random()<0.5;
  var pIdx0=Math.floor(Math.random()*NVR_PATTERN_CYCLE.length);
  var pStep=alsoPattern?1:0;

  function specAt(i){
    return {shape:shape,color:color,rotation:(start+i*rotStep)%360,
      pattern:NVR_PATTERN_CYCLE[(pIdx0+i*pStep)%NVR_PATTERN_CYCLE.length]};
  }
  var frames=[0,1,2].map(function(i){return nvrRenderSingle(specAt(i));});
  var correctSpec=specAt(3);
  var wrongRot=nvrPick([1,2,4,5].filter(function(k){return k!==3;}));
  var candidateSpecs=[
    correctSpec,
    Object.assign({},correctSpec,{rotation:specAt(wrongRot).rotation}),        // wrong rotation amount
    Object.assign({},correctSpec,{pattern:NVR_PATTERN_CYCLE[(pIdx0+2*pStep+1)%NVR_PATTERN_CYCLE.length]}), // right rotation, wrong pattern
    specAt(2)                                                                   // no progress at all
  ];
  var built=nvrBuildOptions(candidateSpecs);
  var desc="rotates "+rotStep+"\u00b0 clockwise each step"+(alsoPattern?", and the fill pattern cycles through outline \u2192 hatch \u2192 dots \u2192 solid":"");
  return {
    visual:true, kind:"rotation",
    question:"Look at the sequence. "+(alsoPattern?"Two things change each step.":"Each shape turns by the same amount.")+" Which option comes next?",
    displaySvgs:frames,
    optionsSvg:built.options,
    correctIndex:built.correctIndex,
    explanation:"Going along the sequence, the shape "+desc+". Continuing that same pattern gives the correct next shape.",
    hint:alsoPattern?"Track the rotation and the fill pattern separately — both change by a fixed amount each step.":"Watch how far the shape turns between each frame — the next one turns by exactly the same amount.",
    topic:"Series"
  };
}

// ── TEMPLATE: ODD ONE OUT ─────────────────────────────────────────────────────
function nvrTplOddOneOut2(yearId){
  var attr=nvrPick(["shape","color","pattern","decoration"]);
  var oddIdx=Math.floor(Math.random()*4);
  var rotations=nvrShuffle([0,15,30,45]);
  var options=[], explanation="";

  if(attr==="shape"){
    var shapes=nvrShuffle(NVR_SIMPLE_SHAPES);
    var base=shapes[0], odd=shapes[1];
    var color=nvrPick(NVR_PALETTE2);
    for(var i=0;i<4;i++) options.push(nvrRenderSingle({shape:i===oddIdx?odd:base,color:color,rotation:rotations[i]}));
    explanation="Three shapes are "+base+"s, but the odd one out is a "+odd+".";
  }else if(attr==="color"){
    var cols=nvrShuffle(NVR_PALETTE2);
    var base=cols[0], odd=cols[1];
    var shape=nvrPick(NVR_SIMPLE_SHAPES);
    for(var i=0;i<4;i++) options.push(nvrRenderSingle({shape:shape,color:i===oddIdx?odd:base,rotation:rotations[i]}));
    explanation="Three shapes share the same colour, but the odd one out is a different colour.";
  }else if(attr==="pattern"){
    var pats=nvrShuffle(NVR_PATTERN_CYCLE.concat(["crosshatch"]));
    var base=pats[0], odd=pats[1];
    var shape=nvrPick(NVR_SIMPLE_SHAPES);
    var color=nvrPick(NVR_PALETTE2);
    for(var i=0;i<4;i++) options.push(nvrRenderSingle({shape:shape,color:color,pattern:i===oddIdx?odd:base,rotation:rotations[i]}));
    explanation="Three shapes share the same fill pattern ("+base+"), but the odd one out is filled with "+odd+" instead.";
  }else{ // decoration: three have a small dot at the same anchor, one doesn't (or has it elsewhere)
    var shape=nvrPick(["circle","square","hexagon","octagon","diamond"]);
    var color=nvrPick(NVR_PALETTE2);
    var anchor=nvrPick(["N","S","E","W"]);
    var oddAnchor=nvrPick(["N","S","E","W"].filter(function(a){return a!==anchor;}));
    for(var i=0;i<4;i++){
      var decoAnchor=i===oddIdx?oddAnchor:anchor;
      options.push(nvrRenderWithDecorations({shape:shape,color:color,pattern:"outline",rotation:rotations[i]},
        [{anchor:decoAnchor,shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}]));
    }
    explanation="Three shapes have a small dot on the same side, but the odd one out has its dot on a different side.";
  }
  return {
    visual:true, kind:"oddOneOut",
    question:"Three of these four shapes share something in common. Which one does NOT belong?",
    displaySvgs:null,
    optionsSvg:options,
    correctIndex:oddIdx,
    explanation:explanation,
    hint:"Compare shape, colour, fill pattern and any small marks across all four options — three will match on one of those.",
    topic:"Odd One Out"
  };
}

// ── TEMPLATE: MIRROR IMAGE ────────────────────────────────────────────────────
function nvrTplMirror2(yearId){
  var shape=nvrPick(NVR_ASYMMETRIC);
  var color=nvrPick(NVR_PALETTE2);
  var pattern=nvrPick(["solid","outline","hatch","dots"]);
  var rotation=nvrPick([0,20,40,60,80,100]);
  var shownSpec={shape:shape,color:color,pattern:pattern,rotation:rotation};
  var correctSpec={shape:shape,color:color,pattern:pattern,rotation:rotation,mirrored:true};
  var shown=nvrRenderSingle(shownSpec);

  var distractorSpecs=[
    {shape:shape,color:color,pattern:pattern,rotation:(rotation+90)%360},               // rotated, not mirrored
    {shape:shape,color:color,pattern:pattern,rotation:(rotation+180)%360},              // rotated 180, not mirrored
    {shape:shape,color:color,pattern:pattern,rotation:rotation},                        // identical to shown (no change)
    {shape:shape,color:color,pattern:nvrPick(NVR_PATTERN_CYCLE.filter(function(p){return p!==pattern;})),rotation:rotation,mirrored:true} // right mirror, wrong pattern
  ];
  var built=nvrBuildOptions([correctSpec].concat(distractorSpecs));
  return {
    visual:true, kind:"mirror",
    question:"Which option is the mirror image of the shape shown (flipped left-to-right, not rotated)?",
    displaySvgs:[shown],
    optionsSvg:built.options,
    correctIndex:built.correctIndex,
    explanation:"A mirror image is flipped left-to-right like a reflection, not turned. The other options are either the original shape rotated (which changes orientation but not 'handedness') or have the wrong fill pattern.",
    hint:"Imagine holding the shape up to a mirror on its right side — that flipped version is the answer, not a turned or re-coloured version.",
    topic:"Mirror Image"
  };
}

// ── TEMPLATE: PATTERN MATRIX (2x2 grid, one cell missing) ────────────────────
function nvrTplMatrix2(yearId){
  var easy=nvrEasy(yearId);
  var shape=nvrPick(NVR_ASYMMETRIC);
  var color=nvrPick(NVR_PALETTE2);
  var rotStep=easy?90:nvrPick([45,60,90]);
  var start=nvrPick([0,15,30]);
  var alsoPattern=!easy && Math.random()<0.5;
  var pIdx0=Math.floor(Math.random()*NVR_PATTERN_CYCLE.length);
  var pStep=alsoPattern?1:0;

  function specAt(i){
    return {shape:shape,color:color,rotation:(start+i*rotStep)%360,
      pattern:NVR_PATTERN_CYCLE[(pIdx0+i*pStep)%NVR_PATTERN_CYCLE.length]};
  }
  var cellA=nvrRenderSingle(specAt(0)), cellB=nvrRenderSingle(specAt(1)), cellC=nvrRenderSingle(specAt(2));
  var correctSpec=specAt(3);
  var gridSvg='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;width:120px;margin:0 auto;">'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellA+'</div>'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellB+'</div>'+
    '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;">'+cellC+'</div>'+
    '<div style="background:'+CARD+';border:2px dashed '+MUTED+';border-radius:8px;padding:6px;display:flex;align-items:center;justify-content:center;color:'+MUTED+';font-size:26px;font-weight:900;">?</div>'+
  '</div>';
  var wrongRot=nvrPick([0,1,4,5]);
  var candidateSpecs=[
    correctSpec,
    Object.assign({},correctSpec,{rotation:specAt(wrongRot).rotation}),
    Object.assign({},correctSpec,{pattern:NVR_PATTERN_CYCLE[(pIdx0+2*pStep+1)%NVR_PATTERN_CYCLE.length]}),
    specAt(2)
  ];
  var built=nvrBuildOptions(candidateSpecs);
  return {
    visual:true, kind:"matrix", html:true,
    question:"The grid follows a pattern reading left-to-right, top-to-bottom. Which shape completes the missing cell?",
    displaySvgs:[gridSvg],
    displayIsHtml:true,
    optionsSvg:built.options,
    correctIndex:built.correctIndex,
    explanation:"Reading across the grid, the shape rotates "+rotStep+"\u00b0 each step"+(alsoPattern?" and the fill pattern also cycles":"")+". The missing cell continues that same pattern.",
    hint:"Treat the three visible cells like a sequence — the same rule that got you from cell 1 to cell 3 applies to the missing one.",
    topic:"Matrix"
  };
}

// ── TEMPLATE: SHAPE ANALOGY (A is to B as C is to ?) ──────────────────────────
function nvrTplAnalogy2(yearId){
  var shape=nvrPick(NVR_ASYMMETRIC);
  var color=nvrPick(NVR_PALETTE2);
  var colorC=nvrPick(NVR_PALETTE2.filter(function(c){return c!==color;}));
  var baseRotation=nvrPick([0,20,40,60]);
  var rotC=nvrPick([10,50,100,140]);
  var transformType=nvrPick(["rotate","pattern","scale","decoration","rotate+pattern"]);

  var specA={shape:shape,color:color,rotation:baseRotation,pattern:"solid"};
  var specC={shape:shape,color:colorC,rotation:rotC,pattern:"solid"};
  var specB,specCorrect,transformDesc,distractorSpecs;

  if(transformType==="rotate"){
    var delta=nvrPick([60,90,120,150]);
    var wrongDelta=nvrPick([60,90,120,150].filter(function(d){return d!==delta;}));
    specB=Object.assign({},specA,{rotation:(baseRotation+delta)%360});
    specCorrect=Object.assign({},specC,{rotation:(rotC+delta)%360});
    transformDesc="the shape rotates "+delta+"\u00b0 clockwise";
    distractorSpecs=[
      Object.assign({},specC),
      Object.assign({},specC,{rotation:(rotC+wrongDelta)%360}),
      Object.assign({},specC,{pattern:"outline"})
    ];
  }else if(transformType==="pattern"){
    var newPattern=nvrPick(["outline","hatch","dots","half"]);
    specB=Object.assign({},specA,{pattern:newPattern});
    specCorrect=Object.assign({},specC,{pattern:newPattern});
    transformDesc="the fill changes to "+newPattern;
    distractorSpecs=[
      Object.assign({},specC,{rotation:(rotC+90)%360}),
      Object.assign({},specC,{scale:0.6}),
      Object.assign({},specC)
    ];
  }else if(transformType==="scale"){
    specB=Object.assign({},specA,{scale:0.6});
    specCorrect=Object.assign({},specC,{scale:0.6});
    transformDesc="the shape becomes smaller";
    distractorSpecs=[
      Object.assign({},specC),
      Object.assign({},specC,{scale:1.4}),
      Object.assign({},specC,{rotation:(rotC+90)%360})
    ];
  }else if(transformType==="decoration"){
    specB={svgSpec:"decorated", main:specA, deco:{anchor:"N",shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}};
    specCorrect={svgSpec:"decorated", main:specC, deco:{anchor:"N",shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}};
    transformDesc="a small dot is added above the shape";
    distractorSpecs=[
      {svgSpec:"decorated", main:specC, deco:{anchor:"S",shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}}, // dot, wrong side
      {svgSpec:"plain", main:specC},                                                                                    // no dot added
      {svgSpec:"decorated", main:Object.assign({},specC,{rotation:(rotC+90)%360}), deco:{anchor:"N",shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}}
    ];
  }else{ // rotate+pattern combined — matches the "two things change" complexity in the screenshots
    var delta2=nvrPick([60,90,120]);
    var newPattern2=nvrPick(["outline","hatch","dots"]);
    specB=Object.assign({},specA,{rotation:(baseRotation+delta2)%360,pattern:newPattern2});
    specCorrect=Object.assign({},specC,{rotation:(rotC+delta2)%360,pattern:newPattern2});
    transformDesc="the shape rotates "+delta2+"\u00b0 AND the fill changes to "+newPattern2;
    distractorSpecs=[
      Object.assign({},specC,{rotation:(rotC+delta2)%360}),           // rotation right, pattern unchanged
      Object.assign({},specC,{pattern:newPattern2}),                  // pattern right, rotation unchanged
      Object.assign({},specC)                                         // neither changed
    ];
  }

  function renderAnalogySpec(s){
    if(s.svgSpec==="decorated") return nvrRenderWithDecorations(s.main,[s.deco]);
    if(s.svgSpec==="plain") return nvrRenderSingle(s.main);
    return nvrRenderSingle(s);
  }
  var svgA=renderAnalogySpec(specA), svgB=renderAnalogySpec(specB), svgC=renderAnalogySpec(specC);
  // nvrBuildOptions can't dedupe these specs (some are wrapped {svgSpec,main,deco} objects
  // for decorated shapes, not plain shape specs) so options are built manually below.
  var allSpecs=[specCorrect].concat(distractorSpecs);
  var seen={}, keep=[];
  allSpecs.forEach(function(s,i){
    if(keep.length>=4) return;
    var svg=renderAnalogySpec(s);
    if(!seen[svg]){ seen[svg]=true; keep.push({svg:svg,correct:i===0}); }
  });
  var guard=0;
  while(keep.length<4 && guard<20){
    guard++;
    var extra=Object.assign({},specC,{rotation:Math.floor(Math.random()*360)});
    var svg=nvrRenderSingle(extra);
    if(!seen[svg]){ seen[svg]=true; keep.push({svg:svg,correct:false}); }
  }
  var shuffled=nvrShuffle(keep);

  var displayHtml='<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:2px;">'+
    nvrBox(svgA)+nvrArrowSep()+nvrBox(svgB)+
    '<span style="color:'+MUTED+';font-size:14px;padding:0 12px;font-weight:900;">::</span>'+
    nvrBox(svgC)+nvrArrowSep()+nvrQBox()+
  '</div>';

  return {
    visual:true, kind:"analogy", html:true,
    question:"The first shape changes into the second shape in a certain way. Which option completes the second pair in the same way?",
    displaySvgs:[displayHtml],
    displayIsHtml:true,
    optionsSvg:shuffled.map(function(k){return k.svg;}),
    correctIndex:shuffled.findIndex(function(k){return k.correct;}),
    explanation:"Going from the first shape to the second, "+transformDesc+". Applying that same change to the third shape gives the correct answer.",
    hint:"Work out exactly what changes between the first two shapes, then apply that same change to the third shape.",
    topic:"Shape Analogy"
  };
}

// ── TEMPLATE: SHAPE CODES ─────────────────────────────────────────────────────
// Two independent code letters per shape, drawn from a richer attribute space
// than the old binary filled/outline: either (shape x fill-pattern) or
// (shape x decoration-position). Three of four combinations shown as worked
// examples; the 4th is the question — both attribute values always appear
// elsewhere, so the code stays deducible.
function nvrTplCodes2(yearId){
  var subtype=nvrPick(["pattern","decoration"]);
  var color=nvrPick(NVR_PALETTE2);
  var shapeChoices=nvrShuffle(NVR_SIMPLE_SHAPES);
  var shapeA=shapeChoices[0], shapeB=shapeChoices[1];
  var letters=nvrShuffle(["B","D","F","G","H","J","K","L","M","N","P","R","S","T","V","W"]);
  var shapeLetterA=letters[0], shapeLetterB=letters[1];
  var attr1Letter=letters[2], attr2Letter=letters[3];

  var attrValues, renderCell;
  if(subtype==="pattern"){
    attrValues=nvrShuffle(["hatch","dots"]);
    renderCell=function(shape,attrVal){ return nvrRenderSingle({shape:shape,color:color,pattern:attrVal}); };
  }else{
    attrValues=nvrShuffle(["N","E"]);
    renderCell=function(shape,attrVal){
      return nvrRenderWithDecorations({shape:shape,color:color,pattern:"outline"},
        [{anchor:attrVal,shape:"circle",color:NVR_STROKE2,pattern:"solid",scale:0.15}]);
    };
  }
  var combos=[
    {shape:shapeA,attr:attrValues[0],code:shapeLetterA+attr1Letter},
    {shape:shapeA,attr:attrValues[1],code:shapeLetterA+attr2Letter},
    {shape:shapeB,attr:attrValues[0],code:shapeLetterB+attr1Letter},
    {shape:shapeB,attr:attrValues[1],code:shapeLetterB+attr2Letter}
  ];
  var shuffledCombos=nvrShuffle(combos);
  var target=shuffledCombos[0];
  var examples=shuffledCombos.slice(1);

  function cellHtml(shape,attrVal,label){
    var svg=renderCell(shape,attrVal);
    return '<div style="background:'+CARD+';border:1px solid '+BORDER+';border-radius:8px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:4px;width:52px;flex-shrink:0;">'+
      '<div style="width:44px;height:44px;">'+svg+'</div>'+
      '<div style="font-weight:900;color:'+WHITE+';font-size:13px;letter-spacing:1px;">'+label+'</div>'+
    '</div>';
  }
  var examplesHtml=examples.map(function(e){return cellHtml(e.shape,e.attr,e.code);}).join("");
  var targetHtml=cellHtml(target.shape,target.attr,"?");
  var divider='<div style="width:2px;align-self:stretch;background:'+BORDER+';margin:0 6px;"></div>';
  var displayHtml='<div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;">'+examplesHtml+divider+targetHtml+'</div>';

  var otherShapeLetter=target.shape===shapeA?shapeLetterB:shapeLetterA;
  var thisShapeLetter=target.shape===shapeA?shapeLetterA:shapeLetterB;
  var thisAttrLetter=target.attr===attrValues[0]?attr1Letter:attr2Letter;
  var otherAttrLetter=target.attr===attrValues[0]?attr2Letter:attr1Letter;
  var candidateWrongCodes=nvrShuffle([
    otherShapeLetter+thisAttrLetter,
    thisShapeLetter+otherAttrLetter,
    otherShapeLetter+otherAttrLetter,
    thisAttrLetter+thisShapeLetter
  ]).slice(0,3);
  var options=nvrShuffle([target.code].concat(candidateWrongCodes));

  var attrDesc=subtype==="pattern"?"the fill pattern":"which side the small dot sits on";
  return {
    visual:true, kind:"codes", html:true,
    question:"Each shape has a code made of two letters. Work out what each letter stands for, then choose the code for the shape marked '?'.",
    displaySvgs:[displayHtml],
    displayIsHtml:true,
    optionsSvg:null,
    options:options,
    correctIndex:options.indexOf(target.code),
    explanation:"The first letter shows which shape it is and the second letter shows "+attrDesc+". The '?' shape is a "+target.shape+" with code "+target.code+".",
    hint:"Look at the examples: the first letter always matches the shape, and the second letter always matches the other attribute.",
    topic:"Shape Codes"
  };
}

function generateVisualNVR(topic,yearId){
  var fn=topic==="Odd One Out"?nvrTplOddOneOut2
        :topic==="Mirror Image"?nvrTplMirror2
        :topic==="Matrix"?nvrTplMatrix2
        :topic==="Shape Analogy"?nvrTplAnalogy2
        :topic==="Shape Codes"?nvrTplCodes2
        :nvrTplRotation2;
  return fn(yearId);
}
