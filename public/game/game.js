const $ = (s) => document.querySelector(s);
const scene = $('#scene'), sky = $('#sky'), sprites = $('#sprites'), dialogue = $('#dialogue');
const speaker = $('#speaker'), line = $('#line'), choices = $('#choices'), fill = $('#progressFill');
const chapterKicker = $('#chapterKicker'), chapterTitle = $('#chapterTitle');
const memoryPanel = $('#memoryPanel'), memoryImage = $('#memoryImage'), memoryVideo = $('#memoryVideo'), videoPlaylist = $('#videoPlaylist'), memoryTitle = $('#memoryTitle'), memoryCaption = $('#memoryCaption');

const moments = [
  {ch:'序章',title:'两条轨道',scene:'map',who:'旁白',text:'2022年5月以前，猪头和Hedy还在天南海北，过着彼此毫无交集的生活。',actors:[['猪头',20],['Hedy',75]]},
  {scene:'phone',who:'系统',text:'2022年5月6日 01:06 · 你已添加了 Hedy，现在可以开始聊天了。',actors:[['猪头',28],['Hedy',68]]},
  {scene:'phone',who:'Hedy',text:'我是哈勾哈。',actors:[['猪头',28],['Hedy',68]]},
  {scene:'phone',who:'猪头',text:'你好。',actors:[['猪头',28],['Hedy',68]]},
  {scene:'phone',who:'Hedy',text:'我本来想说你通过了，但是说不说话决定权在我。但是好傻，还是算了。',actors:[['猪头',28],['Hedy',68]]},
  {scene:'phone',who:'猪头',text:'嘴硬小子。',actors:[['猪头',28],['Hedy',68]]},
  {scene:'quiz',who:'旁白',text:'最早的时候，他们会玩学习强国的双人知识问答。输赢不重要，重要的是——',choice:['喷射战士！','继续答题'],actors:[['猪头',28],['Hedy',68]]},
  {scene:'map-heart',who:'旁白',text:'一来一回的玩笑里，两条轨道在上海附近第一次亮起了同一种颜色。',actors:[['猪头',46],['Hedy',53]],heart:true},
  {scene:'rain-call',who:'猪头',text:'下雨很烦。',actors:[['猪头',25],['Hedy',72]]},
  {scene:'rain-call',who:'Hedy',text:'才意识到我们不在一个城市了。',actors:[['猪头',25],['Hedy',72]],heart:true},
  {scene:'rain-call',who:'猪头 · 心里',text:'听到这句话的时候，我其实很开心。原来不只我一个人在意这段距离。',actors:[['猪头',25],['Hedy',72]]},
  {scene:'map-route',who:'旁白',text:'Hedy从上海去了天津，再去北京。猪头从上海去了南昌。视频、聊天和答题，把距离一点点缩短。',actors:[['猪头',32],['Hedy',72]]},
  {scene:'ticket',who:'猪头 · 心里',text:'没有发生什么特别的事。只是很想见她。',choice:['买一张去北京的机票'],actors:[['猪头',35],['Hedy',74]]},
  {ch:'第一章',title:'北京 · 终于在同一座城市',scene:'arrival',who:'旁白',text:'2022年7月11日。飞机落地北京，猪头打车去了民宿，收拾好行李，吃了一个人的麦当劳。',actors:[['猪头',30]]},
  {scene:'subway',who:'猪头 · 心里',text:'双井地铁站。真人比照片好看。',actors:[['猪头',32],['Hedy',68]]},
  {scene:'subway',who:'猪头',text:'我们之前打过赌。赌约是——你要主动抱我。',choice:['提醒她履行赌约'],actors:[['猪头',42],['Hedy',61]]},
  {scene:'subway',who:'猪头',text:'什么时候抱我？愿赌服输，不许耍赖。',actors:[['猪头',43],['Hedy',59]]},
  {scene:'subway-hug',who:'旁白',text:'两个人一边催、一边不好意思地笑。最后，她在地铁站的角落浅浅地抱了他一下。很短，但赌约兑现了。',actors:[['猪头',47],['Hedy',53]],action:'shy-hug',heart:true},
  {scene:'park',who:'旁白',text:'他们走过领事馆集中的街道，去了日坛公园，也去了她小时候常玩的游乐场。',actors:[['猪头',38],['Hedy',55]]},
  {scene:'park',who:'猪头',text:'他主动牵起她的手。',choice:['牵住Hedy'],actors:[['猪头',43],['Hedy',52]]},
  {scene:'park',who:'旁白',text:'走累以后，他们在日坛公园的长椅上坐下来休息。镜头一会儿朝上，一会儿躲到游乐设施后面，又重新对准两个人。',actors:[['猪头',43],['Hedy',52]],action:'selfie'},
  {scene:'park',who:'Hedy',text:'看看宝宝。',actors:[['猪头',43],['Hedy',52]],action:'selfie',prop:'phone'},
  {scene:'park',who:'猪头',text:'在看。',actors:[['猪头',43],['Hedy',52]],action:'selfie',prop:'phone'},
  {scene:'park',who:'Hedy',text:'再拍一个。',actors:[['猪头',43],['Hedy',52]],action:'selfie',prop:'phone'},
  {scene:'park',who:'旁白',text:'于是又拍了一个。那些当时普通得不能再普通的画面，后来也成为了记忆的一部分。',actors:[['猪头',43],['Hedy',52]],action:'selfie'},
  {scene:'park-kiss',who:'旁白',text:'小土坡上，Hedy履行了另一个赌约，主动吻了他。',actors:[['猪头',47],['Hedy',51]],action:'kiss',heart:true},
  {scene:'park-kiss',who:'猪头',text:'我现在好幸福啊，Hedy。',actors:[['猪头',47],['Hedy',51]],heart:true},
  {ch:'第二日',title:'一顿下午才吃上的午饭',scene:'loft',who:'旁白',text:'7月12日。杭州小笼包、买菜、洗菜、切菜……原本的午饭，一直做到下午四五点。',actors:[['猪头',33],['Hedy',58]]},
  {scene:'loft',who:'Hedy',text:'终于可以吃饭啦。',choice:['把最后一道菜端上桌'],actors:[['猪头',35],['Hedy',57]]},
  {scene:'loft',who:'旁白',text:'他们选了《这个杀手不太冷静》的日本原版。看到后半程，电影已经没有两个人重要。',actors:[['猪头',43],['Hedy',52]]},
  {scene:'loft',who:'旁白',text:'一起做猪鼻子，拍了很多拍立得。天色越来越晚，谁都没有先说该走了。',actors:[['猪头',43],['Hedy',52]]},
  {ch:'第三日',title:'大风车与告白',scene:'jingshan',who:'旁白',text:'7月13日。景山、歪脖子树、山顶的风。树早已不是当年的树，人们却仍记得它曾经站在这里。',actors:[['猪头',36],['Hedy',57]]},
  {scene:'jingshan',who:'猪头',text:'那首歌叫什么来着？',actors:[['猪头',38],['Hedy',56]]},
  {scene:'jingshan',who:'Hedy',text:'大风车吱呀吱悠悠地转……',actors:[['猪头',40],['Hedy',54]]},
  {scene:'nightwalk',who:'旁白',text:'王府井的茶餐厅，长安街的夜风。Hedy忽然反应过来：',actors:[['猪头',41],['Hedy',55]]},
  {scene:'nightwalk',who:'Hedy',text:'你还没有给我表白。',actors:[['猪头',41],['Hedy',55]]},
  {scene:'nightwalk',who:'猪头',text:'不是你给我表的白吗？',actors:[['猪头',41],['Hedy',55]]},
  {scene:'nightwalk',who:'旁白',text:'他只是在逗她，却碰到了她曾经的不安。他马上解释：不是不愿意说，而是不想轻易地说。',actors:[['猪头',43],['Hedy',54]]},
  {scene:'subway-night',who:'猪头',text:'第一天是在逗你。我想把这句话留到最后，认真告诉你。',actors:[['猪头',44],['Hedy',55]]},
  {scene:'subway-night',who:'旁白',text:'人流不断经过。他抱着她，认真说出了那句告白。她落泪了，他能感受到怀里的人身体一点点变暖。',actors:[['猪头',48],['Hedy',52]],action:'warm-hug',heart:true},
  {scene:'subway-night',who:'旁白',text:'2022.07.14 · 从这一天开始，他们不再是两条毫无关系的轨道。',actors:[['猪头',48],['Hedy',52]],heart:true},
  {ch:'第四日',title:'两瓶长白雪',scene:'hotel',who:'旁白',text:'7月14日。本来是离开的日子，Hedy却一早来到酒店，还带来了两瓶水。',actors:[['猪头',38],['Hedy',57]]},
  {scene:'hotel',who:'猪头 · 心里',text:'酒店明明有水啊，笨蛋。',actors:[['猪头',40],['Hedy',55]]},
  {scene:'hotel',who:'猪头 · 心里',text:'但她带来的不一样。',actors:[['猪头',42],['Hedy',53]],heart:true},
  {scene:'hotel',who:'旁白',text:'她爸爸打来电话，问她一大早去了哪里。她慌张地说：“陪同学。”',actors:[['猪头',42],['Hedy',53]]},
  {scene:'airport',who:'旁白',text:'下午五点的飞机飞往深圳。两个人一再拖延，最后还是到了不得不分开的时间。',actors:[['猪头',28],['Hedy',65]]},
  {scene:'map-end',who:'旁白',text:'北京篇结束。地图上两个人再次分开，但这一次，两条路线之间已经有了一条不会消失的红线。',actors:[['猪头',25],['Hedy',75]],heart:true},
  {scene:'note',who:'Hedy的纸条',text:'“在两个毫不相干的时空中，朝着对方的轨道不断奔跑，就觉得好神奇呢……”',choice:['完成北京篇'],actors:[['猪头',38],['Hedy',61]]}
];

let index = Number(localStorage.getItem('bj-memory-index') || 0), locked = false;
const sceneClass = {map:'map-scene',phone:'map-scene',quiz:'map-scene','map-heart':'map-scene','rain-call':'map-scene','map-route':'map-scene',ticket:'map-scene',arrival:'subway-scene',subway:'subway-scene','subway-hug':'subway-scene',park:'park-scene','park-kiss':'park-scene',loft:'loft-scene',jingshan:'park-scene',nightwalk:'night-scene','subway-night':'night-scene',hotel:'loft-scene',airport:'map-scene','map-end':'map-scene',note:'map-scene'};
function sprite(name,left,walking){return `<div class="sprite ${name==='Hedy'?'hedy':''} ${walking?'walking':''}" style="left:${left}%"><span class="name-tag">${name}</span></div>`}
function renderScene(m){
  scene.className='scene '+(sceneClass[m.scene]||'map-scene'); sky.className='sky';
  if(m.scene==='rain-call') sky.classList.add('rain'); if(['nightwalk','subway-night','map-end','note'].includes(m.scene)) sky.classList.add('night');
  const walking=['map-route','park','jingshan','nightwalk','airport'].includes(m.scene) && !m.action;
  sprites.innerHTML=m.action?`<div class="couple-sprite ${m.action}"><span class="name-tag">猪头 × Hedy</span></div>`:(m.actors||[]).map(a=>sprite(a[0],a[1],walking)).join('');
  const extra=[];
  if(m.scene.includes('map')||m.scene==='phone'||m.scene==='quiz'||m.scene==='ticket'||m.scene==='airport'||m.scene==='note'){
    extra.push('<span class="city" style="left:19%;top:31%">上海</span><span class="city" style="left:33%;top:58%">南昌</span><span class="city" style="left:66%;top:21%">北京</span><span class="city" style="left:72%;top:42%">天津</span>');
    extra.push('<i class="route" style="left:29%;top:46%;width:42%;transform:rotate(-17deg)"></i>');
  }
  if(m.scene==='loft'||m.scene==='hotel') extra.push('<i class="heart" style="left:68%;top:35%">♡</i>');
  if(m.heart) extra.push('<i class="heart" style="left:50%;top:34%">♥</i>');
  if(m.prop==='phone') extra.push('<i class="scene-prop phone">▣</i>');
  scene.innerHTML=extra.join('');
}
function showMoment(i){
  index=Math.max(0,Math.min(i,moments.length-1)); const m=moments[index];
  if(m.ch){chapterKicker.textContent=m.ch;chapterTitle.textContent=m.title}
  speaker.textContent=m.who; line.textContent=m.text; fill.style.width=`${(index+1)/moments.length*100}%`; choices.innerHTML='';
  renderScene(m); locked=!!m.choice;
  const isNarration=m.who==='旁白'||m.who==='系统'||m.who==='Hedy的纸条';
  $('.story-ui').classList.toggle('character-mode',!isNarration);
  if(!isNarration){
    const bubble=document.createElement('div');
    const isHedy=m.who.startsWith('Hedy');
    bubble.className=`speech-bubble ${m.action?'couple':isHedy?'hedy':'pig'} ${m.who.includes('心里')?'thought':''}`;
    bubble.textContent=m.text; sprites.appendChild(bubble);
  }
  $('#dayLabel').textContent=m.ch||chapterKicker.textContent;
  if(m.choice){(Array.isArray(m.choice)?m.choice:[m.choice]).forEach(c=>{const b=document.createElement('button');b.textContent=c;b.onclick=()=>{locked=false;next()};choices.appendChild(b)})}
  if(m.photo){const hot=document.createElement('button');hot.className='hotspot';hot.style.cssText='right:8%;top:16%';hot.title='查看真实回忆';hot.onclick=(e)=>{e.stopPropagation();openMemory(m.photo)};scene.appendChild(hot)}
  localStorage.setItem('bj-memory-index',String(index)); buildMap();
}
function next(){if(locked)return;if(index===moments.length-1){$('#memoryUnlock').hidden=false;return}showMoment(index+1)}
function openMemory(p){
  memoryTitle.textContent=p[0]; memoryCaption.textContent=p[2];
  const isVideo=p[3]==='video'; memoryImage.hidden=isVideo; memoryVideo.hidden=!isVideo;
  videoPlaylist.innerHTML='';
  if(isVideo){
    const files=Array.isArray(p[1])?p[1]:[p[1]];
    const play=(src,i)=>{memoryVideo.pause();memoryVideo.src=src;memoryVideo.currentTime=0;videoPlaylist.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===i))};
    files.forEach((src,i)=>{const b=document.createElement('button');b.textContent=`片段 ${i+1}`;b.onclick=()=>play(src,i);videoPlaylist.appendChild(b)});
    play(files[0],0)
  }else{memoryImage.src=p[1]}
  memoryPanel.hidden=false
}
function buildMap(){const marks=[['序章',0],['7.11',moments.findIndex(m=>m.ch==='第一章')],['7.12',moments.findIndex(m=>m.ch==='第二日')],['7.13',moments.findIndex(m=>m.ch==='第三日')],['7.14',moments.findIndex(m=>m.ch==='第四日')]];$('#mapDays').innerHTML=marks.map(([d,i])=>`<button class="day-node ${index<i?'locked':''}" data-i="${i}" ${index<i?'disabled':''}><strong>${d}</strong>${moments[i].title||moments[i].text.slice(0,8)}</button>`).join('');document.querySelectorAll('.day-node:not(.locked)').forEach(b=>b.onclick=()=>{$('#chapterMap').hidden=true;showMoment(+b.dataset.i)})}
dialogue.onclick=next; $('#screen').onclick=next; $('#startBtn').onclick=()=>{$('#titleCard').style.display='none';showMoment(index)}; $('#homeBtn').onclick=()=>{$('#chapterMap').hidden=false};$('#closeMap').onclick=()=>{$('#chapterMap').hidden=true};$('#closeMemory').onclick=()=>{memoryVideo.pause();memoryPanel.hidden=true};$('#collectMemory').onclick=()=>{$('#memoryUnlock').hidden=true;$('#polaroidSlot').textContent='▣';$('#chapterMap').hidden=false;localStorage.setItem('bj-polaroid-unlocked','1')};
$('#soundBtn').onclick=(e)=>{e.currentTarget.textContent=e.currentTarget.textContent.includes('开')?'♪ 关':'♪ 开'};
document.addEventListener('keydown',e=>{if(['ArrowRight',' ','Enter','d','D'].includes(e.key))next();if(['ArrowLeft','a','A'].includes(e.key))showMoment(index-1)});
showMoment(index);
