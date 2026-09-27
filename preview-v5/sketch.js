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
function focusTransform(g){const f=focusEase(g),mobile=width<760,targetX=W*.51,targetY=H*(mobile?.33:.36),targetScale=g.name==='紫微垣'?(mobile?1.00:1.38):(mobile?1.6:1.92);return {f,scale:lerp(1,targetScale,f),dx:lerp(0,targetX-g.anchor[0],f),dy:lerp(0,targetY-g.anchor[1],f)}}
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
  if(f<.08)return;

  const wallP=easeRange(elapsed,.9,3.0);
  const towerP=easeRange(elapsed,1.7,4.0);
  const palaceP=easeRange(elapsed,2.8,5.7);
  const detailP=easeRange(elapsed,4.2,6.8);

  push();
  applyTransform(g);

  const pts=g.pts;
  const c=pts.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0});
  c.x/=pts.length;c.y/=pts.length;

  // 宫城显影前的冷色光晕，只为制造“星图里慢慢有东西出现”的层次。
  push();
  blendMode(SCREEN);
  noStroke();
  for(let i=4;i>=0;i--){
    fill(47,76,91,(1.2+(4-i)*.8)*f*(.35+.65*palaceP));
    ellipse(c.x,c.y+ts(10),ts(330+i*58),ts(185+i*31));
  }
  pop();

  drawZiweiWallSystem(pts,c,elapsed,wallP);
  drawZiweiNodeTowers(pts,c,elapsed,towerP);
  drawZiweiPalaceAxis(pts,c,palaceP,detailP,elapsed);
  drawZiweiBreathingMist(pts,c,detailP,elapsed);

  pop();
}

function inwardNormal(a,b,c){
  const dx=b.x-a.x,dy=b.y-a.y,len=max(1,sqrt(dx*dx+dy*dy));
  let nx=-dy/len,ny=dx/len;
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  if(dist(mx+nx*10,my+ny*10,c.x,c.y)>dist(mx-nx*10,my-ny*10,c.x,c.y)){
    nx*=-1;ny*=-1;
  }
  return {nx,ny,dx:dx/len,dy:dy/len,len};
}

function drawZiweiWallSystem(pts,c,elapsed,wallP){
  const segCount=pts.length-1;

  // 左右两侧同时从上方星点开始生长，最终在下部会合。
  for(let i=0;i<segCount;i++){
    const order=min(i,segCount-1-i);
    const start=.95+order*.17;
    const local=easeRange(elapsed,start,start+.95);
    if(local<=0)continue;

    let a=pts[i],b=pts[i+1];
    if(i>=segCount/2){ const tmp=a;a=b;b=tmp; }
    drawZiweiWallSegment(a,b,c,local,i);
  }

  // 最后才出现很淡的“北阙”视觉联系，不改变原始星座骨架，只补足宫城空间感。
  const topP=easeRange(elapsed,4.8,6.3)*wallP;
  if(topP>0){
    const a=pts[0],b=pts[pts.length-1];
    drawZiweiWallSegment(a,b,c,topP,99,.42);
  }
}

function drawZiweiWallSegment(a,b,c,p,index,alphaScale=1){
  if(p<=0)return;
  const b2={x:lerp(a.x,b.x,p),y:lerp(a.y,b.y,p)};
  const n=inwardNormal(a,b2,c);
  const width=ts(9.5);
  const ia={x:a.x+n.nx*width,y:a.y+n.ny*width};
  const ib={x:b2.x+n.nx*width,y:b2.y+n.ny*width};

  push();

  // 半透明墙体面：不是一根线，而是由原星线“变厚”为真实宫墙。
  noStroke();
  fill(64,87,95,13*p*alphaScale);
  quad(a.x,a.y,b2.x,b2.y,ib.x,ib.y,ia.x,ia.y);

  // 墙顶金线 + 内缘青灰线，形成古画界画式体积。
  stroke(234,194,123,94*p*alphaScale);
  strokeWeight(ts(.62));
  line(a.x,a.y,b2.x,b2.y);

  stroke(135,160,159,50*p*alphaScale);
  strokeWeight(ts(.42));
  line(ia.x,ia.y,ib.x,ib.y);

  stroke(206,175,119,30*p*alphaScale);
  strokeWeight(ts(.32));
  line(lerp(a.x,ia.x,.48),lerp(a.y,ia.y,.48),lerp(b2.x,ib.x,.48),lerp(b2.y,ib.y,.48));

  // 城墙上的檐口/垛口细节。
  const count=max(2,floor(n.len/ts(22)));
  for(let k=0;k<=count;k++){
    const t=k/count;
    if(t>p)break;
    const ox=lerp(a.x,b.x,t),oy=lerp(a.y,b.y,t);
    const ix=ox+n.nx*width,iy=oy+n.ny*width;
    stroke(224,197,145,28*p*alphaScale);
    strokeWeight(ts(.28));
    line(ox,oy,ix,iy);

    if(k<count){
      const cx=ox+n.nx*width*.18,cy=oy+n.ny*width*.18;
      const e=ts(2.6);
      line(cx-n.dx*e,cy-n.dy*e,cx+n.dx*e,cy+n.dy*e);
    }
  }

  // 星光沿“实体化之后的城墙”继续流动，保留原星图的呼吸生命感。
  if(p>.82){
    const travel=(clock*.075+index*.173)%1;
    const x=lerp(a.x,b.x,travel),y=lerp(a.y,b.y,travel);
    noStroke();
    fill(255,165,70,18+28*sin(clock*1.4+index));
    circle(x,y,ts(5.5));
    fill(255,226,174,95);
    circle(x,y,ts(.9));
  }
  pop();
}

function drawZiweiNodeTowers(pts,c,elapsed,towerP){
  pts.forEach((star,i)=>{
    const start=1.55+min(i,pts.length-1-i)*.09;
    const p=easeRange(elapsed,start,start+1.35)*towerP;
    if(p<=0)return;

    const major=[0,3,4,9,10,14].includes(i);
    drawZiweiTower(star,c,p,major?1.08:.72,i);
  });
}

function drawZiweiTower(star,c,p,scale,index){
  const vx=c.x-star.x,vy=c.y-star.y,len=max(1,sqrt(vx*vx+vy*vy));
  const ux=vx/len,uy=vy/len,px=-uy,py=ux;
  const w=ts(17)*scale*p;
  const d=ts(25)*scale*p;
  const inner={x:star.x+ux*d,y:star.y+uy*d};

  push();

  // 楼台基座，星点就在外墙节点上。
  noStroke();
  fill(49,70,79,20*p);
  quad(
    star.x-px*w*.75,star.y-py*w*.75,
    star.x+px*w*.75,star.y+py*w*.75,
    inner.x+px*w,inner.y+py*w,
    inner.x-px*w,inner.y-py*w
  );

  stroke(220,190,134,62*p);
  strokeWeight(ts(.45));
  noFill();
  line(star.x-px*w*.75,star.y-py*w*.75,inner.x-px*w,inner.y-py*w);
  line(star.x+px*w*.75,star.y+py*w*.75,inner.x+px*w,inner.y+py*w);
  line(inner.x-px*w,inner.y-py*w,inner.x+px*w,inner.y+py*w);

  // 第一层屋檐：半透明屋面 + 金色飞檐。
  const roofC={x:inner.x+ux*ts(5)*scale*p,y:inner.y+uy*ts(5)*scale*p};
  const rw=w*1.22,rd=ts(8)*scale*p;
  noStroke();
  fill(73,92,108,24*p);
  quad(
    roofC.x-px*rw-ux*rd,roofC.y-py*rw-uy*rd,
    roofC.x+px*rw-ux*rd,roofC.y+py*rw-uy*rd,
    roofC.x+px*rw*.72+ux*rd,roofC.y+py*rw*.72+uy*rd,
    roofC.x-px*rw*.72+ux*rd,roofC.y-py*rw*.72+uy*rd
  );

  stroke(235,205,151,84*p);
  strokeWeight(ts(.48));
  noFill();
  line(roofC.x-px*rw-ux*rd,roofC.y-py*rw-uy*rd,roofC.x+px*rw-ux*rd,roofC.y+py*rw-uy*rd);
  line(roofC.x-px*rw-ux*rd,roofC.y-py*rw-uy*rd,roofC.x-ux*ts(13)*scale,roofC.y-uy*ts(13)*scale);
  line(roofC.x+px*rw-ux*rd,roofC.y+py*rw-uy*rd,roofC.x-ux*ts(13)*scale,roofC.y-uy*ts(13)*scale);

  if(scale>.9){
    // 角楼/门楼再长一层。
    const c2={x:roofC.x+ux*ts(14)*p,y:roofC.y+uy*ts(14)*p};
    const w2=rw*.72;
    fill(70,90,106,18*p);
    noStroke();
    quad(
      c2.x-px*w2-ux*ts(5),c2.y-py*w2-uy*ts(5),
      c2.x+px*w2-ux*ts(5),c2.y+py*w2-uy*ts(5),
      c2.x+px*w2*.65+ux*ts(4),c2.y+py*w2*.65+uy*ts(4),
      c2.x-px*w2*.65+ux*ts(4),c2.y-py*w2*.65+uy*ts(4)
    );
    stroke(235,205,151,68*p);
    strokeWeight(ts(.4));
    noFill();
    line(c2.x-px*w2-ux*ts(5),c2.y-py*w2-uy*ts(5),c2.x+px*w2-ux*ts(5),c2.y+py*w2-uy*ts(5));
  }

  // 原星点不会消失：它成为建筑节点里持续呼吸的“星核”。
  const pulse=.55+.45*sin(clock*.86+index*.77);
  noStroke();
  fill(249,118,55,(18+28*pulse)*p);
  circle(star.x,star.y,ts(12+8*pulse)*scale);
  fill(255,213,156,180*p);
  circle(star.x,star.y,ts(1.6+1.2*pulse)*scale);

  pop();
}

function drawZiweiPalaceAxis(pts,c,p,detailP,elapsed){
  if(p<=0)return;

  const topL=pts[0],topR=pts[pts.length-1],bottom=pts[7];
  const north={x:(topL.x+topR.x)/2,y:(topL.y+topR.y)/2};
  const ax={x:bottom.x-north.x,y:bottom.y-north.y};
  const al=max(1,sqrt(ax.x*ax.x+ax.y*ax.y));
  const ux=ax.x/al,uy=ax.y/al,px=-uy,py=ux;

  const main={x:north.x+ax.x*.36,y:north.y+ax.y*.36};
  const court={x:north.x+ax.x*.57,y:north.y+ax.y*.57};
  const gate={x:north.x+ax.x*.73,y:north.y+ax.y*.73};

  // 中轴从星垣中显现，不是一张贴上去的宫殿图。
  const axisP=easeRange(elapsed,2.7,4.8);
  drawZiweiCauseway(main,gate,ux,uy,px,py,axisP);

  drawZiweiHall(main,ux,uy,px,py,ts(96),ts(54),p,1.0);
  drawZiweiHall(
    {x:main.x-px*ts(122)+ux*ts(26),y:main.y-py*ts(122)+uy*ts(26)},
    ux,uy,px,py,ts(57),ts(37),easeRange(elapsed,3.45,5.6),.68
  );
  drawZiweiHall(
    {x:main.x+px*ts(122)+ux*ts(26),y:main.y+py*ts(122)+uy*ts(26)},
    ux,uy,px,py,ts(57),ts(37),easeRange(elapsed,3.55,5.7),.68
  );

  drawZiweiCourt(court,ux,uy,px,py,easeRange(elapsed,3.6,5.8));
  drawZiweiGate(gate,ux,uy,px,py,easeRange(elapsed,4.0,6.0));

  if(detailP>0){
    // 两组配殿从中轴两侧展开。
    const side1={x:court.x-px*ts(105),y:court.y-py*ts(105)};
    const side2={x:court.x+px*ts(105),y:court.y+py*ts(105)};
    drawZiweiHall(side1,ux,uy,px,py,ts(46),ts(30),detailP,.55);
    drawZiweiHall(side2,ux,uy,px,py,ts(46),ts(30),detailP,.55);

    // 内廷路径与外垣星点相连，使“宫殿”仍然读得出星座骨架。
    stroke(148,163,151,28*detailP);
    strokeWeight(ts(.34));
    drawingContext.setLineDash([ts(2),ts(5)]);
    line(side1.x,side1.y,pts[3].x,pts[3].y);
    line(side2.x,side2.y,pts[11].x,pts[11].y);
    line(gate.x,gate.y,pts[7].x,pts[7].y);
    drawingContext.setLineDash([]);
  }
}

function drawZiweiCauseway(a,b,ux,uy,px,py,p){
  if(p<=0)return;
  const half=ts(12)*p;
  push();
  noStroke();
  fill(104,110,96,12*p);
  quad(
    a.x-px*half,a.y-py*half,
    a.x+px*half,a.y+py*half,
    b.x+px*half,b.y+py*half,
    b.x-px*half,b.y-py*half
  );
  stroke(225,192,132,38*p);
  strokeWeight(ts(.36));
  line(a.x-px*half,a.y-py*half,b.x-px*half,b.y-py*half);
  line(a.x+px*half,a.y+py*half,b.x+px*half,b.y+py*half);

  const length=dist(a.x,a.y,b.x,b.y);
  const steps=max(4,floor(length/ts(18)));
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const cx=lerp(a.x,b.x,t),cy=lerp(a.y,b.y,t);
    stroke(203,185,144,20*p);
    line(cx-px*half,cy-py*half,cx+px*half,cy+py*half);
  }

  // 微光沿御道向主殿流动。
  for(let s=0;s<2;s++){
    const t=(clock*.075+s*.5)%1;
    const x=lerp(b.x,a.x,t),y=lerp(b.y,a.y,t);
    noStroke();
    fill(255,203,117,42*p);
    circle(x,y,ts(4.6));
    fill(255,235,193,130*p);
    circle(x,y,ts(.9));
  }
  pop();
}

function drawZiweiHall(center,ux,uy,px,py,w,d,p,scale=1){
  if(p<=0)return;
  w*=p;d*=p;

  push();

  // 台基
  const back={x:center.x-ux*d*.45,y:center.y-uy*d*.45};
  const front={x:center.x+ux*d*.55,y:center.y+uy*d*.55};
  noStroke();
  fill(58,76,87,20*p);
  quad(
    back.x-px*w*.52,back.y-py*w*.52,
    back.x+px*w*.52,back.y+py*w*.52,
    front.x+px*w*.58,front.y+py*w*.58,
    front.x-px*w*.58,front.y-py*w*.58
  );

  stroke(218,191,141,46*p);
  strokeWeight(ts(.42));
  noFill();
  line(front.x-px*w*.58,front.y-py*w*.58,front.x+px*w*.58,front.y+py*w*.58);
  line(back.x-px*w*.52,back.y-py*w*.52,front.x-px*w*.58,front.y-py*w*.58);
  line(back.x+px*w*.52,back.y+py*w*.52,front.x+px*w*.58,front.y+py*w*.58);

  // 柱列
  const cols=6;
  for(let i=0;i<=cols;i++){
    const t=i/cols-.5;
    const cx=center.x+px*w*t,cy=center.y+py*w*t;
    stroke(218,192,147,30*p);
    line(cx-ux*d*.2,cy-uy*d*.2,cx+ux*d*.3,cy+uy*d*.3);
  }

  // 双坡屋面：带半透明屋面，不再是“几根线”。
  const ridge={x:center.x-ux*d*.38,y:center.y-uy*d*.38};
  const eaveL={x:center.x-px*w*.66+ux*d*.05,y:center.y-py*w*.66+uy*d*.05};
  const eaveR={x:center.x+px*w*.66+ux*d*.05,y:center.y+py*w*.66+uy*d*.05};
  const frontL={x:center.x-px*w*.55+ux*d*.34,y:center.y-py*w*.55+uy*d*.34};
  const frontR={x:center.x+px*w*.55+ux*d*.34,y:center.y+py*w*.55+uy*d*.34};

  noStroke();
  fill(67,82,104,24*p);
  triangle(ridge.x,ridge.y,eaveL.x,eaveL.y,eaveR.x,eaveR.y);
  fill(90,80,100,13*p);
  quad(eaveL.x,eaveL.y,eaveR.x,eaveR.y,frontR.x,frontR.y,frontL.x,frontL.y);

  stroke(238,205,148,82*p);
  strokeWeight(ts(.52));
  noFill();
  line(eaveL.x,eaveL.y,ridge.x,ridge.y);
  line(ridge.x,ridge.y,eaveR.x,eaveR.y);
  line(eaveL.x,eaveL.y,eaveR.x,eaveR.y);
  line(frontL.x,frontL.y,frontR.x,frontR.y);

  // 飞檐稍稍外挑
  const wing=ts(8)*scale*p;
  line(eaveL.x,eaveL.y,eaveL.x-px*wing-ux*ts(3),eaveL.y-py*wing-uy*ts(3));
  line(eaveR.x,eaveR.y,eaveR.x+px*wing-ux*ts(3),eaveR.y+py*wing-uy*ts(3));

  // 主殿脊心有一颗非常轻的星核，表明宫殿仍是星象取象。
  const pulse=.55+.45*sin(clock*.68+center.x*.01);
  noStroke();
  fill(255,173,79,(18+24*pulse)*p);
  circle(ridge.x,ridge.y,ts(8+5*pulse)*scale);
  fill(255,232,186,150*p);
  circle(ridge.x,ridge.y,ts(1.1+1.0*pulse)*scale);

  pop();
}

function drawZiweiCourt(center,ux,uy,px,py,p){
  if(p<=0)return;
  const w=ts(85)*p,d=ts(47)*p;
  push();
  noFill();
  stroke(158,165,145,26*p);
  strokeWeight(ts(.35));
  const a={x:center.x-px*w-ux*d,y:center.y-py*w-uy*d};
  const b={x:center.x+px*w-ux*d,y:center.y+py*w-uy*d};
  const c={x:center.x+px*w+ux*d,y:center.y+py*w+uy*d};
  const d2={x:center.x-px*w+ux*d,y:center.y-py*w+uy*d};
  beginShape();vertex(a.x,a.y);vertex(b.x,b.y);vertex(c.x,c.y);vertex(d2.x,d2.y);endShape(CLOSE);

  // 庭院中心的星盘
  stroke(213,189,139,28*p);
  ellipse(center.x,center.y,ts(29)*p,ts(15)*p);
  line(center.x-px*ts(13)*p,center.y-py*ts(13)*p,center.x+px*ts(13)*p,center.y+py*ts(13)*p);
  line(center.x-ux*ts(8)*p,center.y-uy*ts(8)*p,center.x+ux*ts(8)*p,center.y+uy*ts(8)*p);
  pop();
}

function drawZiweiGate(center,ux,uy,px,py,p){
  if(p<=0)return;
  const left={x:center.x-px*ts(34)*p,y:center.y-py*ts(34)*p};
  const right={x:center.x+px*ts(34)*p,y:center.y+py*ts(34)*p};
  drawZiweiHall(left,ux,uy,px,py,ts(30),ts(24),p,.45);
  drawZiweiHall(right,ux,uy,px,py,ts(30),ts(24),p,.45);
  stroke(229,198,142,56*p);
  strokeWeight(ts(.45));
  line(left.x,left.y,right.x,right.y);
}

function drawZiweiBreathingMist(pts,c,p,elapsed){
  if(p<=0)return;
  push();
  blendMode(SCREEN);
  noFill();

  for(let i=0;i<4;i++){
    const phase=clock*.16+i*.8;
    const r=ts(74+i*31)*(1+.025*sin(phase));
    stroke(91,124,138,(6+i*2)*p);
    strokeWeight(ts(.35));
    arc(c.x,c.y+ts(12),r*2,r*.72,-2.55+.08*i,-.2+.06*i);
  }

  // 几个不抢眼的“气”沿建筑空间游走。
  for(let i=0;i<9;i++){
    const t=(clock*.018+i*.113)%1;
    const a=pts[3],b=pts[11];
    const x=lerp(a.x,b.x,t)+sin(t*TWO_PI*2+i)*ts(18);
    const y=lerp(a.y,b.y,t)+cos(t*TWO_PI+i)*ts(10);
    noStroke();
    fill(165,196,198,7*p);
    circle(x,y,ts(8+4*sin(clock*.3+i)));
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
