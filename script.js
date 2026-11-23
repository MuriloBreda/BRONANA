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
    { id: "pink", name: "Banana Rosa", skill: "Regeneração · recupera vida com o tempo", stats: "Dano 1 · vida 90 · regenera 0,45 por segundo", mission: 7, damage: 1, speed: 210, maxHealth: 90, fireRate: .34, dashCooldown: 1.15, armor: 0, magnet: 0, xpGain: 1, regen: .45, projectiles: 1, colors: ["#ffd4df", "#ef8ba7", "#aa4e7a"] }
  ];
  const game = {
    active: false, paused: false, score: 0, best: 0, health: 100, elapsed: 0, lastTime: 0,
    mode: "story", missionIndex: 0, missionProgress: 0, difficulty: 1, waveSpawnRemaining: 0,
    waveElapsed: 0, waveEnemyGoal: 5, waveKills: 0, bossWave: false, bossActive: false, level: 1, xp: 0, xpNext: 8, materials: 0,
    characterId: "simple", unlockedCharacters: ["simple"], completedMissions: [],
    spawnClock: 0, shotClock: 0, dashClock: 0, invulnerable: 0,
    combo: 0, comboClock: 0,
    player: null, enemies: [], coins: [], bullets: [], particles: [], stars: [],
    sound: true, audio: null, width: 0, height: 0, dpr: 1
  };

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
    { title: "MISSÃO 7 · RAINHA DO VENENO", objective: "Derrote 30 venenos", type: "kills", target: 30 }
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
    game.waveElapsed = 0;
    game.waveKills = 0;
    game.bossWave = false;
    game.bossActive = false;
    if (mode === "free") {
      game.difficulty = 1;
      game.waveSpawnRemaining = 0;
    }
    const character = characters.find(item => item.id === game.characterId) || characters[0];
    game.player = {
      x: game.width / 2, y: game.height / 2, angle: -Math.PI / 2, dash: 0, radius: 10,
      damage: character.damage, speed: character.speed, fireRate: character.fireRate,
      maxHealth: character.maxHealth, dashCooldown: character.dashCooldown, armor: character.armor, hitCooldown: character.id === "tank" ? 1.2 : 1,
      coinMagnet: character.magnet, xpGain: character.xpGain, regen: character.regen,
      projectiles: character.projectiles, colors: character.colors
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
  }

  function formatClock(seconds) {
    const total = Math.floor(seconds);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function showLevelUp(shop = false) {
    if (game.paused) return;
    if (!shop) {
      game.xp -= game.xpNext;
      game.xpNext += 4;
      game.level++;
    }
    game.paused = true;
    levelupScreen.querySelector(".screen-kicker").textContent = shop ? `INTERVALO · ONDA ${game.difficulty}` : `NÍVEL ${game.level} ALCANÇADO`;
    levelupScreen.querySelector("h2").innerHTML = shop ? (game.bossWave ? "Chefe na próxima <span>onda</span>" : "Prepare sua <span>banana</span>") : "Escolha uma <span>melhoria</span>";
    shopSkip.classList.toggle("visible", shop);
    const upgrades = [
      { name: "ARMA · Canhão duplo", detail: "+1 semente por disparo", apply: () => { game.player.projectiles++; } },
      { name: "ARMA · Sementes de aço", detail: "+0,5 de dano por semente", apply: () => { game.player.damage += .5; } },
      { name: "ARMA · Rajada de cascas", detail: "Atira 18% mais rápido", apply: () => { game.player.fireRate = Math.max(.12, game.player.fireRate * .82); } },
      { name: "HABILIDADE · Dash turbo", detail: "Dash recarrega 18% mais rápido", apply: () => { game.player.dashCooldown = Math.max(.45, game.player.dashCooldown * .82); } },
      { name: "HABILIDADE · Reflexo de casca", detail: "+0,15s de proteção após dano", apply: () => { game.player.hitCooldown += .15; } },
      { name: "ACESSÓRIO · Botas de cipó", detail: "+25 de velocidade", apply: () => { game.player.speed += 25; } },
      { name: "ACESSÓRIO · Ímã de cobre", detail: "+18 de alcance para moedas", apply: () => { game.player.coinMagnet += 18; } },
      { name: "ACESSÓRIO · Casca reforçada", detail: "+2 de armadura", apply: () => { game.player.armor += 2; } },
      { name: "ACESSÓRIO · Broche vital", detail: "+0,2 de regeneração por segundo", apply: () => { game.player.regen += .2; } },
      { name: "CONSUMÍVEL · Vitamina", detail: "+25 de vida máxima e cura", apply: () => { game.player.maxHealth += 25; game.health = Math.min(game.player.maxHealth, game.health + 25); } }
    ].sort(() => Math.random() - .5).slice(0, 3);
    upgradeChoices.replaceChildren();
    upgrades.forEach(upgrade => {
      const cost = shop ? 4 + Math.floor(Math.random() * 7) : 0;
      const button = document.createElement("button");
      button.className = "upgrade-card";
      button.innerHTML = `<strong>${upgrade.name}</strong><span>${upgrade.detail}</span>${shop ? `<small>🍌 ${cost} cachos</small>` : ""}`;
      button.disabled = shop && game.materials < cost;
      button.addEventListener("click", () => {
        if (shop && game.materials < cost) return;
        if (shop) game.materials -= cost;
        upgrade.apply();
        levelupScreen.classList.add("hidden");
        shopSkip.classList.remove("visible");
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

  function finishWave() {
    const completedWave = game.difficulty;
    game.difficulty++;
    game.bossWave = game.mode === "free" && game.difficulty % 10 === 0;
    game.bossActive = false;
    game.enemies = [];
    game.bullets = [];
    updateHud();
    if (completedWave % 5 === 0) showLevelUp(true);
    else launchWave();
  }

  function launchWave() {
    game.spawnClock = 0;
    game.waveElapsed = 0;
    game.waveKills = 0;
    game.waveEnemyGoal = game.difficulty * 5;
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
      enemy.x += Math.cos(angle) * enemy.speed * dt;
      enemy.y += Math.sin(angle) * enemy.speed * dt;
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
    }
    for (const coin of game.coins) coin.phase += dt * 3;
    for (const particle of game.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.vx *= .985;
      particle.vy *= .985;
    }

    for (const bullet of game.bullets) {
      const target = game.enemies.find(enemy => distance(bullet, enemy) < enemy.radius + 3);
      if (target) {
        target.hp -= game.player.damage;
        bullet.life = 0;
        burst(bullet.x, bullet.y, target.color, 4);
        if (target.hp <= 0) {
          game.combo = game.comboClock > 0 ? game.combo + 1 : 1;
          game.comboClock = 2.4;
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
          }
          playTone(285, .055, .025);
          updateHud();
        }
      }
    }
    for (const coin of game.coins) {
      if (distance(player, coin) < 23 + player.coinMagnet) {
        game.score += 25;
        game.materials++;
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
    updateHud();
    if (game.mode === "free" && game.waveKills >= game.waveEnemyGoal && game.waveSpawnRemaining === 0 && game.enemies.length === 0) {
      finishWave();
      return;
    }
    if (game.mode === "story" && game.missionProgress >= missions[game.missionIndex].target) {
      finish(true);
      return;
    }
    game.bullets = game.bullets.filter(b => b.life > 0 && b.x > -20 && b.x < game.width + 20 && b.y > 55 && b.y < game.height + 20);
    game.particles = game.particles.filter(p => p.life > 0);
  }

  function shoot() {
    const p = game.player;
    for (let i = 0; i < p.projectiles; i++) {
      const spread = (i - (p.projectiles - 1) / 2) * .12 + (Math.random() - .5) * .045;
      const angle = p.angle + spread;
      game.bullets.push({ x: p.x + Math.cos(angle) * 15, y: p.y + Math.sin(angle) * 15, vx: Math.cos(angle) * 510, vy: Math.sin(angle) * 510, life: .72 });
      burst(p.x + Math.cos(angle) * 16, p.y + Math.sin(angle) * 16, "#ffd84d", 2);
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
    const kind = roll < eliteChance ? "elite" : roll < eliteChance + bruteChance ? "brute" : "wisp";
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
    drawTouchStick();
  }

  function drawNebula() {
    const glow = ctx.createRadialGradient(game.width * .68, game.height * .55, 0, game.width * .68, game.height * .55, game.width * .52);
    glow.addColorStop(0, "rgba(101, 145, 48, .16)");
    glow.addColorStop(.58, "rgba(111, 117, 39, .07)");
    glow.addColorStop(1, "rgba(8, 10, 8, 0)");
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
