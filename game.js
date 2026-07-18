const $=s=>document.querySelector(s);
const TILE=32,W=18,H=12;
const state={map:'subway',x:2,y:8,hx:11,hy:5,steps:0,facing:'right',stage:0,parkStage:0,moving:false,locked:false,follow:false,unlockedPark:localStorage.getItem('bj-park-unlocked')==='1'};
const maps={
  subway:{name:'双井地铁站',date:'2022 · 07 · 11',start:[2,8],hedy:[11,5],tiles:Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>y<2?'wall':y>9?'track':y===9?'edge':'platform')),props:[['',1,2,'pillar solid'],['',6,2,'pillar solid'],['',12,2,'pillar solid'],['',17,2,'pillar solid'],['',2,3,'metro'],['双井站',4,2,'sign station'],['',7,3,'poster'],['',9,3,'poster ad'],['',12,3,'routeboard'],['',15,3,'exit-arrow'],['出口 A',14,2,'sign exit-sign'],['',5,8,'bench subway-bench solid wide-solid'],['',14,8,'bench subway-bench solid wide-solid'],['',0,9,'safety-rail'],['',6,9,'safety-rail'],['',12,9,'safety-rail'],['',3,5,'ticket-machine solid'],['',16,6,'ticket-machine red solid'],['',8,7,'trash solid'],['',4,4,'floor-arrow'],['',13,7,'floor-arrow'],['',10,4,'ceiling-light'],['',15,4,'ceiling-light']]},
  park:{name:'日坛公园',date:'2022 · 07 · 11 · 下午',start:[1,9],hedy:[2,9],tiles:Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>((x>=2&&x<=15&&y>=4&&y<=9)||(y>=2&&y<=10&&x>=7&&x<=10))?'path':(x>13&&y<5)?'hill':'grass')),props:[['',0,1,'tree oak big solid'],['',3,1,'tree willow solid'],['',11,1,'tree oak solid'],['',16,6,'tree willow big solid'],['',1,5,'tree oak solid'],['',15,9,'tree oak solid'],['',8,4,'bench park-bench solid wide-solid'],['',5,7,'flowerbed pink solid wide-solid'],['',12,8,'flowerbed yellow solid wide-solid'],['',6,2,'lamp solid'],['',11,5,'lamp solid'],['',3,9,'shrub solid'],['',13,6,'shrub solid'],['小土坡',14,2,'sign hill-sign'],['日坛公园',0,10,'sign park-sign'],['',9,2,'stone-wall solid wide-solid'],['',14,4,'stone-wall solid wide-solid'],['',5,5,'pond solid pond-wide'],['',2,8,'picnic'],['',11,9,'fallen-leaves'],['',4,9,'fallen-leaves'],['',7,7,'butterflies'],['',10,3,'bird'],['',16,3,'pavilion solid'],['',0,7,'fence wide-solid solid']]}
};
let holdTimer=null;

function drawMap(name){
  state.map=name;const m=maps[name];$('#chapterName').textContent=m.name;$('#chapterDate').textContent=m.date;
  $('#tiles').innerHTML=m.tiles.flatMap((row,y)=>row.map((t,x)=>`<i class="tile ${t} v${(x*7+y*11)%4}" data-x="${x}" data-y="${y}"></i>`)).join('');
  $('#props').innerHTML=m.props.map(([v,x,y,c=''])=>`<i class="prop ${c}" style="left:${x*TILE}px;top:${y*TILE}px;z-index:${8+y}">${v}</i>`).join('');
  const [hx,hy]=m.hedy;state.hx=hx;state.hy=hy;$('#npcs').innerHTML=`<div id="hedy" class="actor hedy" style="left:${hx*TILE}px;top:${hy*TILE}px"><span class="npc-label">Hedy</span><span class="shadow"></span></div>`;
  [state.x,state.y]=m.start;state.steps=0;state.locked=false;state.follow=name==='park';$('#interactBtn').hidden=true;placeActors();
  if(name==='subway'){setObjective(state.stage<2?'找到 Hedy':'从右上角出口前往日坛公园')}else setObjective(['和 Hedy 一起散步','主动牵住她的手','到长椅坐一会儿','前往小土坡'][Math.min(state.parkStage,3)]);
  camera();closeOverlay('mapOverlay');
}
function placeActors(){
  const p=$('#player');p.style.left=`${state.x*TILE}px`;p.style.top=`${state.y*TILE}px`;
  if($('#hedy')){$('#hedy').style.left=`${state.hx*TILE}px`;$('#hedy').style.top=`${state.hy*TILE}px`;$('#hedy').style.zIndex=String(14+state.hy)}
  p.style.zIndex=String(15+state.y);
}
function camera(){
  const vp=$('#viewport'),world=$('#world');const scale=vp.clientWidth<760?1.05:Math.max(1,Math.min(1.35,vp.clientHeight/384));
  const px=state.x*TILE*scale,py=state.y*TILE*scale;const maxX=Math.max(0,W*TILE*scale-vp.clientWidth),maxY=Math.max(0,H*TILE*scale-vp.clientHeight);
  const cx=Math.max(0,Math.min(maxX,px-vp.clientWidth/2)),cy=Math.max(0,Math.min(maxY,py-vp.clientHeight/2));world.style.transform=`translate(${-cx}px,${-cy}px) scale(${scale})`;
}
function solidCells(){const cells=new Set();for(const [,x,y,c=''] of maps[state.map].props){if(!c.includes('solid'))continue;cells.add(`${x},${y}`);if(c.includes('wide-solid'))cells.add(`${x+1},${y}`);if(c.includes('pond-wide')){cells.add(`${x+1},${y}`);cells.add(`${x+2},${y}`);cells.add(`${x},${y+1}`);cells.add(`${x+1},${y+1}`);cells.add(`${x+2},${y+1}`)}}return cells}
function canMove(x,y){if(x<0||y<2||x>=W||y>=H)return false;if(state.map==='subway'&&y>=9)return false;if(solidCells().has(`${x},${y}`))return false;if(x===state.hx&&y===state.hy)return false;return true}
function move(dir){if(state.locked)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];const nx=state.x+d[0],ny=state.y+d[1];state.facing=dir;if(!canMove(nx,ny)){bump();return}
  const px=state.x,py=state.y;const p=$('#player');p.classList.toggle('face-left',dir==='left');p.classList.toggle('walk-right',dir!=='up'&&dir!=='down');state.x=nx;state.y=ny;state.steps++;if(state.follow){state.hx=px;state.hy=py}placeActors();camera();checkNearby();clearTimeout(holdTimer);holdTimer=setTimeout(()=>p.classList.remove('walk-right'),180);
}
function bump(){const p=$('#player');p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}
function dist(x,y){return Math.abs(state.x-x)+Math.abs(state.y-y)}
function checkNearby(){let text='';
  document.querySelectorAll('.nearby').forEach(n=>n.classList.remove('nearby'));
  if(state.map==='subway'){if(state.stage<2&&dist(state.hx,state.hy)<=2){text='和 Hedy 说话';$('#hedy').classList.add('nearby')}else if(state.stage>=2&&state.x>=15&&state.y<=4)text='前往日坛公园'}
  else{if(state.parkStage===0&&state.steps>=3&&dist(state.hx,state.hy)<=2){text='牵住 Hedy';$('#hedy').classList.add('nearby')}if(state.parkStage===1&&dist(8,4)<=2){text='在长椅休息';$('.park-bench')?.classList.add('nearby')}if(state.parkStage>=2&&dist(14,3)<=2){text='走上小土坡';$('.hill-sign')?.classList.add('nearby')}}
  $('#interactBtn').hidden=!text;$('#interactBtn').textContent=text||'互动';
}
function interact(){if(state.locked)return;
  if(state.map==='subway'){
    if(state.stage<2&&dist(state.hx,state.hy)<=2)return subwayMeeting();
    if(state.stage>=2&&state.x>=15&&state.y<=4){state.unlockedPark=true;localStorage.setItem('bj-park-unlocked','1');$('#parkMapButton').disabled=false;return transition('从地铁站出来后，他们穿过使馆聚集的街道，向日坛公园走去。',()=>drawMap('park'))}
    return bubble('猪头','再往前走走，她应该就在站台那边。');
  }
  if(state.parkStage===0&&state.steps>=3&&dist(state.hx,state.hy)<=2)return handhold();
  if(state.parkStage===1&&dist(8,4)<=2)return benchScene();
  if(state.parkStage>=2&&dist(14,3)<=2)return kissScene();
  bubble('Hedy','我们再到前面看看吧。');
}
function subwayMeeting(){
  if(state.stage===0){state.stage=1;state.locked=true;bubble('猪头','真人比照片好看。',()=>bubble('Hedy','你一直看我干嘛呀？',()=>{bubble('猪头','我们之前打过赌。你要主动抱我。',()=>{state.locked=false;setObjective('让 Hedy 履行拥抱赌约')})}))}
  else{state.stage=2;alignPair(state.hx,state.hy);actionAt('shy-hug',state.hx-.5,state.hy);bubble('猪头','什么时候抱我？愿赌服输，不许耍赖。',()=>transition('两个人一边催、一边不好意思地笑。最后，她在地铁站的角落浅浅抱了他一下。很短，但赌约兑现了。',()=>{endAction();setObjective('从右上角出口前往日坛公园');heartBurst(state.hx,state.hy)}))}
}
function handhold(){state.parkStage=1;alignPair(state.hx,state.hy);actionAt('hold',state.hx-.5,state.hy);bubble('猪头','手给我。',()=>bubble('Hedy','好呀。',()=>transition('这是猪头第一次主动牵起 Hedy 的手。公园里的路忽然变得很长，也很短。',()=>{endAction();state.follow=true;setObjective('到长椅坐一会儿');heartBurst(state.hx,state.hy)})))}
function benchScene(){state.parkStage=2;state.locked=true;state.x=8;state.y=5;state.hx=9;state.hy=5;placeActors();actionAt('hold',8.5,5);bubble('Hedy','看看宝宝。',()=>bubble('猪头','在看。',()=>bubble('Hedy','再拍一个。',()=>transition('他们在长椅上休息，拍了很多短短的视频。镜头晃来晃去，又总会回到彼此身上。',()=>{endAction();state.locked=false;setObjective('前往右上方的小土坡')}))))}
function kissScene(){if(state.parkStage>2)return;state.parkStage=3;state.locked=true;state.x=13;state.y=3;state.hx=14;state.hy=3;placeActors();actionAt('kiss',13.5,3);bubble('猪头','之前另一个赌约，也该履行了。',()=>bubble('Hedy','那你闭眼。',()=>transition('小土坡上，Hedy 主动吻了他。那一刻，两个人幸福得有些头晕目眩。',()=>{bubble('猪头','我现在好幸福啊，Hedy。',()=>{heartBurst(14,3);setTimeout(()=>{$('#completeOverlay').hidden=false;state.locked=false},900)})})))}
function alignPair(hx,hy){const choices=[[hx-1,hy],[hx+1,hy],[hx,hy+1],[hx,hy-1]];const spot=choices.find(([x,y])=>x>=0&&y>=2&&x<W&&y<H&&!solidCells().has(`${x},${y}`))||[hx-1,hy];state.x=spot[0];state.y=spot[1];state.hx=hx;state.hy=hy;placeActors();camera()}
function actionAt(type,x,y){state.locked=true;$('#player').hidden=true;$('#hedy').hidden=true;const a=$('#actionScene');a.hidden=false;a.className=`action-scene ${type}`;a.style.left=`${x*TILE}px`;a.style.top=`${y*TILE}px`}
function endAction(){state.locked=false;$('#actionScene').hidden=true;$('#player').hidden=false;$('#hedy').hidden=false;placeActors()}
function bubble(who,text,next){const target=who==='Hedy'?$('#hedy'):$('#player');const layer=$('#speechLayer');layer.innerHTML='';const b=document.createElement('div');b.className='bubble';b.innerHTML=`<b>${who}</b><br>${text}`;layer.appendChild(b);const r=target.getBoundingClientRect(),v=$('#viewport').getBoundingClientRect();b.style.left=`${Math.max(8,Math.min(v.width-b.offsetWidth-8,r.left-v.left-30))}px`;b.style.top=`${Math.max(55,r.top-v.top-75)}px`;setTimeout(()=>{layer.innerHTML='';if(next)next()},1900)}
function transition(text,next){state.locked=true;$('#narratorText').textContent=text;$('#narrator').hidden=false;$('#narrator').onclick=()=>{$('#narrator').hidden=true;$('#narrator').onclick=null;state.locked=false;if(next)next()}}
function heartBurst(x,y){for(let i=0;i<6;i++){const h=document.createElement('i');h.className='heart-particle';h.textContent='♥';h.style.left=`${x*TILE+10+(i%3)*9}px`;h.style.top=`${y*TILE-10}px`;h.style.animationDelay=`${i*.1}s`;$('#world').appendChild(h);setTimeout(()=>h.remove(),1600)}}
function setObjective(t){$('#objectiveText').textContent=t}
function closeOverlay(id){$('#'+id).hidden=true}

$('#startBtn').onclick=()=>{$('#titleScreen').style.display='none';transition('2022年7月11日。猪头坐着地铁来到双井。越过人群，他终于要见到那个隔着屏幕聊了很久的人。',()=>drawMap('subway'))};
$('#mapBtn').onclick=()=>{$('#parkMapButton').disabled=!state.unlockedPark;$('#mapOverlay').hidden=false};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeOverlay(b.dataset.close));
document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>drawMap(b.dataset.map));
$('#actionBtn').onclick=interact;$('#interactBtn').onclick=interact;$('#continueExplore').onclick=()=>{$('#completeOverlay').hidden=true;setObjective('自由探索日坛公园')};
$('#soundBtn').onclick=e=>{e.currentTarget.classList.toggle('muted');e.currentTarget.textContent=e.currentTarget.classList.contains('muted')?'×':'♫'};
document.querySelectorAll('[data-dir]').forEach(b=>{let repeat;const stop=()=>{clearInterval(repeat);repeat=null};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);move(b.dataset.dir);stop();repeat=setInterval(()=>move(b.dataset.dir),145)});b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('pointerleave',stop)});
document.addEventListener('keydown',e=>{const d={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}[e.key];if(d){e.preventDefault();move(d)}if([' ','Enter','e','E'].includes(e.key)){e.preventDefault();interact()}});
window.addEventListener('resize',camera);drawMap('subway');

const spriteLoader=new Image();
const readyGame=()=>{const b=$('#startBtn');b.disabled=false;b.textContent='戴上耳机 · 进入回忆'};
spriteLoader.onload=readyGame;spriteLoader.onerror=readyGame;spriteLoader.src='./public/couple-sprites-lite.png';
if(spriteLoader.complete)readyGame();
