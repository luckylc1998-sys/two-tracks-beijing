const $=s=>document.querySelector(s);
const TILE=32,W=30,H=22;
const key=(x,y)=>`${x},${y}`;
const state={map:'subway',x:3,y:17,hx:21,hy:10,steps:0,facing:'right',stage:0,parkStage:0,jingStage:0,locked:false,follow:false,sprites:false,unlockedPark:localStorage.getItem('bj-park-unlocked')==='1',unlockedJing:localStorage.getItem('bj-jing-unlocked')==='1'};

function grid(fn){return Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>fn(x,y)))}
function subwayTiles(x,y){if(y<4)return'wall';if(y>18)return'track';if(y===18)return'edge';return'platform'}
function parkTiles(x,y){
  if((x>=2&&x<=27&&y>=9&&y<=12)||(x>=13&&x<=16&&y>=2&&y<=20)||(x>=5&&x<=10&&y>=5&&y<=17))return'path';
  if(x>=20&&x<=27&&y>=2&&y<=7)return'water';
  if(x>=22&&y>=13)return'hill';return'grass';
}
function jingTiles(x,y){
  if(y<4)return'sky';
  const ridge=Math.abs(x-15);if(y<7+Math.floor(ridge/5))return'cliff';
  if((x>=13&&x<=17)||(y>=15&&y<=18)||(x>=4&&x<=25&&y>=9&&y<=11))return'stonepath';
  return y<14?'hill':'grass';
}
const trees=(points,type='tree oak solid')=>points.map(([x,y])=>['',x,y,type]);
const maps={
  subway:{name:'双井地铁站',date:'2022 · 07 · 11 · 上午',start:[3,17],hedy:[21,10],tiles:grid(subwayTiles),props:[
    ...[1,6,12,18,24,29].map(x=>['',x,4,'pillar solid tall']),['双井站',3,3,'sign station'],['双井站',20,3,'sign station'],['',2,5,'metro'],['',8,5,'routeboard'],['',17,5,'routeboard'],['出口 A',26,4,'sign exit-sign'],['',27,6,'exit-arrow'],
    ['',5,15,'bench subway-bench solid wide-solid'],['',14,15,'bench subway-bench solid wide-solid'],['',23,15,'bench subway-bench solid wide-solid'],['',9,10,'ticket-machine solid'],['',10,10,'ticket-machine red solid'],['',18,13,'trash solid'],
    ...[0,6,12,18,24].map(x=>['',x,18,'safety-rail wide-solid']),...[[4,8],[13,12],[22,8]].map(([x,y])=>['',x,y,'floor-arrow']),...[[7,7],[16,7],[25,7]].map(([x,y])=>['',x,y,'ceiling-light'])]},
  park:{name:'日坛公园',date:'2022 · 07 · 11 · 下午',start:[3,11],hedy:[5,11],tiles:grid(parkTiles),props:[
    ['日坛公园·南门',1,13,'gate landmark solid wide-solid'],['日坛',13,3,'altar landmark solid wide-solid'],['西天门',7,8,'arch landmark solid wide-solid'],['小土坡',25,14,'sign hill-sign'],
    ['',21,3,'pond pond-large solid pond-wide'],['',25,4,'lotus'],['',8,10,'bench park-bench solid wide-solid'],['',18,11,'bench park-bench solid wide-solid'],['',7,14,'bench park-bench solid wide-solid'],
    ...trees([[1,3],[4,4],[8,2],[11,6],[18,3],[27,8],[2,18],[11,19],[19,17],[28,19]],'tree oak big solid'),...trees([[5,7],[18,8],[24,9],[4,15]],'tree willow solid'),
    ...[[6,6],[9,16],[17,6],[20,14],[27,12]].map(([x,y])=>['',x,y,'flowerbed pink wide-solid']),...[[12,8],[17,13],[24,17]].map(([x,y])=>['',x,y,'flowerbed yellow wide-solid']),
    ...[[12,10],[17,10],[6,13],[23,12]].map(([x,y])=>['',x,y,'lamp solid']),['',10,5,'pavilion solid wide-solid'],['',23,15,'stone-wall solid wide-solid'],['',5,12,'fallen-leaves'],['',15,16,'butterflies'],['',19,9,'bird'],['',3,16,'picnic']]},
  jingshan:{name:'景山公园',date:'2022 · 07 · 13 · 傍晚',start:[15,19],hedy:[16,19],tiles:grid(jingTiles),props:[
    ['景山公园',13,19,'gate landmark solid wide-solid'],['万春亭',13,6,'pagoda landmark solid wide-solid'],['歪脖子树',5,15,'sign tree-sign'],['俯瞰故宫',20,9,'viewpoint'],
    ...trees([[3,8],[7,7],[22,7],[26,9],[2,14],[9,14],[21,14],[27,15],[5,19],[24,19]],'tree pine big solid'),
    ...[[12,14],[17,14],[12,11],[17,11],[12,8],[17,8]].map(([x,y])=>['',x,y,'stair']),...[[10,17],[19,17],[10,10],[19,10]].map(([x,y])=>['',x,y,'stone-wall solid wide-solid']),
    ['',8,16,'bench park-bench solid wide-solid'],['',21,16,'bench park-bench solid wide-solid'],['',14,8,'lantern solid'],['',16,8,'lantern solid'],['',20,8,'telescope solid']]}
};

let holdTimer=null,walkTimer=null;
function drawMap(name){
  state.map=name;const m=maps[name];$('#chapterName').textContent=m.name;$('#chapterDate').textContent=m.date;
  const world=$('#world');world.style.width=`${W*TILE}px`;world.style.height=`${H*TILE}px`;
  $('#tiles').style.gridTemplateColumns=`repeat(${W},${TILE}px)`;$('#tiles').style.gridTemplateRows=`repeat(${H},${TILE}px)`;
  $('#tiles').innerHTML=m.tiles.flatMap((row,y)=>row.map((t,x)=>`<i class="tile ${t} v${(x*7+y*11)%4}" data-x="${x}" data-y="${y}"></i>`)).join('');
  $('#props').innerHTML=m.props.map(([v,x,y,c=''])=>`<i class="prop ${c}" data-x="${x}" data-y="${y}" style="left:${x*TILE}px;top:${y*TILE}px;z-index:${20+y}">${v}</i>`).join('');
  [state.hx,state.hy]=m.hedy;$('#npcs').innerHTML=`<div id="hedy" class="actor hedy" aria-label="Hedy"><span class="npc-label">Hedy</span><span class="shadow"></span></div>`;
  [state.x,state.y]=m.start;state.steps=0;state.locked=false;state.follow=name!=='subway';$('#interactBtn').hidden=true;placeActors();setObjective(name==='subway'?'穿过站台找到 Hedy':name==='park'?'沿园路和 Hedy 散步':'沿石阶登上万春亭');camera();checkNearby();closeOverlay('mapOverlay');
}
function placeActors(){const p=$('#player'),h=$('#hedy');p.style.left=`${state.x*TILE}px`;p.style.top=`${state.y*TILE}px`;p.style.zIndex=String(40+state.y);if(h){h.style.left=`${state.hx*TILE}px`;h.style.top=`${state.hy*TILE}px`;h.style.zIndex=String(39+state.hy)}}
function camera(){const vp=$('#viewport'),world=$('#world');const scale=vp.clientWidth<760?.94:1;const px=state.x*TILE*scale,py=state.y*TILE*scale;const maxX=Math.max(0,W*TILE*scale-vp.clientWidth),maxY=Math.max(0,H*TILE*scale-vp.clientHeight);const cx=Math.max(0,Math.min(maxX,px-vp.clientWidth*.5)),cy=Math.max(0,Math.min(maxY,py-vp.clientHeight*.48));world.style.transform=`translate3d(${-cx}px,${-cy}px,0) scale(${scale})`}
function solidCells(){const cells=new Set();for(const[,x,y,c='']of maps[state.map].props){if(!c.includes('solid'))continue;cells.add(key(x,y));if(c.includes('wide-solid'))cells.add(key(x+1,y));if(c.includes('pond-wide'))for(let dx=0;dx<5;dx++)for(let dy=0;dy<3;dy++)cells.add(key(x+dx,y+dy));}return cells}
function tileBlocked(x,y){const t=maps[state.map].tiles[y]?.[x];return!t||['track','water','sky','cliff'].includes(t)}
function canMove(x,y,ignoreHedy=false){return x>=0&&y>=0&&x<W&&y<H&&!tileBlocked(x,y)&&!solidCells().has(key(x,y))&&(ignoreHedy||x!==state.hx||y!==state.hy)}
function move(dir){if(state.locked)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];const nx=state.x+d[0],ny=state.y+d[1];state.facing=dir;const p=$('#player');p.classList.toggle('face-left',dir==='left');if(!canMove(nx,ny)){bump();return}const old=[state.x,state.y];state.x=nx;state.y=ny;state.steps++;p.classList.add('walking');if(state.follow&&canMove(old[0],old[1],true)){state.hx=old[0];state.hy=old[1]}placeActors();camera();checkNearby();clearTimeout(walkTimer);walkTimer=setTimeout(()=>p.classList.remove('walking'),160)}
function bump(){const p=$('#player');p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}
function dist(x,y){return Math.abs(state.x-x)+Math.abs(state.y-y)}
function nearProp(selector,r=2){const p=$(selector);if(!p)return false;const x=+p.dataset.x,y=+p.dataset.y;if(dist(x,y)<=r){p.classList.add('nearby');return true}return false}
function checkNearby(){let text='';document.querySelectorAll('.nearby').forEach(n=>n.classList.remove('nearby'));if(state.map==='subway'){if(state.stage<2&&dist(state.hx,state.hy)<=2){text='和 Hedy 说话';$('#hedy').classList.add('nearby')}else if(state.stage>=2&&state.x>=26&&state.y<=8)text='离开地铁站'}else if(state.map==='park'){if(state.parkStage===0&&state.steps>=4&&dist(state.hx,state.hy)<=2){text='牵住 Hedy';$('#hedy').classList.add('nearby')}else if(state.parkStage===1&&nearProp('.park-bench',3))text='坐下休息';else if(state.parkStage>=2&&nearProp('.hill-sign',3))text='走上小土坡'}else{if(nearProp('.tree-sign',2))text='听歪脖子树的故事';else if(nearProp('.viewpoint',3))text='一起看故宫';else if(nearProp('.pagoda',3))text='登上万春亭'}$('#interactBtn').hidden=!text;$('#interactBtn').textContent=text||'互动'}
function interact(){if(state.locked)return;if(state.map==='subway'){if(state.stage<2&&dist(state.hx,state.hy)<=2)return subwayMeeting();if(state.stage>=2&&state.x>=26&&state.y<=8){state.unlockedPark=true;localStorage.setItem('bj-park-unlocked','1');return transition('离开双井站，他们穿过使馆街区，向日坛公园走去。',()=>drawMap('park'))}}else if(state.map==='park'){if(state.parkStage===0&&state.steps>=4&&dist(state.hx,state.hy)<=2)return handhold();if(state.parkStage===1&&nearProp('.park-bench',3))return benchScene();if(state.parkStage>=2&&nearProp('.hill-sign',3))return kissScene()}else{if(nearProp('.tree-sign',2))return bubble('Hedy','这棵早就不是当年那棵啦，不知道换过多少棵了。');if(nearProp('.viewpoint',3))return bubble('猪头','站在这里，北京好像忽然变得很小。');if(nearProp('.pagoda',3)){state.jingStage=1;return transition('从景山顶向南望去，故宫铺展在傍晚的光里。下山时，Hedy 哼出了那首猪头怎么也想不起名字的歌。',()=>bubble('Hedy','大风车吱呀吱悠悠地转……'))}}bubble(state.map==='subway'?'猪头':'Hedy','再往前走走看吧。')}
function subwayMeeting(){if(state.stage===0){state.stage=1;state.locked=true;bubble('猪头','真人比照片好看。',()=>bubble('Hedy','你一直看我干嘛呀？',()=>bubble('猪头','我们之前打过赌。你要主动抱我。',()=>{state.locked=false;setObjective('让 Hedy 履行拥抱赌约')})))}else{state.stage=2;pairAction('shy-hug','什么时候抱我？愿赌服输，不许耍赖。','她在地铁站的角落浅浅抱了他一下。很短，但赌约兑现了。',()=>setObjective('从右上角出口离开地铁站'))}}
function handhold(){state.parkStage=1;pairAction('hold','手给我。','这是猪头第一次主动牵起 Hedy 的手。园路在树影里向前延伸。',()=>setObjective('在园中找到长椅休息'))}
function benchScene(){state.parkStage=2;pairAction('hold','看看宝宝。','他们坐在日坛公园的长椅上，拍了很多短短的视频。镜头晃来晃去，又总会回到彼此身上。',()=>setObjective('探索东侧小土坡'))}
function kissScene(){if(state.parkStage>2)return;state.parkStage=3;pairAction('kiss','之前另一个赌约，也该履行了。','小土坡上，Hedy 主动吻了他。那一刻，两个人幸福得有些头晕目眩。',()=>{bubble('猪头','我现在好幸福啊，Hedy。');state.unlockedJing=true;localStorage.setItem('bj-jing-unlocked','1');$('#jingMapButton').disabled=false;setObjective('继续自由探索，或打开地图前往景山')})}
function safePair(){const choices=[[state.hx-1,state.hy],[state.hx+1,state.hy],[state.hx,state.hy+1],[state.hx,state.hy-1]];const s=choices.find(([x,y])=>canMove(x,y,true))||[state.x,state.y];state.x=s[0];state.y=s[1];placeActors();camera()}
function pairAction(type,line,narration,done){safePair();state.locked=true;const cx=(state.x+state.hx)/2,cy=Math.max(state.y,state.hy);actionAt(type,cx,cy);bubble('猪头',line,()=>transition(narration,()=>{endAction();heartBurst(cx,cy);done?.()}))}
function actionAt(type,x,y){$('#player').hidden=true;$('#hedy').hidden=true;const a=$('#actionScene');a.hidden=false;a.className=`action-scene ${type}`;a.style.left=`${x*TILE}px`;a.style.top=`${y*TILE}px`;a.style.zIndex=String(55+y)}
function endAction(){state.locked=false;$('#actionScene').hidden=true;$('#player').hidden=false;$('#hedy').hidden=false;placeActors();checkNearby()}
function bubble(who,text,next){const target=who==='Hedy'?$('#hedy'):$('#player'),layer=$('#speechLayer');layer.innerHTML='';const b=document.createElement('div');b.className='bubble';b.innerHTML=`<b>${who}</b><br>${text}`;layer.appendChild(b);const r=target.getBoundingClientRect(),v=$('#viewport').getBoundingClientRect();b.style.left=`${Math.max(8,Math.min(v.width-b.offsetWidth-8,r.left-v.left-35))}px`;b.style.top=`${Math.max(62,r.top-v.top-78)}px`;setTimeout(()=>{layer.innerHTML='';next?.()},1900)}
function transition(text,next){state.locked=true;$('#narratorText').textContent=text;$('#narrator').hidden=false;$('#narrator').onclick=()=>{$('#narrator').hidden=true;$('#narrator').onclick=null;state.locked=false;next?.()}}
function heartBurst(x,y){for(let i=0;i<6;i++){const h=document.createElement('i');h.className='heart-particle';h.textContent='♥';h.style.left=`${x*TILE+(i%3)*9}px`;h.style.top=`${y*TILE-12}px`;h.style.animationDelay=`${i*.1}s`;$('#world').appendChild(h);setTimeout(()=>h.remove(),1500)}}
function setObjective(t){$('#objectiveText').textContent=t}function closeOverlay(id){$('#'+id).hidden=true}

$('#startBtn').onclick=()=>{$('#titleScreen').style.display='none';transition('2022年7月11日。猪头坐着地铁来到双井。越过人群，他终于要见到那个隔着屏幕聊了很久的人。',()=>drawMap('subway'))};
$('#mapBtn').onclick=()=>{$('#parkMapButton').disabled=!state.unlockedPark;$('#jingMapButton').disabled=!state.unlockedJing;$('#mapOverlay').hidden=false};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeOverlay(b.dataset.close));document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>drawMap(b.dataset.map));
$('#actionBtn').onclick=interact;$('#interactBtn').onclick=interact;$('#continueExplore').onclick=()=>{$('#completeOverlay').hidden=true};
$('#soundBtn').onclick=e=>{e.currentTarget.classList.toggle('muted');e.currentTarget.textContent=e.currentTarget.classList.contains('muted')?'×':'♫'};
document.querySelectorAll('[data-dir]').forEach(b=>{let repeat;const stop=()=>{clearInterval(repeat);repeat=null};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);move(b.dataset.dir);stop();repeat=setInterval(()=>move(b.dataset.dir),135)});['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,stop))});
document.addEventListener('keydown',e=>{const d={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}[e.key];if(d){e.preventDefault();move(d)}if([' ','Enter','e','E'].includes(e.key)){e.preventDefault();interact()}});window.addEventListener('resize',camera);

// Never gate the game on a large image: CSS avatars are the instant fallback.
$('#startBtn').disabled=false;$('#startBtn').textContent='戴上耳机 · 进入回忆';drawMap('subway');
const spriteLoader=new Image();spriteLoader.decoding='async';spriteLoader.onload=()=>{state.sprites=true;document.documentElement.classList.add('sprites-ready')};spriteLoader.onerror=()=>document.documentElement.classList.add('sprites-fallback');spriteLoader.src='./public/couple-sprites-lite.png';
