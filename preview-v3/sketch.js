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
  const mobile=width<760;sceneScale=mobile?Math.max(width/W,height/H)*.74:Math.min(width/W,height/H);ox=(width-W*sceneScale)/2;oy=(height-H*sceneScale)/2;
  const mx=(mouseX-ox)/sceneScale,my=(mouseY-oy)/sceneScale;hoverId=hitGroup(mx,my);cursor(hoverId<0?'default':'pointer');
  clear();push();translate(ox,oy);scale(sceneScale);drawMilkyDust();drawAmbient();drawOrbitalTrails();
  const ease=1-Math.exp(-dt*6.5);
  groups.forEach(g=>{g.focus=lerp(g.focus,g.i===chosen?1:0,ease*.74);g.light=lerp(g.light,g.i===chosen?1:(g.i===hoverId?.26:0),ease);g.flow+=dt*(.18+g.light*.16)});
  if(chosen>=0)drawFocusVeil(groups[chosen]);
  groups.forEach(g=>{if(g.i!==chosen)drawGroup(g,chosen>=0?.055:1)});
  if(chosen>=0){const g=groups[chosen];if(g.name==='紫微垣')drawZiweiArchitecture(g);else drawConstellationEcho(g);drawGroup(g,1)}
  drawRings(dt);drawSeal();pop();
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
function focusTransform(g){const f=focusEase(g),mobile=width<760,targetX=W*.51,targetY=H*(mobile?.34:.39),targetScale=g.name==='紫微垣'?(mobile?.92:1.28):(mobile?1.6:1.92);return {f,scale:lerp(1,targetScale,f),dx:lerp(0,targetX-g.anchor[0],f),dy:lerp(0,targetY-g.anchor[1],f)}}
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
  if(progress<=0)return;const dx=b.x-a.x,dy=b.y-a.y,len=sqrt(dx*dx+dy*dy);if(len<.001)return;const ux=dx/len,uy=dy/len,px=-uy,py=ux,vis=len*progress,base=red?[197,86,53]:[205,184,140],glow=red?[236,126,80]:[234,211,162];
  stroke(glow[0],glow[1],glow[2],(12+light*26)*alphaMul);strokeWeight(ts(2.3+light*.5));line(a.x,a.y,a.x+dx*progress,a.y+dy*progress);
  for(let seg=0;seg<80;seg++){const start=seg*ts(4.5);if(start>=vis)break;const rs=seed+seg*1.913,end=Math.min(start+ts(2)+h(rs+8)*ts(4.2),vis);if(h(rs+21)<.1&&seg%5!==0)continue;const js=(h(rs+2)-.5)*ts(.5),je=(h(rs+3)-.5)*ts(.5);stroke(base[0],base[1],base[2],(95+light*80+h(rs+55)*22)*alphaMul);strokeWeight(ts(.5)+h(rs+44)*ts(.55));line(a.x+ux*start+px*js,a.y+uy*start+py*js,a.x+ux*end+px*je,a.y+uy*end+py*je)}
}
function drawStar(p,g,opacity){
  const slow=.5+.5*sin(clock*.68+p.p),flash=pow(max(0,sin(clock*1.1+p.p*1.7)),9),light=constrain(slow*.3+flash*.8+g.light*.7,0,1),c=g.red?[247,145,87]:[245,219,169],size=p.r*(1+g.light*.12);
  noStroke();fill(c[0],c[1],c[2],opacity*(8+g.light*10));circle(p.x,p.y,size*7);fill(c[0],c[1],c[2],opacity*(18+g.light*20));circle(p.x,p.y,size*4);fill(g.red?132:139,g.red?58:111,g.red?34:74,opacity*230);circle(p.x,p.y,size*1.45);fill(242,216,165,opacity*(125+light*110));circle(p.x,p.y,size*.52);
  if(light>.72||g.light>.15){stroke(c[0],c[1],c[2],opacity*100);strokeWeight(ts(.45));const ray=size*(1.35+light*.8);line(p.x-ray,p.y,p.x+ray,p.y);line(p.x,p.y-ray,p.x,p.y+ray)}
}
function drawAura(g,reveal){const c=g.red?[226,117,72]:[232,204,151];for(let pass=0;pass<3;pass++){stroke(c[0],c[1],c[2],(3+pass*2)*reveal);strokeWeight(ts(13-pass*4));for(let j=1;j<g.pts.length;j++)line(g.pts[j-1].x,g.pts[j-1].y,g.pts[j].x,g.pts[j].y)}}
function drawFlow(g,alphaMul){const span=g.pts.length-1;if(span<=0)return;const head=(g.flow+g.i*.37)%span;for(let k=11;k>=0;k--){const pos=(head-k*.025+span)%span,idx=floor(pos);if(idx<0||idx>=g.pts.length-1)continue;const t=pos-idx,a=g.pts[idx],b=g.pts[idx+1],x=lerp(a.x,b.x,t),y=lerp(a.y,b.y,t),fade=(1-k/12)*alphaMul;noStroke();fill(248,220,164,fade*(80+g.light*90));circle(x,y,k===0?ts(2.1):ts(.85))}}

function drawConstellationEcho(g){
  const f=focusEase(g);if(f<.04)return;push();applyTransform(g);noFill();
  for(let pass=0;pass<3;pass++){const amount=ts(5+pass*6)*f;stroke(130,158,163,(18-pass*4)*f);strokeWeight(ts(.45));beginShape();g.pts.forEach((p,i)=>{const n=g.pts[(i+1)%g.pts.length],dx=n.x-p.x,dy=n.y-p.y,len=max(1,sqrt(dx*dx+dy*dy));vertex(p.x-dy/len*amount,p.y+dx/len*amount)});endShape()}
  pop();
}

function drawZiweiArchitecture(g){
  const f=focusEase(g);
  if(f<.02)return;

  const build=constrain((f-.04)/.72,0,1);
  const reveal=constrain((f-.22)/.70,0,1);

  push();
  applyTransform(g);

  const pts=g.pts;
  const c=pts.reduce((a,p)=>({x:a.x+p.x,y:a.y+p.y}),{x:0,y:0});
  c.x/=pts.length;c.y/=pts.length;

  push();
  blendMode(SCREEN);
  noStroke();
  for(let i=4;i>=0;i--){
    fill(60,91,104,(1.6+(4-i)*.9)*f);
    ellipse(c.x,c.y+ts(8),ts(360+i*62),ts(205+i*34));
  }
  pop();

  const inner=pts.map(p=>({
    x:lerp(p.x,c.x,.085),
    y:lerp(p.y,c.y,.085)
  }));

  drawZiweiWallBand(pts,inner,build,c);

  [0,4,10,14].forEach((idx,k)=>{
    const p=constrain((reveal-k*.08)/(.70),0,1);
    if(p>0)drawZiweiStarTower(pts[idx],inner[idx],c,p,idx===0||idx===14?1.18:.88);
  });

  drawZiweiInnerPalace(pts,c,reveal);

  if(reveal>.22){
    const p=constrain((reveal-.22)/.78,0,1);
    noFill();
    stroke(126,158,166,28*p);
    strokeWeight(ts(.38));
    drawingContext.setLineDash([ts(2.4),ts(6.6)]);
    line(pts[0].x,pts[0].y,pts[14].x,pts[14].y);
    line((pts[0].x+pts[14].x)/2,(pts[0].y+pts[14].y)/2,pts[7].x,pts[7].y);
    drawingContext.setLineDash([]);
  }

  pop();
}

function drawZiweiWallBand(outer,inner,progress,c){
  const segCount=outer.length-1;
  for(let i=0;i<segCount;i++){
    const local=constrain(progress*segCount-i,0,1);
    if(local<=0)continue;
    const a=outer[i],b=outer[i+1],ia=inner[i],ib=inner[i+1];
    const bx=lerp(a.x,b.x,local),by=lerp(a.y,b.y,local);
    const ibx=lerp(ia.x,ib.x,local),iby=lerp(ia.y,ib.y,local);

    stroke(225,190,129,80*local);
    strokeWeight(ts(.62));
    line(a.x,a.y,bx,by);

    stroke(119,153,160,50*local);
    strokeWeight(ts(.46));
    line(ia.x,ia.y,ibx,iby);

    const dx=b.x-a.x,dy=b.y-a.y,len=max(1,sqrt(dx*dx+dy*dy));
    const steps=max(1,floor(len/ts(26)));
    for(let k=0;k<=steps;k++){
      const t=k/steps;
      if(t>local)break;
      const ox=lerp(a.x,b.x,t),oy=lerp(a.y,b.y,t);
      const ix=lerp(ia.x,ib.x,t),iy=lerp(ia.y,ib.y,t);
      stroke(169,177,155,24*local);
      strokeWeight(ts(.34));
      line(ox,oy,ix,iy);
    }
  }

  outer.forEach((p,i)=>{
    const local=constrain(progress*outer.length-i*.34,0,1);
    if(local<=0)return;
    const v={x:c.x-p.x,y:c.y-p.y};
    const len=max(1,sqrt(v.x*v.x+v.y*v.y)),ux=v.x/len,uy=v.y/len,px=-uy,py=ux;
    const w=ts(8.5)*local;
    stroke(229,201,146,48*local);
    strokeWeight(ts(.4));
    line(p.x-px*w,p.y-py*w,p.x+px*w,p.y+py*w);
    line(p.x-px*w,p.y-py*w,p.x+ux*ts(5),p.y+uy*ts(5));
    line(p.x+px*w,p.y+py*w,p.x+ux*ts(5),p.y+uy*ts(5));
  });
}

function drawZiweiStarTower(anchor,inner,c,p,scale=1){
  const vx=c.x-anchor.x,vy=c.y-anchor.y,len=max(1,sqrt(vx*vx+vy*vy));
  const ux=vx/len,uy=vy/len,px=-uy,py=ux;
  const rise=ts(34)*scale*p,half=ts(22)*scale*p;
  const base={x:inner.x,y:inner.y};
  const top={x:base.x+ux*rise,y:base.y+uy*rise};

  noFill();
  stroke(220,195,150,66*p);
  strokeWeight(ts(.5));
  line(base.x-px*half,base.y-py*half,top.x-px*half*.58,top.y-py*half*.58);
  line(base.x+px*half,base.y+py*half,top.x+px*half*.58,top.y+py*half*.58);

  const roofCenter={x:top.x+ux*ts(8)*scale,y:top.y+uy*ts(8)*scale};
  const eave=half*.92;
  line(top.x-px*eave-ux*ts(4),top.y-py*eave-uy*ts(4),roofCenter.x,roofCenter.y);
  line(roofCenter.x,roofCenter.y,top.x+px*eave-ux*ts(4),top.y+py*eave-uy*ts(4));
  stroke(130,162,168,35*p);
  line(anchor.x,anchor.y,roofCenter.x,roofCenter.y);
}

function drawZiweiInnerPalace(pts,c,p){
  if(p<=0)return;

  const L=pts[0],R=pts[14],base=pts[7];
  const topMid={x:(L.x+R.x)/2,y:(L.y+R.y)/2};
  const axis={x:base.x-topMid.x,y:base.y-topMid.y};
  const axisLen=max(1,sqrt(axis.x*axis.x+axis.y*axis.y));
  const ux=axis.x/axisLen,uy=axis.y/axisLen,px=-uy,py=ux;

  const a1={x:lerp(L.x,topMid.x,.13),y:lerp(L.y,topMid.y,.13)};
  const b1={x:lerp(R.x,topMid.x,.13),y:lerp(R.y,topMid.y,.13)};
  drawZiweiRoof(a1,b1,{x:topMid.x-ux*ts(16),y:topMid.y-uy*ts(16)},p,1);

  const center2={x:topMid.x+ux*axisLen*.24,y:topMid.y+uy*axisLen*.24};
  const half2=dist(a1.x,a1.y,b1.x,b1.y)*.33;
  drawZiweiRoof(
    {x:center2.x-px*half2,y:center2.y-py*half2},
    {x:center2.x+px*half2,y:center2.y+py*half2},
    {x:center2.x-ux*ts(17),y:center2.y-uy*ts(17)},
    constrain((p-.08)/.92,0,1),.82
  );

  const center3={x:topMid.x+ux*axisLen*.42,y:topMid.y+uy*axisLen*.42};
  const half3=half2*.64;
  drawZiweiRoof(
    {x:center3.x-px*half3,y:center3.y-py*half3},
    {x:center3.x+px*half3,y:center3.y+py*half3},
    {x:center3.x-ux*ts(13),y:center3.y-uy*ts(13)},
    constrain((p-.18)/.82,0,1),.68
  );

  [5,6,7,8,9].forEach((idx,k)=>{
    const q=constrain((p-.22-k*.05)/.65,0,1);
    if(q<=0)return;
    const star=pts[idx];
    const targetT=.32+.04*abs(k-2);
    const target={x:topMid.x+axis.x*targetT,y:topMid.y+axis.y*targetT};
    stroke(184,183,153,38*q);
    strokeWeight(ts(.38));
    line(star.x,star.y,lerp(star.x,target.x,q),lerp(star.y,target.y,q));
  });

  const q=constrain((p-.34)/.66,0,1);
  if(q>0){
    stroke(219,190,139,55*q);
    strokeWeight(ts(.48));
    line(pts[6].x,pts[6].y,pts[8].x,pts[8].y);
    const mid={x:(pts[6].x+pts[8].x)/2,y:(pts[6].y+pts[8].y)/2};
    const gateW=ts(18)*q;
    line(mid.x-px*gateW,mid.y-py*gateW,mid.x-px*gateW-ux*ts(28)*q,mid.y-py*gateW-uy*ts(28)*q);
    line(mid.x+px*gateW,mid.y+py*gateW,mid.x+px*gateW-ux*ts(28)*q,mid.y+py*gateW-uy*ts(28)*q);
  }
}

function drawZiweiRoof(a,b,peak,p,scale=1){
  if(p<=0)return;
  noFill();
  stroke(231,204,154,68*p);
  strokeWeight(ts(.54));
  const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const c1={x:lerp(a.x,peak.x,.62),y:lerp(a.y,peak.y,.62)};
  const c2={x:lerp(b.x,peak.x,.62),y:lerp(b.y,peak.y,.62)};
  bezier(a.x,a.y,c1.x,c1.y,c2.x,c2.y,b.x,b.y);

  const dx=b.x-a.x,dy=b.y-a.y,len=max(1,sqrt(dx*dx+dy*dy)),px=-dy/len,py=dx/len;
  const upSign=((peak.x-mid.x)*px+(peak.y-mid.y)*py)>=0?1:-1;
  const wing=ts(11)*scale*p;
  line(a.x,a.y,a.x-px*upSign*wing-dx/len*ts(8),a.y-py*upSign*wing-dy/len*ts(8));
  line(b.x,b.y,b.x-px*upSign*wing+dx/len*ts(8),b.y-py*upSign*wing+dy/len*ts(8));

  stroke(122,157,165,28*p);
  strokeWeight(ts(.34));
  line(a.x,a.y,b.x,b.y);
}

function drawRings(dt){for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.age+=dt;const a=24*max(0,1-r.age/1.4);noFill();stroke(218,188,130,a);strokeWeight(ts(.38));circle(r.x,r.y,ts(7)+r.age*ts(72));if(r.age>1.4)rings.splice(i,1)}}
function drawSeal(){if(chosen>=0)return;const s=ts(36),x=W-tx(61)-s,y=ty(46);push();translate(x+s/2,y+s/2);rotate(-.025);translate(-(x+s/2),-(y+s/2));noFill();stroke(174,77,50,180);strokeWeight(ts(1));rect(x,y,s,s,ts(2));stroke(174,77,50,92);rect(x+ts(3),y+ts(3),s-ts(6),s-ts(6));noStroke();fill(198,87,54,200);textFont('Ma Shan Zheng');textAlign(CENTER,TOP);textSize(ts(9));text('觀星',x+s/2,y+ts(5));text('無盡',x+s/2,y+ts(17));pop()}

function hitGroup(x,y){
  if(x<0||x>W||y<0||y>H)return-1;let best=-1,closest=Math.max(ts(18),18/sceneScale);const candidates=chosen>=0?[groups[chosen]]:groups;
  for(const g of candidates){const pts=g.pts.map(p=>transformedPoint(g,p));for(let j=0;j<pts.length;j++){let d=dist(x,y,pts[j].x,pts[j].y);if(j>0){const a=pts[j-1],b=pts[j],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den>0?constrain(((x-a.x)*dx+(y-a.y)*dy)/den,0,1):0;d=min(d,dist(x,y,a.x+t*dx,a.y+t*dy))}if(d<closest){closest=d;best=g.i}}}return best;
}
function setChosen(index,x=W*.5,y=H*.5){chosen=index;if(index>=0){rings.push({x,y,age:0});if(rings.length>4)rings.shift();window.starChartUI?.select(groups[index])}else window.starChartUI?.select(null)}
window.starChartSetChosen=setChosen;
function handleCanvasPointer(event){
  if(event.button!==undefined&&event.button!==0&&event.button!==-1)return;if(window.__starChartUiPointer)return;if(document.elementFromPoint(event.clientX,event.clientY)?.closest('.ui-shell'))return;
  const rect=event.currentTarget.getBoundingClientRect(),cx=event.clientX-rect.left,cy=event.clientY-rect.top,x=(cx-ox)/sceneScale,y=(cy-oy)/sceneScale;if(x<0||x>W||y<0||y>H)return;
  const hit=hitGroup(x,y);if(chosen>=0&&hit<0){setChosen(-1);return}setChosen(hit===chosen?-1:hit,x,y);
}
function keyPressed(){if(key===' '){paused=!paused;return false}if(key==='r'||key==='R'){clock=0;rings=[];setChosen(-1)}if(key==='s'||key==='S')saveCanvas('敦煌星河遗卷-v3','png')}
function windowResized(){resizeCanvas(windowWidth,windowHeight)}
