// game.js — ASCII roguelike движок

var FW=18, FH=22; // ширина/высота символа
var G={mapDef:null,rows:0,cols:0,cells:[],conts:[],enemies:[],blood:{},exit:null,
       player:{row:1,col:1,hp:100,maxHp:100,lBleed:false,hBleed:false,frac:false,pain:false,painT:0,weapon:null,armor:null,ammo:0,meds:[null,null,null],hunger:100,thirst:100},
       inv:[],kills:0,steps:0,timeLeft:90,timer:null,phase:'play',
       searchCont:null,searchProg:0,searchMax:0,searchIv:null};

function startRaid(lvlIdx,eq){
  clearInterval(G.timer);
  if(G.searchIv)clearInterval(G.searchIv);
  G.phase='play';G.searchCont=null;
  G.level=lvlIdx;G.cells=[];G.conts=[];G.enemies=[];G.blood={};G.exit=null;G.inv=[];G.kills=0;G.steps=0;

  var def=MAPS[lvlIdx%MAPS.length];
  G.mapDef=def;G.rows=def.rows.length;G.cols=def.rows[0].length;

  var floors=[];
  for(var r=0;r<G.rows;r++){
    G.cells[r]=[];
    var row=def.rows[r];
    for(var c=0;c<G.cols;c++){
      var ch=row[c]||'#';
      if(ch==='#'){G.cells[r][c]={t:'wall'};}
      else if(ch==='@'){G.cells[r][c]={t:'floor'};G.player.row=r;G.player.col=c;floors.push({r,c});}
      else if(ch==='<'){G.cells[r][c]={t:'exit'};G.exit={r,c};floors.push({r,c});}
      else if(ch==='.'){G.cells[r][c]={t:'floor'};floors.push({r,c});}
      else{
        var ct=CHAR_TO_CTYPE[ch];
        if(ct){
          var isLocked=!!LOCKED_CHARS[ch];
          var cDef=CONTAINERS[ct];
          var loot=[];
          var cnt=rnd(cDef.loot[0],cDef.loot[1]);
          for(var k=0;k<cnt;k++){var item=pickLoot(ct,def.bias);if(item)loot.push(Object.assign({uid:uid()},item));}
          G.cells[r][c]={t:'cont',ci:G.conts.length};
          G.conts.push({r,c,ct,isLocked,searched:false,loot,idx:G.conts.length});
          floors.push({r,c});
        }else{G.cells[r][c]={t:'floor'};floors.push({r,c});}
      }
    }
  }

  // Враги
  shuf(floors);
  var ef=floors.filter(function(f){return!(f.r===G.player.row&&f.c===G.player.col)&&G.cells[f.r][f.c].t==='floor';});
  var zn=4+lvlIdx*2;
  for(var i=0;i<zn&&ef.length;i++){
    var f=ef.shift();
    var isH=Math.random()<def.humanChance;
    var ekeys=isH?['raider','deserter']:def.enemies;
    var ek=ekeys[Math.floor(Math.random()*ekeys.length)];
    var ed=ENEMIES[ek];
    G.enemies.push({r:f.r,c:f.c,hp:ed.hp,maxHp:ed.hp,dmg:ed.dmg,spd:ed.spd,till:ed.spd,
      ek,name:ed.name,ch:ed.ch,fg:ed.fg,type:ed.type,bleed:ed.bleed,frac:ed.frac,loot:ed.loot,special:ed.special||null});
  }

  // Снаряжение
  var e=eq||{};
  G.player=Object.assign(G.player,{
    hp:getCurUser()?getCurUser().hp:100,maxHp:100,
    lBleed:false,hBleed:false,frac:false,pain:false,painT:0,
    weapon:WEAPONS[e.weapon]||WEAPONS.fists,
    armor:ARMORS[e.armor]||ARMORS.none,
    ammo:e.ammo||0,
    meds:e.meds||[null,null,null],
    hunger:100,thirst:100,
  });
  G.timeLeft=def.time;
  log('Рейд: '+def.name+' | '+def.sub,'good');
  log('Оружие: '+G.player.weapon.name+(G.player.ammo?' | '+G.player.ammo+' патр.':''),'');
  draw();hud();renderMeds();renderInv();
  G.timer=setInterval(tick,1000);
}

function tick(){
  if(G.phase==='dead'||G.phase==='win'){clearInterval(G.timer);return;}
  G.timeLeft--;
  if(G.player.hBleed)harm(3,'кровопотеря');
  else if(G.player.lBleed)harm(1,'кровотечение');
  if(G.player.painT>0){G.player.painT--;if(!G.player.painT)G.player.pain=false;}

  // Голод и жажда убывают каждые 8 секунд
  if(G.timeLeft%8===0){
    G.player.hunger=Math.max(0,G.player.hunger-5);
    G.player.thirst=Math.max(0,G.player.thirst-8); // жажда убывает быстрее
    if(G.player.hunger===0){harm(2,'голод');log('🍖 Ты голодаешь! Съешь что-нибудь!','warn');}
    if(G.player.thirst===0){harm(3,'обезвоживание');log('💧 Критическое обезвоживание!','danger');}
    else if(G.player.thirst<=20&&G.timeLeft%16===0)log('💧 Очень хочется пить...','warn');
    else if(G.player.hunger<=20&&G.timeLeft%16===0)log('🍖 Желудок сводит от голода...','warn');
  }

  hud();
  if(G.timeLeft<=30&&G.timeLeft%10===0)log('⚠ '+G.timeLeft+' сек!','warn');
  if(G.timeLeft<=0){clearInterval(G.timer);endRaid(false,'Время истекло.');}
}


function harm(n,r){G.player.hp=Math.max(0,G.player.hp-n);if(G.player.hp<=0)endRaid(false,r||'погиб');hud();}

function move(dr,dc){
  if(G.phase!=='play')return;
  if(G.player.frac&&G.steps%2===0){G.steps++;log('Перелом мешает...','status');moveEnemies();draw();return;}
  var nr=G.player.row+dr,nc=G.player.col+dc;
  if(!inB(nr,nc))return;
  var cell=G.cells[nr][nc];
  if(!cell||cell.t==='wall')return;
  var ei=eAt(nr,nc);
  if(ei!==-1){atk(ei);G.steps++;moveEnemies();draw();hud();return;}
  if(cell.t==='cont'){
    var cont=G.conts[cell.ci];
    if(!cont.searched)beginSearch(cont);
    else log(CONTAINERS[cont.ct].name+': уже обыскан','');
    return;
  }
  G.player.row=nr;G.player.col=nc;G.steps++;
  if(cell.t==='exit'){
    if(G.inv.length>0){endRaid(true);return;}
    log('Сначала возьми лут!','warn');
  }
  moveEnemies();draw();hud();
}

function atk(idx){
  var e=G.enemies[idx],w=G.player.weapon;
  var dmg=rnd(w.dmg[0],w.dmg[1]);
  var crit=Math.random()<w.crit;
  if(crit)dmg=Math.floor(dmg*1.8);
  if(w.ammo){if(!G.player.ammo){w=WEAPONS.fists;dmg=rnd(w.dmg[0],w.dmg[1]);log('Патроны кончились!','warn');}else G.player.ammo--;}
  e.hp-=dmg;
  log((crit?'💥 ':'')+e.name+': -'+dmg+(w.ammo?' ['+G.player.ammo+'п]':''),'danger');
  if(e.hp<=0){
    G.blood[e.r+','+e.c]=true;
    if(Math.random()<e.loot){var it=pickLoot('bag',G.mapDef.bias);if(it){G.conts.push({r:e.r,c:e.c,ct:'bag',isLocked:false,searched:false,fromEnemy:true,loot:[Object.assign({uid:uid()},it)],idx:G.conts.length});G.cells[e.r][e.c]={t:'cont',ci:G.conts.length-1};}}
    G.enemies.splice(idx,1);G.kills++;
    log('✓ '+e.name+' уничтожен','good');
  }
}

function moveEnemies(){
  for(var i=G.enemies.length-1;i>=0;i--){
    var e=G.enemies[i];
    e.till--;if(e.till>0)continue;e.till=e.spd;
    var dr=G.player.row-e.r,dc=G.player.col-e.c;
    var dist=Math.abs(dr)+Math.abs(dc);
    if(e.special==='alert'&&dist<=4){
      log(e.name+': КРИЧИТ!','warn');
      G.enemies.forEach(function(o){if(o!==e&&o.till>1)o.till=1;});
    }
    if(dist===1){eHit(e);}
    else if(dist<=12){
      var cands=[];
      if(dr!==0)cands.push([dr>0?1:-1,0]);
      if(dc!==0)cands.push([0,dc>0?1:-1]);
      shuf(cands);
      for(var ci=0;ci<cands.length;ci++){
        var nr=e.r+cands[ci][0],nc=e.c+cands[ci][1];
        if(inB(nr,nc)&&G.cells[nr][nc].t!=='wall'&&eAt(nr,nc)===-1&&!(nr===G.player.row&&nc===G.player.col)){e.r=nr;e.c=nc;break;}
      }
    }
  }
}

function eHit(e){
  var raw=rnd(e.dmg[0],e.dmg[1]);
  var arm=G.player.armor,abs=0;
  if(arm&&arm.class>0&&arm.dur>0){abs=Math.floor(raw*arm.absorb);arm.dur-=Math.ceil(abs*0.25);if(arm.dur<0)arm.dur=0;}
  var dmg=Math.max(1,raw-abs);
  G.player.hp-=dmg;
  log(e.name+': -'+dmg+(abs?' (броня:-'+abs+')':''),'hit');
  flashCanvas();
  if(Math.random()<e.bleed&&!G.player.lBleed&&!G.player.hBleed){
    if(Math.random()<0.35){G.player.hBleed=true;log('🩸 ТЯЖЁЛОЕ КРОВОТЕЧЕНИЕ!','hit');}
    else{G.player.lBleed=true;log('🩸 кровотечение','hit');}
  }
  if(Math.random()<e.frac&&!G.player.frac){G.player.frac=true;log('🦴 Перелом!','hit');}
  if(G.player.hp<=0){G.player.hp=0;endRaid(false,e.name+' убил тебя.');}
  hud();
}

function beginSearch(cont){
  var cd=CONTAINERS[cont.ct];
  if(cont.isLocked){
    var hasKey=G.inv.some(function(i){return i.type==='item'&&i.data&&i.data.opensLock===cont.ct;});
    if(!hasKey){var u=getCurUser();if(u)hasKey=u.stash.some(function(s){return s.type==='item'&&s.data&&s.data.opensLock===cont.ct;});}
    if(!hasKey){
      if(cd.openChance&&Math.random()<cd.openChance){log('Взламываешь '+cd.name+'...','warn');cont.isLocked=false;}
      else{log('🔒 '+cd.name+' заперт','warn');return;}
    }else{cont.isLocked=false;log('🗝 Открываешь '+cd.name,'good');}
  }
  if(!cont.loot.length){cont.searched=true;log(cd.name+': пусто','');draw();return;}
  G.phase='searching';G.searchCont=cont;G.searchProg=0;G.searchMax=cd.time*2;
  log('Обыскиваешь '+cd.name+'...','');
  updateSB();
  G.searchIv=setInterval(function(){
    if(G.phase==='dead'){clearInterval(G.searchIv);return;}
    G.searchProg++;updateSB();
    var adj=adjE(G.player.row,G.player.col);
    if(adj!==-1){clearInterval(G.searchIv);G.phase='play';log('⚠ Враг прерывает обыск!','danger');eHit(G.enemies[adj]);draw();updateSB();return;}
    if(G.searchProg>=G.searchMax){clearInterval(G.searchIv);finishSearch(cont);}
  },400);
}

function finishSearch(cont){
  G.phase='play';cont.searched=true;G.searchCont=null;updateSB();
  // После обыска трупа (bag от врага) — клетка снова становится проходимой
  if(cont.ct==='bag'&&cont.fromEnemy){
    G.cells[cont.r][cont.c]={t:'floor'};
  }
  if(!cont.loot.length){log('Пусто','');draw();return;}
  showLootPick(cont.loot);draw();
}

function showLootPick(items){
  var el=document.getElementById('loot-pick');
  if(!el){items.forEach(function(i){G.inv.push(i);log('+ '+(i.data?i.data.name:'?'),'loot');});renderInv();return;}
  el.style.display='block';
  var h='<div style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#76ff7a;margin-bottom:7px">Найдено — выбери:</div>';
  items.forEach(function(it,i){
    var d=it.data||{};
    h+='<label style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #1a1a14;cursor:pointer;font-size:13px;color:#c8d8c0">'
      +'<input type="checkbox" class="lp-cb" data-i="'+i+'" checked style="accent-color:#4caf50">'
      +(d.icon||'?')+' <strong>'+esc(d.name||'?')+'</strong>'+(it.qty>1?' ×'+it.qty:'')
      +'<span style="font-size:11px;color:#4a5e4a;margin-left:auto">'+it.type+'</span></label>';
  });
  h+='<div style="display:flex;gap:7px;margin-top:9px">'
    +'<button class="btn btn-g" id="lp-take">Взять</button>'
    +'<button class="btn btn-gh" id="lp-skip">Пропустить</button></div>';
  el.innerHTML=h;
  document.getElementById('lp-take').onclick=function(){
    el.querySelectorAll('.lp-cb:checked').forEach(function(cb){
      var it=items[parseInt(cb.dataset.i)];G.inv.push(it);log('+ '+(it.data?it.data.name:'?'),'loot');
    });
    el.style.display='none';el.innerHTML='';renderInv();
  };
  document.getElementById('lp-skip').onclick=function(){el.style.display='none';el.innerHTML='';};
}

function useMed(idx){
  if(G.phase!=='play')return;
  var slot=G.player.meds[idx];if(!slot)return;
  var med=MEDICALS[slot.id];if(!med)return;
  G.phase='medusing';log('Применяю '+med.name+'...','');
  var prog=0,total=med.useTime*2;
  var iv=setInterval(function(){
    if(G.phase==='dead'){clearInterval(iv);return;}
    prog++;
    var adj=adjE(G.player.row,G.player.col);
    if(adj!==-1){clearInterval(iv);G.phase='play';log('⚠ Враг прерывает лечение!','danger');eHit(G.enemies[adj]);draw();return;}
    if(prog>=total){clearInterval(iv);applyMed(med,idx);G.phase='play';draw();hud();}
  },400);
}

function applyMed(med,idx){
  var stops=(med.stops||'').split('|');var used=false;
  if(stops.indexOf('light_bleed')!==-1&&G.player.lBleed){G.player.lBleed=false;log('✓ Лёгкое кровотечение остановлено','good');used=true;}
  if(stops.indexOf('heavy_bleed')!==-1&&G.player.hBleed){G.player.hBleed=false;G.player.lBleed=false;log('✓ Тяжёлое кровотечение остановлено','good');used=true;}
  if(stops.indexOf('fracture')!==-1&&G.player.frac){G.player.frac=false;log('✓ Перелом зафиксирован','good');used=true;}
  if(stops.indexOf('pain')!==-1){G.player.pain=true;G.player.painT=40;log('✓ Боль снята','good');used=true;}
  if(med.heals>0){var prev=G.player.hp;G.player.hp=Math.min(G.player.maxHp,G.player.hp+med.heals);log('✓ +'+( G.player.hp-prev)+' HP','good');used=true;}
  if(!used){log(med.name+': нет нужного эффекта','warn');return;}
  var s=G.player.meds[idx];
  if(s){s.qty=(s.qty||1)-1;if(s.qty<=0)G.player.meds[idx]=null;}
  renderMeds();
}

function endRaid(survived,reason){
  G.phase=survived?'win':'dead';
  clearInterval(G.timer);if(G.searchIv)clearInterval(G.searchIv);
  var u=getCurUser();
  var savePct=0;
  if(!survived&&u){var sl=u.shelter.upgrades.security||0;savePct=UPGRADES.security.levels[sl].save;}
  var loot=survived?G.inv.slice():G.inv.slice(0,Math.floor(G.inv.length*savePct));
  var run={id:uid(),date:new Date().toISOString(),location:G.mapDef.name,kills:G.kills,steps:G.steps,loot,survived,deathReason:reason||'',hpLeft:G.player.hp};
  saveRun(run);
  var ov=document.getElementById('raid-ov');if(!ov)return;
  ov.className='overlay show '+(survived?'win':'dead');
  document.getElementById('ov-ico').textContent=survived?'✓':'☠';
  document.getElementById('ov-title').textContent=survived?'EXTRACTED':'WIPE';
  document.getElementById('ov-sub').textContent=survived?'Лут сохранён. HP: '+G.player.hp:(reason||'Погиб.')+' HP: '+G.player.hp;
  document.getElementById('ov-stats').innerHTML=
    sr('Локация',G.mapDef.name)+sr('Убито',G.kills)+sr('Лут',loot.length+' предм.')+sr('Шагов',G.steps)+sr('HP',G.player.hp+'/'+G.player.maxHp);
}

function sr(l,v){return'<div class="srow"><span class="srow-l">'+l+'</span><span class="srow-v">'+v+'</span></div>';}

// ══════ РЕНДЕР ══════
function draw(){
  var cv=document.getElementById('gc');if(!cv||!G.mapDef)return;
  var ctx=cv.getContext('2d');
  var th=G.mapDef.theme;
  cv.width=G.cols*FW;cv.height=G.rows*FH;
  ctx.fillStyle=th.bg;ctx.fillRect(0,0,cv.width,cv.height);
  ctx.font='bold '+FH+'px "Courier New",monospace';ctx.textBaseline='top';

  for(var r=0;r<G.rows;r++){
    for(var c=0;c<G.cols;c++){
      var x=c*FW,y=r*FH,cell=G.cells[r][c];
      if(cell.t==='wall'){
        ctx.fillStyle=th.wall;ctx.fillRect(x,y,FW,FH);
        ctx.fillStyle=th.wallFg;ctx.fillText(wallCh(r,c),x+1,y+1);
      }else{
        ctx.fillStyle=th.floor;ctx.fillRect(x,y,FW,FH);
        if(G.blood[r+','+c]){ctx.fillStyle='#7a1a1a';ctx.fillText('×',x+1,y+1);}
        else if(cell.t==='exit'){
          var canEx=G.inv.length>0;
          ctx.fillStyle='rgba(74,143,189,0.25)';ctx.fillRect(x,y,FW,FH);
          ctx.fillStyle=canEx?'#76c8ff':'#2a4060';ctx.fillText('<',x+1,y+1);
        }else if(cell.t==='cont'){
          var co=G.conts[cell.ci],cd=CONTAINERS[co.ct];
          ctx.fillStyle=co.searched?'rgba(40,40,40,0.5)':(co.isLocked?cd.lockColor:cd.color);
          if(co.searched)ctx.globalAlpha=0.35;
          ctx.fillText(co.searched?co.ct[0]:co.isLocked?co.ct[0].toUpperCase():co.ct[0],x+1,y+1);
          ctx.globalAlpha=1;
          // лут-точка
          if(!co.searched&&co.loot.length){ctx.fillStyle='#e6a817';ctx.beginPath();ctx.arc(x+FW-4,y+4,2.5,0,Math.PI*2);ctx.fill();}
        }else{
          ctx.fillStyle=th.floorFg;ctx.fillText('·',x+1,y+1);
        }
      }
    }
  }

  // Враги
  G.enemies.forEach(function(e){
    var x=e.c*FW,y=e.r*FH;
    ctx.fillStyle=th.floor;ctx.fillRect(x,y,FW,FH);
    ctx.fillStyle=e.type==='human'?'rgba(20,30,50,0.85)':'rgba(35,8,8,0.85)';ctx.fillRect(x+1,y+1,FW-2,FH-2);
    ctx.fillStyle=e.fg;ctx.fillText(e.ch,x+1,y+1);
    // HP полоска
    var hp=e.hp/e.maxHp;
    ctx.fillStyle='#200808';ctx.fillRect(x,y+FH-3,FW,3);
    ctx.fillStyle=hp>.5?e.fg:'#ff4444';ctx.fillRect(x,y+FH-3,Math.round(FW*hp),3);
  });

  // Игрок
  var px=G.player.col*FW,py=G.player.row*FH;
  ctx.fillStyle=th.floor;ctx.fillRect(px,py,FW,FH);
  var pbg=G.player.hBleed?'rgba(70,8,8,.9)':G.player.lBleed?'rgba(55,12,12,.85)':'rgba(5,22,8,.9)';
  ctx.fillStyle=pbg;ctx.fillRect(px+1,py+1,FW-2,FH-2);
  var pc=G.player.hBleed?'#ff4040':G.player.lBleed?'#ff8080':G.player.frac?'#e6a817':'#76ff7a';
  ctx.fillStyle=pc;ctx.fillText('@',px+1,py+1);
  var php=G.player.hp/G.player.maxHp;
  ctx.fillStyle='#1a2e1a';ctx.fillRect(px,py+FH-3,FW,3);
  ctx.fillStyle=php>.6?'#4caf50':php>.3?'#e6a817':'#d94040';
  ctx.fillRect(px,py+FH-3,Math.round(FW*php),3);
}

function wallCh(r,c){
  var n=!inB(r-1,c)||G.cells[r-1][c].t==='wall';
  var s=!inB(r+1,c)||G.cells[r+1][c].t==='wall';
  var w=!inB(r,c-1)||G.cells[r][c-1].t==='wall';
  var e=!inB(r,c+1)||G.cells[r][c+1].t==='wall';
  if(!n&&!w&&s&&e)return'┌';if(!n&&!e&&s&&w)return'┐';
  if(!s&&!w&&n&&e)return'└';if(!s&&!e&&n&&w)return'┘';
  if(n&&s&&!w&&e)return'├';if(n&&s&&!e&&w)return'┤';
  if(w&&e&&!n&&s)return'┬';if(w&&e&&!s&&n)return'┴';
  if(n&&s&&e&&w)return'┼';
  if(n&&s)return'│';if(w&&e)return'─';
  return'█';
}

function hud(){
  var p=G.player;
  setEl('h-hp',p.hp);var he=document.getElementById('h-hp');if(he)he.style.color=p.hp>60?'#4caf50':p.hp>30?'#e6a817':'#d94040';
  var hb=document.getElementById('hp-bar');if(hb){var pct=Math.round(p.hp/p.maxHp*100);hb.style.width=pct+'%';hb.style.background=pct>60?'#4caf50':pct>30?'#e6a817':'#d94040';}
  var hun=p.hunger!=null?p.hunger:100;
  setEl('h-hunger',hun);
  var hunEl=document.getElementById('h-hunger');if(hunEl)hunEl.style.color=hun>50?'#e6a817':hun>20?'#e67c40':'#d94040';
  var hunBar=document.getElementById('hunger-bar');if(hunBar){hunBar.style.width=hun+'%';hunBar.style.background=hun>50?'#e6a817':hun>20?'#e67c40':'#d94040';}
  var thr=p.thirst!=null?p.thirst:100;
  setEl('h-thirst',thr);
  var thrEl=document.getElementById('h-thirst');if(thrEl)thrEl.style.color=thr>50?'#4fc3f7':thr>20?'#e6a817':'#d94040';
  var thrBar=document.getElementById('thirst-bar');if(thrBar){thrBar.style.width=thr+'%';thrBar.style.background=thr>50?'#4fc3f7':thr>20?'#e6a817':'#d94040';}
  setEl('h-kills',G.kills);setEl('h-loot',G.inv.length);
  setEl('h-weapon',p.weapon?p.weapon.name:'—');
  setEl('h-ammo',p.weapon&&p.weapon.ammo?p.ammo:'—');
  var m=Math.floor(G.timeLeft/60),s=G.timeLeft%60;
  var te=document.getElementById('h-timer');if(te){te.textContent=pad(m)+':'+pad(s);te.style.color=G.timeLeft>30?'#e6a817':'#d94040';}
  var sb=document.getElementById('status-bar');
  if(sb){
    var st=[];
    if(p.hBleed)st.push('<span style="color:#d94040">🩸 КРОВОТЕЧЕНИЕ</span>');
    else if(p.lBleed)st.push('<span style="color:#e67c40">🩸 кровотечение</span>');
    if(p.frac)st.push('<span style="color:#e6a817">🦴 Перелом</span>');
    if(p.pain)st.push('<span style="color:#7a967a">😵 Боль</span>');
    if(hun<=20)st.push('<span style="color:#e67c40">🍖 ГОЛОД</span>');
    if(thr<=20)st.push('<span style="color:#4fc3f7">💧 ЖАЖДА</span>');
    if(G.phase==='searching')st.push('<span style="color:#4a8fbd">🔍 Обыск</span>');
    if(G.phase==='medusing') st.push('<span style="color:#4a8fbd">💊 Лечение</span>');
    if(G.phase==='eating')   st.push('<span style="color:#4caf50">🍖 Ем...</span>');
    var arm=p.armor;
    if(arm&&arm.class>0){var dp=Math.round(arm.dur/arm.maxDur*100);st.push('<span style="color:'+(dp>50?'#4a8fbd':dp>20?'#e6a817':'#d94040')+'">🛡 '+dp+'%</span>');}
    sb.innerHTML=st.join('  ')||'<span style="color:#2e6b31;font-size:12px">● В порядке</span>';
  }
}

function updateSB(){
  var el=document.getElementById('search-bar');if(!el)return;
  if(G.phase==='searching'&&G.searchCont){
    var pct=Math.round(G.searchProg/G.searchMax*100);
    el.style.display='block';
    el.innerHTML='<div style="font-size:12px;color:#76ff7a;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">🔍 '+CONTAINERS[G.searchCont.ct].name+'</div><div style="height:5px;background:#1e2e1e"><div style="height:100%;background:#4caf50;width:'+pct+'%;transition:width .35s"></div></div>';
  }else{el.style.display='none';el.innerHTML='';}
}

function renderMeds(){
  var el=document.getElementById('med-slots');if(!el)return;
  var p=G.player,h='';
  for(var i=0;i<3;i++){
    var s=p.meds[i];
    var need='';
    if(s){
      if((s.id==='bandage'||s.id==='ifak')&&p.lBleed&&!p.hBleed)need=' need';
      if((s.id==='tourniquet'||s.id==='cms'||s.id==='surkit')&&p.hBleed)need=' need';
      if(s.id==='splint'&&p.frac)need=' need';
      var d=s.data||{};
      h+='<button class="ms-btn'+need+'" onclick="useMed('+i+')" title="'+(d.desc||d.name||'')+'"><span class="ms-key">'+(i+1)+'</span><span style="font-size:13px">'+(d.icon||'?')+'</span><span style="flex:1;font-size:11px;text-transform:uppercase;letter-spacing:.03em">'+esc(d.name||'?')+'</span>'+(s.qty>1?'<span style="font-size:11px;color:#4a5e4a">×'+s.qty+'</span>':'')+'</button>';
    }else{
      h+='<div style="display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px dashed #1e2e1e;font-size:11px;color:#2e4e2e;text-transform:uppercase"><span class="ms-key">'+(i+1)+'</span>пусто</div>';
    }
  }
  el.innerHTML=h;
}

function eatFood(invIdx){
  if(G.phase!=='play')return;
  var slot=G.inv[invIdx];if(!slot)return;
  var d=slot.data||{};
  if(d.cat!=='food')return;
  var isFood=slot.id==='food_can';
  var isWater=slot.id==='water';
  if(!isFood&&!isWater){log(d.name+': не съедобно','warn');return;}
  G.phase='eating';
  log('Употребляю '+d.name+'...','');
  var prog=0,total=4; // 2 секунды (400мс * 4 итерации * 0.5 = нет, 400*4=1.6с)
  var iv=setInterval(function(){
    if(G.phase==='dead'){clearInterval(iv);return;}
    prog++;
    var adj=adjE(G.player.row,G.player.col);
    if(adj!==-1){clearInterval(iv);G.phase='play';log('⚠ Враг прервал приём пищи!','danger');eHit(G.enemies[adj]);draw();return;}
    if(prog>=total){
      clearInterval(iv);
      G.phase='play';
      if(isFood){
        var oldH=G.player.hunger;
        G.player.hunger=Math.min(100,G.player.hunger+40);
        var hpGain=Math.min(G.player.maxHp-G.player.hp,8);
        if(hpGain>0){G.player.hp+=hpGain;}
        log('🍖 +' +(G.player.hunger-oldH)+' сытость'+(hpGain>0?' +'+hpGain+' HP':''),'good');
      } else {
        var oldT=G.player.thirst;
        G.player.thirst=Math.min(100,G.player.thirst+60);
        log('💧 +'+(G.player.thirst-oldT)+' жажда утолена','good');
      }
      // Убираем из инвентаря
      slot.qty=(slot.qty||1)-1;
      if(slot.qty<=0)G.inv.splice(invIdx,1);
      hud();renderInv();draw();
    }
  },400);
}

function renderInv(){
  var el=document.getElementById('raid-inv');if(!el)return;
  if(!G.inv.length){el.innerHTML='<div style="color:#4a5e4a;font-size:12px;text-align:center;padding:7px 0">Пусто</div>';return;}
  el.innerHTML=G.inv.map(function(item,idx){var d=item.data||{};
    var isFood=d.cat==='food';
    var btnHtml=isFood?'<button onclick="eatFood('+idx+')" style="font-size:10px;padding:1px 5px;border:1px solid #2e6b31;background:transparent;color:#4caf50;cursor:pointer;font-family:monospace">'+( item.id==='water'?'Выпить':'Съесть')+'</button>':'';
    return'<div style="display:flex;align-items:center;gap:5px;font-size:12px;padding:3px 0;border-bottom:1px solid #121812">'
      +'<span style="font-size:13px;flex-shrink:0">'+(d.icon||'?')+'</span>'
      +'<span style="flex:1;color:#7a967a;font-size:11px;text-transform:uppercase">'+esc(d.name||'?')+'</span>'
      +(item.qty>1?'<span style="color:#4caf50;font-size:11px">×'+item.qty+'</span>':'')
      +btnHtml
      +'</div>';
  }).join('');
}

// ══════ УТИЛИТЫ ══════
function inB(r,c){return r>=0&&r<G.rows&&c>=0&&c<G.cols;}
function eAt(r,c){for(var i=0;i<G.enemies.length;i++)if(G.enemies[i].r===r&&G.enemies[i].c===c)return i;return -1;}
function adjE(r,c){var ds=[[-1,0],[1,0],[0,-1],[0,1]];for(var d=0;d<ds.length;d++){var ei=eAt(r+ds[d][0],c+ds[d][1]);if(ei!==-1)return ei;}return -1;}
function setEl(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function log(txt,type){var el=document.getElementById('alog');if(!el)return;var d=document.createElement('div');d.className='log-line'+(type?' log-'+type:'');d.textContent=txt;el.appendChild(d);el.scrollTop=el.scrollHeight;while(el.children.length>60)el.removeChild(el.firstChild);}
function flashCanvas(){var c=document.getElementById('gc');if(!c)return;c.style.outline='2px solid #d94040';setTimeout(function(){if(c)c.style.outline='none';},120);}

document.addEventListener('keydown',function(e){
  if(G.phase!=='play')return;
  var map={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1],W:[-1,0],S:[1,0],A:[0,-1],D:[0,1]};
  var dir=map[e.key];
  if(dir){e.preventDefault();move(dir[0],dir[1]);}
  if(e.key==='1')useMed(0);if(e.key==='2')useMed(1);if(e.key==='3')useMed(2);
});
