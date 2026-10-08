'use strict';
/* Usap Tayo v2 — Filipino tutor with lessons, daily checklist, review & progress. */
const API='https://api.openai.com/v1';
const TTS_MODEL='gpt-4o-mini-tts';
const MAX_MSGS=40; // ~20 turns of chat context
const LESSON_TURNS=5;
const DATA_VERSION=2;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
function h(tag,attrs,...kids){const e=document.createElement(tag);if(attrs)for(const[k,v]of Object.entries(attrs)){if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k==='html')e.innerHTML=v;else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);}for(const k of kids.flat(Infinity)){if(k==null||k===false)continue;e.append(k.nodeType?k:document.createTextNode(String(k)));}return e;}
const hook=(t,d)=>{if(window.__testHook)window.__testHook(t,d);};

/* ---------- icons & mascot ---------- */
const ICON={
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>',
 micfill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
 stop:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>',
 speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
 starFull:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
 trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 kb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7 14h10"/></svg>',
 hf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 0 1 18 0v4a3 3 0 0 1-3 3h-1v-7h4M3 12v4a3 3 0 0 0 3 3h1v-7H3"/></svg>',
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1H15v-6h-6v6H4.5a1 1 0 0 1-1-1z"/></svg>',
 learn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.3 16.8C13 14 9 10 13 8.2l2.7-1.2"/></svg>',
 review:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="13" height="16" rx="2.5"/><path d="M8 3h10a2.5 2.5 0 0 1 2.5 2.5V17"/><path d="M8 11h5M8 15h5"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 20V12M10 20V6M15 20v-9M20 20V4"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
function svg(name){const s=document.createElement('span');s.innerHTML=ICON[name];return s.firstChild;}
function mascotSVG(mood){
 const rays=[...Array(10)].map((_,i)=>{const a=i*36*Math.PI/180;const x1=50+Math.cos(a)*36,y1=52+Math.sin(a)*36,x2=50+Math.cos(a)*47,y2=52+Math.sin(a)*47;const px=-Math.sin(a)*5,py=Math.cos(a)*5;return `<path d="M${(x1+px).toFixed(1)} ${(y1+py).toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${(x1-px).toFixed(1)} ${(y1-py).toFixed(1)}Z"/>`;}).join('');
 const mouth=mood==='cheer'?'<path d="M38 60q12 16 24 0z" fill="#7a2a12"/><path d="M43 66q7 5 14 0" fill="#ff7a7a"/>':mood==='sad'?'<path d="M40 66q10-8 20 0" stroke="#7a2a12" stroke-width="3.5" fill="none" stroke-linecap="round"/>':'<path d="M39 60q11 11 22 0" stroke="#7a2a12" stroke-width="3.8" fill="none" stroke-linecap="round"/>';
 const eyes=mood==='cheer'?'<path d="M33 48q5-6 10 0M57 48q5-6 10 0" stroke="#3b2a12" stroke-width="3.8" fill="none" stroke-linecap="round"/>':'<ellipse cx="39" cy="47" rx="4.2" ry="5.4" fill="#3b2a12"/><ellipse cx="61" cy="47" rx="4.2" ry="5.4" fill="#3b2a12"/><circle cx="40.5" cy="45" r="1.5" fill="#fff"/><circle cx="62.5" cy="45" r="1.5" fill="#fff"/>';
 return `<svg viewBox="0 0 100 104" class="mascot-svg" aria-hidden="true"><g fill="#f5a300">${rays}</g><circle cx="50" cy="52" r="32" fill="#fcd116"/><circle cx="50" cy="52" r="32" fill="url(#mg)" opacity=".35"/><defs><radialGradient id="mg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>${eyes}<circle cx="31" cy="57" r="5" fill="#ff8a65" opacity=".55"/><circle cx="69" cy="57" r="5" fill="#ff8a65" opacity=".55"/>${mouth}<path d="M64 22q8-6 12 2q-6 1-12-2z" fill="#58cc02"/><circle cx="66" cy="22" r="4.5" fill="#fff"/><circle cx="66" cy="22" r="2" fill="#fcd116"/></svg>`;
}
function mascot(mood,cls){return h('div',{class:'mascot '+(cls||''),html:mascotSVG(mood||'happy')});}

/* ---------- storage + migration ---------- */
const DEFAULTS={key:'',level:'beginner',speed:'slow',showEn:true,speakFix:true,sayEn:false,voice:'coral',about:'',chatModel:'gpt-4.1-mini',sttModel:'gpt-4o-transcribe',handsFree:false,goal:'regular'};
const GOALS={casual:30,regular:60,serious:100};
function load(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){toast('Storage is full — progress may not save.');}}
const S=Object.assign({},DEFAULTS,load('ut.settings',{}));
function saveS(){save('ut.settings',S);}
let phrases=load('ut.phrases',[]);
let freeConvo=load('ut.convo',null)||{topic:'free',history:[],items:[]};
freeConvo.mode='free';
let convo=freeConvo;
function newProgress(){return {v:DATA_VERSION,created:Date.now(),totalXP:0,bestStreak:0,days:{},lessons:{},deck:{},badges:{},totals:{sentences:0,clean:0,spokenMs:0,talkMs:0,reviews:0,turns:0}};}
let P=load('ut.progress',null);
function migrate(){
 const ver=+(localStorage.getItem('ut.version')||0);
 if(!P||typeof P!=='object')P=newProgress();
 P=Object.assign(newProgress(),P);P.totals=Object.assign(newProgress().totals,P.totals||{});
 if(ver<2){ // v1 → v2: keep settings, saved phrases and conversation; seed the review deck with saved phrases
  phrases.forEach(p=>p&&p.tl&&addCard(p.tl,p.en,'saved',true));
  const turns=(freeConvo.items||[]).filter(i=>i.who==='me').length;P.totals.turns+=turns;
 }
 P.v=DATA_VERSION;localStorage.setItem('ut.version',String(DATA_VERSION));saveP();saveS();
}
function saveP(){save('ut.progress',P);}

/* ---------- dates ---------- */
const pad=n=>String(n).padStart(2,'0');
function dayKey(t){const d=new Date(t==null?Date.now():t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function todayKey(){return dayKey();}
function keyToDate(k){const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12);}
function addDays(k,n){const d=keyToDate(k);d.setDate(d.getDate()+n);return dayKey(d.getTime());}
function day(k){k=k||todayKey();if(!P.days[k])P.days[k]={xp:0,talkMs:0,spokenMs:0,sentences:0,clean:0,reviews:0,lessons:0,goalHit:false,allDone:false};return P.days[k];}
function peekDay(k){return P.days[k]||{xp:0,talkMs:0,spokenMs:0,sentences:0,clean:0,reviews:0,lessons:0};}

/* ---------- lessons index ---------- */
const UNITS=window.UNITS||[];
const LESSONS=[];UNITS.forEach((u,ui)=>u.lessons.forEach((l,li)=>LESSONS.push(Object.assign(l,{unit:u,ui,li,idx:LESSONS.length}))));
const lessonById=id=>LESSONS.find(l=>l.id===id);
const isDone=l=>!!P.lessons[l.id];
const isUnlocked=l=>l.idx===0||isDone(LESSONS[l.idx-1])||isDone(l);
function nextLesson(){return LESSONS.find(l=>!isDone(l))||null;}

/* ---------- XP, streak, level, checklist, badges ---------- */
const goalXP=()=>GOALS[S.goal]||60;
const ACTIVE_XP=10; // a day counts toward the streak once you earn 10 XP
const isActive=k=>(peekDay(k).xp||0)>=ACTIVE_XP;
function streak(){let k=todayKey();if(!isActive(k))k=addDays(k,-1);let n=0;while(isActive(k)){n++;k=addDays(k,-1);}return n;}
function needXP(L){return 50*(L-1)*L;} // L2=100, L3=300, L4=600, L5=1000…
function levelInfo(xp){let L=1;while(xp>=needXP(L+1))L++;const lo=needXP(L),hi=needXP(L+1);return {L,cur:xp-lo,span:hi-lo,pct:Math.round(100*(xp-lo)/(hi-lo))};}
const CHECKLIST=[
 {id:'talk',em:'💬',label:'Have a 5-minute conversation',cur:d=>Math.floor((d.talkMs||0)/60000),max:5,unit:' min',go:()=>go('talk')},
 {id:'lesson',em:'📘',label:'Complete today’s lesson',cur:d=>d.lessons||0,max:1,go:()=>{const l=nextLesson();l?openLesson(l):go('learn');}},
 {id:'review',em:'🔁',label:'Review 5 phrases',cur:d=>d.reviews||0,max:5,go:()=>go('review')},
 {id:'say',em:'🗣️',label:'Say 10 sentences out loud',cur:d=>d.sentences||0,max:10,go:()=>go('talk')},
 {id:'clean',em:'✅',label:'Get a sentence right with no corrections',cur:d=>d.clean||0,max:1,go:()=>go('talk')}
];
const clDone=(c,d)=>c.cur(d)>=c.max;
function checklistState(k){const d=peekDay(k||todayKey());const n=CHECKLIST.filter(c=>clDone(c,d)).length;return {n,all:n===CHECKLIST.length};}
const BADGES=[
 {id:'first',em:'🗣️',name:'Unang Salita',desc:'Say your first sentence',test:()=>P.totals.sentences>=1||P.totals.turns>=1},
 {id:'lesson1',em:'📘',name:'First lesson',desc:'Complete a lesson',test:()=>Object.keys(P.lessons).length>=1},
 {id:'perfect',em:'🌟',name:'Perfect!',desc:'Get 3 stars on a lesson',test:()=>Object.values(P.lessons).some(l=>l.stars>=3)},
 {id:'unit',em:'🏅',name:'Unit master',desc:'Finish a whole unit',test:()=>UNITS.some(u=>u.lessons.every(isDone))},
 {id:'check',em:'📋',name:'All done!',desc:'Finish a daily checklist',test:()=>Object.values(P.days).some(d=>d.allDone)},
 {id:'streak3',em:'🔥',name:'On fire',desc:'3-day streak',test:()=>P.bestStreak>=3},
 {id:'streak7',em:'🗓️',name:'Isang linggo',desc:'7-day streak',test:()=>P.bestStreak>=7},
 {id:'xp100',em:'⚡',name:'100 XP',desc:'Earn 100 XP',test:()=>P.totalXP>=100},
 {id:'xp500',em:'💎',name:'500 XP',desc:'Earn 500 XP',test:()=>P.totalXP>=500},
 {id:'deck20',em:'🧠',name:'Word collector',desc:'20 cards in your deck',test:()=>Object.keys(P.deck).length>=20},
 {id:'talk30',em:'🎙️',name:'Chatterbox',desc:'Speak for 30 minutes',test:()=>P.totals.spokenMs>=30*60000},
 {id:'review50',em:'🔁',name:'Memory master',desc:'50 reviews',test:()=>P.totals.reviews>=50}
];
let lastGoalHit=null;
function afterProgress(){
 const k=todayKey(),d=day(k);
 const s=streak();if(s>P.bestStreak)P.bestStreak=s;
 if(!d.goalHit&&d.xp>=goalXP()){d.goalHit=true;setTimeout(()=>{toast('🎯 Daily goal reached! Galing, Neal!',3200);confetti(90);},400);hook('goal');}
 if(!d.allDone&&checklistState(k).all){d.allDone=true;d.xp+=20;P.totalXP+=20;hook('checklist-all');setTimeout(()=>celebrate('Daily checklist complete!','Lahat tapos na! You finished every task today. +20 XP bonus','cheer'),700);}
 for(const b of BADGES){if(!P.badges[b.id]&&b.test()){P.badges[b.id]=k;setTimeout(()=>toast('🏅 Badge unlocked: '+b.name,3200),1600);hook('badge',b.id);}}
 saveP();updateChrome();
}
function addXP(n,anchor){if(!n)return;const d=day();d.xp+=n;P.totalXP+=n;floatXP(n,anchor);afterProgress();}
function track(field,n){const d=day();d[field]=(d[field]||0)+n;if(field in P.totals)P.totals[field]+=n;}
let lastTalkTouch=0;
function touchTalk(){const now=Date.now();if(lastTalkTouch&&now-lastTalkTouch<120000&&now>lastTalkTouch){const dt=now-lastTalkTouch;track('talkMs',dt);}lastTalkTouch=now;}

/* ---------- review deck (Leitner spaced repetition) ---------- */
const INTERVALS=[0,1,2,4,7,14,30];
function norm(s){
 const MAP={kamusta:'kumusta',puwede:'pwede',pde:'pwede',niyo:'ninyo',nyo:'ninyo',kuwarto:'kwarto',pasensiya:'pasensya',ung:'yung',sya:'siya',cr:'cr'};
 return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'`]/g,'').replace(/-/g,'').replace(/[^a-z0-9ñ]+/g,' ').trim().split(/\s+/).filter(Boolean).map(w=>MAP[w]||w).join(' ');
}
function cardKey(tl){return norm(tl);}
function addCard(tl,en,src,silent){const k=cardKey(tl);if(!k)return false;if(P.deck[k])return false;P.deck[k]={tl,en:en||'',src,box:0,due:todayKey(),added:todayKey(),reps:0,lapses:0};if(!silent)saveP();return true;}
function dueCards(){const t=todayKey();return Object.values(P.deck).filter(c=>c.due<=t).sort((a,b)=>a.box-b.box||a.due.localeCompare(b.due));}
function gradeCard(c,good){if(good){c.box=Math.min(c.box+1,INTERVALS.length-1);c.due=addDays(todayKey(),INTERVALS[c.box]);}else{c.lapses++;c.box=0;c.due=todayKey();}c.reps++;}
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur;}return prev[n];}
function scoreSpeech(target,heard){
 const t=norm(target),hd=norm(heard);const tt=t.split(' ').filter(Boolean),ht=hd.split(' ').filter(Boolean);
 const near=(w,list)=>list.some(x=>x===w||(w.length>=4&&lev(w,x)<=1)||(w.length>=8&&lev(w,x)<=2));
 const hits=tt.map(w=>near(w,ht));const wordScore=tt.length?hits.filter(Boolean).length/tt.length:0;
 const a=t.replace(/ /g,''),b=hd.replace(/ /g,'');const charScore=Math.max(0,1-lev(a,b)/Math.max(a.length,b.length,1));
 return {score:Math.round(100*(0.5*wordScore+0.5*charScore))/100,hits,tokens:tt};
}
function phraseUsed(w,utterances){const parts=String(w.tl).split(/[\/,]/).map(norm).filter(Boolean);const said=utterances.map(norm);
 return parts.some(p=>{const toks=p.split(' ');return said.some(u=>{const ut=u.split(' ');const got=toks.filter(x=>ut.some(y=>y===x||(x.length>=5&&lev(x,y)<=1))).length;return got/toks.length>=0.6;});});}

/* ---------- UI helpers ---------- */
let toastT;function toast(msg,ms=2600){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms);hook('toast',msg);}
function floatXP(n,anchor){const el=h('div',{class:'xpfloat'},'+'+n+' XP');let x=innerWidth/2,y=innerHeight*0.45;
 const a=anchor&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;if(a&&a.width){x=a.left+a.width/2;y=a.top;}
 el.style.left=x+'px';el.style.top=y+'px';document.body.append(el);setTimeout(()=>el.remove(),1400);}
function confetti(n=160){const c=$('#confetti');const ctx=c.getContext('2d');const dpr=Math.min(devicePixelRatio||1,2);c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.scale(dpr,dpr);
 const cols=['#ce1126','#0b3a8c','#fcd116','#58cc02','#1cb0f6','#ff9600','#ce82ff'];
 const ps=[...Array(n)].map(()=>({x:innerWidth/2+(Math.random()-.5)*80,y:innerHeight*0.35,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:Math.random()*6+4,c:cols[Math.random()*cols.length|0],rot:Math.random()*6,vr:(Math.random()-.5)*.4,sh:Math.random()<.5}));
 const t0=performance.now();(function f(t){const el=t-t0;ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of ps){p.vy+=0.35;p.vx*=0.99;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=Math.max(0,1-el/2800);ctx.fillStyle=p.c;
   if(p.sh)ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);else{ctx.beginPath();ctx.arc(0,0,p.r/2.4,0,6.3);ctx.fill();}ctx.restore();}
  if(el<2900)requestAnimationFrame(f);else ctx.clearRect(0,0,innerWidth,innerHeight);})(t0);}
function celebrate(title,text,mood,btn){if(recActive()||state==='recording'){setTimeout(()=>celebrate(title,text,mood,btn),1200);return;}const m=$('#modal'),c=$('#modalCard');c.innerHTML='';
 c.append(mascot(mood||'cheer'),h('h2',null,title),h('p',null,text),h('button',{class:'b3 green wide',onclick:()=>{m.hidden=true;}},btn||'Salamat!'));m.hidden=false;confetti(180);hook('celebrate',title);}
function openSheet(id){$$('.sheet.open').forEach(s=>{if(s.id!=='lessonView')s.classList.remove('open');});$(id).classList.add('open');}
function closeSheets(){$$('.sheet.open').forEach(s=>{if(s.id!=='lessonView')s.classList.remove('open');});}

/* ---------- API ---------- */
class AppError extends Error{constructor(msg,kind){super(msg);this.kind=kind;}}
async function apiErr(res){let body={};try{body=await res.json();}catch(e){}
 const m=(body.error&&body.error.message)||'';const code=(body.error&&body.error.code)||'';
 if(res.status===401)return new AppError('Your OpenAI API key was rejected. Open Settings and paste a valid key.','key');
 if(res.status===429&&(code==='insufficient_quota'||/quota|billing/i.test(m)))return new AppError('Your OpenAI account is out of credit. Add a few dollars at platform.openai.com → Billing, then try again.','quota');
 if(res.status===429)return new AppError('OpenAI says too many requests right now. Wait a few seconds and try again.','rate');
 if(res.status===404||(/model/i.test(m)&&res.status===400))return new AppError('OpenAI couldn’t use that model'+(m?': '+m:'.')+' Try another model in Settings → Advanced.','model');
 if(res.status>=500)return new AppError('OpenAI is having trouble right now ('+res.status+'). Try again in a moment.','server');
 return new AppError('OpenAI error ('+res.status+'): '+(m||'unknown problem'),'other');}
async function api(path,opts){if(!S.key)throw new AppError('Add your OpenAI API key in Settings first.','key');
 let res;try{res=await fetch(API+path,Object.assign({},opts,{headers:Object.assign({Authorization:'Bearer '+S.key},opts.headers||{})}));}
 catch(e){throw new AppError(navigator.onLine===false?'You’re offline. Check your internet connection and try again.':'Couldn’t reach OpenAI (network problem). Check your connection and try again.','network');}
 if(!res.ok)throw await apiErr(res);return res;}

/* ---------- audio: unlock, IndexedDB clip cache, playback ---------- */
const player=$('#player');
const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let actx=null,unlocked=false;
function unlockAudio(){
 if(!actx){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC)actx=new AC();}catch(e){}}
 if(actx&&actx.state!=='running')actx.resume().catch(()=>{});
 if(!unlocked){unlocked=true;try{if(!player.currentSrc){player.src=SILENT;const p=player.play();if(p)p.catch(()=>{});}}catch(e){}}
}
document.addEventListener('pointerdown',unlockAudio,{capture:true});
document.addEventListener('touchend',unlockAudio,{capture:true,passive:true});
const clipDB={_p:null,
 open(){if(!this._p)this._p=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open('usap-tts',1);r.onupgradeneeded=()=>r.result.createObjectStore('clips');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});return this._p;},
 async get(k){try{const db=await this.open();return await new Promise(res=>{const q=db.transaction('clips').objectStore('clips').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);});}catch(e){return null;}},
 async put(k,v){try{const db=await this.open();await new Promise(res=>{const tx=db.transaction('clips','readwrite');tx.objectStore('clips').put(v,k);tx.oncomplete=res;tx.onerror=res;tx.onabort=res;});}catch(e){}},
 async count(){try{const db=await this.open();return await new Promise(res=>{const q=db.transaction('clips').objectStore('clips').count();q.onsuccess=()=>res(q.result);q.onerror=()=>res(0);});}catch(e){return 0;}}
};
const ttsCache=new Map();
function ttsInstructions(){
 const pace={slow:'Speak slowly and very clearly, with small pauses between phrases, like a patient teacher talking to a beginner.',normal:'Speak a bit slower than normal conversation, clearly enunciated.',natural:'Speak at a natural, relaxed conversational pace.'}[S.speed]||'';
 return 'Voice: a warm, friendly native Filipino speaker from Manila who is a patient language tutor. Language: the text is mostly Filipino (Tagalog). Pronounce it with authentic Tagalog pronunciation — pure vowels, lightly tapped r, natural Filipino stress and intonation — never with an American accent. English words should sound the way a Filipino says them in Taglish; English-only sentences can be read in clear Filipino-accented English. '+pace+' Tone: encouraging, cheerful, kind.';
}
// persist=true stores the clip in IndexedDB (lesson words, phrases, review cards) so replays are free forever.
async function ttsUrl(text,persist){
 const key=S.voice+'|'+S.speed+'|'+text;if(ttsCache.has(key))return ttsCache.get(key);
 if(persist){const hit=await clipDB.get(key);if(hit&&hit.buf){const url=URL.createObjectURL(new Blob([hit.buf],{type:hit.type||'audio/mpeg'}));ttsCache.set(key,url);hook('tts-idb-hit',text);return url;}}
 const body=v=>JSON.stringify({model:TTS_MODEL,voice:v,input:text.slice(0,3500),instructions:ttsInstructions(),response_format:'mp3'});
 let res;try{res=await api('/audio/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:body(S.voice)});}
 catch(e){if(S.voice!=='coral'&&(e.kind==='other'||e.kind==='model')){res=await api('/audio/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:body('coral')});}else throw e;}
 const blob=await res.blob();const url=URL.createObjectURL(blob);ttsCache.set(key,url);
 if(persist){blob.arrayBuffer().then(buf=>clipDB.put(key,{buf,type:blob.type||'audio/mpeg',at:Date.now()}));}
 return url;
}
let playToken=0,onPlayEnd=null;
function stopPlayback(){playToken++;try{player.pause();}catch(e){}if(onPlayEnd){const f=onPlayEnd;onPlayEnd=null;f('stopped');}}
function playUrl(url){return new Promise(resolve=>{stopPlayback();const my=++playToken;
 const done=r=>{if(onPlayEnd===done)onPlayEnd=null;player.onended=player.onerror=null;resolve(r);};onPlayEnd=done;
 player.onended=()=>{if(my===playToken)done('ended');};player.onerror=()=>{if(my===playToken)done('error');};
 player.src=url;player.playbackRate=S.speed==='slow'?0.92:1;player.preservesPitch=true;player.webkitPreservesPitch=true;
 const p=player.play();if(p)p.catch(()=>{if(my===playToken){toast('Tap 🔊 to play the audio (iPhone blocked autoplay).',3500);done('blocked');}});});}
// speak a line; errors go to the chat (ctx='chat') or a toast.
async function speak(text,opts={}){
 if(!text)return 'empty';
 if(!S.key){toast('Add your OpenAI API key in Settings to hear audio.');openSettings();return 'nokey';}
 try{const url=await ttsUrl(text,opts.persist);hook('speak',text);return await playUrl(url);}
 catch(e){if(opts.ctx==='chat')showError(e);else toast(e.message,4000);return 'error';}
}
function playBtnFor(el,text,persist){el.addEventListener('click',async e=>{e.stopPropagation();unlockAudio();el.classList.add('playing');await speak(text,{persist});el.classList.remove('playing');});return el;}

/* ---------- recorder (shared by conversation + review) ---------- */
const R={stream:null,rec:null,chunks:[],start:0,starting:false,pendingStop:false,cancel:false,opts:null,vadTimer:0,raf:0,analyser:null,src:null,heard:false};
let interruptGen=0;
function pickMime(){if(!window.MediaRecorder)return '';for(const m of ['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg']){try{if(MediaRecorder.isTypeSupported(m))return m;}catch(e){}}return '';}
function extFor(m){return /mp4|m4a|aac/.test(m)?'mp4':/webm/.test(m)?'webm':/ogg/.test(m)?'ogg':'mp4';}
function recActive(){return !!(R.rec&&R.rec.state==='recording')||R.starting;}
function releaseMic(){if(R.stream){R.stream.getTracks().forEach(t=>t.stop());R.stream=null;}try{R.src&&R.src.disconnect();}catch(e){}R.src=null;R.analyser=null;cancelAnimationFrame(R.raf);clearInterval(R.vadTimer);
 if(R.opts&&R.opts.ring)R.opts.ring.style.transform='';try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}}
async function recStart(opts){
 if(recActive())return false;
 if(!S.key){openSettings();toast('Add your OpenAI API key first.');return false;}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){opts.onError(new AppError('This browser can’t record audio. On iPhone, use Safari (iOS 14.3+) or the Home Screen app.','mic'));return false;}
 interruptGen++;stopPlayback();R.opts=opts;R.starting=true;R.pendingStop=false;R.cancel=false;R.heard=false;
 try{try{if(navigator.audioSession)navigator.audioSession.type='play-and-record';}catch(e){}
  R.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
 }catch(e){R.starting=false;releaseMic();const n=e&&e.name;
  opts.onError(new AppError(n==='NotAllowedError'||n==='SecurityError'?'Microphone permission is blocked. On iPhone: Settings → Apps → Safari → Microphone → Allow (or tap “aA” in Safari → Website Settings → Microphone → Allow). Then try again.':n==='NotFoundError'?'No microphone found.':'Couldn’t start the microphone ('+(e&&e.message||n||'unknown')+'). Close other apps using the mic and try again.','mic'));return false;}
 const mime=pickMime();R.chunks=[];
 try{R.rec=mime?new MediaRecorder(R.stream,{mimeType:mime}):new MediaRecorder(R.stream);}catch(e){try{R.rec=new MediaRecorder(R.stream);}catch(e2){R.starting=false;releaseMic();opts.onError(new AppError('Recording isn’t supported here: '+e2.message,'mic'));return false;}}
 R.rec.ondataavailable=ev=>{if(ev.data&&ev.data.size)R.chunks.push(ev.data);};
 R.rec.onstop=onRecStop;R.rec.start(250);R.start=Date.now();R.starting=false;opts.onState('recording');setupMeter();
 if(R.pendingStop){R.pendingStop=false;recStop();}
 return true;
}
function setupMeter(){
 const o=R.opts;try{if(!actx){const AC=window.AudioContext||window.webkitAudioContext;actx=new AC();}if(actx.state!=='running')actx.resume().catch(()=>{});
  R.src=actx.createMediaStreamSource(R.stream);R.analyser=actx.createAnalyser();R.analyser.fftSize=1024;R.src.connect(R.analyser);}catch(e){R.analyser=null;}
 const buf=new Uint8Array(1024);let floor=0.01,silentMs=0,last=Date.now(),warm=0;
 const lvl=()=>{if(!R.analyser)return 0;R.analyser.getByteTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++){const v=(buf[i]-128)/128;s+=v*v;}return Math.sqrt(s/buf.length);};
 const draw=()=>{if(!R.rec||R.rec.state!=='recording')return;if(o.ring)o.ring.style.transform='scale('+(1+Math.min(lvl()*6,0.35))+')';R.raf=requestAnimationFrame(draw);};draw();
 clearInterval(R.vadTimer);
 R.vadTimer=setInterval(()=>{if(!R.rec||R.rec.state!=='recording'){clearInterval(R.vadTimer);return;}
  const now=Date.now(),dt=now-last;last=now;const l=lvl();const el=now-R.start;
  if(el<300){floor=Math.max(0.004,(floor*warm+l)/(++warm));return;}
  const thr=Math.max(0.025,floor*3.2);
  if(l>thr){R.heard=true;silentMs=0;}else{silentMs+=dt;if(!R.heard)floor=floor*0.98+l*0.02;}
  if(el>60000){recStop();return;}
  if(!o.vad||!R.analyser)return;
  if(R.heard&&silentMs>1300){recStop();return;}
  if(!R.heard&&el>9000){R.cancel=true;recStop();o.onNoSpeech&&setTimeout(o.onNoSpeech,50);}
 },60);
}
function recStop(cancel){if(cancel)R.cancel=true;if(R.starting){R.pendingStop=true;return;}if(R.rec&&R.rec.state!=='inactive'){try{R.rec.stop();}catch(e){onRecStop();}}}
function onRecStop(){
 const o=R.opts||{};const dur=Date.now()-R.start;const type=(R.rec&&R.rec.mimeType)||pickMime()||'audio/mp4';
 const blob=new Blob(R.chunks,{type});R.chunks=[];R.rec=null;releaseMic();
 if(R.cancel){R.cancel=false;o.onCancel&&o.onCancel();return;}
 if(dur<600||blob.size<1200){o.onShort&&o.onShort();return;}
 hook('recorded',{type,size:blob.size,dur});
 o.onBlob(blob,type,dur);
}
async function transcribe(blob,type,opts={}){
 const fd=new FormData();fd.append('file',blob,'speech.'+extFor(type));fd.append('model',S.sttModel);
 fd.append('prompt',opts.prompt||'An American English speaker practicing Filipino (Tagalog). Speech may be Filipino, English, or Taglish (mixed). Transcribe exactly what is said, keeping Tagalog words in standard Filipino spelling, e.g. "Kumusta po kayo? Okay lang ako, salamat."');
 if(opts.lang)fd.append('language',opts.lang);
 fd.append('response_format','json');
 const res=await api('/audio/transcriptions',{method:'POST',body:fd});const j=await res.json();return (j.text||'').trim();
}

/* ---------- free-talk topics ---------- */
const TOPICS=[
 {id:'free',em:'💬',name:'Free conversation',desc:'Chat about anything — your day, work, plans',brief:'Free conversation. Ask Neal about his day, work, plans and interests. Keep it light and personal.'},
 {id:'greet',em:'👋',name:'Greetings & introductions',desc:'Kumusta, name, where you’re from, work',brief:'Role-play meeting someone new at a Filipino party. Practice greetings (Kumusta, Magandang umaga/hapon/gabi), asking and giving names, where you are from, and what you do for work.'},
 {id:'food',em:'🍲',name:'Ordering food',desc:'Carinderia / restaurant — order, ask, pay',brief:'Role-play: you are a friendly server at a Filipino restaurant (carinderia). Help Neal order dishes (adobo, sinigang, pancit, lechon, halo-halo), ask about spiciness, drinks, and paying the bill.'},
 {id:'family',em:'👵',name:'Meeting her family',desc:'Polite talk with Tita, Tito & Lola (po/opo)',brief:'Role-play: you are the Tita (aunt) of Neal’s Filipino girlfriend, meeting him at a family gathering with Lola nearby. Teach respectful speech: po and opo, mano po, polite questions about family, food (Kain na!), and compliments. Be warm and a little teasing like a real Tita.'},
 {id:'directions',em:'🧭',name:'Asking directions',desc:'Left/right, jeepney, tricycle, how far',brief:'Role-play: Neal is lost in a Philippine town and asks you (a local) for directions. Practice: Nasaan ang...?, kaliwa/kanan, diretso, malapit/malayo, jeep/tricycle, pamasahe.'},
 {id:'shop',em:'🛍️',name:'Shopping & haggling',desc:'Palengke — prices, numbers, tawad',brief:'Role-play: you are a vendor at a palengke (market). Neal shops for fruit, a shirt, or souvenirs. Practice numbers and prices (Magkano ito?), asking for a discount (May tawad po ba?), sizes and colors.'},
 {id:'small',em:'☀️',name:'Small talk',desc:'Weather, weekend, food, hobbies, family',brief:'Casual small talk like with a new friend: weather, weekend plans, favorite food, hobbies, family. Ask easy follow-up questions.'},
 {id:'work',em:'🏡',name:'Talking about my work',desc:'Explain real estate in Filipino',brief:'Neal is a real estate agent in Ohio. Have a friendly chat where he explains his job in Filipino: bahay, magbenta, kliyente, presyo, kuwarto, and his workday.'}
];
const topicById=id=>TOPICS.find(t=>t.id===id)||TOPICS[0];

/* ---------- conversation engine (free talk + lesson practice) ---------- */
const chat=$('#chat'),mic=$('#mic'),statusEl=$('#status');
let state='idle'; // idle | recording | transcribing | thinking | speaking
function scrollDown(){requestAnimationFrame(()=>{chat.scrollTop=chat.scrollHeight;});}
function setState(s,msg){state=s;mic.classList.toggle('rec',s==='recording');mic.classList.toggle('busy',s==='transcribing'||s==='thinking');mic.classList.toggle('speaking',s==='speaking');
 statusEl.classList.toggle('live',s==='recording');
 const icon=mic.querySelector('.micIcon');icon.innerHTML='';
 if(s==='recording')icon.append(svg('stop'));else if(s==='transcribing'||s==='thinking')icon.append(h('div',{class:'spin'}));else icon.append(svg('mic'));
 mic.setAttribute('aria-label',s==='recording'?'Stop and send':'Talk');
 statusEl.textContent=msg!=null?msg:({idle:S.handsFree?'Hands-free on · tap the mic to start':'Tap the mic to talk (or hold it)',recording:S.handsFree?'Listening… just talk, I’ll send when you pause':'Listening… tap again to send',transcribing:'Got it — transcribing…',thinking:'Mara is thinking…',speaking:'Mara is speaking · tap mic to interrupt'})[s];
 document.body.dataset.state=s;
}
let lastFailed=null,errEl=null;
function clearErr(){if(errEl){errEl.remove();errEl=null;}}
function showError(e){clearErr();const msg=e&&e.message?e.message:String(e);
 const btns=h('div');
 if(e&&e.kind==='key')btns.append(h('button',{onclick:()=>{clearErr();openSettings();}},'Open Settings'));
 if(lastFailed&&e&&e.kind!=='mic'&&e.kind!=='key'){const f=lastFailed;btns.append(h('button',{onclick:()=>{clearErr();f();}},'Try again'));}
 errEl=h('div',{class:'err',role:'alert'},h('div',null,msg),btns.childNodes.length?btns:null);chat.append(errEl);scrollDown();hook('error',msg);
}
function startConvRec(){touchTalk();return recStart({ring:mic.querySelector('.ring'),vad:S.handsFree,onState:s=>setState(s),onBlob:handleAudio,
 onShort:()=>{setState('idle');toast('That was too short — tap the mic, talk, then tap again.');},
 onCancel:()=>{if(state==='recording')setState('idle');},
 onNoSpeech:()=>setState('idle','Hands-free paused — tap the mic when you’re ready'),
 onError:e=>{setState('idle');showError(e);}});}
let downAt=0,downWhileRec=false;
mic.addEventListener('pointerdown',e=>{e.preventDefault();unlockAudio();
 if(state==='transcribing'||state==='thinking'){toast('One sec — Mara is still working.');return;}
 downAt=Date.now();
 if(recActive()){downWhileRec=true;R.cancel=false;recStop();return;}
 downWhileRec=false;startConvRec();});
mic.addEventListener('pointerup',e=>{e.preventDefault();if(downWhileRec){downWhileRec=false;return;}
 if(downAt&&Date.now()-downAt>450&&recActive())recStop();downAt=0;});
mic.addEventListener('pointercancel',()=>{downAt=0;});
mic.addEventListener('contextmenu',e=>e.preventDefault());

function systemPrompt(){
 const beg=S.level!=='intermediate';
 let topic;
 if(convo.mode==='lesson'){const l=lessonById(convo.lessonId);const n=userTurns();
  topic=`GUIDED LESSON “${l.title}” (unit: ${l.unit.title}). Lesson goal: ${l.goal}\n${l.brief}\nKey phrases for this lesson — model them, and ask questions that make Neal say each one at least once: ${l.words.map(w=>w.tl+' = '+w.en).join('; ')}.\nLesson progress: Neal has answered ${n} of ${LESSON_TURNS} times.${n>=LESSON_TURNS?' This is the FINAL reply: give warm praise, recap 2–3 phrases he practiced, say the lesson is complete (“Tapos na ang lesson natin!”), and do NOT ask a new question.':''}`;}
 else topic=topicById(convo.topic).brief;
 return `You are "Mara", a warm, funny, patient Filipino (Tagalog) conversation tutor. You are having a SPOKEN conversation (voice in, voice out) with Neal, an adult American English speaker from Ohio who works as a real estate agent and is learning Filipino.${S.about?`\nAbout Neal (from him): ${S.about}`:''}

LEVEL: ${beg?'BEGINNER. Use short, simple, high-frequency everyday Filipino. reply_tl must be 1–2 short sentences (max ~16 words total). Use common words real Filipinos say, including normal Taglish loanwords when natural. Always give English help.':'INTERMEDIATE. reply_tl can be 2–3 natural sentences with varied grammar (verb aspects, ng/nang, particles na/pa/din/lang/kasi). Natural Manila Filipino; Taglish allowed. Keep English help brief.'}

TOPIC: ${topic}

EVERY TURN:
1. Check what Neal just said. Text comes from speech recognition, so ignore punctuation, capitalization and minor spelling. If he made a real Filipino mistake (wrong word, word order, verb form, missing/misused ng/sa/ang/na/po, unnatural phrasing) or he said something in English, set "correction": you_said = his words, better = the natural Filipino way to say what he meant, why = one short, kind English explanation (max ~20 words). If he spoke English, "better" is how to say it in Filipino. If his Filipino was fine, correction = null and you may praise briefly in reply_tl (e.g., "Galing!").
2. Respond naturally in Filipino to keep the conversation going, usually ending with ONE simple question so he keeps talking. Stay in role if the topic is a role-play. Teach respect words (po/opo) with elders or strangers.
3. If he asks in English how to say something or what something means, answer it: put the Filipino phrase in reply_tl, explain in reply_en, and invite him to try saying it.
4. If his message is "(start)", greet him and open the topic.
5. Give 2 short suggested replies he could say next (at his level), and 0–3 useful new words from your reply.

reply_tl is read aloud by text-to-speech: no emojis, no brackets, no pronunciation guides, no English translation inside it.

Respond with ONLY a JSON object, exactly this shape:
{"correction": null or {"you_said": "...", "better": "...", "why": "..."},
 "reply_tl": "Filipino reply",
 "reply_en": "English translation of reply_tl",
 "new_words": [{"tl": "...", "en": "..."}],
 "suggestions": [{"tl": "...", "en": "..."}, {"tl": "...", "en": "..."}]}`;
}
function userTurns(){return convo.history.filter(m=>m.role==='user'&&m.content!=='(start)').length;}
async function chatReply(){
 const msgs=[{role:'system',content:systemPrompt()},...convo.history.slice(-MAX_MSGS)];
 const res=await api('/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:S.chatModel,messages:msgs,temperature:0.7,max_tokens:600,response_format:{type:'json_object'}})});
 const j=await res.json();const raw=(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||'';
 let r;try{r=JSON.parse(raw);}catch(e){const m=raw.match(/\{[\s\S]*\}/);try{r=m?JSON.parse(m[0]):null;}catch(e2){r=null;}}
 if(!r||!r.reply_tl)r={correction:null,reply_tl:String(raw||'Pasensya na, ulitin mo nga?').replace(/[{}"]/g,'').slice(0,400),reply_en:'',new_words:[],suggestions:[]};
 r.new_words=Array.isArray(r.new_words)?r.new_words.filter(w=>w&&w.tl).slice(0,3):[];
 r.suggestions=Array.isArray(r.suggestions)?r.suggestions.filter(w=>w&&w.tl).slice(0,3):[];
 if(r.correction&&!r.correction.better)r.correction=null;
 return r;
}
function persist(){convo.history=convo.history.slice(-MAX_MSGS);convo.items=convo.items.slice(-80);if(convo.mode!=='lesson')save('ut.convo',convo);}
async function handleAudio(blob,type,dur){
 clearErr();setState('transcribing');touchTalk();
 if(dur){track('spokenMs',dur);saveP();}
 lastFailed=()=>handleAudio(blob,type,0);
 let text;try{text=await transcribe(blob,type);}catch(e){setState('idle');showError(e);return;}
 if(!text||/^[\s.。…!?]*$/.test(text)){setState('idle');toast('I didn’t catch that — try again a little closer to the mic.');if(S.handsFree)autoListen();return;}
 track('sentences',1);
 const item={who:'me',text,voice:true};convo.items.push(item);const node=renderItem(item);scrollDown();
 convo.history.push({role:'user',content:text});persist();
 await tutorTurn(item,node);
}
async function tutorTurn(meItem,meNode){
 clearErr();setState('thinking');const typing=h('div',{class:'msg tutor'},h('div',{class:'av',html:mascotSVG('happy')}),h('div',{class:'bubble typing'},h('i'),h('i'),h('i')));chat.append(typing);scrollDown();
 lastFailed=()=>tutorTurn(meItem,meNode);
 const owner=convo;
 let r;try{r=await chatReply();}catch(e){typing.remove();setState('idle');showError(e);return;}
 typing.remove();lastFailed=null;
 if(owner!==convo)return; // user left this conversation while Mara was thinking
 convo.history.push({role:'assistant',content:JSON.stringify({correction:r.correction,reply_tl:r.reply_tl,reply_en:r.reply_en})});
 if(meItem){meItem.correction=r.correction||null;meItem.graded=true;if(meNode)meNode.replaceWith(renderItem(meItem,true));
  const clean=!r.correction;P.totals.turns++;if(clean)track('clean',1);
  const xp=clean?5:3;convo.xp=(convo.xp||0)+xp;convo.turnsDone=(convo.turnsDone||0)+1;if(!clean)convo.corrected=(convo.corrected||0)+1;
  addXP(xp,mic);}
 touchTalk();
 const item={who:'tutor',r};convo.items.push(item);renderItem(item);renderSugs(r.suggestions);persist();scrollDown();
 if(convo.mode==='lesson')updateLessonBar();
 const parts=[];
 if(S.speakFix&&r.correction&&r.correction.better)parts.push((S.level==='intermediate'?'Mas natural: ':'Mas tama: ')+r.correction.better);
 parts.push(r.reply_tl);
 if(S.sayEn&&r.reply_en)parts.push(r.reply_en);
 setState('speaking','Mara is getting ready to speak…');
 const urlsP=parts.map(t=>ttsUrl(t));urlsP.forEach(u=>u.catch(()=>{}));
 let how='ended';const gen=interruptGen;
 for(let i=0;i<parts.length;i++){
  let url;try{url=await urlsP[i];}catch(e){setState('idle');lastFailed=()=>{setState('speaking');speak(r.reply_tl,{ctx:'chat'}).then(()=>setState('idle'));};showError(e);return;}
  if(gen!==interruptGen||state!=='speaking'||owner!==convo)return;
  setState('speaking');hook('tts-start',parts[i]);
  how=await playUrl(url);
  if(how!=='ended')break;
  if(i<parts.length-1)await new Promise(res=>setTimeout(res,250));
 }
 hook('tts-'+how,parts.join(' | '));touchTalk();
 if(state==='speaking')setState('idle');
 if(how==='ended'&&S.handsFree&&!(convo.mode==='lesson'&&userTurns()>=LESSON_TURNS))autoListen();
}
function autoListen(){if(!S.handsFree||document.hidden)return;setTimeout(()=>{if(state==='idle'&&S.handsFree&&!$('.sheet.open:not(#lessonView)')&&convIsVisible())startConvRec();},350);}
function convIsVisible(){return convo.mode==='lesson'?$('#lessonView').classList.contains('open'):currentTab==='talk';}

/* ---------- rendering chat ---------- */
function isSaved(tl){return phrases.some(p=>p.tl===tl);}
function toggleSave(tl,en,btn){
 if(isSaved(tl)){phrases=phrases.filter(p=>p.tl!==tl);toast('Removed from Phrases');}
 else{phrases.unshift({tl,en:en||'',at:Date.now()});addCard(tl,en,'saved');toast('⭐ Saved — it’s in your Review deck too');}
 save('ut.phrases',phrases);if(btn)setSaveBtn(btn,isSaved(tl));updateChrome();
}
function setSaveBtn(btn,on){btn.classList.toggle('saved',on);btn.innerHTML='';btn.append(svg(on?'starFull':'star'),on?'Saved':'Save');}
function playBtn(text,label){return h('button',{class:'act','aria-label':'Play audio',onclick:async e=>{e.stopPropagation();unlockAudio();const b=e.currentTarget;b.disabled=true;await speak(text,{ctx:'chat'});b.disabled=false;}},svg('speaker'),label||'');}
function renderItem(it,returnOnly){
 let node;const wel=chat.querySelector('.welcome');if(wel&&!returnOnly)wel.remove();
 if(it.who==='me'){
  node=h('div',{class:'msg me'},h('div',{class:'bubble'},it.text));
  const c=it.correction;
  if(c&&c.better){const sb=h('button',{class:'act',onclick:e=>{e.stopPropagation();toggleSave(c.better,c.why,sb);}});setSaveBtn(sb,isSaved(c.better));
   node.append(h('div',{class:'fix'},h('div',{class:'lbl'},'✏️ Better way to say it'),h('div',{class:'better'},c.better),c.why?h('div',{class:'why'},c.why):null,h('div',{class:'actions'},playBtn(c.better,'Hear it'),sb)));}
  else if(it.graded)node.append(h('span',{class:'okmark'},'✓ Tama! No corrections'));
 }else if(it.who==='tutor'){
  const r=it.r;const en=h('div',{class:'en'+(S.showEn?'':' hidden')},r.reply_en||'');
  const reveal=S.showEn||!r.reply_en?null:h('button',{class:'reveal',onclick:e=>{e.stopPropagation();en.classList.toggle('hidden');}},'Show English');
  const sb=h('button',{class:'act'});sb.addEventListener('click',e=>{e.stopPropagation();toggleSave(r.reply_tl,r.reply_en,sb);});setSaveBtn(sb,isSaved(r.reply_tl));
  const words=r.new_words&&r.new_words.length?h('div',{class:'nwords'},r.new_words.map(w=>h('button',{class:'nword',onclick:e=>{e.stopPropagation();unlockAudio();speak(w.tl,{persist:true});}},h('b',null,w.tl),' · '+(w.en||'')))):null;
  const bubble=h('div',{class:'bubble'},h('div',{class:'tl'},r.reply_tl),en,reveal,words,h('div',{class:'actions'},playBtn(r.reply_tl,'Replay'),sb));
  bubble.addEventListener('click',()=>{if(!S.showEn)en.classList.toggle('hidden');});
  node=h('div',{class:'msg tutor'},h('div',{class:'av',html:mascotSVG('happy')}),h('div',{class:'col'},bubble));
 }else node=h('div',{class:'sys'},it.text);
 if(!returnOnly)chat.append(node);
 return node;
}
function renderSugs(list){const box=$('#sugs');box.innerHTML='';const has=list&&list.length;$('#sugLabel').hidden=!has;if(!has)return;
 for(const s of list)box.append(h('button',{class:'sug',onclick:()=>{unlockAudio();speak(s.tl);}},h('div',{class:'s1'},svg('speaker'),s.tl),s.en?h('div',{class:'s2'},s.en):null));}
function renderWelcome(){
 const t=topicById(convo.topic);
 chat.append(h('div',{class:'welcome'},h('div',{class:'hero'},mascot('happy'),h('div',null,h('h2',null,'Kumusta, Neal!'),h('p',{style:'margin:0'},'Free talk with Mara'))),
  h('p',null,'Tap the big red mic and say anything — Filipino, English, or Taglish. Tap again when you’re done (or hold it while you talk). Mara answers out loud and gently fixes your Filipino.'),
  h('div',{class:'chips'},h('button',{class:'chip primary',onclick:()=>startTopic(convo.topic)},'▶ Let Mara start: '+t.name),
   ...TOPICS.filter(x=>x.id!==t.id).slice(0,3).map(x=>h('button',{class:'chip',onclick:()=>startTopic(x.id)},x.em+' '+x.name)),
   h('button',{class:'chip',onclick:()=>openTopics()},'More topics…'))));
}
function renderConv(){chat.innerHTML='';errEl=null;$('#topicName').textContent=topicById(freeConvo.topic).name;
 if(!convo.items.length&&convo.mode!=='lesson'){renderWelcome();renderSugs([]);}
 else{convo.items.forEach(it=>renderItem(it));const lastT=[...convo.items].reverse().find(i=>i.who==='tutor');renderSugs(lastT?lastT.r.suggestions:[]);}
 scrollDown();}
function leaveConv(){stopPlayback();if(recActive())recStop(true);lastTalkTouch=0;if(state!=='idle')setState('idle');}
function resetConvo(topic){leaveConv();freeConvo={mode:'free',topic:topic||freeConvo.topic||'free',history:[],items:[]};convo=freeConvo;persist();renderConv();setState('idle');}
async function startTopic(id){unlockAudio();if(!S.key){openSettings();return;}closeSheets();if(currentTab!=='talk')go('talk');resetConvo(id);
 const t=topicById(id);convo.items.push({who:'sys',text:t.em+' '+t.name});renderConv();
 convo.history.push({role:'user',content:'(start)'});persist();await tutorTurn(null,null);}
async function sendTyped(){const v=$('#typeIn').value.trim();if(!v)return;if(!S.key){openSettings();return;}if(state!=='idle'&&state!=='speaking')return;unlockAudio();stopPlayback();$('#typeIn').value='';$('#typeIn').blur();touchTalk();
 const item={who:'me',text:v};convo.items.push(item);const node=renderItem(item);convo.history.push({role:'user',content:v});persist();scrollDown();await tutorTurn(item,node);}
$('#typeSend').addEventListener('click',sendTyped);
$('#typeIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendTyped();}});
$('#kbBtn').append(svg('kb'));$('#hfBtn').append(svg('hf'));
$('#kbBtn').addEventListener('click',()=>{const r=$('#typeRow');r.classList.toggle('open');if(r.classList.contains('open'))$('#typeIn').focus();});
function syncHF(){const b=$('#hfBtn');b.classList.toggle('on',S.handsFree);b.setAttribute('aria-pressed',S.handsFree);$('#hfLbl').textContent=S.handsFree?'Hands-free on':'Hands-free';}
$('#hfBtn').addEventListener('click',()=>{unlockAudio();S.handsFree=!S.handsFree;saveS();syncHF();
 if(S.handsFree){toast('Hands-free on: after Mara talks, just answer. I send when you pause.',3500);if(state==='idle')startConvRec();}
 else{toast('Hands-free off: tap the mic to talk.');if(recActive()){recStop(true);setState('idle');}else setState(state);}});

/* ---------- navigation ---------- */
let currentTab='home';
const RENDER={home:()=>renderHome(),learn:()=>renderLearn(),talk:()=>{},review:()=>renderReview(),progress:()=>renderProgress()};
function go(tab){
 if(currentTab==='talk'&&tab!=='talk')leaveConv();
 if(currentTab==='review'&&tab!=='review'&&recActive())recStop(true);
 currentTab=tab;
 $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.tab===tab));
 $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===tab));
 if(tab==='talk'){if(convo!==freeConvo){convo=freeConvo;}if(!$('#talkHost').contains($('#conv')))$('#talkHost').append($('#conv'));renderConv();setState('idle');}
 RENDER[tab]();updateChrome();hook('tab',tab);
}
$$('#tabs button').forEach(b=>{b.querySelector('i').append(svg(b.querySelector('i').dataset.ico));b.addEventListener('click',()=>{unlockAudio();go(b.dataset.go);});});
function updateChrome(){
 const d=peekDay(todayKey()),st=streak(),due=dueCards().length;
 for(const id of ['#hStreak','#lStreak']){const el=$(id);el.textContent='🔥 '+st;el.classList.toggle('cold',!isActive(todayKey()));}
 $('#hXp').textContent='⚡ '+d.xp+' XP';
 const td=$('#tabDue');td.hidden=!due;td.textContent=due>99?'99+':due;
 $('#rDue').textContent=due+' due';
 const done=LESSONS.filter(isDone).length;$('#learnSub').textContent=done+' of '+LESSONS.length+' lessons complete';
 $('#progSub').textContent='Level '+levelInfo(P.totalXP).L+' · '+P.totalXP+' XP';
}

/* ---------- HOME ---------- */
let shownDone=null;
function greeting(){const hr=new Date().getHours();return hr<12?'Magandang umaga':hr<18?'Magandang hapon':'Magandang gabi';}
function ringSVG(pct,color){const r=40,C=2*Math.PI*r;return `<svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--panel2)" stroke-width="11"/><circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-Math.min(1,pct))).toFixed(1)}"/></svg>`;}
function renderHome(){
 const b=$('#homeBody');b.innerHTML='';const k=todayKey();const d=peekDay(k);const g=goalXP();const lv=levelInfo(P.totalXP);const st=streak();
 const streakMsg=st===0?'Earn 10 XP today to start a streak! 🔥':isActive(k)?`🔥 ${st}-day streak — keep it going!`:`🔥 ${st}-day streak — practice today to keep it!`;
 b.append(h('div',{class:'card'},
  h('div',{class:'hero'},mascot(d.xp>=g?'cheer':'happy'),h('div',null,h('h2',null,greeting()+', Neal!'),h('p',null,streakMsg))),
  h('div',{class:'goalrow'},h('div',{class:'ring',html:ringSVG(d.xp/g,d.xp>=g?'var(--sun)':'var(--green)')},h('div',{class:'rv'},String(d.xp),h('small',null,'/ '+g+' XP'))),
   h('div',{class:'lvl'},h('b',null,'Level '+lv.L),h('div',{class:'bar'},h('i',{style:'width:'+lv.pct+'%'})),h('div',{class:'hint'},(lv.span-lv.cur)+' XP to Level '+(lv.L+1)),
    h('div',{class:'hint'},d.xp>=g?'🎯 Daily goal reached!':'Daily goal: '+g+' XP ('+S.goal+')')))));
 const l=nextLesson();
 if(l){const done=LESSONS.filter(isDone).length;
  b.append(h('div',{class:'card today',style:`background:linear-gradient(135deg,${l.unit.color},color-mix(in srgb,${l.unit.color} 70%,#000))`},h('div',{class:'em'},l.unit.em),
   h('div',{class:'k'},'Today’s lesson · Unit '+(l.ui+1)+', lesson '+(l.li+1)),h('h3',null,l.title),h('p',null,l.goal),
   h('button',{class:'b3 wide',id:'startToday',onclick:()=>{unlockAudio();openLesson(l);}},done?'Start lesson':'Start your first lesson')));}
 else b.append(h('div',{class:'card today',style:'background:linear-gradient(135deg,#58cc02,#3d9a00)'},h('div',{class:'em'},'🏆'),h('div',{class:'k'},'All lessons complete'),h('h3',null,'Kahanga-hanga!'),h('p',null,'You finished the whole path. Keep talking with Mara to stay sharp.'),h('button',{class:'b3 wide',onclick:()=>go('talk')},'Free talk')));
 // checklist
 const cs=checklistState(k);const prev=shownDone&&shownDone.k===k?shownDone.set:new Set();const now=new Set();
 const card=h('div',{class:'card',id:'checklist'},h('div',{class:'cl-head'},h('h4',null,'📋 Daily checklist'),h('span',{class:'cl-count'},cs.n+'/'+CHECKLIST.length)),h('div',{class:'bar green',style:'margin:0 0 6px'},h('i',{style:'width:'+(100*cs.n/CHECKLIST.length)+'%'})));
 for(const c of CHECKLIST){const cur=Math.min(c.cur(d),c.max),ok=cur>=c.max;if(ok)now.add(c.id);
  const it=h('button',{class:'cl-item'+(ok?' done':'')+(ok&&shownDone&&shownDone.k===k&&!prev.has(c.id)?' just':''),'data-cl':c.id,onclick:()=>{unlockAudio();c.go();}},
   h('span',{class:'chk'},svg('check')),h('div',{class:'cl-txt'},h('b',null,c.em+' '+c.label),!ok&&c.max>1?h('div',{class:'bar'},h('i',{style:'width:'+(100*cur/c.max)+'%'})):null),
   h('span',{class:'cl-sub'},ok?'Done':c.max>1?cur+'/'+c.max+(c.unit||''):'Go ›'));card.append(it);}
 if(cs.all)card.append(h('div',{class:'cl-done'},'🎉 All done for today! +20 XP bonus earned'));
 else card.append(h('div',{class:'hint',style:'text-align:center;margin-top:6px'},'Resets at midnight · tap a task to do it'));
 shownDone={k,set:now};b.append(card);
 const due=dueCards().length;
 b.append(h('div',{class:'quick'},
  h('button',{class:'qbtn',onclick:()=>go('talk')},h('div',{class:'e'},'💬'),h('b',null,'Free talk'),h('small',null,'Chat with Mara')),
  h('button',{class:'qbtn',onclick:()=>go('review')},h('div',{class:'e'},'🔁'),h('b',null,'Review'),h('small',null,due?due+' cards due':'All caught up')),
  h('button',{class:'qbtn',onclick:()=>go('learn')},h('div',{class:'e'},'🗺️'),h('b',null,'Learning path'),h('small',null,LESSONS.filter(isDone).length+'/'+LESSONS.length+' lessons')),
  h('button',{class:'qbtn',onclick:()=>openPhrases()},h('div',{class:'e'},'⭐'),h('b',null,'My phrases'),h('small',null,phrases.length+' saved'))));
}

/* ---------- LEARN ---------- */
const ZIG=[0,48,72,48,0,-48,-72,-48];
function renderLearn(){
 const b=$('#learnBody');b.innerHTML='';const nl=nextLesson();let currentEl=null;
 UNITS.forEach((u,ui)=>{const done=u.lessons.filter(isDone).length;const stars=u.lessons.reduce((a,l)=>a+((P.lessons[l.id]||{}).stars||0),0);
  const unit=h('div',{class:'unit'},h('div',{class:'ubanner',style:'background:'+u.color},h('span',{class:'ue'},u.em),h('div',null,h('small',null,'UNIT '+(ui+1)),h('b',null,u.title)),h('span',{class:'ust'},done===u.lessons.length?'⭐ '+stars+'/'+u.lessons.length*3:done+'/'+u.lessons.length)));
  const path=h('div',{class:'path'});
  u.lessons.forEach(l=>{const unlocked=isUnlocked(l),dn=isDone(l),cur=nl&&nl.id===l.id;const rec=P.lessons[l.id]||{};
   const btn=h('button',{class:'nbtn','aria-label':l.title,style:`background:${u.color};box-shadow:0 6px 0 color-mix(in srgb,${u.color} 70%,#000)`,onclick:()=>{unlockAudio();if(!unlocked){toast('🔒 Finish the lesson before this one to unlock it.');return;}openLesson(l);}});
   if(!unlocked)btn.textContent='🔒';else if(dn)btn.append(svg('check'));else btn.textContent=u.em;
   if(dn){btn.firstChild.style.cssText='width:34px;height:34px;color:#fff';}
   const node=h('div',{class:'node'+(unlocked?'':' locked')+(cur?' current':'')+(dn?' done':''),'data-lesson':l.id,style:'transform:translateX('+ZIG[l.idx%ZIG.length]+'px)'},
    cur?h('div',{class:'startTag'},'START'):null,btn,h('div',{class:'nlabel'},l.title),
    dn?h('div',{class:'stars'},[1,2,3].map(i=>h('span',{class:i<=rec.stars?'':'off'},'⭐'))):null);
   if(cur)currentEl=node;path.append(node);});
  unit.append(path);b.append(unit);});
 if(currentEl)setTimeout(()=>{const sb=$('#learnBody');sb.scrollTop=Math.max(0,currentEl.offsetTop-sb.clientHeight/2+60);},30);
}

/* ---------- LESSON ---------- */
let LS=null;
function lessonStep(step){LS.step=step;$('#lessonIntro').classList.toggle('on',step==='intro');$('#lessonHost').classList.toggle('on',step==='talk');$('#lessonFoot').hidden=step!=='talk';$('#lessonResults').classList.toggle('on',step==='results');
 $('#lessonView').dataset.step=step;$('#lessonTurns').textContent='';}
function setLessonProg(p){$('#lessonProg').style.width=Math.round(p*100)+'%';}
function openLesson(l){
 if(!isUnlocked(l)){toast('🔒 Finish the previous lesson first.');return;}
 if(currentTab==='talk')leaveConv();closeSheets();
 LS={lesson:l,step:'intro'};renderLessonIntro();lessonStep('intro');setLessonProg(0.08);$('#lessonView').classList.add('open');hook('lesson-open',l.id);
}
function renderLessonIntro(){const l=LS.lesson,b=$('#lessonIntro');b.innerHTML='';
 b.append(h('div',{class:'lk',style:'color:'+l.unit.color},l.unit.em+' Unit '+(l.ui+1)+' · Lesson '+(l.li+1)),h('div',{class:'lt'},l.title),
  h('div',{class:'lgoal'},mascot('happy'),h('div',{class:'bubbleTip'},h('b',null,'🎯 Goal: '+l.goal),h('span',{class:'hint'},'Learn these phrases, then use them in a real conversation with me!'))),
  h('div',{class:'card',style:'background:var(--sun-soft);border-color:transparent'},h('b',null,'💡 Tip'),h('div',{style:'margin-top:4px;font-size:15.5px'},l.tip)),
  h('div',{class:'sec'},'Key phrases · tap to hear'));
 const heard=new Set();
 l.words.forEach((w,i)=>{const btn=h('button',{class:'word','data-w':i},h('span',{class:'spk'},svg('speaker')),h('div',null,h('b',null,w.tl),h('span',null,w.en)));
  btn.addEventListener('click',async()=>{unlockAudio();btn.classList.add('playing');const r=await speak(w.tl,{persist:true});btn.classList.remove('playing');if(r==='ended'||r==='stopped'){heard.add(i);btn.classList.add('heard');setLessonProg(0.08+0.12*heard.size/l.words.length);}});b.append(btn);});
 b.append(h('button',{class:'btn wide',style:'margin:4px 0 16px',onclick:async e=>{unlockAudio();const bt=e.currentTarget;bt.disabled=true;for(const el of $$('#lessonIntro .word')){el.classList.add('playing');const r=await speak(l.words[+el.dataset.w].tl,{persist:true});el.classList.remove('playing');if(r!=='ended')break;el.classList.add('heard');await new Promise(r=>setTimeout(r,300));}bt.disabled=false;}},'▶ Play all phrases'),
  h('button',{class:'b3 green wide',id:'startTalk',onclick:()=>{unlockAudio();startLessonTalk();}},'🎙️ Start talking with Mara'),
  h('p',{class:'hint',style:'text-align:center'},'Mara will chat with you for about '+LESSON_TURNS+' turns using these phrases.'));
 b.scrollTop=0;
}
async function startLessonTalk(){
 if(!S.key){openSettings();toast('Add your OpenAI API key to talk with Mara.');return;}
 const l=LS.lesson;
 convo={mode:'lesson',lessonId:l.id,history:[],items:[{who:'sys',text:'🎯 '+l.goal+' Try to use the key phrases!'}],xp:0,turnsDone:0,corrected:0};
 $('#lessonHost').append($('#conv'));lessonStep('talk');renderConv();updateLessonBar();setState('idle');
 convo.history.push({role:'user',content:'(start)'});await tutorTurn(null,null);
}
function updateLessonBar(){if(!LS||LS.step!=='talk')return;const n=userTurns();const fb=$('#finishBtn');
 $('#lessonTurns').textContent=Math.min(n,LESSON_TURNS)+'/'+LESSON_TURNS;setLessonProg(0.2+0.75*Math.min(n/LESSON_TURNS,1));
 fb.disabled=n<3;fb.classList.toggle('pulse',n>=LESSON_TURNS);
 fb.textContent=n>=LESSON_TURNS?'🎉 Finish lesson':n<3?'Answer '+(3-n)+' more to finish':'Finish lesson ('+n+'/'+LESSON_TURNS+')';
 if(n===LESSON_TURNS&&!LS.goalToast){LS.goalToast=true;toast('🎯 Lesson goal reached! Tap Finish when Mara is done.',3500);}
}
$('#finishBtn').addEventListener('click',()=>{unlockAudio();finishLesson();});
function finishLesson(){
 const l=LS.lesson,c=convo;leaveConv();
 const turns=c.turnsDone||0,corrected=c.corrected||0;const acc=turns?Math.round(100*(turns-corrected)/turns):0;const stars=acc>=80?3:acc>=50?2:1;
 const utter=c.items.filter(i=>i.who==='me').map(i=>i.text);const used=l.words.map(w=>({w,ok:phraseUsed(w,utter)}));
 const k=todayKey();const prev=P.lessons[l.id];const firstTime=!prev;
 P.lessons[l.id]={stars:Math.max(stars,prev?prev.stars:0),bestAcc:Math.max(acc,prev?prev.bestAcc:0),times:(prev?prev.times:0)+1,first:prev?prev.first:k,last:k};
 day(k).lessons=(day(k).lessons||0)+1;
 let added=0;l.words.forEach(w=>{if(addCard(w.tl,w.en,'lesson',true))added++;});
 const bonus=10+stars*5;
 convo=freeConvo;$('#talkHost').append($('#conv'));renderConv();
 addXP(bonus,null);
 const total=(c.xp||0)+bonus;
 hook('lesson-complete',{id:l.id,stars,acc,xp:total,turns,corrected});
 const b=$('#lessonResults');b.innerHTML='';
 b.append(h('div',{class:'res'},mascot('cheer'),h('h2',null,stars===3?'Perfect lesson!':'Lesson complete!'),h('div',{class:'hint',style:'font-size:16px'},l.title+(firstTime?'':' · practice')),
  h('div',{class:'bigstars'},[1,2,3].map(i=>h('span',{class:i<=stars?'':'off'},'⭐'))),
  h('div',{class:'tiles'},
   h('div',{class:'tile'},h('div',{class:'th',style:'background:var(--sun-d)'},'Total XP'),h('div',{class:'tv'},'⚡ '+total)),
   h('div',{class:'tile'},h('div',{class:'th',style:'background:var(--green)'},'Accuracy'),h('div',{class:'tv'},'🎯 '+acc+'%')),
   h('div',{class:'tile'},h('div',{class:'th',style:'background:var(--blue2)'},'Turns'),h('div',{class:'tv'},'💬 '+turns))),
  h('div',{class:'card plist'},h('h4',null,'Phrases practiced · '+used.filter(u=>u.ok).length+'/'+used.length),
   used.map(u=>h('div',{class:'prow'},h('span',{class:u.ok?'ok':'no'},u.ok?'✓':'○'),h('div',{style:'flex:1'},h('b',null,u.w.tl),h('div',{class:'hint',style:'margin:0'},u.w.en))))),
  h('p',{class:'hint'},(corrected?corrected+' of '+turns+' answers needed a correction. ':'No corrections needed — galing! ')+(added?added+' new cards added to your Review deck.':'')),
  h('button',{class:'b3 green wide',id:'resContinue',onclick:()=>closeLesson(true)},'Continue'),
  h('button',{class:'btn wide',style:'margin-top:12px',onclick:()=>openLesson(l)},'↻ Practice this lesson again')));
 lessonStep('results');setLessonProg(1);b.scrollTop=0;setTimeout(()=>confetti(stars===3?200:120),250);
}
function closeLesson(skipConfirm){
 if(!LS)return;
 if(!skipConfirm&&LS.step==='talk'&&userTurns()>0&&!confirm('Quit this lesson? You keep the XP you earned, but the lesson won’t be marked complete.'))return;
 leaveConv();if(convo!==freeConvo){convo=freeConvo;$('#talkHost').append($('#conv'));renderConv();}
 $('#lessonView').classList.remove('open');LS=null;hook('lesson-close');
 go(currentTab==='talk'?'talk':currentTab==='learn'?'learn':'home');
}
$('#lessonClose').append(svg('close'));$('#lessonClose').addEventListener('click',()=>closeLesson(false));

/* ---------- REVIEW (flashcards + spoken answers + spaced repetition) ---------- */
let RV=null;
function renderReview(){
 const b=$('#reviewBody');b.innerHTML='';
 if(RV)return renderReviewCard();
 const all=Object.values(P.deck),due=dueCards(),mastered=all.filter(c=>c.box>=4).length;
 if(!all.length){b.append(h('div',{class:'card empty'},mascot('happy'),h('h3',null,'Your deck is empty'),h('p',null,'Finish a lesson or tap ⭐ Save on anything Mara says. Those phrases show up here for spaced-repetition practice.'),h('button',{class:'b3 green wide',onclick:()=>go('learn')},'Go to lessons')));return;}
 b.append(h('div',{class:'card',style:'text-align:center'},mascot(due.length?'happy':'cheer','big'),
  h('h3',null,due.length?due.length+' card'+(due.length>1?'s':'')+' ready to review':'All caught up! 🎉'),
  h('p',{class:'hint'},due.length?'Listen, say it out loud, and Mara checks your pronunciation.':'Come back tomorrow — or practice a few anyway.'),
  h('div',{class:'statsrow'},h('div',{class:'stat'},h('b',null,due.length),h('small',null,'Due')),h('div',{class:'stat'},h('b',null,all.length),h('small',null,'In deck')),h('div',{class:'stat'},h('b',null,mastered),h('small',null,'Mastered'))),
  due.length?h('button',{class:'b3 green wide',id:'startReview',onclick:()=>{unlockAudio();startReview(false);}},'Start review ('+Math.min(due.length,10)+')'):h('button',{class:'b3 blue wide',id:'startReview',onclick:()=>{unlockAudio();startReview(true);}},'Practice anyway')));
 b.querySelector('.mascot').style.cssText='width:90px;height:90px;margin:0 auto';
 b.append(h('div',{class:'card'},h('h4',null,'How review works'),h('p',{class:'hint',style:'margin:0'},'New cards: listen & repeat. Known cards: see the English, say it in Filipino. Get it right and the card comes back later (1, 2, 4, 7, 14, 30 days). Miss it and you’ll see it again soon.')));
}
function startReview(practice){
 let q=dueCards().slice(0,10).map(c=>cardKey(c.tl));
 if(!q.length&&practice)q=Object.values(P.deck).sort((a,b)=>a.box-b.box||Math.random()-.5).slice(0,8).map(c=>cardKey(c.tl));
 if(!q.length)return;
 RV={queue:q,i:0,good:0,again:0,xp:0,requeued:new Set(),practice};renderReviewCard();hook('review-start',q.length);
}
function renderReviewCard(){
 const b=$('#reviewBody');b.innerHTML='';
 if(RV.i>=RV.queue.length)return finishReview();
 const key=RV.queue[RV.i],c=P.deck[key];if(!c){RV.i++;return renderReviewCard();}
 RV.cur={key,best:0,revealed:c.box===0,attempts:0};
 const recall=c.box>0;
 const ans=h('div',{class:'rv-ans',hidden:true},h('b',null,c.tl),recall?h('span',{class:'rv-a'},c.en):null);
 const card=h('div',{class:'rv-card'},h('div',{class:'rv-k'},recall?'🧠 How do you say…':'🆕 New · listen & repeat'),
  h('div',{class:'rv-q'},recall?c.en:c.tl),!recall?h('div',{class:'rv-a'},c.en):null,ans);
 const listen=h('button',{class:'btn',id:'rvListen',onclick:async()=>{unlockAudio();revealAns();await speak(c.tl,{persist:true});}},'🔊 Listen');
 const show=recall?h('button',{class:'btn',id:'rvShow',onclick:()=>{revealAns();speak(c.tl,{persist:true});showNext(true);}},'👀 Show answer'):null;
 const micB=h('button',{class:'micbtn',id:'rvMic','aria-label':'Say it'},h('span',{class:'ring'}),h('span',{class:'micIcon'},svg('mic')));
 const fb=h('div',{id:'rvFb'}),next=h('div',{class:'rv-next',id:'rvNext'});
 b.append(h('div',{class:'rv-top'},h('button',{class:'xbtn','aria-label':'End review',onclick:()=>{if(recActive())recStop(true);RV=null;renderReview();}},svg('close')),h('div',{class:'lprog'},h('div',{class:'lprog-fill',style:'width:'+Math.round(100*RV.i/RV.queue.length)+'%'})),h('span',{class:'lturns'},(RV.i+1)+'/'+RV.queue.length)),
  card,h('div',{class:'rv-tools'},listen,show),h('div',{class:'rv-mic'},micB,h('small',{id:'rvMicLbl'},'Tap, say it in Filipino, tap again')),fb,next);
 function revealAns(){RV.cur.revealed=true;if(recall)ans.hidden=false;}
 const setMic=s=>{micB.classList.toggle('rec',s==='recording');micB.classList.toggle('busy',s==='busy');const ic=micB.querySelector('.micIcon');ic.innerHTML='';ic.append(s==='recording'?svg('stop'):s==='busy'?h('div',{class:'spin'}):svg('mic'));$('#rvMicLbl').textContent=s==='recording'?'Listening… tap to check':s==='busy'?'Checking…':'Tap, say it in Filipino, tap again';};
 micB.addEventListener('pointerdown',e=>{e.preventDefault();unlockAudio();if(micB.classList.contains('busy'))return;
  if(recActive()){recStop();return;}
  recStart({ring:micB.querySelector('.ring'),vad:false,onState:setMic,onShort:()=>{setMic('idle');toast('Too short — tap, say the phrase, then tap again.');},onCancel:()=>setMic('idle'),onError:e=>{setMic('idle');toast(e.message,5000);},
   onBlob:async(blob,type,dur)=>{setMic('busy');track('spokenMs',dur);let text='';
    try{text=await transcribe(blob,type,{lang:'tl',prompt:'A learner saying a short Filipino (Tagalog) phrase.'});}catch(err){setMic('idle');toast(err.message,5000);return;}
    setMic('idle');if(!RV||RV.cur.key!==key)return;
    if(!text){toast('I didn’t hear anything — try again.');return;}
    track('sentences',1);const sc=scoreSpeech(c.tl,text);RV.cur.attempts++;RV.cur.best=Math.max(RV.cur.best,sc.score);if(sc.score>=0.85)track('clean',1);saveP();afterProgress();
    revealAns();const cls=sc.score>=0.85?'good':sc.score>=0.6?'mid':'bad';
    fb.innerHTML='';fb.append(h('div',{class:'fb '+cls},h('div',{class:'fh'},cls==='good'?'🎉 Perfect!':cls==='mid'?'👍 Almost!':'🔁 Not quite'),
     h('div',{class:'heard'},'I heard: “'+text+'”'),h('div',{class:'tw'},sc.tokens.map((w,i)=>[h('span',{class:sc.hits[i]?'hit':'miss'},w),' ']))));
    hook('review-attempt',{score:sc.score,text});
    if(cls!=='good')speak(c.tl,{persist:true});
    showNext(false);}});});
 function showNext(self){next.innerHTML='';const goodNow=!self&&RV.cur.best>=0.75;
  if(goodNow)next.append(h('button',{class:'b3 green',id:'rvGood',onclick:e=>grade(true,e.currentTarget)},'Continue ›'));
  else next.append(h('button',{class:'b3',id:'rvAgain',onclick:e=>grade(false,e.currentTarget)},'↻ Again'),h('button',{class:'b3 green',id:'rvGood',onclick:e=>grade(true,e.currentTarget)},self?'I knew it':'Got it ›'));}
 if(c.box===0)setTimeout(()=>{if(RV&&RV.cur&&RV.cur.key===key&&currentTab==='review')speak(c.tl,{persist:true});},250);
}
function grade(good,btn){const key=RV.cur.key,c=P.deck[key];if(recActive())recStop(true);gradeCard(c,good);track('reviews',1);
 const xp=good?3:1;RV.xp+=xp;good?RV.good++:RV.again++;
 if(!good&&!RV.requeued.has(key)){RV.queue.push(key);RV.requeued.add(key);}
 addXP(xp,btn);RV.i++;renderReviewCard();}
function finishReview(){const b=$('#reviewBody');b.innerHTML='';const r=RV;RV=null;
 b.append(h('div',{class:'card res'},mascot('cheer'),h('h2',null,'Review complete!'),
  h('div',{class:'statsrow'},h('div',{class:'stat'},h('b',null,r.good),h('small',null,'Got it')),h('div',{class:'stat'},h('b',null,r.again),h('small',null,'Again')),h('div',{class:'stat'},h('b',null,'+'+r.xp),h('small',null,'XP'))),
  h('button',{class:'b3 green wide',id:'reviewDone',onclick:()=>renderReview()},'Done')));
 hook('review-done',{good:r.good,again:r.again});if(!r.again)confetti(120);updateChrome();}

/* ---------- PROGRESS ---------- */
function renderProgress(){
 const b=$('#progressBody');b.innerHTML='';const lv=levelInfo(P.totalXP);const st=streak();const deck=Object.values(P.deck);const k=todayKey();
 b.append(h('div',{class:'card'},h('div',{class:'hero'},mascot('happy'),h('div',{style:'flex:1'},h('h2',null,'Level '+lv.L),h('div',{class:'bar'},h('i',{style:'width:'+lv.pct+'%'})),h('p',null,P.totalXP+' XP total · '+(lv.span-lv.cur)+' to Level '+(lv.L+1))))));
 const box=(e,v,l)=>h('div',{class:'sbox'},h('span',{class:'se'},e),h('div',null,h('b',null,v),h('small',null,l)));
 b.append(h('div',{class:'grid2',style:'margin-bottom:14px'},
  box('🔥',st,'day streak · best '+P.bestStreak),box('⚡',P.totalXP,'total XP'),
  box('📘',LESSONS.filter(isDone).length+'/'+LESSONS.length,'lessons done'),box('🧠',deck.length,'words learned · '+deck.filter(c=>c.box>=4).length+' mastered'),
  box('🎙️',(m=>m<10?Math.round(m*10)/10:Math.round(m))(P.totals.spokenMs/60000),'minutes spoken'),box('💬',P.totals.sentences,'sentences said')));
 // 7-day chart
 const days=[...Array(7)].map((_,i)=>addDays(k,i-6));const g=goalXP();const mx=Math.max(g,...days.map(d=>peekDay(d).xp))*1.1;
 const chart=h('div',{class:'chart',id:'xpChart'});
 days.forEach(d=>{const xp=peekDay(d).xp;const dt=keyToDate(d);chart.append(h('div',{class:'col'+(xp>=g?' met':'')+(d===k?' today':'')},h('div',{class:'xv'},xp||''),h('div',{class:'bw'},h('div',{class:'bv',style:'height:'+Math.max(3,Math.round(100*xp/mx))+'%'})),h('div',{class:'xl'},d===k?'Today':'SMTWTFS'[dt.getDay()])));});
 const gl=h('div',{class:'goalline',style:'bottom:'+(21+Math.round(110*g/mx))+'px'},h('span',null,'goal '+g));chart.append(gl);
 b.append(h('div',{class:'card'},h('h4',null,'⚡ XP — last 7 days'),chart));
 // calendar (5 weeks, Monday first)
 const cal=h('div',{class:'cal',id:'streakCal'});['M','T','W','T','F','S','S'].forEach(x=>cal.append(h('div',{class:'dh'},x)));
 const td=keyToDate(k);const dow=(td.getDay()+6)%7;let start=addDays(k,-dow-28);
 for(let i=0;i<35;i++){const d=addDays(start,i);const pd=peekDay(d);const fut=d>k;
  cal.append(h('div',{class:'d'+(isActive(d)?(pd.goalHit?' goal':' on'):'')+(d===k?' today':'')+(fut?' future':''),title:d},isActive(d)?'🔥':String(keyToDate(d).getDate())));}
 const activeDays=Object.keys(P.days).filter(isActive).length;
 b.append(h('div',{class:'card'},h('h4',null,'🔥 Streak calendar'),cal,h('p',{class:'hint'},activeDays+' practice day'+(activeDays===1?'':'s')+' total · a day counts when you earn '+ACTIVE_XP+'+ XP')));
 // badges
 const bg=h('div',{class:'badges'});BADGES.forEach(x=>{const got=P.badges[x.id];bg.append(h('div',{class:'badge'+(got?'':' locked'),'data-badge':x.id},h('div',{class:'be'},x.em),h('b',null,x.name),h('small',null,got?'Earned '+keyToDate(got).toLocaleDateString('en-US',{month:'short',day:'numeric'}):x.desc)));});
 b.append(h('div',{class:'card'},h('h4',null,'🏅 Badges · '+Object.keys(P.badges).length+'/'+BADGES.length),bg));
 b.append(h('div',{class:'quick'},h('button',{class:'qbtn',onclick:()=>openPhrases()},h('div',{class:'e'},'⭐'),h('b',null,'My phrases'),h('small',null,phrases.length+' saved')),h('button',{class:'qbtn',onclick:()=>openSettings()},h('div',{class:'e'},'⚙️'),h('b',null,'Settings'),h('small',null,'Goal, voice, backup'))));
}

/* ---------- topics & phrases sheets ---------- */
function openTopics(){const list=$('#topicList');list.innerHTML='';
 TOPICS.forEach(t=>list.append(h('button',{class:'topic'+(t.id===freeConvo.topic?' on':''),onclick:()=>startTopic(t.id)},h('div',{class:'em'},t.em),h('div',null,h('b',null,t.name),h('small',null,t.desc)))));
 openSheet('#topicSheet');}
$('#topicBtn').addEventListener('click',openTopics);
function openPhrases(){const box=$('#phraseList');box.innerHTML='';
 if(!phrases.length)box.append(h('div',{class:'empty'},mascot('happy'),h('p',null,'No saved phrases yet.'),h('p',null,'Tap “Save” under any line Mara says or any correction to keep it here — it also goes into your Review deck.')));
 else phrases.forEach((p,i)=>box.append(h('div',{class:'phrase'},h('div',{class:'txt'},h('b',null,p.tl),p.en?h('span',null,p.en):null),
  h('button',{class:'round','aria-label':'Play',onclick:async e=>{unlockAudio();const b=e.currentTarget;b.disabled=true;await speak(p.tl,{persist:true});b.disabled=false;}},svg('speaker')),
  h('button',{class:'round','aria-label':'Delete',onclick:()=>{phrases.splice(i,1);save('ut.phrases',phrases);openPhrases();renderConv();}},svg('trash')))));
 openSheet('#phraseSheet');}
$('#phrasesBtn').append(svg('star'));$('#phrasesBtn').addEventListener('click',openPhrases);

/* ---------- settings ---------- */
const VOICES=[['coral','Coral — warm female (default)'],['marin','Marin — natural female'],['cedar','Cedar — natural male'],['nova','Nova — bright female'],['shimmer','Shimmer — soft female'],['sage','Sage — calm female'],['ash','Ash — friendly male'],['verse','Verse — expressive male'],['ballad','Ballad — gentle male'],['alloy','Alloy — neutral']];
$('#voiceSel').append(...VOICES.map(([v,l])=>h('option',{value:v},l)));
function segInit(id,key,after){const seg=$(id);const sync=()=>seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===S[key]));
 seg.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{S[key]=b.dataset.v;saveS();sync();after&&after();}));sync();return sync;}
function togInit(id,key,after){const t=$(id);const sync=()=>{t.classList.toggle('on',!!S[key]);t.setAttribute('aria-checked',!!S[key]);};
 t.addEventListener('click',()=>{S[key]=!S[key];saveS();sync();after&&after();});sync();}
segInit('#levelSeg','level');segInit('#speedSeg','speed');segInit('#goalSeg','goal',()=>{afterProgress();RENDER[currentTab]();});
togInit('#tEn','showEn',()=>renderConv());togInit('#tFix','speakFix');togInit('#tSayEn','sayEn');
function openSettings(){$('#keyIn').value=S.key;$('#welcomeCard').hidden=!!S.key;$('#voiceSel').value=S.voice;$('#chatSel').value=S.chatModel;$('#sttSel').value=S.sttModel;$('#aboutIn').value=S.about;
 $('#keyState').textContent=S.key?'Key saved on this phone ✓':'';$('#keyState').className='keystate'+(S.key?' good':'');openSheet('#settingsSheet');$('#settingsSheet .body').scrollTop=0;}
$$('[data-open-settings]').forEach(b=>{b.append(svg('gear'));b.addEventListener('click',openSettings);});
$$('[data-close]').forEach(b=>{b.append(svg('close'));b.addEventListener('click',()=>{closeSheets();RENDER[currentTab]();});});
$('#keyShow').addEventListener('click',()=>{const i=$('#keyIn');i.type=i.type==='password'?'text':'password';$('#keyShow').textContent=i.type==='password'?'Show':'Hide';});
$('#keySave').addEventListener('click',async()=>{unlockAudio();const k=$('#keyIn').value.trim().replace(/^Bearer\s+/i,'');const st=$('#keyState');
 if(!k){S.key='';saveS();st.textContent='Key removed.';st.className='keystate';return;}
 if(!/^sk-/.test(k)){st.textContent='That doesn’t look like an OpenAI key (it should start with “sk-”).';st.className='keystate bad';return;}
 S.key=k;saveS();st.textContent='Testing key…';st.className='keystate';
 try{await api('/models/'+encodeURIComponent(S.chatModel),{method:'GET'});st.textContent='✅ Key works! Close this screen and start learning.';st.className='keystate good';$('#welcomeCard').hidden=true;}
 catch(e){st.textContent=(e.kind==='network'?'Saved, but couldn’t test it: ':'')+e.message;st.className='keystate bad';if(e.kind==='key'){S.key='';saveS();}}
});
$('#voiceSel').addEventListener('change',e=>{S.voice=e.target.value;saveS();});
$('#chatSel').addEventListener('change',e=>{S.chatModel=e.target.value;saveS();});
$('#sttSel').addEventListener('change',e=>{S.sttModel=e.target.value;saveS();});
$('#aboutIn').addEventListener('input',e=>{S.about=e.target.value.slice(0,600);saveS();});
$('#voiceTest').addEventListener('click',async()=>{unlockAudio();const b=$('#voiceTest');b.disabled=true;b.textContent='…';await speak('Kumusta, Neal! Ako si Mara. Handa ka na bang mag-usap tayo sa Filipino?');b.disabled=false;b.textContent='▶ Test';});
$('#resetBtn').addEventListener('click',()=>{if(confirm('Clear the free-talk conversation and start fresh? (Progress and saved phrases are kept.)')){resetConvo();closeSheets();toast('New conversation started');}});
// backup
function backupData(){const s=Object.assign({},S);delete s.key;return {app:'usap-tayo',v:DATA_VERSION,exportedAt:new Date().toISOString(),settings:s,phrases,convo:freeConvo,progress:P};}
$('#exportBtn').addEventListener('click',async()=>{const json=JSON.stringify(backupData());const name='usap-tayo-backup-'+todayKey()+'.json';
 try{const file=new File([json],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[file]})&&/iPhone|iPad|Android/i.test(navigator.userAgent)&&!window.__testHook){await navigator.share({files:[file],title:'Usap Tayo backup'});return;}}catch(e){if(e&&e.name==='AbortError')return;}
 const a=h('a',{href:URL.createObjectURL(new Blob([json],{type:'application/json'})),download:name});document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);toast('Backup saved: '+name);});
$('#importBtn').addEventListener('click',()=>$('#importFile').click());
$('#importFile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 let d;try{d=JSON.parse(await f.text());}catch(err){toast('That file isn’t a valid backup.');return;}
 if(!d||d.app!=='usap-tayo'||!d.progress){toast('That file isn’t a Usap Tayo backup.');return;}
 if(!confirm('Replace your current progress with this backup from '+(d.exportedAt||'').slice(0,10)+'?'))return;
 const key=S.key;save('ut.settings',Object.assign({},DEFAULTS,d.settings||{},{key}));save('ut.phrases',d.phrases||[]);save('ut.convo',d.convo||{topic:'free',history:[],items:[]});save('ut.progress',d.progress);localStorage.setItem('ut.version',String(DATA_VERSION));
 toast('Backup restored ✓');setTimeout(()=>location.reload(),600);});

/* ---------- lifecycle ---------- */
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(recActive())recStop(true);stopPlayback();if(state==='speaking')setState('idle');lastTalkTouch=0;}else{updateChrome();if(currentTab==='home'||currentTab==='progress')RENDER[currentTab]();}});
window.addEventListener('online',()=>toast('Back online ✓'));
window.addEventListener('offline',()=>toast('You’re offline — Mara needs internet.',3500));
$$('[data-mascot]').forEach(el=>el.innerHTML=mascotSVG(el.dataset.mascot));
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')e.currentTarget.hidden=true;});
migrate();syncHF();renderConv();setState('idle');go('home');
if(!S.key)openSettings();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__app={P:()=>P,S,LESSONS,scoreSpeech,norm,streak,dayKey};
