"use strict";

(() => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const frame = canvas.parentElement;
  const startScreen = document.getElementById("start-screen");
  const mainMenu = document.getElementById("main-menu");
  const menuPanel = document.getElementById("menu-panel");
  const menuPanelControls = document.getElementById("menu-panel-controls");
  const menuPanelTitle = document.getElementById("menu-panel-title");
  const menuPanelCopy = document.getElementById("menu-panel-copy");
  const endScreen = document.getElementById("end-screen");
  const storyButton = document.getElementById("story-button");
  const freeButton = document.getElementById("free-button");
  const restartButton = document.getElementById("restart-button");
  const soundButton = document.getElementById("sound-button");
  const fullscreenButton = document.getElementById("fullscreen-button");
  const pauseButton = document.getElementById("pause-button");
  const pauseScreen = document.getElementById("pause-screen");
  const resumeButton = document.getElementById("resume-button");
  const exitButton = document.getElementById("exit-button");
  const levelupScreen = document.getElementById("levelup-screen");
  const upgradeChoices = document.getElementById("upgrade-choices");
  const shopSkip = document.getElementById("shop-skip");
  const shopLock = document.getElementById("shop-lock");
  const shopReroll = document.getElementById("shop-reroll");
  const scoreElement = document.getElementById("score");
  const sectorElement = document.getElementById("sector");
  const healthFill = document.getElementById("health-fill");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const keys = new Set();
  const pointer = { x: 0, y: 0, down: false, inside: false };
  const touchMove = { active: false, anchorX: 0, anchorY: 0, x: 0, y: 0 };
  const characters = [
    { id: "simple", name: "Banana Simples", skill: "Sem habilidade especial", stats: "Equilibrada · vida 100 · velocidade 210", mission: 0, damage: 1, speed: 210, maxHealth: 100, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#fff08a", "#ffd944", "#efa923"] },
    { id: "red", name: "Banana Vermelha", skill: "Fúria rubra · causa 40% mais dano", stats: "Dano 1,4 · vida 90 · velocidade 195", mission: 1, damage: 1.4, speed: 195, maxHealth: 90, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#ffc09b", "#e85b43", "#a82c30"] },
    { id: "green", name: "Banana Verde", skill: "Passo ligeiro · corre e dá dash mais rápido", stats: "Dano 1 · vida 90 · velocidade 260", mission: 2, damage: 1, speed: 260, maxHealth: 90, fireRate: .34, dashCooldown: .72, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#e3f38c", "#9acb38", "#4f812f"] },
    { id: "blue", name: "Banana Azul", skill: "Rajada azul · dispara mais rápido", stats: "Dano 0,9 · vida 95 · tiro 30% mais rápido", mission: 3, damage: .9, speed: 210, maxHealth: 95, fireRate: .24, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#b8e9ff", "#59b7e7", "#3574b7"] },
    { id: "tank", name: "Banana Tanque", skill: "Casca grossa · reduz dano recebido", stats: "Dano 1 · vida 155 · armadura 5", mission: 4, damage: 1, speed: 175, maxHealth: 155, fireRate: .38, dashCooldown: 1.4, armor: 5, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#fff0b6", "#c89b4b", "#765329"] },
    { id: "gold", name: "Banana Dourada", skill: "Ímã de moedas · coleta de mais longe", stats: "Dano 1 · vida 100 · alcance de coleta +35", mission: 5, damage: 1, speed: 205, maxHealth: 100, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 35, xpGain: 1, regen: 0, projectiles: 1, colors: ["#fff3a0", "#f7bd27", "#cf781b"] },
    { id: "purple", name: "Banana Roxa", skill: "Mente afiada · ganha o dobro de XP por moeda", stats: "Dano 1 · vida 90 · XP por moeda ×2", mission: 6, damage: 1, speed: 215, maxHealth: 90, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 2, regen: 0, projectiles: 1, colors: ["#f2c6ff", "#bd76dc", "#74459d"] },
    { id: "pink", name: "Banana Rosa", skill: "Regeneração · recupera vida com o tempo", stats: "Dano 1 · vida 90 · regenera 0,45 por segundo", mission: 7, damage: 1, speed: 210, maxHealth: 90, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: .45, projectiles: 1, colors: ["#ffd4df", "#ef8ba7", "#aa4e7a"] },
    { id: "orange", name: "Banana Laranja", skill: "Canhão triplo · começa com três sementes", stats: "Dano 0,8 · vida 100 · 3 projéteis", mission: 8, damage: .8, speed: 205, maxHealth: 100, fireRate: .38, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 3, colors: ["#ffe3a1", "#f5a13b", "#bd5726"] },
    { id: "black", name: "Banana Noturna", skill: "Sombra protetora · mais armadura e vida", stats: "Vida 130 · armadura 8 · velocidade 175", mission: 9, damage: 1, speed: 175, maxHealth: 130, fireRate: .38, dashCooldown: 1.3, armor: 8, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#b99b64", "#58413b", "#231f29"] },
    { id: "rainbow", name: "Banana Arco-Íris", skill: "Sorte colorida · ganha XP e moedas extras", stats: "Dano 1,1 · vida 105 · +1 moeda por coleta", mission: 10, damage: 1.1, speed: 210, maxHealth: 105, fireRate: .32, dashCooldown: 1.05, armor: 0, magnet: 8, xpGain: 1.5, coinBonus: 1, regen: 0, projectiles: 1, colors: ["#fff1a1", "#d768b4", "#557fd0"] },
    { id: "ice", name: "Banana Glacial", skill: "Casca congelada · fica invulnerável por mais tempo", stats: "Vida 120 · proteção 1,5s · velocidade 190", mission: 11, damage: .9, speed: 190, maxHealth: 120, fireRate: .36, dashCooldown: 1.2, armor: 2, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, hitCooldown: 1.5, colors: ["#e1fcff", "#75cfe4", "#4381bd"] },
    { id: "fire", name: "Banana Vulcânica", skill: "Sementes ardentes · dano alto e disparo potente", stats: "Dano 1,8 · vida 80 · tiro lento", mission: 12, damage: 1.8, speed: 205, maxHealth: 80, fireRate: .48, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#ffe071", "#f06b35", "#a92b27"] },
    { id: "silver", name: "Banana Prateada", skill: "Passo fantasma · velocidade e dash aprimorados", stats: "Velocidade 285 · dash 0,55s · vida 85", mission: 13, damage: .9, speed: 285, maxHealth: 85, fireRate: .34, dashCooldown: .55, armor: 0, magnet: 0, xpGain: 1, regen: 0, projectiles: 1, colors: ["#f4ffff", "#b9c8d2", "#788d9d"] },
    { id: "spotted", name: "Banana Pintada", skill: "Farejadora de moedas · atrai moedas e ganha XP", stats: "Ímã +55 · XP ×2 · vida 95", mission: 14, damage: 1, speed: 200, maxHealth: 95, fireRate: .35, dashCooldown: 1.1, armor: 0, magnet: 55, xpGain: 2, regen: 0, projectiles: 1, colors: ["#fff1ad", "#f2d05c", "#9d6c37"] },
    { id: "king", name: "Banana Rei", skill: "Coroa do pomar · vida, dano e armadura", stats: "Dano 1,3 · vida 125 · armadura 3", mission: 15, damage: 1.3, speed: 195, maxHealth: 125, fireRate: .33, dashCooldown: 1.05, armor: 3, magnet: 12, xpGain: 1, regen: .1, projectiles: 1, colors: ["#fff3a4", "#e9bd3e", "#a86c24"] }
  ];
  const game = {
    active: false, paused: false, score: 0, best: 0, health: 100, elapsed: 0, lastTime: 0,
    mode: "story", missionIndex: 0, missionProgress: 0, difficulty: 1, waveSpawnRemaining: 0,
    waveElapsed: 0, waveEnemyGoal: 5, waveKills: 0, bossWave: false, bossActive: false, level: 1, xp: 0, xpNext: 8, materials: 0,
    phaseEnding: false,
    characterId: "simple", unlockedCharacters: ["simple"], completedMissions: [],
    spawnClock: 0, shotClock: 0, dashClock: 0, invulnerable: 0,
    combo: 0, comboClock: 0,
    player: null, enemies: [], coins: [], bullets: [], particles: [], stars: [],
    sound: true, audio: null, width: 0, height: 0, dpr: 1,
    waveDuration: 60, coinsCollected: 0, enemiesKilled: 0, bossesDefeated: 0,
    damageNumbers: [], weapons: [], items: {}, upgrades: [], shopLocked: false,
    shopOffer: [], stats: null, seeds: 0, permanent: {}, eventName: "", eventClock: 0
  };

  const WEAPONS = [
    { id:"seed", name:"Semente de Banana", rarity:"COMUM", description:"Projétil rápido e preciso.", damage:1, cooldown:.34, projectileSpeed:510, projectiles:1, range:.72, knockback:2, behavior:"straight" },
    { id:"vine", name:"Estilingue de Cipó", rarity:"INCOMUM", description:"Empurra inimigos com força.", damage:1.3, cooldown:.48, projectileSpeed:430, projectiles:1, range:.95, knockback:18, behavior:"knockback" },
    { id:"boomerang", name:"Bananerangue", rarity:"RARO", description:"Vai até o alvo e retorna.", damage:1.5, cooldown:.72, projectileSpeed:380, projectiles:1, range:1.2, knockback:8, behavior:"boomerang" },
    { id:"rain", name:"Chuva de Bananas", rarity:"RARO", description:"Dispara em vários sentidos.", damage:.65, cooldown:.9, projectileSpeed:360, projectiles:5, range:.75, knockback:3, behavior:"spread" },
    { id:"shell", name:"Casca Explosiva", rarity:"ÉPICO", description:"Projétil que explode ao acertar.", damage:1.8, cooldown:1.05, projectileSpeed:300, projectiles:1, range:.9, knockback:10, behavior:"explosive" },
    { id:"pulp", name:"Canhão de Polpa", rarity:"INCOMUM", description:"Projétil pesado de alto dano.", damage:3.2, cooldown:1.35, projectileSpeed:260, projectiles:1, range:1.2, knockback:22, behavior:"heavy" },
    { id:"rot", name:"Podre de Área", rarity:"RARO", description:"Deixa dano persistente no chão.", damage:.8, cooldown:1.5, projectileSpeed:220, projectiles:1, range:.8, knockback:0, behavior:"area" },
    { id:"bolt", name:"Raio Tropical", rarity:"ÉPICO", description:"Encadeia dano entre inimigos.", damage:1.4, cooldown:.8, projectileSpeed:620, projectiles:1, range:1.1, knockback:2, behavior:"chain" },
    { id:"mill", name:"Moinho de Cascas", rarity:"RARO", description:"Cascas giram ao redor da banana.", damage:1.1, cooldown:.55, projectileSpeed:180, projectiles:3, range:1, knockback:6, behavior:"orbit" },
    { id:"vortex", name:"Laranja Vortex", rarity:"LENDÁRIO", description:"Puxa os inimigos para o centro.", damage:.9, cooldown:1.25, projectileSpeed:200, projectiles:1, range:1.3, knockback:-28, behavior:"vortex" },
    { id:"thorn", name:"Espinho Selvagem", rarity:"INCOMUM", description:"Perfura vários inimigos.", damage:.95, cooldown:.6, projectileSpeed:470, projectiles:1, range:1.1, knockback:4, behavior:"pierce" },
    { id:"sun", name:"Sol de Casca", rarity:"ÉPICO", description:"Emite pulsos solares ao redor.", damage:1.3, cooldown:1.1, projectileSpeed:320, projectiles:8, range:.65, knockback:5, behavior:"radial" }
  ];

  const ITEMS = [
    { id:"magnet", name:"Ímã de Cobre", rarity:"COMUM", effect:{pickupRange:18}, description:"+18 alcance de coleta" },
    { id:"armor", name:"Casca de Ferro", rarity:"INCOMUM", effect:{armor:3}, description:"+3 armadura" },
    { id:"vitamin", name:"Vitamina de Banana", rarity:"COMUM", effect:{maxHealth:25}, description:"+25 vida máxima" },
    { id:"coffee", name:"Café do Pomar", rarity:"RARO", effect:{attackSpeed:.15}, description:"+15% velocidade de ataque" },
    { id:"sneakers", name:"Tênis de Cipó", rarity:"COMUM", effect:{moveSpeed:.12}, description:"+12% velocidade" },
    { id:"lens", name:"Lupa Tropical", rarity:"INCOMUM", effect:{range:.15}, description:"+15% alcance" },
    { id:"golden", name:"Cacho Dourado", rarity:"RARO", effect:{coinGain:.2}, description:"+20% moedas" },
    { id:"leaf", name:"Folha de Energia", rarity:"COMUM", effect:{healthRegen:.45}, description:"+0,45 vida por segundo" },
    { id:"bag", name:"Saco de Sementes", rarity:"RARO", effect:{projectileCount:1}, description:"+1 projétil" },
    { id:"pulp", name:"Polpa Concentrada", rarity:"INCOMUM", effect:{damage:.2}, description:"+20% dano" },
    { id:"steel", name:"Sementes de Aço", rarity:"RARO", effect:{damage:.12,critChance:.03}, description:"+12% dano e +3% crítico" },
    { id:"emerald", name:"Broto Esmeralda", rarity:"ÉPICO", effect:{lifesteal:.03}, description:"3% roubo de vida" },
    { id:"hourglass", name:"Ampulheta Solar", rarity:"RARO", effect:{duration:.2}, description:"+20% duração de efeitos" },
    { id:"clover", name:"Trevo da Colheita", rarity:"LENDÁRIO", effect:{luck:.12,coinGain:.1}, description:"+12 sorte e +10% moedas" },
    { id:"crown", name:"Coroa de Casca", rarity:"ÉPICO", effect:{maxHealth:15,damage:.1}, description:"+15 vida e +10% dano" },
    { id:"gloves", name:"Luvas Tropicais", rarity:"INCOMUM", effect:{cooldownReduction:.1}, description:"10% menos recarga" }
  ];

  const BUFFS = [
    { id:"damage", name:"Polpa Poderosa", description:"+15% dano", rarity:"COMUM", apply:()=>{ game.stats.damage*=1.15; game.player.damage=game.stats.damage; } },
    { id:"attack", name:"Rajada do Pomar", description:"-12% recarga dos disparos", rarity:"COMUM", apply:()=>{ game.player.fireRate=Math.max(.08,game.player.fireRate*.88); } },
    { id:"speed", name:"Passo de Cipó", description:"+12% velocidade", rarity:"COMUM", apply:()=>{ game.stats.moveSpeed*=1.12; game.player.speed=game.stats.moveSpeed; } },
    { id:"health", name:"Casca Revigorada", description:"+25 vida máxima e cura", rarity:"INCOMUM", apply:()=>{ game.stats.maxHealth+=25; game.player.maxHealth=game.stats.maxHealth; game.health=Math.min(game.health+25,game.stats.maxHealth); } },
    { id:"magnet", name:"Ímã Natural", description:"+25 alcance de coleta", rarity:"COMUM", apply:()=>{ game.stats.pickupRange+=25; game.player.coinMagnet=game.stats.pickupRange; } },
    { id:"crit", name:"Ponta Afiada", description:"+8% chance de crítico", rarity:"RARO", apply:()=>{ game.stats.critChance+=.08; } },
    { id:"critDamage", name:"Fúria Vermelha", description:"+30% dano crítico", rarity:"RARO", apply:()=>{ game.stats.critDamage+=.30; } },
    { id:"projectiles", name:"Saco de Sementes", description:"+1 projétil", rarity:"ÉPICO", apply:()=>{ game.stats.projectileCount++; game.player.projectiles=game.stats.projectileCount; } },
    { id:"armor", name:"Casca Blindada", description:"+3 armadura", rarity:"INCOMUM", apply:()=>{ game.stats.armor+=3; game.player.armor=game.stats.armor; } },
    { id:"regen", name:"Seiva Fresca", description:"+0,6 vida por segundo", rarity:"RARO", apply:()=>{ game.stats.healthRegen+=.6; game.player.regen=game.stats.healthRegen; } },
    { id:"luck", name:"Trevo do Pomar", description:"+8 sorte", rarity:"RARO", apply:()=>{ game.stats.luck+=.08; } },
    { id:"range", name:"Braço Comprido", description:"+15% alcance dos ataques", rarity:"INCOMUM", apply:()=>{ game.stats.range+=.15; } }
  ];

  try {
    game.best = Number(localStorage.getItem("bronana-best")) || 0;
    const unlocked = JSON.parse(localStorage.getItem("bronana-characters") || "[\"simple\"]");
    const completed = JSON.parse(localStorage.getItem("bronana-missions") || "[]");
    if (Array.isArray(unlocked)) game.unlockedCharacters = [...new Set(["simple", ...unlocked])];
    if (Array.isArray(completed)) game.completedMissions = completed;
    const selected = localStorage.getItem("bronana-selected-character");
    if (selected && game.unlockedCharacters.includes(selected)) game.characterId = selected;
  } catch (error) {
    game.best = 0;
  }

  const SaveManager = {
    key: "bronana-save",
    load() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.key) || "{}");
        game.seeds = Number(saved.seeds) || 0;
        game.permanent = saved.permanent || {};
        game.unlockedCharacters = [...new Set(["simple", ...(saved.characters || game.unlockedCharacters)])];
        game.completedMissions = saved.missions || game.completedMissions;
        game.best = Number(saved.best) || game.best;
        game.stats = saved.stats || { runs:0, wins:0, bosses:0, kills:0, coins:0, bestTime:0 };
      } catch (error) { console.warn("Falha ao carregar progresso.", error); }
    },
    save() {
      try {
        localStorage.setItem(this.key, JSON.stringify({
          seeds: game.seeds, permanent: game.permanent,
          characters: game.unlockedCharacters, missions: game.completedMissions,
          best: game.best, stats: game.stats,
          selectedCharacter: game.characterId
        }));
        localStorage.setItem("bronana-best", String(game.best));
        localStorage.setItem("bronana-characters", JSON.stringify(game.unlockedCharacters));
        localStorage.setItem("bronana-missions", JSON.stringify(game.completedMissions));
        localStorage.setItem("bronana-selected-character", game.characterId);
      } catch (error) { console.warn("Falha ao salvar progresso.", error); }
    }
  };
  SaveManager.load();

  function createStats(character) {
    const permanent = game.permanent;
    const stats = {
      maxHealth: character.maxHealth * (1 + (permanent.health || 0)),
      healthRegen: character.regen,
      armor: character.armor,
      damage: character.damage,
      attackSpeed: 1 / character.fireRate,
      moveSpeed: character.speed * (1 + (permanent.speed || 0)),
      critChance: .1 + (permanent.crit || 0),
      critDamage: 2,
      pickupRange: 23 + character.magnet,
      luck: .02,
      projectileSpeed: 510,
      projectileCount: character.projectiles,
      range: 1,
      knockback: 2,
      cooldownReduction: 0,
      lifesteal: 0,
      xpGain: character.xpGain,
      coinGain: 1 + (permanent.coins || 0),
      areaDamage: 1,
      duration: 1
    };
    if (character.id === "red") { stats.damage *= 1.3; stats.moveSpeed *= .9; }
    if (character.id === "green") { stats.moveSpeed *= 1.2; stats.maxHealth *= .9; }
    if (character.id === "blue") { stats.attackSpeed *= 1.3; stats.damage *= .9; }
    if (character.id === "tank") { stats.maxHealth *= 1.5; stats.moveSpeed *= .82; stats.armor += 5; }
    if (character.id === "king") { stats.damage *= 1.2; stats.maxHealth *= 1.2; }
    return stats;
  }

  function resize() {
    const rect = frame.getBoundingClientRect();
    game.dpr = Math.min(window.devicePixelRatio || 1, 2);
    game.width = rect.width;
    game.height = rect.height;
    canvas.width = Math.round(rect.width * game.dpr);
    canvas.height = Math.round(rect.height * game.dpr);
    ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
    makeStars();
    if (game.player) {
      game.player.x = Math.min(game.player.x, game.width - 22);
      game.player.y = Math.min(game.player.y, game.height - 22);
    }
    draw();
  }

  function makeStars() {
    const amount = Math.max(50, Math.round(game.width * game.height / 4200));
    game.stars = Array.from({ length: amount }, () => ({
      x: Math.random() * game.width, y: Math.random() * game.height,
      size: Math.random() * 1.6 + .25, alpha: Math.random() * .55 + .15,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * .8 + .25
    }));
  }

  const missions = [
    { title: "MISSÃO 1 · PRIMEIRA COLHEITA", objective: "Derrote 8 venenos", type: "kills", target: 8 },
    { title: "MISSÃO 2 · MOEDAS NO CHÃO", objective: "Colete 5 moedas", type: "coins", target: 5 },
    { title: "MISSÃO 3 · POMAR EM FÚRIA", objective: "Sobreviva por 45 segundos", type: "survive", target: 45 },
    { title: "MISSÃO 4 · CASCA GROSSA", objective: "Derrote 18 venenos", type: "kills", target: 18 },
    { title: "MISSÃO 5 · TESOURO DO POMAR", objective: "Colete 10 moedas", type: "coins", target: 10 },
    { title: "MISSÃO 6 · A LONGA NOITE", objective: "Sobreviva por 60 segundos", type: "survive", target: 60 },
    { title: "MISSÃO 7 · RAINHA DO VENENO", objective: "Derrote 30 venenos", type: "kills", target: 30 },
    { title: "MISSÃO 8 · CHUVA DE SEMENTES", objective: "Derrote 35 venenos", type: "kills", target: 35 },
    { title: "MISSÃO 9 · COFRE DO BANANAL", objective: "Colete 20 moedas", type: "coins", target: 20 },
    { title: "MISSÃO 10 · ARCO-ÍRIS SOMBRIO", objective: "Sobreviva por 75 segundos", type: "survive", target: 75 },
    { title: "MISSÃO 11 · TEMPESTADE GLACIAL", objective: "Derrote 45 venenos", type: "kills", target: 45 },
    { title: "MISSÃO 12 · FORNALHA DO POMAR", objective: "Colete 30 moedas", type: "coins", target: 30 },
    { title: "MISSÃO 13 · PASSO FANTASMA", objective: "Sobreviva por 100 segundos", type: "survive", target: 100 },
    { title: "MISSÃO 14 · CAÇADORA DE MOEDAS", objective: "Derrote 55 venenos", type: "kills", target: 55 },
    { title: "MISSÃO 15 · COROA DO BANANAL", objective: "Derrote 70 venenos", type: "kills", target: 70 }
  ];
  game.missionIndex = Math.min(game.completedMissions.length, missions.length - 1);

  function begin(mode = game.mode) {
    game.mode = mode;
    game.active = true;
    game.paused = false;
    game.score = 0;
    game.health = 100;
    game.elapsed = 0;
    game.lastTime = performance.now();
    game.spawnClock = 0;
    game.shotClock = 0;
    game.dashClock = 0;
    game.invulnerable = 0;
    game.combo = 0;
    game.comboClock = 0;
    game.missionProgress = 0;
    game.level = 1;
    game.xp = 0;
    game.xpNext = 8;
    game.materials = 0;
    game.coinsCollected = 0;
    game.enemiesKilled = 0;
    game.bossesDefeated = 0;
    game.damageNumbers = [];
    game.weapons = [{ ...WEAPONS[0], level:1 }];
    game.items = {};
    game.upgrades = [];
    game.eventName = "";
    game.eventClock = 0;
    game.waveElapsed = 0;
    game.waveKills = 0;
    game.bossWave = false;
    game.bossActive = false;
    if (mode === "free") {
      game.difficulty = 1;
      game.waveSpawnRemaining = 0;
    }
    const character = characters.find(item => item.id === game.characterId) || characters[0];
    const stats = createStats(character);
    game.stats = stats;
    game.player = {
      x: game.width / 2, y: game.height / 2, angle: -Math.PI / 2, dash: 0, radius: 10,
      damage: stats.damage, speed: stats.moveSpeed, fireRate: 1 / stats.attackSpeed,
      maxHealth: stats.maxHealth, dashCooldown: character.dashCooldown, armor: stats.armor, hitCooldown: character.hitCooldown || 1,
      coinMagnet: stats.pickupRange, coinBonus: 0, xpGain: stats.xpGain, regen: stats.healthRegen,
      projectiles: stats.projectileCount, colors: character.colors
    };
    game.health = character.maxHealth;
    game.health = character.maxHealth;
    game.enemies = [];
    game.coins = [];
    game.bullets = [];
    game.particles = [];
    if (mode === "free") launchWave();
    keys.clear();
    pointer.down = false;
    touchMove.active = false;
    touchMove.x = 0;
    touchMove.y = 0;
    startScreen.classList.add("hidden");
    mainMenu.classList.add("hidden");
    menuPanel.classList.add("hidden");
    endScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    levelupScreen.classList.add("hidden");
    frame.classList.add("is-playing");
    pauseButton.textContent = "II";
    pauseButton.setAttribute("aria-label", "Pausar jogo");
    updateHud();
    requestAnimationFrame(loop);
    playTone(440, .08, .045);
  }

  function finish(victory) {
    if (!game.active) return;
    game.active = false;
    game.paused = false;
    frame.classList.remove("is-playing");
    const reward = Math.max(1, Math.floor(game.elapsed / 30) + game.bossesDefeated);
    game.seeds += reward;
    game.stats.runs = (game.stats.runs || 0) + 1;
    game.stats.kills = (game.stats.kills || 0) + game.enemiesKilled;
    game.stats.coins = (game.stats.coins || 0) + game.coinsCollected;
    game.stats.bestTime = Math.max(game.stats.bestTime || 0, game.elapsed);
    if (victory) game.stats.wins = (game.stats.wins || 0) + 1;
    game.stats.bosses = (game.stats.bosses || 0) + game.bossesDefeated;
    if (game.score > game.best) {
      game.best = game.score;
      try {
        localStorage.setItem("bronana-best", String(game.best));
      } catch (error) {
        console.warn("Não foi possível salvar o recorde local.", error);
      }
    }
    const storyWon = victory && game.mode === "story";
    const freeRecord = game.mode === "free" && game.score >= game.best;
    let unlockedCharacter = null;
    const completedMission = game.missionIndex;
    if (storyWon) {
      if (!game.completedMissions.includes(completedMission)) game.completedMissions.push(completedMission);
      unlockedCharacter = characters.find(character => character.mission === completedMission + 1) || null;
      if (unlockedCharacter && !game.unlockedCharacters.includes(unlockedCharacter.id)) game.unlockedCharacters.push(unlockedCharacter.id);
      game.missionIndex = Math.min(completedMission + 1, missions.length - 1);
      try {
        localStorage.setItem("bronana-missions", JSON.stringify(game.completedMissions));
        localStorage.setItem("bronana-characters", JSON.stringify(game.unlockedCharacters));
      } catch (error) {
        console.warn("NÃ£o foi possÃ­vel salvar o progresso da histÃ³ria.", error);
      }
    }
    document.getElementById("end-kicker").textContent = storyWon ? "DESAFIO CONCLUÍDO" : victory ? "NOVA ONDA" : "FIM DE JOGO";
    document.getElementById("end-title").innerHTML = storyWon ? "A banana<br>resiste<span>.</span>" : victory ? "O pomar<br>treme<span>.</span>" : "A horda<br>venceu<span>.</span>";
    document.getElementById("end-copy").textContent = unlockedCharacter
      ? `${unlockedCharacter.name} desbloqueada! ${game.score >= game.best ? "Novo recorde" : "Recorde"}: ${String(game.best).padStart(4, "0")} pontos.`
      : `${game.score >= game.best ? "Novo recorde" : "Recorde"}: ${String(game.best).padStart(4, "0")} pontos.`;
    document.getElementById("final-score").textContent = String(game.score).padStart(4, "0");
    const runSummary = document.getElementById("run-summary");
    if (runSummary) runSummary.innerHTML =
      `<span>TEMPO ${formatClock(game.elapsed)}</span><span>ONDA ${game.difficulty}</span><span>NÍVEL ${game.level}</span>` +
      `<span>ELIMINAÇÕES ${game.enemiesKilled}</span><span>MOEDAS ${game.coinsCollected}</span><span>CHEFES ${game.bossesDefeated}</span>` +
      `<span>SEMENTES +${reward}</span><strong>${game.weapons.map(w => w.name).join(" · ")}</strong>`;
    SaveManager.save();
    restartButton.querySelector("span").textContent = storyWon && completedMission < missions.length - 1 ? "PRÓXIMA MISSÃO" : "TENTAR NOVAMENTE";
    endScreen.classList.remove("hidden");
    levelupScreen.classList.add("hidden");
    playTone(victory ? 660 : 160, .24, .055);
    draw();
  }

  function exitToMenu() {
    game.active = false;
    game.paused = false;
    frame.classList.remove("is-playing");
    pauseScreen.classList.add("hidden");
    levelupScreen.classList.add("hidden");
    endScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    mainMenu.classList.remove("hidden");
    pointer.down = false;
    touchMove.active = false;
    keys.clear();
    draw();
  }

  function updateHud() {
    scoreElement.textContent = String(game.materials).padStart(3, "0");
    sectorElement.textContent = game.mode === "story" ? String(game.missionIndex + 1).padStart(2, "0") : String(game.difficulty).padStart(2, "0");
    document.getElementById("hud-sector-label").textContent = game.mode === "story" ? "DESAFIO" : "ONDA";
    const mission = missions[game.missionIndex];
    const status = document.getElementById("mission-status");
    if (status) status.textContent = game.mode === "story" ? `${mission.title} — ${mission.objective} (${Math.floor(game.missionProgress)}/${mission.target}) · NV ${game.level} · MOEDAS ${game.materials}` : `${game.bossWave ? "CHEFE DA ONDA" : "MODO LIVRE"} · VENENOS ${game.waveKills}/${game.waveEnemyGoal} · NÍVEL ${game.level} · MOEDAS ${game.materials}`;
    document.getElementById("wave-timer").textContent = formatClock(game.waveElapsed);
    document.getElementById("timer-label").classList.toggle("hidden", game.mode !== "free");
    document.getElementById("wave-timer").classList.toggle("hidden", game.mode !== "free");
    healthFill.style.width = `${Math.max(0, game.health / (game.player?.maxHealth || 100) * 100)}%`;
    healthFill.style.background = game.health <= 30 ? "#ff6387" : "#ffd84d";
    const xpFill = document.getElementById("xp-progress-fill");
    const xpLabel = document.getElementById("xp-label");
    if (xpFill) xpFill.style.width = `${Math.min(100, game.xp / game.xpNext * 100)}%`;
    if (xpLabel) xpLabel.textContent = `${Math.floor(game.xp)}/${game.xpNext}`;
    const waveFill = document.getElementById("wave-progress-fill");
    if (waveFill) waveFill.style.width = `${game.mode === "free" ? Math.min(100, game.waveElapsed / game.waveDuration * 100) : 0}%`;
    const build = document.getElementById("build-status");
    if (build) build.textContent = `${game.weapons.map(w => w.name).join(" · ") || "Arma"} | ${Object.values(game.items).map(i => i.name).join(" · ") || "Sem itens"}`;
  }

  function formatClock(seconds) {
    const total = Math.floor(seconds);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function showLevelUp(shop = false) {
    if (game.paused && !shop) return;
    if (!shop) {
      game.xp -= game.xpNext;
      game.xpNext += 4;
      game.level++;
    }
    game.paused = true;
    levelupScreen.querySelector(".screen-kicker").textContent = shop ? `INTERVALO · ONDA ${game.difficulty}` : `NÍVEL ${game.level} ALCANÇADO`;
    levelupScreen.querySelector("h2").innerHTML = shop ? (game.bossWave ? "Chefe na próxima <span>onda</span>" : "Prepare sua <span>banana</span>") : "Escolha uma <span>melhoria</span>";
    shopSkip.classList.toggle("visible", shop);
    if (shopLock) shopLock.classList.toggle("visible", shop);
    if (shopReroll) shopReroll.classList.toggle("visible", shop);
    const weighted = [ ...WEAPONS, ...ITEMS ].sort((a, b) => (b.rarity === "LENDÁRIO" ? 1 : 0) - (a.rarity === "LENDÁRIO" ? 1 : 0) + Math.random() - .5);
    let offer = weighted.slice(0, 3).map(entry => ({
      name: `${entry.rarity} · ${entry.name}`,
      detail: entry.description,
      entry,
      apply: () => {
        if (ITEMS.includes(entry)) applyItem(entry);
        else addWeapon(entry);
      }
    }));
    if (shop) {
      offer = game.shopLocked && game.shopOffer.length ? game.shopOffer : offer;
      game.shopOffer = offer;
    }
    const rerollCost = 3;
    shopSkip.textContent = shop ? "COMEÇAR ONDA" : "CONTINUAR";
    upgradeChoices.replaceChildren();
    offer.forEach(upgrade => {
      const cost = shop ? 4 + Math.floor(Math.random() * 7) : 0;
      const button = document.createElement("button");
      button.className = "upgrade-card";
      const artType = ITEMS.includes(upgrade.entry) ? "item" : "weapon";
      const artId = upgrade.entry?.id || "damage";
      button.innerHTML = `${choiceArt(artId, artType)}<strong>${upgrade.name}</strong><span>${upgrade.detail}</span>${shop ? `<small>🍌 ${cost} cachos</small>` : ""}`;
      button.disabled = shop && game.materials < cost;
      button.addEventListener("click", () => {
        if (shop && game.materials < cost) return;
        if (shop) game.materials -= cost;
        upgrade.apply();
        levelupScreen.classList.add("hidden");
        shopSkip.classList.remove("visible");
        if (shopLock) shopLock.classList.remove("visible");
        if (shopReroll) shopReroll.classList.remove("visible");
        if (shopLock) shopLock.classList.remove("visible");
        game.paused = false;
        if (shop) launchWave();
        updateHud();
        if (game.xp >= game.xpNext) showLevelUp();
      });
      upgradeChoices.append(button);
    });
    levelupScreen.classList.remove("hidden");
  }

  shopSkip.addEventListener("click", () => {
    levelupScreen.classList.add("hidden");
    shopSkip.classList.remove("visible");
    game.paused = false;
    launchWave();
    updateHud();
    if (game.xp >= game.xpNext) showLevelUp();
  });

  if (shopLock) {
    shopLock.addEventListener("click", () => {
      game.shopLocked = !game.shopLocked;
      shopLock.textContent = game.shopLocked ? "LOJA TRAVADA" : "TRAVAR LOJA";
      shopLock.classList.toggle("visible", true);
      playTone(game.shopLocked ? 620 : 440, .08, .025);
    });
  }

  if (shopReroll) {
    shopReroll.addEventListener("click", () => {
      if (!game.active || game.materials < 3) return;
      game.materials -= 3;
      playTone(520, .08, .035);
      showLevelUp(true);
    });
  }

  function rarityScale(rarity) {
    return { COMUM:1, INCOMUM:1.25, RARO:1.5, "ÉPICO":1.85, "LENDÁRIO":2.25 }[rarity] || 1;
  }

  function applyItem(item) {
    const existing = game.items[item.id];
    if (existing) existing.level = (existing.level || 1) + 1;
    else game.items[item.id] = { ...item, level:1 };
    const scale = rarityScale(item.rarity);
    const e = item.effect;
    if (e.maxHealth) { game.stats.maxHealth += e.maxHealth * scale; game.player.maxHealth = game.stats.maxHealth; game.health += e.maxHealth * scale; }
    if (e.healthRegen) { game.stats.healthRegen += e.healthRegen * scale; game.player.regen = game.stats.healthRegen; }
    if (e.armor) { game.stats.armor += e.armor * scale; game.player.armor = game.stats.armor; }
    if (e.damage) { game.stats.damage *= 1 + e.damage * scale; game.player.damage = game.stats.damage; }
    if (e.attackSpeed) { game.stats.attackSpeed *= 1 + e.attackSpeed * scale; game.player.fireRate = Math.max(.08, 1 / game.stats.attackSpeed); }
    if (e.moveSpeed) { game.stats.moveSpeed *= 1 + e.moveSpeed * scale; game.player.speed = game.stats.moveSpeed; }
    if (e.pickupRange) { game.stats.pickupRange += e.pickupRange * scale; game.player.coinMagnet = game.stats.pickupRange; }
    if (e.projectileCount) { game.stats.projectileCount += e.projectileCount * scale; game.player.projectiles = game.stats.projectileCount; }
    if (e.range) game.stats.range += e.range * scale;
    if (e.luck) game.stats.luck += e.luck * scale;
    if (e.critChance) game.stats.critChance += e.critChance * scale;
    if (e.coinGain) game.stats.coinGain *= 1 + e.coinGain * scale;
    if (e.lifesteal) game.stats.lifesteal += e.lifesteal * scale;
    if (e.duration) game.stats.duration *= 1 + e.duration * scale;
    if (e.cooldownReduction) game.stats.cooldownReduction += e.cooldownReduction * scale;
    game.upgrades.push(item.name);
    updateHud();
  }

  function addWeapon(template) {
    const existing = game.weapons.find(w => w.id === template.id);
    if (existing) {
      existing.level = Math.min(6, (existing.level || 1) + 1);
      existing.damage *= 1.2;
      if (existing.level === 3) existing.projectiles++;
      if (existing.level === 4) existing.cooldown *= .82;
      game.upgrades.push(`${template.name} Nv.${existing.level}`);
    } else if (game.weapons.length < 6) {
      game.weapons.push({ ...template, level:1 });
      game.upgrades.push(template.name);
    } else {
      applyItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    }
    updateHud();
  }

  function finishWave() {
    if (game.phaseEnding) return;
    game.phaseEnding = true;
    const completedWave = game.difficulty;
    game.difficulty++;
    game.bossWave = game.mode === "free" && game.difficulty % 10 === 0;
    game.bossActive = false;
    game.enemies = [];
    game.bullets = [];
    game.coins = [];
    game.particles = [];
    updateHud();
    if (game.mode === "free") showFreeBuffs();
    else launchWave();
  }

  function showFreeBuffs() {
    game.paused = true;
    levelupScreen.querySelector(".screen-kicker").textContent = `WAVE ${completedWaveText()} CONCLUÍDA`;
    levelupScreen.querySelector("h2").innerHTML = "Escolha 1 <span>buff grátis</span>";
    shopSkip.classList.remove("visible");
    if (shopLock) shopLock.classList.remove("visible");
    const pool = BUFFS.sort(() => Math.random() - .5).slice(0, 3);
    upgradeChoices.replaceChildren();
    pool.forEach(buff => {
      const button = document.createElement("button");
      button.className = "upgrade-card free-buff-card";
      button.innerHTML = `${choiceArt(buff.id, "buff")}<strong>${buff.name}</strong><span>${buff.description}</span><small>${buff.rarity} · GRÁTIS</small>`;
      button.addEventListener("click", () => {
        buff.apply();
        game.upgrades.push(buff.name);
        levelupScreen.classList.add("hidden");
        game.paused = false;
        showLevelUp(true);
      });
      upgradeChoices.append(button);
    });
    levelupScreen.classList.remove("hidden");
  }

  function completedWaveText() {
    return String(Math.max(1, game.difficulty - 1)).padStart(2, "0");
  }

  function choiceArt(id, type) {
    const weapon = WEAPONS.find(item => item.id === id);
    const item = ITEMS.find(entry => entry.id === id);
    const symbol = weapon ? "⌁" : item ? "◆" : ({
      damage:"✹", attack:"⌁", speed:"➤", health:"♥", magnet:"∪", crit:"◆",
      critDamage:"🔥", projectiles:"●●●", armor:"⬟", regen:"☘", luck:"✦", range:"◎"
    }[id] || "✦");
    const label = (weapon?.name || item?.name || type).slice(0, 1).toUpperCase();
    return `<span class="choice-art art-${type}" aria-hidden="true"><b>${symbol}</b><small>${label}</small></span>`;
  }

  function launchWave() {
    game.phaseEnding = false;
    game.spawnClock = 0;
    game.waveElapsed = 0;
    game.waveKills = 0;
    game.waveEnemyGoal = Math.min(240, game.difficulty * 12);
    const bossCount = game.mode === "free" && game.bossWave ? 1 : 0;
    game.waveSpawnRemaining = Math.max(0, game.waveEnemyGoal - bossCount);
    if (game.mode === "free" && game.bossWave && !game.bossActive) {
      game.bossActive = true;
      spawnBoss();
    }
  }

  function loop(now) {
    if (!game.active) return;
    if (game.paused) {
      game.lastTime = now;
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min((now - game.lastTime) / 1000, .035);
    game.lastTime = now;
    update(dt);
    draw();
    if (game.health <= 0) {
      finish(false);
      return;
    }
    requestAnimationFrame(loop);
  }

  function update(dt) {
    game.elapsed += dt;
    if (game.mode === "free") {
      game.waveElapsed += dt;
      if (game.eventClock > 0) {
        game.eventClock -= dt;
        if (game.eventClock <= 0) game.eventName = "";
      }
      if (game.waveElapsed >= game.waveDuration) {
        finishWave();
        return;
      }
    }
    game.comboClock -= dt;
    if (game.comboClock <= 0) game.combo = 0;
    game.spawnClock += dt;
    game.shotClock -= dt;
    game.dashClock -= dt;
    game.invulnerable -= dt;
    const player = game.player;
    if (player.regen > 0) game.health = Math.min(player.maxHealth, game.health + player.regen * dt);
    if (game.mode === "story" && missions[game.missionIndex].type === "survive") game.missionProgress = game.elapsed;
    let mx = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
    let my = (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - (keys.has("w") || keys.has("arrowup") ? 1 : 0);
    mx += touchMove.x;
    my += touchMove.y;
    const magnitude = Math.hypot(mx, my) || 1;
    mx /= magnitude;
    my /= magnitude;
    const boost = player.dash > 0 ? 2.8 : 1;
    player.dash = Math.max(0, player.dash - dt);
    player.x = clamp(player.x + mx * player.speed * boost * dt, 18, game.width - 18);
    player.y = clamp(player.y + my * player.speed * boost * dt, 72, game.height - 20);

    if (game.enemies.length) {
      const nearest = game.enemies.reduce((a, b) => distance(player, a) < distance(player, b) ? a : b);
      player.angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
      if (game.shotClock <= 0) { shoot(); game.shotClock = player.fireRate; }
    } else if (pointer.inside) player.angle = Math.atan2(pointer.y - player.y, pointer.x - player.x);

    const pressure = game.mode === "free" ? game.difficulty : 1 + game.missionIndex * .12;
    if (game.mode === "free") {
      if (game.waveSpawnRemaining > 0 && game.spawnClock > Math.max(.22, 1.05 - game.difficulty * .035)) {
        spawnEnemy();
        game.waveSpawnRemaining--;
        game.spawnClock = 0;
      }
    } else if (game.spawnClock > Math.max(.42, 1.35 - game.elapsed * .007)) {
      spawnEnemy();
      game.spawnClock = 0;
    }
    for (const enemy of game.enemies) {
      const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemy.slowClock = (enemy.slowClock || 0) - dt;
      const slow = enemy.slowClock > 0 ? .45 : 1;
      let moveX = Math.cos(angle) * enemy.speed * slow * dt;
      let moveY = Math.sin(angle) * enemy.speed * slow * dt;
      if (enemy.kind === "shooter") {
        const dist = distance(player, enemy);
        if (dist < 240) { moveX *= -0.55; moveY *= -0.55; }
        enemy.shotClock = (enemy.shotClock || 1.8) - dt;
        if (enemy.shotClock <= 0) {
          game.bullets.push({x:enemy.x,y:enemy.y,vx:Math.cos(angle)*190,vy:Math.sin(angle)*190,life:2.5,damage:enemy.kind,enemyShot:true,hit:new Set(),behavior:"enemy"});
          enemy.shotClock = 2;
        }
      } else if (enemy.kind === "thief") {
        enemy.x += moveX * 1.35; enemy.y += moveY * 1.35;
        if (distance(player, enemy) < 22 && game.materials > 0) { game.materials--; enemy.dead = true; }
      } else if (enemy.kind === "explosive" && distance(player, enemy) < 42) {
        game.health -= Math.max(8, 32 - player.armor);
        game.invulnerable = player.hitCooldown;
        burst(enemy.x, enemy.y, "#ff7a45", 16);
        enemy.dead = true;
      }
      enemy.x += moveX;
      enemy.y += moveY;
      enemy.pulse += dt * 5;
      if (distance(player, enemy) < player.radius + enemy.radius && game.invulnerable <= 0) {
        const contactDamage = enemy.kind === "boss" ? 38 : enemy.kind === "elite" ? 30 : enemy.kind === "brute" ? 22 : 14;
        game.health -= Math.max(5, contactDamage - player.armor);
        game.invulnerable = player.hitCooldown;
        burst(player.x, player.y, "#ff6d9d", 14);
        playTone(115, .12, .06);
        enemy.x += Math.cos(angle) * 28;
        enemy.y += Math.sin(angle) * 28;
        updateHud();
      }
    }
    for (const bullet of game.bullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      bullet.life -= dt;
      if (bullet.enemyShot && distance(player, bullet) < player.radius + 5) {
        game.health -= Math.max(5, 16 - player.armor);
        game.invulnerable = player.hitCooldown;
        bullet.life = 0;
        burst(player.x, player.y, "#ff6387", 8);
      }
    }
    for (const coin of game.coins) coin.phase += dt * 3;
    for (const particle of game.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.vx *= .985;
      particle.vy *= .985;
    }
    for (const number of game.damageNumbers) {
      number.y -= 20 * dt;
      number.life -= dt;
    }
    game.damageNumbers = game.damageNumbers.filter(number => number.life > 0);

    for (const bullet of game.bullets) {
      const target = game.enemies.find(enemy => !bullet.hit?.has(enemy) && distance(bullet, enemy) < enemy.radius + 3);
      if (target) {
        if (bullet.hit) bullet.hit.add(target);
        const luckCrit = game.stats.critChance + game.stats.luck * .05;
        const critical = Math.random() < luckCrit;
        const damage = bullet.damage * (critical ? game.stats.critDamage : 1);
        target.hp -= damage;
        target.slowClock = bullet.weaponId === "seed" && game.characterId === "blue" && Math.random() < .22 ? 1.2 : target.slowClock;
        if (bullet.behavior === "knockback" || bullet.weaponId === "pulp") {
          const angle = Math.atan2(target.y - player.y, target.x - player.x);
          target.x += Math.cos(angle) * (bullet.weaponId === "pulp" ? 24 : 12);
          target.y += Math.sin(angle) * (bullet.weaponId === "pulp" ? 24 : 12);
        }
        if (bullet.behavior !== "pierce") bullet.life = bullet.behavior === "boomerang" ? 1.15 : bullet.life;
        if (bullet.behavior === "explosive") {
          burst(target.x, target.y, "#ff7a45", 18);
          for (const other of game.enemies) {
            if (other !== target && distance(target, other) < 74) other.hp -= damage * .55;
          }
        }
        game.damageNumbers.push({x:target.x,y:target.y,value:damage,critical,life:.65});
        if (game.damageNumbers.length > 50) game.damageNumbers.shift();
        if (bullet.behavior !== "pierce" && bullet.behavior !== "chain") bullet.life = 0;
        burst(bullet.x, bullet.y, target.color, 4);
        if (target.hp <= 0) {
          game.combo = game.comboClock > 0 ? game.combo + 1 : 1;
          game.comboClock = 2.4;
          game.enemiesKilled++;
          const comboBonus = Math.min(game.combo - 1, 5) * 2;
          game.score += (target.kind === "boss" ? 250 : target.kind === "elite" ? 60 : target.kind === "brute" ? 30 : 10) + comboBonus;
          if (game.mode === "free") game.waveKills++;
          if (game.mode === "story" && missions[game.missionIndex].type === "kills") game.missionProgress++;
          burst(target.x, target.y, target.color, 12);
          const baseCoins = target.kind === "boss" ? 20 : target.kind === "elite" ? 6 : target.kind === "brute" ? 3 : 1;
          const baseHp = target.kind === "boss" ? 150 : target.kind === "elite" ? 7 : target.kind === "brute" ? 3 : 1;
          const baseSpeed = target.kind === "boss" ? 47 : target.kind === "elite" ? 43 : target.kind === "brute" ? 37 : 56;
          const coinCount = baseCoins + Math.floor(Math.max(0, target.maxHp - baseHp) / 2) + Math.floor(Math.max(0, target.speed - baseSpeed) / 30);
          for (let coinIndex = 0; coinIndex < coinCount; coinIndex++) {
            const angle = Math.random() * Math.PI * 2;
            const spread = 5 + Math.random() * (coinCount * 2);
            game.coins.push({ x: target.x + Math.cos(angle) * spread, y: target.y + Math.sin(angle) * spread, phase: Math.random() * 6 });
          }
          game.enemies.splice(game.enemies.indexOf(target), 1);
          if (target.kind === "boss") {
            game.bossActive = false;
            game.bossesDefeated++;
          }
          playTone(285, .055, .025);
          updateHud();
        }
      }
    }
    for (const coin of game.coins) {
      if (distance(player, coin) < 23 + player.coinMagnet) {
        game.score += 25;
        game.materials += 1 + player.coinBonus;
        game.coinsCollected++;
        game.xp += player.xpGain;
        if (game.mode === "story" && missions[game.missionIndex].type === "coins") game.missionProgress++;
        coin.collected = true;
        burst(coin.x, coin.y, "#ffd84d", 5);
        playTone(760, .11, .04);
        updateHud();
        if (game.xp >= game.xpNext) { showLevelUp(); break; }
      }
    }
    game.coins = game.coins.filter(coin => !coin.collected);
    const killedBefore = new Set();
    for (let i = game.enemies.length - 1; i >= 0; i--) {
      const enemy = game.enemies[i];
      if (enemy.dead || enemy.hp <= 0) {
        if (enemy.dead) {
          killedBefore.add(enemy);
          burst(enemy.x, enemy.y, enemy.color || "#ff7a45", 8);
        }
        game.enemies.splice(i, 1);
      }
    }

    if (game.mode === "free"
      && game.waveElapsed < game.waveDuration
      && game.waveSpawnRemaining === 0
      && game.enemies.length === 0
      && !game.phaseEnding) {
      finishWave();
      return;
    }
    updateHud();
    if (game.mode === "story" && game.missionProgress >= missions[game.missionIndex].target) {
      finish(true);
      return;
    }
    game.bullets = game.bullets.filter(b => b.life > 0 && b.x > -20 && b.x < game.width + 20 && b.y > 55 && b.y < game.height + 20);
    game.particles = game.particles.filter(p => p.life > 0);
  }

  function shoot() {
    const p = game.player;
    let weapons = game.weapons.length ? game.weapons : [WEAPONS[0]];
    for (const weapon of weapons) {
      const count = (weapon.projectiles || 1) + (weapon.id === "rain" ? 4 : 0) + Math.max(0, p.projectiles - 1);
      for (let i = 0; i < count; i++) {
        const spread = count === 1 ? 0 : (i - (count - 1) / 2) * .16;
        const angle = p.angle + spread + (Math.random() - .5) * .025;
        const speed = (weapon.projectileSpeed || 510) * (1 + (game.stats?.projectileSpeed ? 0 : 0));
        game.bullets.push({
          x:p.x + Math.cos(angle) * 15, y:p.y + Math.sin(angle) * 15,
          vx:Math.cos(angle) * speed, vy:Math.sin(angle) * speed,
          life:(weapon.range || .72) * 1.25, damage:(weapon.damage || 1) * p.damage,
          behavior:weapon.behavior, weaponId:weapon.id, hit:new Set()
        });
      }
    }
    playTone(360 + Math.random() * 90, .035, .012);
  }

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    const margin = 25;
    const x = side === 0 ? margin : side === 1 ? game.width - margin : Math.random() * game.width;
    const y = side === 2 ? 72 : side === 3 ? game.height - margin : 75 + Math.random() * (game.height - 100);
    const threatTime = game.elapsed + (game.mode === "free" ? (game.difficulty - 1) * 45 : game.missionIndex * 25);
    const eliteChance = threatTime < 55 ? 0 : Math.min(.2, (threatTime - 55) * .0015);
    const bruteChance = Math.min(.48, .12 + threatTime * .003);
    const roll = Math.random();
    const threat = threatTime;
    let kind = roll < eliteChance ? "elite" : roll < eliteChance + bruteChance ? "brute" : "wisp";
    if (threat > 25) {
      const extra = Math.random();
      if (extra < .14) kind = "runner";
      else if (extra < .24) kind = "shooter";
      else if (extra < .32) kind = "divider";
      else if (extra < .40) kind = "explosive";
      else if (extra < .46) kind = "thief";
      else if (extra < .52) kind = "tank";
    }
    const elite = kind === "elite";
    const brute = kind === "brute";
    const baseSpeed = elite ? 43 : brute ? 37 : 56;
    const hp = elite ? 7 + Math.floor(threatTime / 100) : brute ? 3 + Math.floor(threatTime / 150) : 1;
    game.enemies.push({
      x, y, radius: elite ? 19 : brute ? 15 : 10,
      hp, maxHp: hp,
      speed: (baseSpeed + Math.min(threatTime * .18, 32)) * (game.mode === "free" ? 1 + (game.difficulty - 1) * .13 : 1),
      kind, color: elite ? "#ff4b91" : brute ? "#bc55e8" : "#a6ff55", pulse: Math.random() * 6
    });
  }

  function spawnBoss() {
    const side = Math.floor(Math.random() * 4);
    const margin = 38;
    const x = side === 0 ? margin : side === 1 ? game.width - margin : Math.random() * game.width;
    const y = side === 2 ? 95 : side === 3 ? game.height - margin : 95 + Math.random() * (game.height - 125);
    const hp = 70 + game.difficulty * 8;
    game.enemies.push({
      x, y, radius: 31, hp, maxHp: hp,
      speed: (34 + Math.min(game.difficulty * 1.3, 22)) * (1 + (game.difficulty - 1) * .08),
      kind: "boss", color: "#ff386d", pulse: Math.random() * 6
    });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 115;
      game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .2 + Math.random() * .45, maxLife: .65, size: 1 + Math.random() * 2.5, color });
    }
  }

  function draw() {
    if (!game.width || !game.height) return;
    ctx.clearRect(0, 0, game.width, game.height);
    const bg = ctx.createLinearGradient(0, 0, game.width, game.height);
    bg.addColorStop(0, "#111a0e");
    bg.addColorStop(.55, "#0c120a");
    bg.addColorStop(1, "#1a190b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, game.width, game.height);
    drawNebula();
    const time = performance.now() / 1000;
    for (const star of game.stars) {
      const alpha = star.alpha * (.65 + Math.sin(time * star.speed + star.phase) * .35);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#d9e8ff";
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
    drawGrid();
    for (const coin of game.coins) {
      const bob = Math.sin(coin.phase) * 2;
      ctx.save();
      ctx.translate(coin.x, coin.y + bob);
      ctx.fillStyle = "#ffd84d";
      ctx.shadowColor = "#ffbd38";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#9e5e26";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#714020";
      ctx.font = "bold 7px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B", 0, .5);
      ctx.restore();
    }
    for (const bullet of game.bullets) drawBullet(bullet);
    for (const enemy of game.enemies) drawEnemy(enemy);
    for (const particle of game.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    if (game.player) drawPlayer();
    for (const number of game.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = clamp(number.life / .65, 0, 1);
      ctx.fillStyle = number.critical ? "#ff5b72" : "#fff1a1";
      ctx.shadowColor = number.critical ? "#ff3158" : "#d69d3a";
      ctx.shadowBlur = number.critical ? 12 : 5;
      ctx.font = `${number.critical ? "bold " : ""}${number.critical ? 17 : 12}px "DM Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(number.critical ? `CRÍTICO ${Math.round(number.value)}` : `${Math.round(number.value)}`, number.x, number.y);
      ctx.restore();
    }
    drawTouchStick();
  }

  function drawNebula() {
    const glow = ctx.createRadialGradient(game.width * .55, game.height * .48, 0, game.width * .55, game.height * .48, game.width * .62);
    glow.addColorStop(0, "rgba(139, 179, 72, .18)");
    glow.addColorStop(.52, "rgba(82, 111, 54, .10)");
    glow.addColorStop(1, "rgba(8, 12, 8, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, game.width, game.height);
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(179, 194, 112, .055)";
    ctx.lineWidth = 1;
    const gap = 48;
    for (let x = (game.width % gap) / 2; x < game.width; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 58); ctx.lineTo(x, game.height); ctx.stroke();
    }
    for (let y = 58 + gap; y < game.height; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(game.width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer() {
    const p = game.player;
    const blink = game.invulnerable > 0 && Math.floor(performance.now() / 90) % 2 === 0;
    if (blink) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.shadowColor = "#ffc83d";
    ctx.shadowBlur = 20;
    const peel = ctx.createLinearGradient(-15, -16, 14, 16);
    peel.addColorStop(0, p.colors[0]);
    peel.addColorStop(.45, p.colors[1]);
    peel.addColorStop(1, p.colors[2]);
    ctx.fillStyle = peel;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.bezierCurveTo(-8, -24, 8, -22, 17, -11);
    ctx.bezierCurveTo(22, -5, 17, 1, 10, 4);
    ctx.bezierCurveTo(3, 7, -2, 14, -7, 18);
    ctx.bezierCurveTo(-15, 23, -23, 13, -20, 4);
    ctx.bezierCurveTo(-18, -3, -10, -7, -15, -12);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = p.colors[2];
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 248, 179, .95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, -11);
    ctx.bezierCurveTo(-4, -18, 7, -17, 13, -10);
    ctx.stroke();
    ctx.strokeStyle = "rgba(188, 113, 25, .55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-4, 0, 2, 7);
    ctx.moveTo(-15, 7); ctx.quadraticCurveTo(-8, 7, -5, 13);
    ctx.stroke();
    ctx.fillStyle = "#35201a";
    ctx.beginPath(); ctx.arc(5, -3, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -7, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#35201a"; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(5, 2); ctx.quadraticCurveTo(10, 6, 15, 1); ctx.stroke();
    ctx.fillStyle = "#fff1a1"; ctx.beginPath(); ctx.arc(4.5, -3.8, .7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#81502b";
    ctx.beginPath(); ctx.moveTo(14, -12); ctx.lineTo(20, -14); ctx.lineTo(20, -8); ctx.lineTo(15, -7); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-19, -13); ctx.lineTo(-15, -17); ctx.lineTo(-12, -12); ctx.lineTo(-16, -9); ctx.closePath(); ctx.fill();

    if (game.weapons.length) {
      const weapon = game.weapons[0];
      ctx.save();
      ctx.translate(18, 4);
      ctx.rotate(.12);
      ctx.fillStyle = "#f5cb3d";
      ctx.strokeStyle = "#3a2817";
      ctx.lineWidth = 2;
      if (weapon.behavior === "boomerang") {
        ctx.beginPath(); ctx.moveTo(0,-5); ctx.quadraticCurveTo(14,-14,18,-2); ctx.quadraticCurveTo(12,5,0,5); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (weapon.behavior === "heavy" || weapon.behavior === "explosive") {
        ctx.fillRect(-2,-5,24,10); ctx.strokeRect(-2,-5,24,10);
        ctx.fillStyle="#8c5a32"; ctx.fillRect(18,-8,7,16);
      } else if (weapon.behavior === "orbit" || weapon.behavior === "mill") {
        ctx.beginPath(); ctx.arc(8,0,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillRect(-1,-3,25,6); ctx.strokeRect(-1,-3,25,6);
        ctx.fillStyle="#6f8f3a"; ctx.fillRect(20,-5,8,10);
      }
      ctx.restore();
    }
    const passiveCount = Object.keys(game.items).length;
    if (passiveCount) {
      ctx.fillStyle="#7bd7b1";
      for (let i=0;i<Math.min(passiveCount,5);i++) {
        ctx.beginPath(); ctx.arc(-12+i*6,-20-(i%2)*3,2.2,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 23, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 216, 77, .16)";
    ctx.stroke();
  }

  function drawEnemy(enemy) {
    const wobble = Math.sin(enemy.pulse) * 2;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(Math.sin(enemy.pulse * .3) * .12);
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 18 + wobble * 2;
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.moveTo(0, -enemy.radius);
    ctx.bezierCurveTo(enemy.radius * .45, -enemy.radius * .72, enemy.radius * 1.08, -enemy.radius * .45, enemy.radius, enemy.radius * .12);
    ctx.bezierCurveTo(enemy.radius * .94, enemy.radius * .48, enemy.radius * .66, enemy.radius * .65, enemy.radius * .48, enemy.radius * .48);
    ctx.bezierCurveTo(enemy.radius * .3, enemy.radius * .92, enemy.radius * .04, enemy.radius * .88, 0, enemy.radius * .55);
    ctx.bezierCurveTo(-enemy.radius * .18, enemy.radius * .94, -enemy.radius * .48, enemy.radius * .84, -enemy.radius * .49, enemy.radius * .5);
    ctx.bezierCurveTo(-enemy.radius * 1.08, enemy.radius * .28, -enemy.radius * 1.02, -enemy.radius * .38, -enemy.radius * .6, -enemy.radius * .7);
    ctx.bezierCurveTo(-enemy.radius * .34, -enemy.radius * .9, -enemy.radius * .18, -enemy.radius * .72, 0, -enemy.radius);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(244,255,221,.45)";
    ctx.beginPath();
    ctx.ellipse(-enemy.radius * .38, -enemy.radius * .35, enemy.radius * .19, enemy.radius * .1, -.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#24131e";
    ctx.beginPath();
    ctx.arc(-enemy.radius * .28, -enemy.radius * .08, Math.max(1.5, enemy.radius * .12), 0, Math.PI * 2);
    ctx.arc(enemy.radius * .25, -enemy.radius * .08, Math.max(1.5, enemy.radius * .12), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(239,255,220,.68)";
    ctx.beginPath();
    ctx.arc(enemy.radius * .35, enemy.radius * .34, Math.max(1, enemy.radius * .11), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const barWidth = enemy.kind === "boss" ? 116 : Math.max(25, enemy.radius * 2.35);
    const barHeight = enemy.kind === "boss" ? 7 : enemy.kind === "elite" ? 5 : 4;
    const barY = enemy.y - enemy.radius - (enemy.kind === "boss" ? 20 : 11);
    if (enemy.kind === "boss") {
      ctx.fillStyle = "#ffe8ec";
      ctx.font = "bold 9px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("MÃE DO VENENO", enemy.x, barY - 3);
    }
    ctx.fillStyle = "rgba(14, 10, 18, .9)";
    ctx.fillRect(enemy.x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = "#433443";
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth, barHeight);
    ctx.fillStyle = enemy.kind === "elite" ? "#ff4b91" : enemy.kind === "brute" ? "#c66af0" : "#a6ff55";
    ctx.fillRect(enemy.x - barWidth / 2, barY, barWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), barHeight);
  }

  function drawBullet(bullet) {
    ctx.strokeStyle = "#fff09b";
    ctx.shadowColor = "#ffd84d";
    ctx.shadowBlur = 11;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.vx * .027, bullet.y - bullet.vy * .027);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawReticle() {
    if (!pointer.inside) return;
    ctx.save();
    ctx.translate(pointer.x, pointer.y);
    ctx.strokeStyle = "rgba(119, 244, 227, .65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.moveTo(-13, 0); ctx.lineTo(-6, 0);
    ctx.moveTo(13, 0); ctx.lineTo(6, 0);
    ctx.moveTo(0, -13); ctx.lineTo(0, -6);
    ctx.moveTo(0, 13); ctx.lineTo(0, 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawTouchStick() {
    if (!touchMove.active) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 216, 77, .6)";
    ctx.fillStyle = "rgba(255, 216, 77, .16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(touchMove.anchorX, touchMove.anchorY, 39, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(touchMove.anchorX + touchMove.x * 32, touchMove.anchorY + touchMove.y * 32, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function playTone(frequency, duration, volume) {
    if (!game.sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!game.audio) game.audio = new AudioContext();
      if (game.audio.state === "suspended") game.audio.resume();
      const oscillator = game.audio.createOscillator();
      const gain = game.audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, game.audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * .55), game.audio.currentTime + duration);
      gain.gain.setValueAtTime(volume, game.audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, game.audio.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(game.audio.destination);
      oscillator.start();
      oscillator.stop(game.audio.currentTime + duration);
    } catch (error) {
      console.warn("Não foi possível iniciar o áudio do jogo.", error);
    }
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }

  storyButton.addEventListener("click", () => begin("story"));
  freeButton.addEventListener("click", () => begin("free"));
  restartButton.addEventListener("click", () => begin(game.mode));
  document.getElementById("menu-play").addEventListener("click", () => begin("free"));
  document.getElementById("menu-story").addEventListener("click", () => begin("story"));
  document.getElementById("menu-characters-open").addEventListener("click", () => openMenuPanel("characters"));
  document.getElementById("menu-options-open").addEventListener("click", () => openMenuPanel("options"));
  document.getElementById("menu-progress-open").addEventListener("click", () => openMenuPanel("progress"));
  document.getElementById("menu-credits-open").addEventListener("click", () => openMenuPanel("credits"));
  document.getElementById("menu-panel-back").addEventListener("click", () => menuPanel.classList.add("hidden"));

  function openMenuPanel(section) {
    menuPanelControls.replaceChildren();
    menuPanelControls.classList.remove("character-select-grid");
    menuPanel.classList.toggle("character-panel", section === "characters");
    if (section === "options") {
      menuPanelTitle.textContent = "OPÇÕES";
      menuPanelCopy.textContent = "Ajuste sua partida antes de encarar o pomar.";
      menuPanelControls.append(fullscreenButton, soundButton);
    } else if (section === "progress") {
      menuPanelTitle.textContent = "PROGRESSO";
      menuPanelCopy.textContent = `${game.completedMissions.length}/${missions.length} missões concluídas · ${game.unlockedCharacters.length}/${characters.length} personagens liberadas.`;
      const badge = document.createElement("div");
      badge.className = "progress-badge";
      badge.innerHTML = `<strong>${String(game.best).padStart(4, "0")}</strong><span>RECORDE DE PONTOS</span>`;
      menuPanelControls.append(badge);
    } else if (section === "characters") {
      menuPanelTitle.textContent = "PERSONAGENS";
      menuPanelCopy.textContent = "Complete as missões da história para liberar novas bananas. Cada uma tem seus próprios atributos e habilidade.";
      menuPanelControls.classList.add("character-select-grid");
      characters.forEach(character => {
        const unlocked = game.unlockedCharacters.includes(character.id);
        const card = document.createElement("button");
        card.className = `character-card${game.characterId === character.id ? " is-selected" : ""}`;
        card.disabled = !unlocked;
        card.innerHTML = `<strong>${character.name}</strong><span>${character.skill}</span><small>${character.stats}</small><em>${unlocked ? (game.characterId === character.id ? "EM USO" : "SELECIONAR") : `DESBLOQUEIA NA MISSÃO ${character.mission}`}</em>`;
        if (unlocked) card.addEventListener("click", () => {
          game.characterId = character.id;
          try { localStorage.setItem("bronana-selected-character", character.id); } catch (error) {}
          updateCharacterLabel();
          openMenuPanel("characters");
        });
        menuPanelControls.append(card);
      });
    } else {
      menuPanelTitle.textContent = "CRÉDITOS";
      menuPanelCopy.textContent = "BRONANA é uma arena de sobrevivência independente. Feito para quem gosta de bananas e ondas intermináveis.";
    }
    menuPanel.classList.remove("hidden");
  }

  function updateCharacterLabel() {
    const character = characters.find(item => item.id === game.characterId) || characters[0];
    document.getElementById("selected-character-label").textContent = `PERSONAGEM · ${character.name.toUpperCase()}`;
    document.getElementById("menu-banana-body").setAttribute("fill", character.colors[1]);
  }
  updateCharacterLabel();
  soundButton.addEventListener("click", () => {
    game.sound = !game.sound;
    soundButton.classList.toggle("is-muted", !game.sound);
    document.getElementById("sound-icon").textContent = game.sound ? "♫" : "♪";
    document.getElementById("sound-label").textContent = game.sound ? "SOM LIGADO" : "SOM DESLIGADO";
    soundButton.setAttribute("aria-label", game.sound ? "Desativar som" : "Ativar som");
    if (game.sound) playTone(520, .08, .035);
  });
  fullscreenButton.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await (mainMenu.classList.contains("hidden") ? frame : document.documentElement).requestFullscreen();
    } catch (error) {
      console.warn("Não foi possível alternar para tela cheia.", error);
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const isFullscreen = document.fullscreenElement === frame || document.fullscreenElement === document.documentElement;
    fullscreenButton.classList.toggle("is-muted", isFullscreen);
    fullscreenButton.setAttribute("aria-label", isFullscreen ? "Sair da tela cheia" : "Ativar tela cheia");
    fullscreenButton.title = isFullscreen ? "Sair da tela cheia" : "Ativar tela cheia";
    document.getElementById("fullscreen-label").textContent = isFullscreen ? "SAIR DA TELA CHEIA" : "TELA CHEIA";
    document.getElementById("fullscreen-icon").textContent = isFullscreen ? "⛶" : "⛶";
    requestAnimationFrame(resize);
  });
  canvas.addEventListener("pointermove", event => {
    updatePointer(event);
    pointer.inside = true;
    if (touchMove.active) {
      touchMove.x = clamp((pointer.x - touchMove.anchorX) / 42, -1, 1);
      touchMove.y = clamp((pointer.y - touchMove.anchorY) / 42, -1, 1);
    }
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.inside = false;
    pointer.down = false;
    touchMove.active = false;
  });
  canvas.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    updatePointer(event);
    pointer.inside = true;
    pointer.down = true;
    if (event.pointerType === "touch") {
      touchMove.active = true;
      touchMove.anchorX = pointer.x;
      touchMove.anchorY = pointer.y;
      touchMove.x = 0;
      touchMove.y = 0;
    }
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointerup", () => {
    pointer.down = false;
    touchMove.active = false;
  });
  canvas.addEventListener("pointercancel", () => {
    pointer.down = false;
    touchMove.active = false;
  });
  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === " " && game.active && game.dashClock <= 0) {
      game.player.dash = .18;
      game.dashClock = game.player.dashCooldown;
      burst(game.player.x, game.player.y, "#a78bfa", 9);
      playTone(230, .11, .04);
    }
  });
  window.addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => { keys.clear(); pointer.down = false; });
  window.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === "escape" && game.active && levelupScreen.classList.contains("hidden")) togglePause();
  });
  window.addEventListener("resize", resize);

  function togglePause() {
    game.paused = !game.paused;
    pauseScreen.classList.toggle("hidden", !game.paused);
    pauseButton.textContent = game.paused ? "▶" : "II";
    pauseButton.setAttribute("aria-label", game.paused ? "Continuar jogo" : "Pausar jogo");
    pointer.down = false;
    touchMove.active = false;
    keys.clear();
  }

  pauseButton.addEventListener("click", togglePause);
  resumeButton.addEventListener("click", togglePause);
  exitButton.addEventListener("click", exitToMenu);
  new ResizeObserver(resize).observe(frame);
  resize();
  if (reducedMotion) document.documentElement.classList.add("reduced-motion");
})();
