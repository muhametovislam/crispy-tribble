// shared.js — всё общее: данные, хранилище, утилиты

// ══════════ ВАЛЮТА ══════════
var RUB = ' руб.';

// ══════════ ОРУЖИЕ ══════════
var WEAPONS = {
  fists:   {id:'fists',   name:'Кулаки',     icon:'✊', type:'melee',  dmg:[3,7],   crit:.05, speed:1, ammo:null,  noise:1,  value:0   },
  knife:   {id:'knife',   name:'Нож',        icon:'🔪', type:'melee',  dmg:[8,15],  crit:.15, speed:1, ammo:null,  noise:1,  value:120 },
  hatchet: {id:'hatchet', name:'Топор',      icon:'🪓', type:'melee',  dmg:[15,24], crit:.20, speed:2, ammo:null,  noise:2,  value:200 },
  crowbar: {id:'crowbar', name:'Монтировка', icon:'🔩', type:'melee',  dmg:[10,18], crit:.10, speed:1, ammo:null,  noise:2,  value:80  },
  pm:      {id:'pm',      name:'ПМ',         icon:'🔫', type:'pistol', dmg:[18,26], crit:.10, speed:1, ammo:'9mm', noise:8,  value:350 },
  mp5:     {id:'mp5',     name:'MP5',        icon:'🔫', type:'smg',    dmg:[16,23], crit:.10, speed:1, ammo:'9mm', noise:9,  value:750 },
  shotgun: {id:'shotgun', name:'Дробовик',   icon:'🔫', type:'shotgun',dmg:[38,58], crit:.25, speed:3, ammo:'12ga',noise:12, value:600 },
  ak74:    {id:'ak74',    name:'АК-74',      icon:'🔫', type:'rifle',  dmg:[28,38], crit:.15, speed:1, ammo:'545', noise:12, value:1200},
  svd:     {id:'svd',     name:'СВД',        icon:'🔫', type:'sniper', dmg:[58,82], crit:.35, speed:3, ammo:'762', noise:14, value:2500},
};

// ══════════ БРОНЯ ══════════
var ARMORS = {
  none:  {id:'none',  name:'Без брони',   class:0, absorb:0,   dur:0,   maxDur:0,   value:0   },
  vest1: {id:'vest1', name:'Жилет I',     class:1, absorb:.15, dur:80,  maxDur:80,  value:200 },
  vest2: {id:'vest2', name:'Жилет II',    class:2, absorb:.25, dur:100, maxDur:100, value:400 },
  vest3: {id:'vest3', name:'6Б23',        class:3, absorb:.38, dur:120, maxDur:120, value:800 },
  vest4: {id:'vest4', name:'6Б43',        class:4, absorb:.50, dur:150, maxDur:150, value:1500},
};

// ══════════ МЕДИЦИНА ══════════
var MEDICALS = {
  bandage:     {id:'bandage',     name:'Бинт',        icon:'🩹', useTime:3,  heals:0,  stops:'light_bleed',           desc:'Лёгкое кровотечение',       value:40 },
  tourniquet:  {id:'tourniquet',  name:'Жгут',        icon:'🩺', useTime:4,  heals:0,  stops:'heavy_bleed',           desc:'Тяжёлое кровотечение',      value:80 },
  splint:      {id:'splint',      name:'Шина',        icon:'🦴', useTime:5,  heals:0,  stops:'fracture',              desc:'Перелом',                   value:60 },
  medkit:      {id:'medkit',      name:'Аптечка',     icon:'🏥', useTime:4,  heals:40, stops:null,                    desc:'+40 HP',                    value:150},
  painkillers: {id:'painkillers', name:'Обезболив.',  icon:'💊', useTime:2,  heals:0,  stops:'pain',                  desc:'Болевой шок',               value:50 },
  ifak:        {id:'ifak',        name:'IFAK',        icon:'💉', useTime:5,  heals:25, stops:'light_bleed',           desc:'+25 HP + лёгкое кровотеч.', value:200},
  cms:         {id:'cms',         name:'CMS набор',   icon:'🧰', useTime:6,  heals:0,  stops:'heavy_bleed|fracture',  desc:'Кровотеч. + перелом',       value:300},
  surkit:      {id:'surkit',      name:'Хирнабор',    icon:'🔬', useTime:10, heals:60, stops:'heavy_bleed|fracture',  desc:'+60 HP + кровотеч.+перелом',value:400},
  promedol:    {id:'promedol',    name:'Промедол',    icon:'💉', useTime:3,  heals:15, stops:'pain',                  desc:'+15 HP + боль',             value:180},
};

// ══════════ ПРЕДМЕТЫ ══════════
var ITEMS = {
  ammo_9mm:   {id:'ammo_9mm',   name:'9мм патроны',   icon:'🟡', cat:'ammo',      ammoType:'9mm',  stackQty:15, value:2  },
  ammo_545:   {id:'ammo_545',   name:'5.45мм',        icon:'🔴', cat:'ammo',      ammoType:'545',  stackQty:30, value:3  },
  ammo_12ga:  {id:'ammo_12ga',  name:'Дробь 12ga',    icon:'🟤', cat:'ammo',      ammoType:'12ga', stackQty:8,  value:5  },
  ammo_762:   {id:'ammo_762',   name:'7.62 снайп.',   icon:'🟠', cat:'ammo',      ammoType:'762',  stackQty:10, value:8  },
  food_can:   {id:'food_can',   name:'Тушёнка',       icon:'🥫', cat:'food',      stackQty:1,      value:25 },
  water:      {id:'water',      name:'Вода',          icon:'💧', cat:'food',      stackQty:1,      value:20 },
  gold_chain: {id:'gold_chain', name:'Золотая цепь',  icon:'⛓',  cat:'valuables', stackQty:1,      value:400},
  gold_watch: {id:'gold_watch', name:'Золотые часы',  icon:'⌚', cat:'valuables', stackQty:1,      value:350},
  diamond:    {id:'diamond',    name:'Бриллиант',     icon:'💎', cat:'valuables', stackQty:1,      value:800},
  flash_drive:{id:'flash_drive',name:'Флешка',        icon:'💾', cat:'valuables', stackQty:1,      value:200},
  documents:  {id:'documents',  name:'Документы',     icon:'📄', cat:'valuables', stackQty:1,      value:250},
  key_safe:   {id:'key_safe',   name:'Ключ от сейфа', icon:'🗝', cat:'key',       opensLock:'safe',   stackQty:1, value:350},
  key_bunker: {id:'key_bunker', name:'Ключ бункера',  icon:'🗝', cat:'key',       opensLock:'bunker', stackQty:1, value:250},
  key_office: {id:'key_office', name:'Ключ офиса',    icon:'🗝', cat:'key',       opensLock:'cabinet',stackQty:1, value:150},
  tools:      {id:'tools',      name:'Инструменты',   icon:'🔧', cat:'craft',     stackQty:1,      value:70 },
  scrap:      {id:'scrap',      name:'Металлолом',    icon:'⚙',  cat:'craft',     stackQty:1,      value:20 },
  wire:       {id:'wire',       name:'Провода',       icon:'🔌', cat:'craft',     stackQty:1,      value:50 },
  fuel:       {id:'fuel',       name:'Канистра',      icon:'⛽', cat:'craft',     stackQty:1,      value:90 },
  scrap_metal:{id:'scrap_metal',name:'Металлолом',    icon:'🔩', cat:'craft',     stackQty:1,      value:20 },
};

// ══════════ ТОРГОВЦЫ ══════════
var TRADERS = [
  {
    id:'therapist', name:'Терапевт', icon:'🏥', color:'#4caf50',
    desc:'Медикаменты и еда. Лучшая цена на ценности.',
    buys:['medical','valuables','food'], buyRate:0.65,
    sells:[
      {ref:'medical', id:'bandage',    qty:5,  price:150},
      {ref:'medical', id:'tourniquet', qty:3,  price:200},
      {ref:'medical', id:'splint',     qty:2,  price:110},
      {ref:'medical', id:'medkit',     qty:1,  price:130},
      {ref:'medical', id:'painkillers',qty:4,  price:160},
      {ref:'medical', id:'ifak',       qty:1,  price:175},
      {ref:'medical', id:'cms',        qty:1,  price:270},
      {ref:'item',    id:'food_can',   qty:5,  price:100},
      {ref:'item',    id:'water',      qty:5,  price:80 },
    ]
  },
  {
    id:'mechanic', name:'Механик', icon:'🔧', color:'#e6a817',
    desc:'Холодное оружие и крафтовые материалы.',
    buys:['weapon','craft'], buyRate:0.55,
    sells:[
      {ref:'weapon', id:'knife',   qty:1, price:100},
      {ref:'weapon', id:'hatchet', qty:1, price:180},
      {ref:'weapon', id:'crowbar', qty:1, price:80 },
      {ref:'item',   id:'tools',   qty:1, price:60 },
      {ref:'item',   id:'wire',    qty:3, price:120},
      {ref:'item',   id:'fuel',    qty:1, price:85 },
    ]
  },
  {
    id:'skier', name:'Лыжник', icon:'🔫', color:'#4a8fbd',
    desc:'Пистолеты, патроны, лёгкая броня.',
    buys:['ammo','armor','key'], buyRate:0.50,
    sells:[
      {ref:'weapon', id:'pm',       qty:1,  price:290},
      {ref:'item',   id:'ammo_9mm', qty:30, price:55 },
      {ref:'item',   id:'ammo_12ga',qty:16, price:75 },
      {ref:'armor',  id:'vest1',    qty:1,  price:175},
      {ref:'armor',  id:'vest2',    qty:1,  price:340},
      {ref:'item',   id:'key_office',qty:1, price:130},
    ]
  },
  {
    id:'peacekeeper', name:'Миротворец', icon:'🪖', color:'#c0392b',
    desc:'Штурмовые винтовки и тяжёлая броня.',
    buys:['weapon','armor','ammo'], buyRate:0.52,
    sells:[
      {ref:'weapon', id:'mp5',     qty:1,  price:700 },
      {ref:'weapon', id:'shotgun', qty:1,  price:570 },
      {ref:'weapon', id:'ak74',    qty:1,  price:1100},
      {ref:'item',   id:'ammo_545',qty:30, price:85  },
      {ref:'armor',  id:'vest3',   qty:1,  price:680 },
    ]
  },
  {
    id:'fence', name:'Барыга', icon:'💰', color:'#8B7355',
    desc:'Покупает всё. Редкие товары.',
    buys:['valuables','key','weapon','armor','medical','ammo','food','craft'], buyRate:0.35,
    sells:[
      {ref:'weapon', id:'svd',       qty:1,  price:2400},
      {ref:'armor',  id:'vest4',     qty:1,  price:1400},
      {ref:'medical',id:'surkit',    qty:1,  price:350 },
      {ref:'medical',id:'promedol',  qty:2,  price:290 },
      {ref:'item',   id:'key_safe',  qty:1,  price:310 },
      {ref:'item',   id:'ammo_762',  qty:20, price:150 },
    ]
  },
];

// ══════════ КАРТЫ ══════════
// Все строки ровно 20 символов
// @ = старт, < = выход, # = стена, . = пол
// c=ящик, S=сейф(locked), l=шкафчик, o=бочка, C=воен.ящик(locked), b=рюкзак, d=стол, f=картотека(locked)
var MAPS = [
  {
    id:0, name:'Заброшенный завод', sub:'Цех №3',
    desc:'Запах масла и крови.',
    time:120, diff:1,
    theme:{bg:'#080c08',wall:'#1a2a1a',wallFg:'#2d472d',floor:'#0d140d',floorFg:'#172217'},
    enemies:['zombie','runner','crawler'], humanChance:.04,
    bias:['ammo_9mm','tools','scrap','food_can','bandage'],
    rows:[
      '####################',
      '#@................##',
      '#.####.######.####.#',
      '#.#..#........#..#.#',
      '#...d#.##..##...c#.#',
      '#.#..#.#....#.#..#.#',
      '#.####.#.SS.#.####.#',
      '#......#.##.#......#',
      '#.####.#....#.####.#',
      '#.#..#.######.#..#.#',
      '#...d#..........c#.#',
      '#.#..#.##..##.#..#.#',
      '#.####.#....#.####.#',
      '#......#.od.#......#',
      '#.####.######.####.#',
      '#.#..#........#..#.#',
      '#.#.b#.######.#.C#.#',
      '#.#..............#.#',
      '#.#####.######.####.',
      '#.................<#',
    ]
  },
  {
    id:1, name:'Торговый центр', sub:'1-й этаж',
    desc:'Разбитые витрины, тела у касс.',
    time:105, diff:2,
    theme:{bg:'#09080a',wall:'#1e1510',wallFg:'#302015',floor:'#100d09',floorFg:'#191309'},
    enemies:['zombie','runner','fat','crawler'], humanChance:.07,
    bias:['food_can','water','pm','ammo_9mm','gold_chain'],
    rows:[
      '####################',
      '#@..........d......#',
      '#.##################',
      '#..................#',
      '###.######.#######.#',
      '#...#....#.#.....#.#',
      '#.b.#.c.......S..#.#',
      '#...#....#.#.....#.#',
      '###.######.#######.#',
      '#..................#',
      '#.##################',
      '#..........f.......#',
      '##.######.#######.##',
      '#..#....#.#........#',
      '#.f#.c..#.#.b......#',
      '#..#......#........#',
      '##.######.##########',
      '#..................#',
      '##.#################',
      '#.................<#',
    ]
  },
  {
    id:2, name:'Военная база', sub:'Периметр',
    desc:'Боец-зомби за каждым углом.',
    time:90, diff:3,
    theme:{bg:'#080a0e',wall:'#0f1820',wallFg:'#152030',floor:'#090d12',floorFg:'#0e1319'},
    enemies:['soldier_z','fat','runner','zombie'], humanChance:.14,
    bias:['ak74','ammo_545','vest2','vest3','surkit'],
    rows:[
      '####################',
      '#@..C..#...C.......#',
      '#..............#...#',
      '#.######.#######.###',
      '#......#.......#...#',
      '#..C...#...S...#...#',
      '#......#.......#...#',
      '##.##########.######',
      '#.............#b...#',
      '##.##########.###.##',
      '#......#.......#...#',
      '#..C...#...C...#S..#',
      '#......#.......#...#',
      '#.######.#######.###',
      '#......#.......#...#',
      '#..b...#...C.......#',
      '#......#.......#...#',
      '##.##############.##',
      '#.................<#',
      '####################',
    ]
  },
  {
    id:3, name:'Больница', sub:'Корпус А',
    desc:'Много медикаментов и мертвецов.',
    time:100, diff:2,
    theme:{bg:'#08080e',wall:'#141520',wallFg:'#1e2030',floor:'#0d0d14',floorFg:'#13131e'},
    enemies:['zombie','crawler','screamer','fat'], humanChance:.05,
    bias:['medkit','bandage','tourniquet','ifak','surkit','promedol'],
    rows:[
      '####################',
      '#@..f..#.f..#.f....#',
      '#......#...........#',
      '#..###############.#',
      '#..#.......#.......#',
      '#..#..f....#..S....#',
      '#..........#.......#',
      '#..###############.#',
      '#..................#',
      '#######.############',
      '#.....#............#',
      '#..f........f......#',
      '#.....#............#',
      '#######.##########.#',
      '#..................#',
      '#.f.........f......#',
      '###..##########..###',
      '#..................#',
      '##.#################',
      '#.................<#',
    ]
  },
  {
    id:4, name:'Подземный бункер', sub:'Уровень -2',
    desc:'Здесь хранили самое ценное.',
    time:80, diff:4,
    theme:{bg:'#080c08',wall:'#1a2a1a',wallFg:'#2d472d',floor:'#0d140d',floorFg:'#172217'},
    enemies:['soldier_z','fat','screamer'], humanChance:.22,
    bias:['ak74','svd','vest3','vest4','ammo_762','diamond','key_safe'],
    rows:[
      '####################',
      '#@.S..#...S...#....#',
      '#.............#....#',
      '#.#####.#######.###.',
      '#.#...........#....#',
      '#.#.S...C...S.#....#',
      '#.#...........#....#',
      '#.#############....#',
      '#.................f#',
      '#.#############....#',
      '#.#...........#....#',
      '#.#.C...S...C.#....#',
      '#.#...........#....#',
      '#.#####.#######.###.',
      '#.....#.......#....#',
      '#..C..#...S...#....#',
      '#.....#.......#....#',
      '#########.######.###',
      '#.................<#',
      '####################',
    ]
  },
];

// ══════════ КОНТЕЙНЕРЫ ══════════
var CONTAINERS = {
  chest:   {name:'Ящик',       color:'#8B7355', lockColor:'#8B7355', time:3, loot:[1,3], locked:false, openChance:0   },
  safe:    {name:'Сейф',       color:'#FFD700', lockColor:'#FFD700', time:8, loot:[2,4], locked:true,  openChance:.12 },
  locker:  {name:'Шкафчик',    color:'#6B8E6B', lockColor:'#6B8E6B', time:2, loot:[1,2], locked:false, openChance:0   },
  barrel:  {name:'Бочка',      color:'#8B4513', lockColor:'#8B4513', time:2, loot:[1,2], locked:false, openChance:0   },
  crate:   {name:'Воен.ящик',  color:'#7CFC00', lockColor:'#7CFC00', time:4, loot:[2,4], locked:true,  openChance:.10 },
  bag:     {name:'Рюкзак',     color:'#D2B48C', lockColor:'#D2B48C', time:3, loot:[1,3], locked:false, openChance:0   },
  desk:    {name:'Стол',       color:'#6B8E23', lockColor:'#6B8E23', time:2, loot:[1,2], locked:false, openChance:0   },
  cabinet: {name:'Картотека',  color:'#87CEEB', lockColor:'#87CEEB', time:3, loot:[1,2], locked:true,  openChance:.20 },
};

var CHAR_TO_CTYPE = {c:'chest',S:'safe',s:'safe',l:'locker',o:'barrel',C:'crate',B:'crate',b:'bag',d:'desk',f:'cabinet',F:'cabinet'};
var LOCKED_CHARS  = {S:true, C:true, f:true};

var LOOT_POOLS = {
  chest:   {pool:['food_can','water','scrap','tools','bandage','ammo_9mm','ammo_545']},
  safe:    {pool:['gold_chain','gold_watch','diamond','flash_drive','documents','key_safe','key_bunker']},
  locker:  {pool:['food_can','water','scrap','bandage','ammo_9mm']},
  barrel:  {pool:['ammo_9mm','ammo_545','scrap','fuel','food_can']},
  crate:   {pool:['ak74','ammo_545','vest2','vest3','surkit','cms']},
  bag:     {pool:['medkit','bandage','food_can','water','ammo_9mm']},
  desk:    {pool:['documents','flash_drive','tools','scrap']},
  cabinet: {pool:['bandage','medkit','tourniquet','ifak','surkit','promedol']},
};

// ══════════ ВРАГИ ══════════
var ENEMIES = {
  zombie:    {name:'Зомби',      ch:'z', fg:'#c0392b', hp:35,  dmg:[6,12],  spd:3, bleed:.20, frac:.04, loot:.25, type:'zombie'},
  runner:    {name:'Бегун',      ch:'r', fg:'#e74c3c', hp:22,  dmg:[5,9],   spd:1, bleed:.10, frac:.02, loot:.15, type:'zombie'},
  fat:       {name:'Толстяк',    ch:'F', fg:'#922b21', hp:90,  dmg:[15,24], spd:4, bleed:.30, frac:.10, loot:.50, type:'zombie'},
  soldier_z: {name:'Боец-зомби', ch:'Z', fg:'#7b241c', hp:65,  dmg:[10,18], spd:2, bleed:.25, frac:.06, loot:.60, type:'zombie'},
  crawler:   {name:'Ползун',     ch:'q', fg:'#a93226', hp:18,  dmg:[4,8],   spd:2, bleed:.40, frac:.02, loot:.10, type:'zombie'},
  screamer:  {name:'Крикун',     ch:'K', fg:'#e67e22', hp:30,  dmg:[3,6],   spd:2, bleed:.10, frac:.01, loot:.15, type:'zombie', special:'alert'},
  raider:    {name:'Мародёр',    ch:'m', fg:'#5d6d7e', hp:55,  dmg:[12,20], spd:2, bleed:.30, frac:.05, loot:.80, type:'human'},
  deserter:  {name:'Дезертир',   ch:'D', fg:'#2c3e50', hp:80,  dmg:[22,34], spd:2, bleed:.40, frac:.08, loot:.90, type:'human'},
};

// ══════════ УЛУЧШЕНИЯ УБЕЖИЩА ══════════
var UPGRADES = {
  stash:      {name:'Схрон',       icon:'📦', desc:'Вместимость',
    levels:[{name:'Коробки',cap:20,cost:0,mats:[]},{name:'Полки',cap:40,cost:500,mats:[{id:'tools',n:2},{id:'scrap',n:3}]},{name:'Стеллаж',cap:80,cost:1500,mats:[{id:'tools',n:3},{id:'wire',n:2}]},{name:'Бункер',cap:999,cost:4000,mats:[{id:'tools',n:5},{id:'fuel',n:2}]}]},
  medstation: {name:'Медпункт',    icon:'🏥', desc:'Восстановление HP',
    levels:[{name:'Нет',healPerHp:0,cost:0,mats:[]},{name:'Аптечка',healPerHp:5,cost:400,mats:[{id:'tools',n:1}]},{name:'Медпункт',healPerHp:3,cost:1200,mats:[{id:'tools',n:3},{id:'wire',n:2}]},{name:'Клиника',healPerHp:2,cost:3000,mats:[{id:'tools',n:5},{id:'scrap',n:5}]}]},
  heating:    {name:'Отопление',   icon:'🔥', desc:'Бонус макс. HP',
    levels:[{name:'Нет',hpBonus:0,cost:0,mats:[]},{name:'Буржуйка',hpBonus:5,cost:300,mats:[{id:'scrap',n:5},{id:'fuel',n:1}]},{name:'Котёл',hpBonus:10,cost:800,mats:[{id:'scrap',n:8},{id:'wire',n:3}]},{name:'Центральное',hpBonus:20,cost:2500,mats:[{id:'tools',n:4},{id:'wire',n:5}]}]},
  security:   {name:'Безопасность',icon:'🔒', desc:'% лута при смерти',
    levels:[{name:'Нет',save:0,cost:0,mats:[]},{name:'Засов',save:.10,cost:350,mats:[{id:'scrap',n:4}]},{name:'Решётки',save:.20,cost:1000,mats:[{id:'scrap',n:10},{id:'tools',n:2}]},{name:'Бронедверь',save:.35,cost:2800,mats:[{id:'tools',n:5},{id:'wire',n:3}]}]},
};

// ══════════ СТАРТОВЫЙ СХРОН ══════════
var STARTER = [
  {uid:'s1',type:'weapon', id:'fists',      qty:1, data:WEAPONS.fists},
  {uid:'s2',type:'weapon', id:'knife',       qty:1, data:WEAPONS.knife},
  {uid:'s3',type:'medical',id:'bandage',     qty:3, data:MEDICALS.bandage},
  {uid:'s4',type:'medical',id:'tourniquet',  qty:1, data:MEDICALS.tourniquet},
  {uid:'s5',type:'medical',id:'painkillers', qty:2, data:MEDICALS.painkillers},
  {uid:'s6',type:'item',   id:'food_can',    qty:3, data:ITEMS.food_can},
  {uid:'s7',type:'item',   id:'water',       qty:2, data:ITEMS.water},
];

// ══════════ ХРАНИЛИЩЕ ══════════
var DB_KEY   = 'rl_db';
var AUTH_KEY = 'rl_auth';

function getDB(){try{return JSON.parse(localStorage.getItem(DB_KEY))||{users:{}};}catch{return{users:{}};}}
function saveDB(db){localStorage.setItem(DB_KEY,JSON.stringify(db));}
function getCurLogin(){return localStorage.getItem(AUTH_KEY);}
function getCurUser(){var l=getCurLogin();if(!l)return null;return getDB().users[l]||null;}
function saveCurUser(u){var db=getDB();db.users[u.login]=u;saveDB(db);}

function register(login,pass){
  if(!login||!pass)         return{ok:false,err:'Заполни оба поля'};
  if(login.length<3)        return{ok:false,err:'Логин мин. 3 символа'};
  if(pass.length<4)         return{ok:false,err:'Пароль мин. 4 символа'};
  if(!/^[a-zA-Z0-9_]+$/.test(login)) return{ok:false,err:'Только a-z 0-9 _'};
  var db=getDB();
  if(db.users[login])       return{ok:false,err:'Логин занят'};
  db.users[login]={
    login, pw:hashPw(pass),
    hp:100, maxHp:100, money:500,
    shelter:{upgrades:{stash:0,medstation:0,heating:0,security:0}},
    stash:JSON.parse(JSON.stringify(STARTER)),
    equipped:{weapon:'fists',armor:'none',ammo:0,meds:[null,null,null]},
    stats:{runs:0,survived:0,kills:0},
    runs:[],
  };
  saveDB(db);
  return{ok:true};
}

function login(login,pass){
  var db=getDB(),u=db.users[login];
  if(!u)               return{ok:false,err:'Пользователь не найден'};
  if(u.pw!==hashPw(pass)) return{ok:false,err:'Неверный пароль'};
  localStorage.setItem(AUTH_KEY,login);
  return{ok:true};
}
function logout(){localStorage.removeItem(AUTH_KEY);}

function stashCap(u){return UPGRADES.stash.levels[u.shelter.upgrades.stash||0].cap;}
function addToStash(u,item){if(u.stash.length>=stashCap(u))return false;u.stash.push(Object.assign({uid:uid()},item));return true;}
function countInStash(u,id){return u.stash.reduce(function(a,s){return s.id===id?a+(s.qty||1):a;},0);}

function doHeal(u,amount){
  var lvl=u.shelter.upgrades.medstation||0;
  var def=UPGRADES.medstation.levels[lvl];
  if(!def.healPerHp)return{ok:false,err:'Нет медпункта'};
  var miss=u.maxHp-u.hp, heal=Math.min(amount,miss);
  if(heal<=0)return{ok:false,err:'HP уже полное'};
  var cost=heal*def.healPerHp;
  if(u.money<cost)return{ok:false,err:'Нужно '+fm(cost)};
  u.money-=cost; u.hp+=heal;
  saveCurUser(u);
  return{ok:true,heal,cost};
}

function doUpgrade(u,key){
  var upg=UPGRADES[key];
  var cur=u.shelter.upgrades[key]||0;
  if(cur>=upg.levels.length-1)return{ok:false,err:'Макс уровень'};
  var next=upg.levels[cur+1];
  if(u.money<next.cost)return{ok:false,err:'Нужно '+fm(next.cost)};
  for(var i=0;i<next.mats.length;i++){
    var m=next.mats[i];
    if(countInStash(u,m.id)<m.n)return{ok:false,err:'Нужно '+( ITEMS[m.id]?ITEMS[m.id].name:m.id)+' ×'+m.n};
  }
  u.money-=next.cost;
  next.mats.forEach(function(m){
    var rem=m.n;
    for(var i=u.stash.length-1;i>=0&&rem>0;i--){
      var s=u.stash[i];
      if(s.id===m.id){var t=Math.min(s.qty||1,rem);rem-=t;s.qty=(s.qty||1)-t;if(s.qty<=0)u.stash.splice(i,1);}
    }
  });
  u.shelter.upgrades[key]++;
  // Обновить maxHp
  u.maxHp=100+(UPGRADES.heating.levels[u.shelter.upgrades.heating||0].hpBonus);
  saveCurUser(u);
  return{ok:true};
}

function doSell(u,stashUid,rate){
  var idx=u.stash.findIndex(function(s){return s.uid===stashUid;});
  if(idx===-1)return{ok:false,err:'Не найдено'};
  var item=u.stash[idx];
  var val=(item.data?item.data.value:0)||0;
  var earned=Math.floor(val*(rate||0.4)*(item.qty||1));
  u.money+=earned;
  u.stash.splice(idx,1);
  saveCurUser(u);
  return{ok:true,earned};
}

function doBuy(u,trader,offerIdx){
  var offer=trader.sells[offerIdx];
  if(!offer)return{ok:false,err:'Нет товара'};
  if(u.money<offer.price)return{ok:false,err:'Нужно '+fm(offer.price)};
  if(u.stash.length>=stashCap(u))return{ok:false,err:'Схрон переполнен'};
  u.money-=offer.price;
  var data=offer.ref==='weapon'?WEAPONS[offer.id]:offer.ref==='armor'?ARMORS[offer.id]:offer.ref==='medical'?MEDICALS[offer.id]:ITEMS[offer.id];
  addToStash(u,{type:offer.ref,id:offer.id,qty:offer.qty||1,data:data});
  saveCurUser(u);
  return{ok:true};
}

function saveRun(run){
  var u=getCurUser();if(!u)return;
  u.runs.unshift(run);
  if(u.runs.length>30)u.runs=u.runs.slice(0,30);
  u.stats.runs++;
  if(run.survived){
    u.stats.survived++;
    var secLvl=u.shelter.upgrades.security||0;
    run.loot.forEach(function(item){addToStash(u,item);});
  }
  u.stats.kills+=(run.kills||0);
  u.hp=Math.max(1,run.hpLeft);
  saveCurUser(u);
}

// ══════════ УТИЛИТЫ ══════════
function hashPw(s){var h=0;for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return'h'+Math.abs(h).toString(16);}
function uid(){return'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function pad(n){return n<10?'0'+n:''+n;}
function fm(n){return(n||0).toLocaleString('ru')+RUB;}
function fd(iso){var d=new Date(iso);return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes());}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

function pickLoot(ctypeKey, bias){
  var pool=LOOT_POOLS[ctypeKey]?LOOT_POOLS[ctypeKey].pool:LOOT_POOLS.chest.pool;
  var key;
  if(bias&&bias.length&&Math.random()<0.5){key=bias[Math.floor(Math.random()*bias.length)];}
  else{key=pool[Math.floor(Math.random()*pool.length)];}
  if(WEAPONS[key])  return{type:'weapon', id:key,data:WEAPONS[key], qty:1};
  if(ARMORS[key])   return{type:'armor',  id:key,data:ARMORS[key],  qty:1};
  if(MEDICALS[key]) return{type:'medical',id:key,data:MEDICALS[key],qty:rnd(1,3)};
  if(ITEMS[key])    return{type:'item',   id:key,data:ITEMS[key],   qty:rnd(1,ITEMS[key].stackQty||1)};
  return null;
}

function toast(msg,bad){
  var t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:18px;right:18px;background:#080e08;border:1px solid '+(bad?'#d94040':'#2e6b31')+';color:'+(bad?'#ff7070':'#76ff7a')+';font-family:"Courier New",monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:9px 15px;z-index:9999';
  t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},2500);
}
