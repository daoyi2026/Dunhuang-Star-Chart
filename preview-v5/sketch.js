let groups=[];
let ambient=[];
let milkyDust=[];
let orbiters=[];
let rings=[];
let clock=0;
let paused=false;
let chosen=-1;
let hoverId=-1;
let sceneScale=1, ox=0, oy=0;
let selectedSince=0;

const W=1440, H=810;
const BW=1000, BH=760;
const SX=W/BW, SY=H/BH, SS=Math.min(SX,SY);
const tx=v=>v*SX, ty=v=>v*SY, ts=v=>v*SS;

const names=['紫微','北斗','天棓','华盖','天厨','传舍','天柱','文昌','三师','太尊','天牢','内阶','天床','八谷','天理','六甲','勾陈','北极','天皇','五帝','尚书','女史','柱史','御女','天枪','玄戈','三公','相','紫微垣'];

const notes={
  '紫微':'古人以为中天帝座之域，万星拱卫，象征天极与帝居。',
  '北斗':'“斗为帝车”，斗柄随四时转移，既是授时之器，也被想象为天帝所乘之车。',
  '天棓':'近紫微与北斗，古人视作天帝近卫与警戒之象。',
  '华盖':'如帝王车盖覆于天上，象征尊位、仪仗与护卫。',
  '天厨':'天上的庖厨与供御之府，把饮食、丰饶与礼制写进星空。',
  '传舍':'使者与宾客往来的天上驿馆，象征行旅、消息与接待。',
  '天柱':'取擎天之柱意，象征支撑、纲纪与政教之所系。',
  '文昌':'近北斗的文教与政务之府，主典章、文书、禄位与秩序。',
  '三师':'辅弼之臣的星象，重在教化、协调与维持中枢秩序。',
  '太尊':'靠近中枢的尊亲之位，把宫廷尊卑关系投射到夜空。',
  '天牢':'天上禁垣之象，关联法禁、约束与收束过失。',
  '内阶':'宫廷内部阶陛，是由外而内、由下而上的礼序通道。',
  '天床':'天上寝居之所，让帝宫不只有政令，也有起居与安息。',
  '八谷':'八种谷物的星象，与农时、粮食和岁岁丰歉相连。',
  '天理':'执法辨理之象，古人以其表现天上秩序对曲直的判断。',
  '六甲':'与干支、节候和授时相连，是悬在宫城旁的一套时间标尺。',
  '勾陈':'环卫紫微的宿卫之象，表现帝宫周围的守护与权柄。',
  '北极':'天之枢纽，众星环绕而行，是古代北天秩序的中心意象。',
  '天皇':'至尊帝座之象，把神权、礼仪与宇宙中枢收束于一处。',
  '五帝':'五方、五德与四时汇于中央，表现多方归一的宇宙秩序。',
  '尚书':'天上文书与诏令之官，象征记录、传达与执行。',
  '女史':'内廷掌记之官，把值守、记事与礼仪写入宫城星官。',
  '柱史':'史册与记录之象，使政事可追溯、过失可核验。',
  '御女':'内廷近侍之象，与宫门、起居和内廷礼秩相连。',
  '天枪':'天上兵卫之象，重点在警戒、守护与应对非常。',
  '玄戈':'兵戈之象，像宫城外沿的一枚边界与守备标记。',
  '三公':'最高辅弼之臣的星象，表现协同百官、辅佐中枢。',
  '相':'宰辅之位，承接帝命并统合政务。',
  '紫微垣':'紫微垣被视为天帝宫城所在。左右星列如宫墙，群星环卫，如天上朝廷。'
};

const details={
  '紫微垣':'紫微垣最迷人的地方，恰在“垣”字：星点并非一幅宫殿插图的背景，而是宫墙本身。东西两列像城垣延展，端部如门阙，中间诸星则被古人继续解释为帝座、官署、寝舍、厨膳与宿卫。这里让原来的星线继续生长，宫墙、门阙和屋脊都从同一组星点中显形。',
  '北斗':'北斗既能辨向、授时，也在古代文献中被比作帝车。七星的排列因此同时具有天文尺度和政治想象：星线不是单纯的连线，而像车架在夜空中缓慢转动。',
  '华盖':'华盖由尊位上方的覆盖之象而来。古人把圆盖、盖柄与帝王仪仗对应到星位，让一组星成为可被辨认的天上器物。',
  '文昌':'文昌并非只指“文运”，古籍更把它组织成一组分工明确的天上官署，包含政务、禄位、文书与刑狱等职掌。'
};

const sources={
  '紫微':'据《史记·天官书》《晋书·天文志》整理','北斗':'据《史记·天官书》《晋书·天文志》整理','天棓':'据《晋书·天文志》整理','华盖':'据《晋书·天文志》整理',
  '天厨':'据《晋书·天文志》整理','传舍':'据《晋书·天文志》整理','天柱':'据《晋书·天文志》整理','文昌':'据《史记·天官书》整理','三师':'据《晋书·天文志》整理',
  '太尊':'据古代星官文献整理','天牢':'据《晋书·天文志》整理','内阶':'据《晋书·天文志》整理','天床':'据《晋书·天文志》整理','八谷':'据《宋史·天文志》整理',
  '天理':'据《史记·天官书》《晋书·天文志》整理','六甲':'据《晋书·天文志》整理','勾陈':'据《晋书·天文志》整理','北极':'据《晋书·天文志》整理','天皇':'据《晋书·天文志》整理',
  '五帝':'据《晋书·天文志》整理','尚书':'据《晋书·天文志》整理','女史':'据《晋书·天文志》整理','柱史':'据《晋书·天文志》整理','御女':'据古代星官文献整理',
  '天枪':'据《史记·天官书》《晋书·天文志》整理','玄戈':'据《史记·天官书》整理','三公':'据《晋书·天文志》整理','相':'据《晋书·天文志》整理','紫微垣':'据《晋书·天文志》整理'
};

function setup(){
  const canvas=createCanvas(windowWidth,windowHeight);
  canvas.parent('app');
  canvas.elt.addEventListener('pointerdown',handleCanvasPointer,{passive:true});
  pixelDensity(Math.min(window.devicePixelRatio||1,2));
  randomSeed(412086939); noiseSeed(731);
  makeGroups(); makeAmbient();
}
function h(n){const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v)}

function makeAmbient(){
  ambient=[]; milkyDust=[]; orbiters=[];
  for(let i=0;i<260;i++) ambient.push({x:random(W),y:random(H),s:random(ts(.18),ts(1.0)),a:random(8,48),p:random(TWO_PI),v:random(.06,.24),tone:random()});
  for(let i=0;i<960;i++){
    const t=random(-.08,1.08),baseX=lerp(-W*.05,W*.91,t),baseY=lerp(H*1.11,-H*.12,t)+sin(t*7.4)*ts(20);
    const spread=randomGaussian()*ts(58+80*sin(constrain(t,0,1)*PI)),tangent=randomGaussian()*ts(24),dx=.76,dy=-.65;
    milkyDust.push({x:baseX-dy*spread+dx*tangent,y:baseY+dx*spread+dy*tangent,s:random(ts(.12),ts(1.05)),a:random(5,32),p:random(TWO_PI),v:random(.04,.18),tone:random(),bright:random()});
  }
  for(let i=0;i<7;i++) orbiters.push({cx:W*.52+random(-90,90),cy:H*.43+random(-45,45),rx:ts(170+i*38+random(-18,18)),ry:ts(82+i*22+random(-10,10)),start:random(-2.9,-1.2),span:random(.55,1.18),speed:random(.014,.034),phase:random(1),alpha:random(7,16)});
}

function makeGroups(){
  const centers=[[450,135],[370,240],[600,157],[720,245],[240,153],[150,270],[840,170],[795,368],[650,320],[510,275],[270,365],[400,435],[570,445],[700,505],[850,530],[180,480],[485,570],[550,355],[345,580],[610,625],[245,615],[755,620],[140,590],[865,650],[335,140],[870,285],[445,655],[110,390]];
  groups=[];
  centers.forEach((c,index)=>{
    let pts=[]; const count=index===1?7:floor(random(3,7));
    for(let j=0;j<count;j++){const angle=j*.95+random(-.4,.4),radius=random(ts(19),ts(43));pts.push({x:tx(c[0])+cos(angle)*radius,y:ty(c[1])+sin(angle)*radius,r:random(ts(2.1),ts(3.7)),p:random(TWO_PI),seed:index*100+j*17+random(100)})}
    if(index===1) pts=[[-58,-32],[-28,-21],[0,-6],[26,8],[47,37],[19,55],[-4,27]].map((p,j)=>({x:tx(c[0]+p[0]),y:ty(c[1]+p[1]),r:ts(3.5),p:random(TWO_PI),seed:700+j*17}));
    groups.push(makeGroup(index,names[index],pts,[tx(c[0]),ty(c[1])],index%4===0));
  });
  const wall=[[290,210],[265,270],[254,340],[265,420],[294,497],[367,526],[455,520],[545,539],[630,568],[704,546],[708,464],[690,396],[671,331],[662,255],[625,218]];
  const pts=wall.map((p,i)=>({x:tx(p[0]),y:ty(p[1]),r:ts(3.8),p:random(TWO_PI),seed:2800+i*19}));
  const g=makeGroup(28,'紫微垣',pts,[tx(480),ty(395)],true);g.c=[tx(715),ty(438)];groups.push(g);
}
function makeGroup(i,name,pts,anchor,red){return {i,name,pts,points:pts,anchor,c:anchor,red,note:notes[name],detail:details[name]||(notes[name]+' 星位、名称与古代制度想象在同一张星图中重叠，使夜空成为一座可以阅读的天上秩序。'),source:sources[name],light:0,focus:0,flow:0}}

function draw(){
  const dt=paused?0:Math.min(deltaTime,50)/1000;clock+=dt;
  const mobile=width<760;
  sceneScale=mobile?Math.max(width/W,height/H)*.74:Math.min(width/W,height/H);
  ox=(width-W*sceneScale)/2;oy=(height-H*sceneScale)/2;

  const mx=(mouseX-ox)/sceneScale,my=(mouseY-oy)/sceneScale;
  hoverId=hitGroup(mx,my);
  cursor(hoverId<0?'default':'pointer');

  clear();
  push();
  translate(ox,oy);
  scale(sceneScale);

  drawMilkyDust();
  drawAmbient();
  drawOrbitalTrails();

  const ease=1-Math.exp(-dt*6.5);
  groups.forEach(g=>{
    g.focus=lerp(g.focus,g.i===chosen?1:0,ease*.74);
    g.light=lerp(g.light,g.i===chosen?1:(g.i===hoverId?.26:0),ease);
    g.flow+=dt*(.14+g.light*.34);
  });

  if(chosen>=0) drawFocusVeil(groups[chosen]);

  groups.forEach(g=>{
    if(g.i!==chosen) drawGroup(g,chosen>=0?.045:1);
  });

  if(chosen>=0){
    const g=groups[chosen];
    const elapsed=Math.max(0,clock-selectedSince);

    if(g.name==='紫微垣'){
      // 先看见原来的星座骨架，再让“宫城之象”从同一批星点慢慢长出来。
      drawZiweiArchitecture(g,elapsed);
    }else{
      drawConstellationEcho(g);
    }

    drawGroup(g,1);
  }

  drawRings(dt);
  drawSeal();
  pop();
}

function drawMilkyDust(){
  push();
  blendMode(SCREEN);
  noStroke();
  milkyDust.forEach(s=>{
    const pulse=.72+.28*sin(clock*s.v+s.p);
    const c=s.tone<.42?[157,198,210]:s.tone<.72?[184,176,211]:[222,203,168];
    const a=s.a*pulse*.20;
    fill(c[0],c[1],c[2],a);
    circle(s.x,s.y,s.s*(.8+pulse*.2));
    if(s.bright>.975){
      fill(c[0],c[1],c[2],a*.18);
      circle(s.x,s.y,s.s*5.5);
    }
  });
  pop();
}

function drawAmbient(){
  push();blendMode(SCREEN);noStroke();
  ambient.forEach(s=>{const pulse=.62+.38*sin(clock*s.v+s.p),c=s.tone<.45?[191,214,219]:s.tone<.72?[207,198,222]:[226,202,155];fill(c[0],c[1],c[2],s.a*pulse*.44);circle(s.x,s.y,s.s*(.9+pulse*.18));if(s.s>ts(.8)&&pulse>.82){fill(c[0],c[1],c[2],s.a*.07);circle(s.x,s.y,s.s*5)}});
  pop();
}
function drawOrbitalTrails(){
  push();
  const ctx=drawingContext;
  ctx.save();
  ctx.setLineDash([ts(1.2),ts(7.5)]);
  orbiters.forEach((o,i)=>{
    noFill();
    stroke(i%3===0?137:176,i%3===0?169:162,i%3===0?180:139,o.alpha*.52);
    strokeWeight(ts(.30));
    arc(o.cx,o.cy,o.rx*2,o.ry*2,o.start,o.start+o.span);

    const p=(clock*o.speed+o.phase)%1;
    const a=o.start+o.span*p;
    const x=o.cx+cos(a)*o.rx, y=o.cy+sin(a)*o.ry;
    noStroke();
    fill(225,211,180,19);
    circle(x,y,ts(3.8));
    fill(244,231,201,70);
    circle(x,y,ts(.72));
  });
  ctx.restore();
  pop();
}

function focusEase(g){const t=constrain(g.focus,0,1);return 1-pow(1-t,3)}
function focusTransform(g){const f=focusEase(g),mobile=width<760,targetX=W*.51,targetY=H*(mobile?.35:.39),targetScale=g.name==='紫微垣'?(mobile?.96:1.24):(mobile?1.6:1.92);return {f,scale:lerp(1,targetScale,f),dx:lerp(0,targetX-g.anchor[0],f),dy:lerp(0,targetY-g.anchor[1],f)}}
function applyTransform(g){const t=focusTransform(g);translate(t.dx,t.dy);translate(g.anchor[0],g.anchor[1]);scale(t.scale);translate(-g.anchor[0],-g.anchor[1])}
function transformedPoint(g,p){const t=focusTransform(g);return{x:g.anchor[0]+(p.x-g.anchor[0])*t.scale+t.dx,y:g.anchor[1]+(p.y-g.anchor[1])*t.scale+t.dy}}

function drawFocusVeil(g){
  const f=focusEase(g);if(f<.01)return;const t=focusTransform(g),cx=g.anchor[0]+t.dx,cy=g.anchor[1]+t.dy,ctx=drawingContext;ctx.save();
  const grad=ctx.createRadialGradient(cx,cy,ts(120),cx,cy,ts(620));grad.addColorStop(0,'rgba(6,9,10,'+(.02*f)+')');grad.addColorStop(.42,'rgba(6,8,9,'+(.07*f)+')');grad.addColorStop(1,'rgba(5,5,5,'+(.42*f)+')');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.restore();
}

function drawGroup(g,alphaMul=1){
  const reveal=constrain((clock-g.i*.035)/2.6,0,1);push();applyTransform(g);if(g.i===chosen)drawAura(g,reveal);
  for(let j=1;j<g.pts.length;j++){const progress=constrain(reveal*(g.pts.length-1)-(j-1),0,1);drawInkLine(g.pts[j-1],g.pts[j],progress,g.i*100+j*13.7,g.red,g.light,alphaMul)}
  if(reveal>=1)drawFlow(g,alphaMul);g.pts.forEach((p,j)=>{const a=constrain(reveal*g.pts.length-j,0,1);if(a>0)drawStar(p,g,a*alphaMul)});
  const f=focusEase(g);
  if(g.i!==chosen||f<.25){const ink=g.red?[190,92,58]:[202,180,139];noStroke();fill(ink[0],ink[1],ink[2],175*reveal*alphaMul*(g.i===chosen?1-f:1));textFont('Ma Shan Zheng');textSize(g.i===28?ts(17):ts(14));push();translate(g.c[0]+ts(25),g.c[1]+ts(22));rotate(sin(g.i*3)*.12);for(let k=0;k<g.name.length;k++)text(g.name[k],0,k*ts(15));pop()}
  pop();
}
function drawInkLine(a,b,progress,seed,red,light,alphaMul){
  if(progress<=0)return;
  const dx=b.x-a.x,dy=b.y-a.y,len=sqrt(dx*dx+dy*dy);if(len<.001)return;
  const ux=dx/len,uy=dy/len,px=-uy,py=ux,vis=len*progress;
  const base=red?[197,86,53]:[205,184,140],glow=red?[247,139,79]:[241,218,169];
  const breath=.72+.28*sin(clock*.72+seed*.021);
  const energy=.72+breath*.28+light*.38;

  stroke(glow[0],glow[1],glow[2],(9+light*31)*alphaMul*energy);
  strokeWeight(ts(2.1+light*.8));
  line(a.x,a.y,a.x+dx*progress,a.y+dy*progress);

  for(let seg=0;seg<80;seg++){
    const start=seg*ts(4.5);if(start>=vis)break;
    const rs=seed+seg*1.913,end=Math.min(start+ts(2)+h(rs+8)*ts(4.2),vis);
    if(h(rs+21)<.1&&seg%5!==0)continue;
    const js=(h(rs+2)-.5)*ts(.5),je=(h(rs+3)-.5)*ts(.5);
    stroke(base[0],base[1],base[2],(86+light*92+h(rs+55)*20)*alphaMul*energy);
    strokeWeight(ts(.48)+h(rs+44)*ts(.58));
    line(a.x+ux*start+px*js,a.y+uy*start+py*js,a.x+ux*end+px*je,a.y+uy*end+py*je);
  }

  if(progress>.96){
    const travel=(clock*(.075+light*.055)+h(seed)*3.7)%1;
    const txp=a.x+dx*travel,typ=a.y+dy*travel;
    noStroke();
    fill(glow[0],glow[1],glow[2],(28+light*62)*alphaMul);
    circle(txp,typ,ts(4.8+light*2.5));
    fill(255,239,202,(105+light*105)*alphaMul);
    circle(txp,typ,ts(.85+light*.35));
  }
}
function drawStar(p,g,opacity){
  const slow=.5+.5*sin(clock*.72+p.p);
  const flash=pow(max(0,sin(clock*1.08+p.p*1.7)),9);
  const light=constrain(slow*.38+flash*.82+g.light*.72,0,1);
  const c=g.red?[249,146,84]:[246,220,169];
  const breathe=.94+slow*.13;
  const size=p.r*breathe*(1+g.light*.15);

  noStroke();
  fill(c[0],c[1],c[2],opacity*(5+slow*12+g.light*18));
  circle(p.x,p.y,size*(8.5+g.light*2.5));
  fill(c[0],c[1],c[2],opacity*(14+slow*20+g.light*28));
  circle(p.x,p.y,size*4.4);
  fill(g.red?132:139,g.red?58:111,g.red?34:74,opacity*235);
  circle(p.x,p.y,size*1.45);
  fill(250,227,183,opacity*(126+light*120));
  circle(p.x,p.y,size*.54);

  if(light>.66||g.light>.12){
    stroke(c[0],c[1],c[2],opacity*(75+light*60));
    strokeWeight(ts(.43));
    const ray=size*(1.45+light*.95);
    line(p.x-ray,p.y,p.x+ray,p.y);
    line(p.x,p.y-ray,p.x,p.y+ray);
  }
}
function drawAura(g,reveal){const c=g.red?[226,117,72]:[232,204,151];for(let pass=0;pass<3;pass++){stroke(c[0],c[1],c[2],(3+pass*2)*reveal);strokeWeight(ts(13-pass*4));for(let j=1;j<g.pts.length;j++)line(g.pts[j-1].x,g.pts[j-1].y,g.pts[j].x,g.pts[j].y)}}
function drawFlow(g,alphaMul){
  const span=g.pts.length-1;if(span<=0)return;
  const streams=g.i===chosen?2:1;
  for(let s=0;s<streams;s++){
    const head=(g.flow+g.i*.37+s*span*.46)%span;
    for(let k=14;k>=0;k--){
      const pos=(head-k*.022+span)%span,idx=floor(pos);
      if(idx<0||idx>=g.pts.length-1)continue;
      const t=pos-idx,a=g.pts[idx],b=g.pts[idx+1],x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t);
      const fade=pow(1-k/15,1.5)*alphaMul;
      noStroke();
      fill(249,220,164,fade*(66+g.light*125));
      circle(x,y,k===0?ts(2.6+g.light*.8):ts(.72+fade*.45));
      if(k===0){
        fill(255,238,199,fade*(150+g.light*85));
        circle(x,y,ts(.92+g.light*.28));
      }
    }
  }
}

function drawConstellationEcho(g){
  const f=focusEase(g);if(f<.04)return;push();applyTransform(g);noFill();
  for(let pass=0;pass<3;pass++){const amount=ts(5+pass*6)*f;stroke(130,158,163,(18-pass*4)*f);strokeWeight(ts(.45));beginShape();g.pts.forEach((p,i)=>{const n=g.pts[(i+1)%g.pts.length],dx=n.x-p.x,dy=n.y-p.y,len=max(1,sqrt(dx*dx+dy*dy));vertex(p.x-dy/len*amount,p.y+dx/len*amount)});endShape()}
  pop();
}

function easeRange(t,a,b){
  const x=constrain((t-a)/(b-a),0,1);
  return x*x*(3-2*x);
}

function drawZiweiArchitecture(g,elapsed){
  const f=focusEase(g);
  if(f<.06)return;

  const wallP=easeRange(elapsed,.75,2.7);
  const towerP=easeRange(elapsed,1.45,3.7);
  const palaceP=easeRange(elapsed,2.15,5.3);
  const detailP=easeRange(elapsed,3.45,7.0);
  const spiritP=easeRange(elapsed,4.7,7.6);

  push();
  applyTransform(g);

  const pts=g.pts;
  const c=pts.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0});
  c.x/=pts.length;c.y/=pts.length;

  // Very soft celestial depth behind the architecture. The palace remains line-made.
  push();
  blendMode(SCREEN);
  noStroke();
  for(let i=4;i>=0;i--){
    fill(45,76,93,(1.1+(4-i)*.7)*f*(.35+.65*palaceP));
    ellipse(c.x,c.y+ts(8),ts(360+i*62),ts(190+i*35));
  }
  pop();

  drawZiweiWallSystemV8(pts,c,elapsed,wallP);
  drawZiweiNodeTowersV8(pts,c,elapsed,towerP);
  drawZiweiReferenceTraceV9(pts,c,palaceP,detailP,elapsed);
  drawZiweiSpiritV8(pts,c,spiritP,elapsed);

  pop();
}

function ziweiPt(origin,ux,uy,px,py,forward,side){
  return {x:origin.x+ux*forward+px*side,y:origin.y+uy*forward+py*side};
}

function ziweiInk(x1,y1,x2,y2,a=60,w=.35,tone=0){
  const col=tone===1?[138,169,174]:tone===2?[193,173,137]:[235,201,145];
  stroke(col[0],col[1],col[2],a);
  strokeWeight(ts(w));
  line(x1,y1,x2,y2);
}

function ziweiGlowPoint(x,y,pulse=1,scale=1){
  noStroke();
  fill(250,118,50,13+24*pulse);
  circle(x,y,ts((12+8*pulse)*scale));
  fill(255,198,124,35+55*pulse);
  circle(x,y,ts((5+3*pulse)*scale));
  fill(255,235,190,155+75*pulse);
  circle(x,y,ts((1.1+.9*pulse)*scale));
}

function ziweiFrame(origin,ux,uy,px,py,halfW,halfD,p,alpha=32){
  const a=ziweiPt(origin,ux,uy,px,py,-halfD,-halfW);
  const b=ziweiPt(origin,ux,uy,px,py,-halfD, halfW);
  const c=ziweiPt(origin,ux,uy,px,py, halfD, halfW);
  const d=ziweiPt(origin,ux,uy,px,py, halfD,-halfW);
  noFill();
  ziweiInk(a.x,a.y,b.x,b.y,alpha*p,.28,2);
  ziweiInk(b.x,b.y,c.x,c.y,alpha*p,.28,2);
  ziweiInk(c.x,c.y,d.x,d.y,alpha*p,.28,2);
  ziweiInk(d.x,d.y,a.x,a.y,alpha*p,.28,2);
  return {a,b,c,d};
}

function drawZiweiWallSystemV8(pts,c,elapsed,wallP){
  const n=pts.length;

  // Original constellation chain becomes the actual palace wall.
  for(let i=0;i<n-1;i++){
    const growOrder=min(i,n-2-i);
    const local=easeRange(elapsed,.75+growOrder*.12,1.55+growOrder*.12);
    drawZiweiWallSegmentV8(pts[i],pts[i+1],c,local,i,1);
  }

  // Close the enclosure last: a real north wall with a central northern gatehouse.
  const closeP=easeRange(elapsed,2.35,3.55)*wallP;
  if(closeP>0){
    const left=pts[n-1],right=pts[0];
    const mid={x:(left.x+right.x)/2,y:(left.y+right.y)/2};
    const q1={x:lerp(left.x,mid.x,.82),y:lerp(left.y,mid.y,.82)};
    const q2={x:lerp(mid.x,right.x,.18),y:lerp(mid.y,right.y,.18)};
    drawZiweiWallSegmentV8(left,q1,c,closeP,90,.86);
    drawZiweiWallSegmentV8(q2,right,c,closeP,91,.86);
    drawZiweiGateTowerV8(mid,c,easeRange(elapsed,2.75,4.2),1.28,900);
  }
}

function inwardNormalV8(a,b,c){
  const dx=b.x-a.x,dy=b.y-a.y,len=max(1,sqrt(dx*dx+dy*dy));
  let nx=-dy/len,ny=dx/len;
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  if(dist(mx+nx*10,my+ny*10,c.x,c.y)>dist(mx-nx*10,my-ny*10,c.x,c.y)){nx*=-1;ny*=-1}
  return {nx,ny,tx:dx/len,ty:dy/len,len};
}

function drawZiweiWallSegmentV8(a,b,c,p,index,alphaScale=1){
  if(p<=0)return;
  const end={x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p)};
  const n=inwardNormalV8(a,end,c);
  const depth=ts(12);
  const lip=ts(3.2);
  const ia={x:a.x+n.nx*depth,y:a.y+n.ny*depth};
  const ib={x:end.x+n.nx*depth,y:end.y+n.ny*depth};
  const oa={x:a.x-n.nx*lip,y:a.y-n.ny*lip};
  const ob={x:end.x-n.nx*lip,y:end.y-n.ny*lip};

  push();

  // translucent wall body
  noStroke();
  fill(43,63,73,13*p*alphaScale);
  quad(oa.x,oa.y,ob.x,ob.y,ib.x,ib.y,ia.x,ia.y);

  // multiple contour lines make the wall read as jiehua architecture, not a vector stroke
  ziweiInk(a.x,a.y,end.x,end.y,112*p*alphaScale,.66,0);
  ziweiInk(oa.x,oa.y,ob.x,ob.y,39*p*alphaScale,.31,2);
  ziweiInk(ia.x,ia.y,ib.x,ib.y,61*p*alphaScale,.42,1);
  ziweiInk(
    lerp(a.x,ia.x,.42),lerp(a.y,ia.y,.42),
    lerp(end.x,ib.x,.42),lerp(end.y,ib.y,.42),
    32*p*alphaScale,.26,2
  );

  // roof/parapet cap
  const ca={x:a.x+n.nx*depth*.14,y:a.y+n.ny*depth*.14};
  const cb={x:end.x+n.nx*depth*.14,y:end.y+n.ny*depth*.14};
  const ciA={x:a.x+n.nx*depth*.68,y:a.y+n.ny*depth*.68};
  const ciB={x:end.x+n.nx*depth*.68,y:end.y+n.ny*depth*.68};
  ziweiInk(ca.x,ca.y,cb.x,cb.y,58*p*alphaScale,.34,0);
  ziweiInk(ciA.x,ciA.y,ciB.x,ciB.y,29*p*alphaScale,.24,2);

  const steps=max(3,floor(n.len/ts(13)));
  for(let k=0;k<=steps;k++){
    const t=k/steps;
    if(t>p)break;
    const ox=lerp(a.x,b.x,t),oy=lerp(a.y,b.y,t);
    const ix=ox+n.nx*depth,iy=oy+n.ny*depth;

    // masonry / vertical divisions
    ziweiInk(ox,oy,ix,iy,17*p*alphaScale,.18,2);

    // dense small rafters/battlements on the top line
    const rx=ox+n.nx*depth*.18,ry=oy+n.ny*depth*.18;
    const rw=ts(2.8);
    ziweiInk(
      rx-n.tx*rw,ry-n.ty*rw,
      rx+n.tx*rw,ry+n.ty*rw,
      37*p*alphaScale,.24,0
    );
  }

  // luminous energy still follows the original star line
  if(p>.76){
    for(let stream=0;stream<2;stream++){
      const t=(clock*(.055+stream*.013)+index*.131+stream*.48)%1;
      const x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t);
      const pulse=.5+.5*sin(clock*1.2+index+stream);
      noStroke();
      fill(255,143,58,(12+24*pulse)*alphaScale);
      circle(x,y,ts(5.0+2.4*pulse));
      fill(255,229,181,105*alphaScale);
      circle(x,y,ts(.8));
    }
  }
  pop();
}

function drawZiweiNodeTowersV8(pts,c,elapsed,towerP){
  pts.forEach((star,i)=>{
    const order=min(i,pts.length-1-i);
    const p=easeRange(elapsed,1.35+order*.07,2.75+order*.07)*towerP;
    if(p<=0)return;
    const major=[0,3,4,9,10,14].includes(i);
    drawZiweiGateTowerV8(star,c,p,major?1.18:.78,i);
  });
}

function drawZiweiGateTowerV8(star,c,p,scale,index){
  if(p<=0)return;
  const vx=c.x-star.x,vy=c.y-star.y,len=max(1,sqrt(vx*vx+vy*vy));
  const ux=vx/len,uy=vy/len,px=-uy,py=ux;
  const center={x:star.x+ux*ts(17)*scale*p,y:star.y+uy*ts(17)*scale*p};

  // platform
  for(let tier=0;tier<3;tier++){
    const hw=ts((18-tier*1.8)*scale)*p;
    const hd=ts((14-tier*1.4)*scale)*p;
    const o={x:center.x+ux*ts(tier*1.6),y:center.y+uy*ts(tier*1.6)};
    const a=ziweiPt(o,ux,uy,px,py,-hd,-hw);
    const b=ziweiPt(o,ux,uy,px,py,-hd, hw);
    const cc=ziweiPt(o,ux,uy,px,py, hd, hw);
    const d=ziweiPt(o,ux,uy,px,py, hd,-hw);
    noStroke();fill(51,70,80,(13-tier*2)*p);
    quad(a.x,a.y,b.x,b.y,cc.x,cc.y,d.x,d.y);
    ziweiInk(d.x,d.y,cc.x,cc.y,41*p,.32,0);
  }

  // lower column bay
  const colBack=ziweiPt(center,ux,uy,px,py,-ts(5)*scale,0);
  const colFront=ziweiPt(center,ux,uy,px,py, ts(8)*scale,0);
  for(let k=-2;k<=2;k++){
    const side=k*ts(6.2)*scale*p;
    const a=ziweiPt(colBack,ux,uy,px,py,0,side);
    const b=ziweiPt(colFront,ux,uy,px,py,0,side);
    ziweiInk(a.x,a.y,b.x,b.y,36*p,.25,2);
  }

  drawZiweiHipRoofV8(center,ux,uy,px,py,ts(39)*scale,ts(25)*scale,p,1);

  if(scale>1){
    const upper=ziweiPt(center,ux,uy,px,py,-ts(16)*scale,0);
    drawZiweiHipRoofV8(upper,ux,uy,px,py,ts(29)*scale,ts(18)*scale,p,.78);
  }

  // star is the architectural core
  const pulse=.5+.5*sin(clock*.76+index*.77);
  ziweiGlowPoint(star.x,star.y,pulse,scale);
}

function drawZiweiHipRoofV8(center,ux,uy,px,py,w,d,p,scale=1){
  if(p<=0)return;
  const hw=w*.5*p,hd=d*.5*p;
  const backL=ziweiPt(center,ux,uy,px,py,-hd,-hw);
  const backR=ziweiPt(center,ux,uy,px,py,-hd, hw);
  const frontL=ziweiPt(center,ux,uy,px,py, hd,-hw);
  const frontR=ziweiPt(center,ux,uy,px,py, hd, hw);

  const ridgeL=ziweiPt(center,ux,uy,px,py,-hd*.18,-hw*.31);
  const ridgeR=ziweiPt(center,ux,uy,px,py,-hd*.18, hw*.31);

  noStroke();
  fill(63,80,102,20*p);
  quad(backL.x,backL.y,backR.x,backR.y,ridgeR.x,ridgeR.y,ridgeL.x,ridgeL.y);
  fill(83,77,100,14*p);
  quad(ridgeL.x,ridgeL.y,ridgeR.x,ridgeR.y,frontR.x,frontR.y,frontL.x,frontL.y);

  ziweiInk(ridgeL.x,ridgeL.y,ridgeR.x,ridgeR.y,90*p,.50,0);
  ziweiInk(backL.x,backL.y,backR.x,backR.y,48*p,.32,0);
  ziweiInk(frontL.x,frontL.y,frontR.x,frontR.y,72*p,.41,0);
  ziweiInk(backL.x,backL.y,ridgeL.x,ridgeL.y,48*p,.31,0);
  ziweiInk(backR.x,backR.y,ridgeR.x,ridgeR.y,48*p,.31,0);
  ziweiInk(ridgeL.x,ridgeL.y,frontL.x,frontL.y,42*p,.28,2);
  ziweiInk(ridgeR.x,ridgeR.y,frontR.x,frontR.y,42*p,.28,2);

  // roof ribs / tiles
  for(let i=1;i<10;i++){
    const t=i/10;
    const rl={x:lerp(ridgeL.x,ridgeR.x,t),y:lerp(ridgeL.y,ridgeR.y,t)};
    const bl={x:lerp(backL.x,backR.x,t),y:lerp(backL.y,backR.y,t)};
    const fl={x:lerp(frontL.x,frontR.x,t),y:lerp(frontL.y,frontR.y,t)};
    ziweiInk(rl.x,rl.y,bl.x,bl.y,13*p,.17,1);
    ziweiInk(rl.x,rl.y,fl.x,fl.y,14*p,.17,1);
  }

  // flying eaves
  const wing=ts(5.8)*scale*p;
  ziweiInk(backL.x,backL.y,backL.x-px*wing-ux*ts(2),backL.y-py*wing-uy*ts(2),66*p,.36,0);
  ziweiInk(backR.x,backR.y,backR.x+px*wing-ux*ts(2),backR.y+py*wing-uy*ts(2),66*p,.36,0);
  ziweiInk(frontL.x,frontL.y,frontL.x-px*wing+ux*ts(2),frontL.y-py*wing+uy*ts(2),54*p,.32,0);
  ziweiInk(frontR.x,frontR.y,frontR.x+px*wing+ux*ts(2),frontR.y+py*wing+uy*ts(2),54*p,.32,0);
}

function drawZiweiPalaceCityV8(pts,c,p,detailP,spiritP,elapsed){
  if(p<=0)return;

  const northL=pts[0],northR=pts[pts.length-1],south=pts[7];
  const north={x:(northL.x+northR.x)/2,y:(northL.y+northR.y)/2};
  const ax={x:south.x-north.x,y:south.y-north.y};
  const al=max(1,sqrt(ax.x*ax.x+ax.y*ax.y));
  const ux=ax.x/al,uy=ax.y/al,px=-uy,py=ux;

  // Main hierarchy follows one clear imperial axis.
  const throne=ziweiPt(north,ux,uy,px,py,al*.28,0);
  const innerCourt=ziweiPt(north,ux,uy,px,py,al*.47,0);
  const frontCourt=ziweiPt(north,ux,uy,px,py,al*.63,0);
  const meridian=ziweiPt(north,ux,uy,px,py,al*.78,0);

  // nested precinct walls make a coherent city, not floating roof fragments
  drawZiweiPrecinctV8(innerCourt,ux,uy,px,py,ts(173),ts(108),easeRange(elapsed,2.5,4.8),0);
  drawZiweiPrecinctV8(frontCourt,ux,uy,px,py,ts(205),ts(93),easeRange(elapsed,3.2,5.5),1);

  // Imperial hall group
  drawZiweiHallV8(throne,ux,uy,px,py,ts(124),ts(67),easeRange(elapsed,2.2,4.7),1.22,true);
  drawZiweiHallV8(
    ziweiPt(throne,ux,uy,px,py,ts(66),0),
    ux,uy,px,py,ts(98),ts(51),easeRange(elapsed,2.85,5.0),1.0,true
  );

  // left/right side halls in the inner court
  const innerSide=ts(125);
  drawZiweiHallV8(ziweiPt(innerCourt,ux,uy,px,py,-ts(15),-innerSide),ux,uy,px,py,ts(68),ts(38),easeRange(elapsed,3.0,5.3),.72,false);
  drawZiweiHallV8(ziweiPt(innerCourt,ux,uy,px,py,-ts(15), innerSide),ux,uy,px,py,ts(68),ts(38),easeRange(elapsed,3.1,5.4),.72,false);
  drawZiweiHallV8(ziweiPt(frontCourt,ux,uy,px,py,ts(2),-ts(145)),ux,uy,px,py,ts(58),ts(32),easeRange(elapsed,3.55,5.8),.62,false);
  drawZiweiHallV8(ziweiPt(frontCourt,ux,uy,px,py,ts(2), ts(145)),ux,uy,px,py,ts(58),ts(32),easeRange(elapsed,3.65,5.9),.62,false);

  // gates on the axis
  drawZiweiAxialGateV8(meridian,ux,uy,px,py,easeRange(elapsed,3.55,5.9),1.05);
  drawZiweiAxialGateV8(
    ziweiPt(innerCourt,ux,uy,px,py,ts(80),0),
    ux,uy,px,py,easeRange(elapsed,3.05,5.2),.82
  );

  // ceremonial way connects the whole palace
  drawZiweiRoyalWayV8(throne,meridian,ux,uy,px,py,easeRange(elapsed,2.6,5.6));

  if(detailP>0){
    // continuous covered corridors around courtyards
    drawZiweiCorridorRingV8(innerCourt,ux,uy,px,py,ts(157),ts(91),detailP);
    drawZiweiCorridorRingV8(frontCourt,ux,uy,px,py,ts(188),ts(77),detailP*.92);

    // smaller pavilions / service buildings create reference-image density
    const small=[
      [-65,-92,42,25],[-62,92,42,25],
      [14,-91,37,23],[14,91,37,23],
      [72,-89,34,21],[72,89,34,21],
      [-10,-158,33,20],[-10,158,33,20],
      [52,-164,31,19],[52,164,31,19]
    ];
    small.forEach((d,i)=>{
      const base=i<6?innerCourt:frontCourt;
      const pp=easeRange(elapsed,4.0+i*.08,5.7+i*.08)*detailP;
      drawZiweiHallV8(
        ziweiPt(base,ux,uy,px,py,ts(d[0]),ts(d[1])),
        ux,uy,px,py,ts(d[2]),ts(d[3]),pp,.42,false
      );
    });

    // side links explicitly tie architecture back to constellation star nodes
    drawZiweiStarLinkV8(pts[3],ziweiPt(innerCourt,ux,uy,px,py,-ts(16),-innerSide),detailP);
    drawZiweiStarLinkV8(pts[11],ziweiPt(innerCourt,ux,uy,px,py,-ts(16), innerSide),detailP);
    drawZiweiStarLinkV8(pts[5],ziweiPt(frontCourt,ux,uy,px,py,0,-ts(145)),detailP*.8);
    drawZiweiStarLinkV8(pts[9],ziweiPt(frontCourt,ux,uy,px,py,0, ts(145)),detailP*.8);

    // gardens / cloud-water lines
    drawZiweiGardenV8(ziweiPt(frontCourt,ux,uy,px,py,ts(28),-ts(92)),ux,uy,px,py,detailP,0);
    drawZiweiGardenV8(ziweiPt(frontCourt,ux,uy,px,py,ts(31), ts(94)),ux,uy,px,py,detailP,1);
  }

  if(spiritP>0){
    // subtle glow at the imperial core
    const pulse=.5+.5*sin(clock*.7);
    noStroke();
    fill(255,175,77,(7+12*pulse)*spiritP);
    circle(throne.x,throne.y,ts(27+10*pulse));
    fill(255,232,186,100*spiritP);
    circle(throne.x,throne.y,ts(2.0));
  }
}

function drawZiweiPrecinctV8(center,ux,uy,px,py,w,d,p,variant=0){
  if(p<=0)return;
  const hw=w*.5*p,hd=d*.5*p;
  const a=ziweiPt(center,ux,uy,px,py,-hd,-hw);
  const b=ziweiPt(center,ux,uy,px,py,-hd, hw);
  const cc=ziweiPt(center,ux,uy,px,py, hd, hw);
  const dd=ziweiPt(center,ux,uy,px,py, hd,-hw);

  noStroke();
  fill(38,56,67,6*p);
  quad(a.x,a.y,b.x,b.y,cc.x,cc.y,dd.x,dd.y);
  ziweiInk(a.x,a.y,b.x,b.y,30*p,.26,2);
  ziweiInk(b.x,b.y,cc.x,cc.y,29*p,.26,2);
  ziweiInk(cc.x,cc.y,dd.x,dd.y,34*p,.28,0);
  ziweiInk(dd.x,dd.y,a.x,a.y,29*p,.26,2);

  // stone paving grid
  const across=variant===0?8:10;
  const along=variant===0?5:4;
  for(let i=1;i<across;i++){
    const side=lerp(-hw,hw,i/across);
    const p1=ziweiPt(center,ux,uy,px,py,-hd*.88,side);
    const p2=ziweiPt(center,ux,uy,px,py, hd*.88,side);
    ziweiInk(p1.x,p1.y,p2.x,p2.y,7*p,.14,1);
  }
  for(let i=1;i<along;i++){
    const f=lerp(-hd,hd,i/along);
    const p1=ziweiPt(center,ux,uy,px,py,f,-hw*.9);
    const p2=ziweiPt(center,ux,uy,px,py,f, hw*.9);
    ziweiInk(p1.x,p1.y,p2.x,p2.y,7*p,.14,1);
  }
}

function drawZiweiCorridorRingV8(center,ux,uy,px,py,w,d,p){
  if(p<=0)return;
  const hw=w*.5,hd=d*.5;
  const corners=[
    ziweiPt(center,ux,uy,px,py,-hd,-hw),
    ziweiPt(center,ux,uy,px,py,-hd, hw),
    ziweiPt(center,ux,uy,px,py, hd, hw),
    ziweiPt(center,ux,uy,px,py, hd,-hw)
  ];
  for(let i=0;i<4;i++){
    const a=corners[i],b=corners[(i+1)%4];
    ziweiInk(a.x,a.y,b.x,b.y,22*p,.23,0);
    const len=dist(a.x,a.y,b.x,b.y);
    const count=max(3,floor(len/ts(16)));
    for(let k=0;k<=count;k++){
      const t=k/count;
      const x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t);
      const dx=b.x-a.x,dy=b.y-a.y,l=max(1,sqrt(dx*dx+dy*dy));
      const nx=-dy/l,ny=dx/l;
      ziweiInk(x-nx*ts(3),y-ny*ts(3),x+nx*ts(3),y+ny*ts(3),14*p,.16,2);
    }
  }
}

function drawZiweiHallV8(center,ux,uy,px,py,w,d,p,scale=1,imperial=false){
  if(p<=0)return;

  const Wd=w*p,Dp=d*p;

  // layered terrace
  for(let tier=0;tier<(imperial?4:3);tier++){
    const hw=Wd*(.58-tier*.035);
    const hd=Dp*(.54-tier*.035);
    const o=ziweiPt(center,ux,uy,px,py,tier*ts(1.7),0);
    const a=ziweiPt(o,ux,uy,px,py,-hd,-hw);
    const b=ziweiPt(o,ux,uy,px,py,-hd, hw);
    const cc=ziweiPt(o,ux,uy,px,py, hd, hw);
    const dd=ziweiPt(o,ux,uy,px,py, hd,-hw);
    noStroke();fill(49,68,78,(12-tier*1.5)*p);
    quad(a.x,a.y,b.x,b.y,cc.x,cc.y,dd.x,dd.y);
    ziweiInk(dd.x,dd.y,cc.x,cc.y,(38-tier*5)*p,.29,0);
  }

  // hall body / column forest
  const back=ziweiPt(center,ux,uy,px,py,-Dp*.12,0);
  const front=ziweiPt(center,ux,uy,px,py, Dp*.34,0);
  const cols=imperial?10:7;
  for(let i=0;i<=cols;i++){
    const side=lerp(-Wd*.48,Wd*.48,i/cols);
    const a=ziweiPt(back,ux,uy,px,py,0,side);
    const b=ziweiPt(front,ux,uy,px,py,0,side);
    ziweiInk(a.x,a.y,b.x,b.y,29*p,.23,2);
  }
  const beamL=ziweiPt(back,ux,uy,px,py,0,-Wd*.5);
  const beamR=ziweiPt(back,ux,uy,px,py,0, Wd*.5);
  ziweiInk(beamL.x,beamL.y,beamR.x,beamR.y,35*p,.29,0);

  // main roof + second imperial roof
  drawZiweiHipRoofV8(ziweiPt(center,ux,uy,px,py,-Dp*.18,0),ux,uy,px,py,Wd*1.28,Dp*.82,p,scale);
  if(imperial){
    drawZiweiHipRoofV8(ziweiPt(center,ux,uy,px,py,-Dp*.48,0),ux,uy,px,py,Wd*.92,Dp*.62,p*.94,scale*.88);
  }

  // staircase
  const stairTop=ziweiPt(center,ux,uy,px,py,Dp*.52,0);
  const stairBot=ziweiPt(center,ux,uy,px,py,Dp*.96,0);
  const sw=Wd*(imperial?.16:.13);
  ziweiInk(stairTop.x-px*sw,stairTop.y-py*sw,stairBot.x-px*sw*.82,stairBot.y-py*sw*.82,28*p,.24,2);
  ziweiInk(stairTop.x+px*sw,stairTop.y+py*sw,stairBot.x+px*sw*.82,stairBot.y+py*sw*.82,28*p,.24,2);
  for(let i=0;i<6;i++){
    const t=i/5;
    const cc={x:lerp(stairTop.x,stairBot.x,t),y:lerp(stairTop.y,stairBot.y,t)};
    const ww=lerp(sw,sw*.82,t);
    ziweiInk(cc.x-px*ww,cc.y-py*ww,cc.x+px*ww,cc.y+py*ww,12*p,.16,2);
  }

  // ridge star breath
  const core=ziweiPt(center,ux,uy,px,py,-Dp*.25,0);
  const pulse=.5+.5*sin(clock*.64+center.x*.012);
  ziweiGlowPoint(core.x,core.y,pulse,imperial?1.0:.65);
}

function drawZiweiAxialGateV8(center,ux,uy,px,py,p,scale=1){
  if(p<=0)return;
  const left=ziweiPt(center,ux,uy,px,py,0,-ts(35)*scale);
  const right=ziweiPt(center,ux,uy,px,py,0, ts(35)*scale);
  drawZiweiHallV8(left,ux,uy,px,py,ts(34)*scale,ts(26)*scale,p,.42,false);
  drawZiweiHallV8(right,ux,uy,px,py,ts(34)*scale,ts(26)*scale,p,.42,false);
  ziweiInk(left.x,left.y,right.x,right.y,43*p,.31,0);
  const topL=ziweiPt(left,ux,uy,px,py,-ts(9)*scale,0);
  const topR=ziweiPt(right,ux,uy,px,py,-ts(9)*scale,0);
  ziweiInk(topL.x,topL.y,topR.x,topR.y,28*p,.23,2);
}

function drawZiweiRoyalWayV8(a,b,ux,uy,px,py,p){
  if(p<=0)return;
  const half=ts(13);
  const l1={x:a.x-px*half,y:a.y-py*half},l2={x:b.x-px*half,y:b.y-py*half};
  const r1={x:a.x+px*half,y:a.y+py*half},r2={x:b.x+px*half,y:b.y+py*half};

  noStroke();fill(89,88,77,7*p);
  quad(l1.x,l1.y,r1.x,r1.y,r2.x,r2.y,l2.x,l2.y);
  ziweiInk(l1.x,l1.y,l2.x,l2.y,30*p,.24,0);
  ziweiInk(r1.x,r1.y,r2.x,r2.y,30*p,.24,0);

  const length=dist(a.x,a.y,b.x,b.y);
  const steps=max(6,floor(length/ts(18)));
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const cc={x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)};
    ziweiInk(cc.x-px*half,cc.y-py*half,cc.x+px*half,cc.y+py*half,8*p,.13,2);
  }

  // flowing light on the imperial axis
  for(let s=0;s<3;s++){
    const t=(clock*(.045+s*.007)+s*.33)%1;
    const x=lerp(b.x,a.x,t),y=lerp(b.y,a.y,t);
    noStroke();fill(255,188,92,35*p);circle(x,y,ts(4.5));
    fill(255,235,191,115*p);circle(x,y,ts(.85));
  }
}

function drawZiweiStarLinkV8(a,b,p){
  if(p<=0)return;
  const ctx=drawingContext;
  ctx.save();
  ctx.setLineDash([ts(1.8),ts(4.8)]);
  ziweiInk(a.x,a.y,b.x,b.y,22*p,.22,1);
  ctx.restore();
}

function drawZiweiGardenV8(center,ux,uy,px,py,p,flip){
  if(p<=0)return;
  push();noFill();
  const sign=flip?-1:1;

  // cloud-river lines
  stroke(102,142,157,15*p);strokeWeight(ts(.30));
  for(let j=0;j<3;j++){
    const yOff=ts((j-1)*8);
    const s=ziweiPt(center,ux,uy,px,py,-ts(24)+yOff,sign*ts(18));
    const e=ziweiPt(center,ux,uy,px,py, ts(28)+yOff,-sign*ts(24));
    const c1=ziweiPt(center,ux,uy,px,py,-ts(5)+yOff,sign*ts(52));
    const c2=ziweiPt(center,ux,uy,px,py, ts(12)+yOff,-sign*ts(55));
    bezier(s.x,s.y,c1.x,c1.y,c2.x,c2.y,e.x,e.y);
  }

  // tiny pavilion / trees as line clusters
  for(let i=0;i<4;i++){
    const q=ziweiPt(center,ux,uy,px,py,ts(-17+i*12),sign*ts(31+i*5));
    stroke(177,169,134,16*p);strokeWeight(ts(.22));
    line(q.x,q.y,q.x+ux*ts(8),q.y+uy*ts(8));
    arc(q.x+ux*ts(4),q.y+uy*ts(4),ts(12),ts(7),PI,TWO_PI);
  }
  pop();
}

function drawZiweiReferenceTraceV9(pts,c,p,detailP,elapsed){
  const trace=window.ZIWEI_TRACE;
  if(!trace||!trace.length||p<=0)return;

  push();
  noFill();

  trace.forEach((poly,i)=>{
    if(poly.length<2)return;

    let cy=0;
    poly.forEach(q=>{cy+=q[1]});
    cy/=poly.length;

    // Top/central palaces appear first, then lower courts and secondary architecture.
    const order=constrain((cy-170)/520,0,1);
    const local=easeRange(elapsed,1.95+order*.85,4.25+order*1.15);
    if(local<=0)return;

    const major=poly.length>18;
    const visible=max(2,floor(1+(poly.length-1)*local));

    // warm underglow
    stroke(239,188,112,(major?13:7)*local);
    strokeWeight(ts(major?.72:.48));
    beginShape();
    for(let j=0;j<visible;j++) vertex(poly[j][0],poly[j][1]);
    endShape();

    // faithful fine linework traced from the chosen palace reference
    stroke(232,198,139,(major?62:39)*local*(.8+.2*detailP));
    strokeWeight(ts(major?.30:.22));
    beginShape();
    for(let j=0;j<visible;j++) vertex(poly[j][0],poly[j][1]);
    endShape();

    // blue-gray ghost line to keep the Dunhuang/celestial translucency
    if(i%5===0&&local>.58){
      stroke(121,153,163,8*local);
      strokeWeight(ts(.17));
      beginShape();
      for(let j=0;j<visible;j++) vertex(poly[j][0]+ts(.35),poly[j][1]+ts(.25));
      endShape();
    }
  });

  // restrained light runs through the central imperial axis.
  const top={x:tx(505),y:ty(265)};
  const bottom={x:tx(500),y:ty(500)};
  for(let s=0;s<3;s++){
    const t=(clock*(.032+s*.006)+s*.33)%1;
    const x=lerp(bottom.x,top.x,t),y=lerp(bottom.y,top.y,t);
    noStroke();
    fill(255,184,86,24*p);
    circle(x,y,ts(4));
    fill(255,232,186,105*p);
    circle(x,y,ts(.72));
  }

  pop();
}

function drawZiweiSpiritV8(pts,c,p,elapsed){
  if(p<=0)return;
  push();
  blendMode(SCREEN);
  noFill();

  // only a few broad celestial traces, not techno rings
  for(let i=0;i<3;i++){
    const phase=clock*.12+i*.9;
    const r=ts(105+i*43)*(1+.015*sin(phase));
    stroke(83,119,137,(3.2+i*1.4)*p);
    strokeWeight(ts(.26));
    arc(c.x,c.y+ts(8),r*2,r*.60,-2.42+.08*i,-.36+.05*i);
  }

  // soft dust wandering through the compound
  for(let i=0;i<14;i++){
    const t=(clock*.015+i*.079)%1;
    const a=pts[3],b=pts[11];
    const x=lerp(a.x,b.x,t)+sin(t*TWO_PI*2+i)*ts(20);
    const y=lerp(a.y,b.y,t)+cos(t*TWO_PI+i)*ts(11);
    noStroke();fill(166,196,199,5.5*p);circle(x,y,ts(7+3*sin(clock*.25+i)));
  }
  pop();
}

function drawRings(dt){for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.age+=dt;const a=24*max(0,1-r.age/1.4);noFill();stroke(218,188,130,a);strokeWeight(ts(.38));circle(r.x,r.y,ts(7)+r.age*ts(72));if(r.age>1.4)rings.splice(i,1)}}
function drawSeal(){if(chosen>=0)return;const s=ts(36),x=W-tx(61)-s,y=ty(46);push();translate(x+s/2,y+s/2);rotate(-.025);translate(-(x+s/2),-(y+s/2));noFill();stroke(174,77,50,180);strokeWeight(ts(1));rect(x,y,s,s,ts(2));stroke(174,77,50,92);rect(x+ts(3),y+ts(3),s-ts(6),s-ts(6));noStroke();fill(198,87,54,200);textFont('Ma Shan Zheng');textAlign(CENTER,TOP);textSize(ts(9));text('觀星',x+s/2,y+ts(5));text('無盡',x+s/2,y+ts(17));pop()}

function hitGroup(x,y){
  if(x<0||x>W||y<0||y>H)return-1;let best=-1,closest=Math.max(ts(18),18/sceneScale);const candidates=chosen>=0?[groups[chosen]]:groups;
  for(const g of candidates){const pts=g.pts.map(p=>transformedPoint(g,p));for(let j=0;j<pts.length;j++){let d=dist(x,y,pts[j].x,pts[j].y);if(j>0){const a=pts[j-1],b=pts[j],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den>0?constrain(((x-a.x)*dx+(y-a.y)*dy)/den,0,1):0;d=min(d,dist(x,y,a.x+t*dx,a.y+t*dy))}if(d<closest){closest=d;best=g.i}}}return best;
}
function setChosen(index,x=W*.5,y=H*.5){chosen=index;if(index>=0){selectedSince=clock;rings.push({x,y,age:0});if(rings.length>4)rings.shift();window.starChartUI?.select(groups[index])}else{selectedSince=clock;window.starChartUI?.select(null)}}
window.starChartSetChosen=setChosen;
function handleCanvasPointer(event){
  if(event.button!==undefined&&event.button!==0&&event.button!==-1)return;if(window.__starChartUiPointer)return;if(document.elementFromPoint(event.clientX,event.clientY)?.closest('.ui-shell'))return;
  const rect=event.currentTarget.getBoundingClientRect(),cx=event.clientX-rect.left,cy=event.clientY-rect.top,x=(cx-ox)/sceneScale,y=(cy-oy)/sceneScale;if(x<0||x>W||y<0||y>H)return;
  const hit=hitGroup(x,y);if(chosen>=0&&hit<0){setChosen(-1);return}setChosen(hit===chosen?-1:hit,x,y);
}
function keyPressed(){if(key===' '){paused=!paused;return false}if(key==='r'||key==='R'){clock=0;rings=[];setChosen(-1)}if(key==='s'||key==='S')saveCanvas('敦煌星河遗卷-v3','png')}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
