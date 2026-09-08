// ══════════════════════════════════════════════════════════════════════════════
// NVR SHAPE ENGINE v2 — composite multi-element scene renderer
// Every primitive is defined as raw SVG path markup inside a fixed 60x60 local
// box, centered on (30,30). Positioning/rotation/mirroring/scaling is applied
// uniformly via a single transform pipeline in nvrPlaceElement, so every
// primitive — polygon or curve-based — behaves identically under transforms.
// Deterministic: no primitive uses Math.random() internally. Randomness (which
// shape/color/pattern/position) lives in the template layer, not here.
// ══════════════════════════════════════════════════════════════════════════════

var NVR_PALETTE2 = ["#4361EE","#EF5DA8","#06D6A0","#FFD166","#FF9F1C","#7B2FBE"];
var NVR_STROKE2 = "#1E2654";

// ── PRIMITIVE PATH LIBRARY ────────────────────────────────────────────────────
// Each entry returns raw path `d` string(s) in the local 60x60 box.
// Multi-path primitives (keyhole, crescent, ring) use evenodd fill-rule to cut
// holes, so they need fill-rule set on the <path>, not on separate elements.

function nvrRegPolyD(sides){
  var pts=[];
  for(var i=0;i<sides;i++){
    var theta=i*2*Math.PI/sides-Math.PI/2;
    pts.push([30+20*Math.cos(theta),30+20*Math.sin(theta)]);
  }
  return pts.map(function(p,i){return (i===0?"M":"L")+p[0].toFixed(2)+","+p[1].toFixed(2);}).join(" ")+" Z";
}

var NVR_PRIMITIVES = {
  triangle:   { d: function(){ return nvrRegPolyD(3); } },
  square:     { d: function(){ return nvrRegPolyD(4); } },
  pentagon:   { d: function(){ return nvrRegPolyD(5); } },
  hexagon:    { d: function(){ return nvrRegPolyD(6); } },
  octagon:    { d: function(){ return nvrRegPolyD(8); } },
  circle:     { d: function(){ return "M10,30 A20,20 0 1,1 50,30 A20,20 0 1,1 10,30 Z"; } },
  star5:      { d: function(){
    var pts=[]; for(var i=0;i<10;i++){ var r=i%2===0?20:8; var theta=i*Math.PI/5-Math.PI/2; pts.push([30+r*Math.cos(theta),30+r*Math.sin(theta)]); }
    return pts.map(function(p,i){return (i===0?"M":"L")+p[0].toFixed(2)+","+p[1].toFixed(2);}).join(" ")+" Z";
  }},
  star4:      { d: function(){
    var pts=[]; for(var i=0;i<8;i++){ var r=i%2===0?20:7; var theta=i*Math.PI/4-Math.PI/2; pts.push([30+r*Math.cos(theta),30+r*Math.sin(theta)]); }
    return pts.map(function(p,i){return (i===0?"M":"L")+p[0].toFixed(2)+","+p[1].toFixed(2);}).join(" ")+" Z";
  }},
  cross:      { d: function(){
    return "M22,10 L38,10 L38,22 L50,22 L50,38 L38,38 L38,50 L22,50 L22,38 L10,38 L10,22 L22,22 Z";
  }},
  arrow:      { d: function(){ // single arrow pointing "up" (north) by default
    return "M30,8 L46,26 L36,26 L36,52 L24,52 L24,26 L14,26 Z";
  }},
  doubleArrow:{ d: function(){ // arrow pointing both up and down
    return "M30,4 L44,18 L36,18 L36,42 L44,42 L30,56 L16,42 L24,42 L24,18 L16,18 Z";
  }},
  chevron:    { d: function(){ return "M12,38 L30,16 L48,38 L40,38 L30,26 L20,38 Z"; } },
  teardrop:   { d: function(){ return "M30,8 C42,24 46,34 46,40 A16,16 0 1,1 14,40 C14,34 18,24 30,8 Z"; } },
  // Kidney-bean silhouettes, deliberately lopsided (one lobe bigger, one side
  // pinched in) so normal / mirrored / rotated all look visibly distinct —
  // same reasoning as lshape/flag. NOT safe to treat as symmetric.
  blobA:      { d: function(){ return "M14,8 C28,2 48,4 52,20 C55,32 46,30 40,36 C48,42 44,54 30,54 C14,54 4,44 6,30 C7,20 6,13 14,8 Z"; } },
  blobB:      { d: function(){ return "M10,20 C8,8 26,2 38,8 C48,13 44,22 52,26 C58,30 54,42 42,44 C46,50 36,58 24,52 C12,46 14,38 8,32 C3,27 11,26 10,20 Z"; } },
  house:      { d: function(){ return "M30,8 L52,26 L44,26 L44,52 L16,52 L16,26 L8,26 Z"; } },
  lshape:     { d: function(){ return "M14,10 L42,10 L42,26 L26,26 L26,50 L14,50 Z"; } },
  keyhole:    { d: function(){ return "M30,10 A10,10 0 1,1 29.9,10 Z M30,24 L38,44 L22,44 Z"; }, evenodd:true },
  crescent:   { d: function(){ return "M30,8 A22,22 0 1,0 30,52 A17,22 0 1,1 30,8 Z"; }, evenodd:true },
  ring:       { d: function(){ return "M30,6 A24,24 0 1,1 29.9,6 Z M30,18 A12,12 0 1,1 29.9,18 Z"; }, evenodd:true },

  // ── new additions ──
  diamond:    { d: function(){ return "M30,6 L42,30 L30,54 L18,30 Z"; } }, // elongated rhombus — visually distinct from square@45deg
  trapezoid:  { d: function(){ return "M22,16 L38,16 L50,46 L10,46 Z"; } },
  pacman:     { d: function(){ return "M30,30 L47,17 A20,20 0 1,0 47,43 Z"; } }, // wedge cut facing right — asymmetric, direction-testable
  heart:      { d: function(){ return "M30,46 C10,32 8,16 20,10 C27,6.5 30,13 30,15 C30,13 33,6.5 40,10 C52,16 50,32 30,46 Z"; } },
  zigzag:     { d: function(){ return "M26,6 L38,6 L28,26 L40,26 L22,54 L28,30 L16,30 Z"; } },
  plusUneven: { d: function(){ return "M24,2 L36,2 L36,26 L46,26 L46,34 L36,34 L36,58 L24,58 L24,34 L2,34 L2,26 L24,26 Z"; } }, // vertical bar centered; left arm tip at x=2 (28 from center), right arm tip at x=46 (16 from center) — large, clearly visible left/right contrast
  lshape2:    { d: function(){ return "M10,10 L30,10 L30,26 L50,26 L50,50 L10,50 Z"; } }, // different proportions from `lshape`
  semicircle: { d: function(){ return "M10,30 A20,20 0 0,1 50,30 Z"; } }, // flat edge at the equator, rounded top
  pennant:    { d: function(){ return "M8,14 L40,14 L40,24 L52,30 L40,36 L40,46 L8,46 Z"; } }, // banner with a triangular tail
  star6:      { d: function(){
    var pts=[]; for(var i=0;i<12;i++){ var r=i%2===0?20:9; var theta=i*Math.PI/6-Math.PI/2; pts.push([30+r*Math.cos(theta),30+r*Math.sin(theta)]); }
    return pts.map(function(p,i){return (i===0?"M":"L")+p[0].toFixed(2)+","+p[1].toFixed(2);}).join(" ")+" Z";
  }}
};
var NVR_SHAPE_NAMES = Object.keys(NVR_PRIMITIVES);

// Broader pool for non-rotation-critical templates (Odd One Out shape-swap,
// Shape Codes shape pairs) — includes shapes that have partial rotational or
// reflective symmetry (diamond, semicircle, star6), which are fine there since
// those templates don't rely on rotation/mirror distinctness.
var NVR_SIMPLE_SHAPES = ["hexagon","pentagon","square","triangle","octagon","diamond","trapezoid","heart","star6","semicircle","pacman"];

// ── FILL PATTERNS ─────────────────────────────────────────────────────────────
// Returns {fillRef, defs} — fillRef goes in the fill="" attr, defs is markup to
// inject into <defs>. Pattern ids are namespaced by color+type so multiple
// elements sharing a pattern+color in one scene reuse the same def.
function nvrFillFor(pattern,color){
  var safeColor=color.replace("#","");
  if(pattern==="solid") return {fillRef:color, defs:""};
  if(pattern==="outline") return {fillRef:"none", defs:""};
  var id="pat_"+pattern+"_"+safeColor;
  if(pattern==="hatch"){
    return {fillRef:"url(#"+id+")", defs:
      '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">'+
      '<rect width="6" height="6" fill="white"/><line x1="0" y1="0" x2="0" y2="6" stroke="'+color+'" stroke-width="3"/></pattern>'};
  }
  if(pattern==="crosshatch"){
    return {fillRef:"url(#"+id+")", defs:
      '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">'+
      '<rect width="6" height="6" fill="white"/><line x1="0" y1="0" x2="0" y2="6" stroke="'+color+'" stroke-width="2"/>'+
      '<line x1="0" y1="0" x2="6" y2="0" stroke="'+color+'" stroke-width="2"/></pattern>'};
  }
  if(pattern==="dots"){
    return {fillRef:"url(#"+id+")", defs:
      '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="8" height="8">'+
      '<rect width="8" height="8" fill="white"/><circle cx="4" cy="4" r="2" fill="'+color+'"/></pattern>'};
  }
  if(pattern==="half"){
    return {fillRef:"url(#"+id+")", defs:
      '<pattern id="'+id+'" patternUnits="objectBoundingBox" width="1" height="1">'+
      '<rect x="0" y="0" width="0.5" height="1" fill="'+color+'"/><rect x="0.5" y="0" width="0.5" height="1" fill="white"/></pattern>'};
  }
  return {fillRef:color, defs:""};
}
var NVR_FILL_PATTERNS=["solid","outline","hatch","crosshatch","dots","half"];

// ── SINGLE ELEMENT → positioned <g> ───────────────────────────────────────────
// spec: {shape, color, pattern("solid"), rotation(0), scale(1), mirrored(false),
//        cx(30), cy(30), strokeColor}
function nvrPlaceElement(spec){
  var prim=NVR_PRIMITIVES[spec.shape];
  if(!prim) throw new Error("Unknown NVR primitive: "+spec.shape);
  var pattern=spec.pattern||"solid";
  var color=spec.color||NVR_PALETTE2[0];
  var fill=nvrFillFor(pattern,color);
  var stroke=spec.strokeColor||(pattern==="outline"?color:NVR_STROKE2);
  var cx=spec.cx!==undefined?spec.cx:30, cy=spec.cy!==undefined?spec.cy:30;
  var scale=spec.scale||1, rot=spec.rotation||0;
  var transform="translate("+cx+","+cy+") scale("+scale+") rotate("+rot+") "+(spec.mirrored?"scale(-1,1) ":"")+"translate(-30,-30)";
  var fillRule=prim.evenodd?' fill-rule="evenodd"':"";
  var path='<path d="'+prim.d()+'" fill="'+fill.fillRef+'" stroke="'+stroke+'" stroke-width="2.5"'+fillRule+'/>';
  return { defs:fill.defs, markup:'<g transform="'+transform+'">'+path+'</g>' };
}

// ── DECORATION ANCHORS ────────────────────────────────────────────────────────
// Named offsets (relative to a 60x60-box-sized main element) for attaching small
// decorations — dots, tiny arrows, tiny shapes — around a main shape. Used for
// GL-style items where meaning is carried by an attribute's *position*.
var NVR_ANCHORS={
  N:[30,4], S:[30,56], E:[56,30], W:[4,30],
  NE:[50,10], NW:[10,10], SE:[50,50], SW:[10,50]
};

// ── SCENE COMPOSITOR ──────────────────────────────────────────────────────────
// elements: array of specs, each additionally may include cx/cy in *canvas*
// coordinates (not local box coords — nvrPlaceElement handles that offset).
// viewBox defaults to a square big enough for a main shape + ring of decorations.
function nvrRenderScene(elements,viewSize){
  viewSize=viewSize||60;
  var defsSet={}, bodies=[];
  elements.forEach(function(spec){
    var placed=nvrPlaceElement(spec);
    if(placed.defs) defsSet[placed.defs]=true;
    bodies.push(placed.markup);
  });
  var defsMarkup=Object.keys(defsSet).join("");
  return '<svg viewBox="0 0 '+viewSize+' '+viewSize+'" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block">'+
    (defsMarkup?"<defs>"+defsMarkup+"</defs>":"")+bodies.join("")+'</svg>';
}

// Convenience: single-shape render (replaces old nvrRenderShape for simple cases)
function nvrRenderSingle(spec){
  var s=Object.assign({cx:30,cy:30},spec);
  return nvrRenderScene([s],60);
}

// Convenience: main shape + decorations placed at named anchors, on a 60x60 canvas.
// decorations: array of {anchor:"N", shape, color, pattern, scale(0.35), rotation}
function nvrRenderWithDecorations(mainSpec,decorations){
  var elements=[Object.assign({cx:30,cy:30},mainSpec)];
  (decorations||[]).forEach(function(dec){
    var pos=NVR_ANCHORS[dec.anchor]||[30,30];
    elements.push(Object.assign({cx:pos[0],cy:pos[1],scale:dec.scale||0.35,rotation:dec.rotation||0},dec,{cx:pos[0],cy:pos[1]}));
  });
  return nvrRenderScene(elements,60);
}
