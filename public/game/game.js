const $=s=>document.querySelector(s);
const TILE=32,W=18,H=12;
const state={map:'subway',x:2,y:8,stage:0,parkStage:0,moving:false,locked:false,follow:false,unlockedPark:localStorage.getItem('bj-park-unlocked')==='1'};
const maps={
  subway:{name:'双井地铁站',date:'2022 · 07 · 11',start:[2,8],hedy:[13,5],tiles:Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>y<2?'wall':y>9?'track':y===9?'edge':'platform')),props:[['🚇',2,3],['双井站',4,2,'sign'],['▤',8,3],['▤',10,3],['↗',16,3],['出口',15,2,'sign']]},
  park:{name:'日坛公园',date:'2022 · 07 · 11 · 下午',start:[1,9],hedy:[2,9],tiles:Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>((x>=2&&x<=15&&y>=4&&y<=9)||(y>=2&&y<=10&&x>=7&&x<=10))?'path':(x>13&&y<5)?'hill':'grass')),props:[['🌳',1,2],['🌳',4,2],['🌳',12,2],['🌳',16,7],['🌲',2,6],['🌲',15,9],['🪑',8,4,'wide'],['🌼',5,7],['🌷',12,8],['小土坡',14,2,'sign'],['日坛公园',1,10,'sign']]}
};
const blocked={subway:new Set(['0,0']),park:new Set(['1,2','4,2','12,2','16,7','2,6','15,9','8,4','9,4'])};
let holdTimer=null;

function drawMap(name){
  state.map=name;const m=maps[name];$('#chapterName').textContent=m.name;$('#chapterDate').textContent=m.date;
  $('#tiles').innerHTML=m.tiles.flatMap((row,y)=>row.map((t,x)=>`<i class="tile ${t}" data-x="${x}" data-y="${y}"></i>`)).join('');
  $('#props').innerHTML=m.props.map(([v,x,y,c=''])=>`<i class="prop ${c}" style="left:${x*TILE}px;top:${y*TILE}px">${v}</i>`).join('');
  const [hx,hy]=m.hedy;$('#npcs').innerHTML=`<div id="hedy" class="actor hedy" style="left:${hx*TILE}px;top:${hy*TILE}px"><span class="shadow"></span></div>`;
  [state.x,state.y]=m.start;state.locked=false;state.follow=name==='park';placeActors();
  if(name==='subway'){setObjective(state.stage<2?'找到 Hedy':'从右上角出口前往日坛公园')}else setObjective(['和 Hedy 一起散步','主动牵住她的手','到长椅坐一会儿','前往小土坡'][Math.min(state.parkStage,3)]);
  camera();closeOverlay('mapOverlay');
}
function placeActors(){
  const p=$('#player');p.style.left=`${state.x*TILE}px`;p.style.top=`${state.y*TILE}px`;
  if(state.follow&&$('#hedy')){const hx=Math.max(1,state.x-1),hy=state.y;$('#hedy').style.left=`${hx*TILE}px`;$('#hedy').style.top=`${hy*TILE}px`}
}
function camera(){
  const vp=$('#viewport'),world=$('#world');const scale=Math.max(1,Math.min(1.45,vp.clientHeight/384));
  const px=state.x*TILE*scale,py=state.y*TILE*scale;const maxX=Math.max(0,W*TILE*scale-vp.clientWidth),maxY=Math.max(0,H*TILE*scale-vp.clientHeight);
  const cx=Math.max(0,Math.min(maxX,px-vp.clientWidth/2)),cy=Math.max(0,Math.min(maxY,py-vp.clientHeight/2));world.style.transform=`translate(${-cx}px,${-cy}px) scale(${scale})`;
}
function canMove(x,y){if(x<0||y<2||x>=W||y>=H)return false;if(state.map==='subway'&&y>=9)return false;return !blocked[state.map].has(`${x},${y}`)}
function move(dir){if(state.locked)return;const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];const nx=state.x+d[0],ny=state.y+d[1];if(!canMove(nx,ny))return;
  const p=$('#player');p.classList.toggle('face-left',dir==='left');p.classList.toggle('walk-right',dir!=='up'&&dir!=='down');state.x=nx;state.y=ny;placeActors();camera();checkNearby();clearTimeout(holdTimer);holdTimer=setTimeout(()=>p.classList.remove('walk-right'),180);
}
function dist(x,y){return Math.abs(state.x-x)+Math.abs(state.y-y)}
function checkNearby(){let text='';
  if(state.map==='subway'){if(state.stage<2&&dist(13,5)<=2)text='和 Hedy 说话';else if(state.stage>=2&&state.x>=15&&state.y<=4)text='前往日坛公园'}
  else{if(state.parkStage===0&&state.x>=4)text='牵住 Hedy';if(state.parkStage===1&&dist(8,4)<=2)text='在长椅休息';if(state.parkStage>=2&&dist(14,3)<=2)text='走上小土坡'}
  $('#interactBtn').hidden=!text;$('#interactBtn').textContent=text||'互动';
}
function interact(){if(state.locked)return;
  if(state.map==='subway'){
    if(state.stage<2&&dist(13,5)<=2)return subwayMeeting();
    if(state.stage>=2&&state.x>=15&&state.y<=4){state.unlockedPark=true;localStorage.setItem('bj-park-unlocked','1');$('#parkMapButton').disabled=false;return transition('从地铁站出来后，他们穿过使馆聚集的街道，向日坛公园走去。',()=>drawMap('park'))}
    return bubble('猪头','再往前走走，她应该就在站台那边。');
  }
  if(state.parkStage===0&&state.x>=4)return handhold();
  if(state.parkStage===1&&dist(8,4)<=2)return benchScene();
  if(state.parkStage>=2&&dist(14,3)<=2)return kissScene();
  bubble('Hedy','我们再到前面看看吧。');
}
function subwayMeeting(){
  if(state.stage===0){state.stage=1;state.locked=true;bubble('猪头','真人比照片好看。',()=>bubble('Hedy','你一直看我干嘛呀？',()=>{bubble('猪头','我们之前打过赌。你要主动抱我。',()=>{state.locked=false;setObjective('让 Hedy 履行拥抱赌约')})}))}
  else{state.stage=2;actionAt('shy-hug',13,5);bubble('猪头','什么时候抱我？愿赌服输，不许耍赖。',()=>transition('两个人一边催、一边不好意思地笑。最后，她在地铁站的角落浅浅抱了他一下。很短，但赌约兑现了。',()=>{endAction();setObjective('从右上角出口前往日坛公园');heartBurst(13,5)}))}
}
function handhold(){state.parkStage=1;actionAt('hold',state.x,state.y);bubble('猪头','手给我。',()=>bubble('Hedy','好呀。',()=>transition('这是猪头第一次主动牵起 Hedy 的手。公园里的路忽然变得很长，也很短。',()=>{endAction();state.follow=true;setObjective('到长椅坐一会儿');heartBurst(state.x,state.y)})))}
function benchScene(){state.parkStage=2;state.locked=true;actionAt('hold',8,4);bubble('Hedy','看看宝宝。',()=>bubble('猪头','在看。',()=>bubble('Hedy','再拍一个。',()=>transition('他们在长椅上休息，拍了很多短短的视频。镜头晃来晃去，又总会回到彼此身上。',()=>{endAction();state.locked=false;setObjective('前往右上方的小土坡')}))))}
function kissScene(){if(state.parkStage>2)return;state.parkStage=3;state.locked=true;actionAt('kiss',14,3);bubble('猪头','之前另一个赌约，也该履行了。',()=>bubble('Hedy','那你闭眼。',()=>transition('小土坡上，Hedy 主动吻了他。那一刻，两个人幸福得有些头晕目眩。',()=>{bubble('猪头','我现在好幸福啊，Hedy。',()=>{heartBurst(14,3);setTimeout(()=>{$('#completeOverlay').hidden=false;state.locked=false},900)})})))}
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
document.querySelectorAll('[data-dir]').forEach(b=>{const go=e=>{e.preventDefault();move(b.dataset.dir)};b.addEventListener('pointerdown',go)});
document.addEventListener('keydown',e=>{const d={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'}[e.key];if(d){e.preventDefault();move(d)}if([' ','Enter','e','E'].includes(e.key)){e.preventDefault();interact()}});
window.addEventListener('resize',camera);drawMap('subway');
