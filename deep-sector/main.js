const SAVE_KEY = "deepSectorSave_v1";
const SIZE = 8;
 
let game = null;

const el = {
  galaxyMap: document.getElementById("galaxyMap"),
  sectorMap: document.getElementById("sectorMap"),
  log: document.getElementById("log"),
  quadrantReadout: document.getElementById("quadrantReadout"),
  energyReadout: document.getElementById("energyReadout"),
  shieldReadout: document.getElementById("shieldReadout"),
  torpedoReadout: document.getElementById("torpedoReadout"),
  enemyReadout: document.getElementById("enemyReadout"),
  newGameBtn: document.getElementById("newGameBtn"),
  saveBtn: document.getElementById("saveBtn"),
  loadBtn: document.getElementById("loadBtn"),
  scanBtn: document.getElementById("scanBtn"),
  phaserBtn: document.getElementById("phaserBtn"),
  torpedoBtn: document.getElementById("torpedoBtn"),
  dockBtn: document.getElementById("dockBtn")
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function makeEmptyGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null)
  );
}

function createGame() {
  const galaxy = makeEmptyGrid();
  let totalEnemies = 0;
  let totalBases = 0;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const enemies = Math.random() < 0.32 ? randomInt(3) + 1 : 0;
      const base = Math.random() < 0.08 ? 1 : 0;
      const stars = randomInt(6);

      galaxy[y][x] = {
        enemies,
        base,
        stars,
        scanned: false
      };

      totalEnemies += enemies;
      totalBases += base;
    }
  }

  const qx = randomInt(SIZE);
  const qy = randomInt(SIZE);

  galaxy[qy][qx].scanned = true;

  return {
    version: 1,
    player: {
      qx,
      qy,
      sx: randomInt(SIZE),
      sy: randomInt(SIZE),
      energy: 3000,
      shields: 1000,
      torpedoes: 8
    },
    galaxy,
    enemiesRemaining: totalEnemies,
    basesRemaining: totalBases,
    log: [
      "Command vessel launched.",
      "Mission: clear raiders from the frontier before the sector collapses."
    ]
  };
}

function getCurrentQuadrant() {
  return game.galaxy[game.player.qy][game.player.qx];
}

function createSectorFromQuadrant() {
  const sector = makeEmptyGrid();
  const q = getCurrentQuadrant();

  sector[game.player.sy][game.player.sx] = "P";

  let placedEnemies = 0;
  while (placedEnemies < q.enemies) {
    const x = randomInt(SIZE);
    const y = randomInt(SIZE);
    if (!sector[y][x]) {
      sector[y][x] = "E";
      placedEnemies++;
    }
  }

  if (q.base) {
    let placed = false;
    while (!placed) {
      const x = randomInt(SIZE);
      const y = randomInt(SIZE);
      if (!sector[y][x]) {
        sector[y][x] = "B";
        placed = true;
      }
    }
  }

  let placedStars = 0;
  while (placedStars < q.stars) {
    const x = randomInt(SIZE);
    const y = randomInt(SIZE);
    if (!sector[y][x]) {
      sector[y][x] = "*";
      placedStars++;
    }
  }

  return sector;
}

function log(message) {
  game.log.push(message);
  if (game.log.length > 80) game.log.shift();
  render();
}

function renderGalaxy() {
  el.galaxyMap.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const q = game.galaxy[y][x];
      const cell = document.createElement("button");
      cell.className = "cell";

      const isCurrent = x === game.player.qx && y === game.player.qy;
      if (isCurrent) cell.classList.add("current");

      if (q.scanned || isCurrent) {
        cell.textContent = `${q.enemies}${q.base}${q.stars}`;
      } else {
        cell.textContent = "?";
      }

      cell.title = `Quadrant ${x + 1}, ${y + 1}`;
      cell.addEventListener("click", () => moveToQuadrant(x, y));

      el.galaxyMap.appendChild(cell);
    }
  }
}

function renderSector() {
  el.sectorMap.innerHTML = "";
  const sector = createSectorFromQuadrant();

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const value = sector[y][x];
      const cell = document.createElement("div");
      cell.className = "cell";

      if (value === "P") {
        cell.textContent = "▲";
        cell.classList.add("player");
      } else if (value === "E") {
        cell.textContent = "◆";
        cell.classList.add("enemy");
      } else if (value === "B") {
        cell.textContent = "⬢";
        cell.classList.add("base");
      } else if (value === "*") {
        cell.textContent = "✦";
        cell.classList.add("star");
      } else {
        cell.textContent = "";
      }

      el.sectorMap.appendChild(cell);
    }
  }
}

function renderStatus() {
  const p = game.player;
  el.quadrantReadout.textContent = `${p.qx + 1}, ${p.qy + 1}`;
  el.energyReadout.textContent = p.energy;
  el.shieldReadout.textContent = p.shields;
  el.torpedoReadout.textContent = p.torpedoes;
  el.enemyReadout.textContent = game.enemiesRemaining;
}

function renderLog() {
  el.log.innerHTML = "";
  for (const line of game.log.slice().reverse()) {
    const div = document.createElement("div");
    div.className = "logLine";
    div.textContent = `> ${line}`;
    el.log.appendChild(div);
  }
}

function render() {
  renderGalaxy();
  renderSector();
  renderStatus();
  renderLog();
}

function moveToQuadrant(x, y) {
  const distance = Math.abs(game.player.qx - x) + Math.abs(game.player.qy - y);
  const cost = Math.max(100, distance * 150);

  if (game.player.energy < cost) {
    log("Insufficient energy for jump.");
    return;
  }

  game.player.energy -= cost;
  game.player.qx = x;
  game.player.qy = y;
  game.player.sx = randomInt(SIZE);
  game.player.sy = randomInt(SIZE);

  const q = getCurrentQuadrant();
  q.scanned = true;

  log(`Jumped to quadrant ${x + 1}, ${y + 1}. Energy cost: ${cost}.`);

  if (q.enemies > 0) {
    enemyCounterAttack();
  }

  render();
}

function longScan() {
  const px = game.player.qx;
  const py = game.player.qy;

  for (let y = py - 1; y <= py + 1; y++) {
    for (let x = px - 1; x <= px + 1; x++) {
      if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
        game.galaxy[y][x].scanned = true;
      }
    }
  }

  game.player.energy -= 50;
  log("Long-range scan completed.");
}

function firePhasers() {
  const q = getCurrentQuadrant();

  if (q.enemies <= 0) {
    log("No raiders in this quadrant.");
    return;
  }

  const cost = 350;
  if (game.player.energy < cost) {
    log("Not enough energy to fire phasers.");
    return;
  }

  game.player.energy -= cost;

  const destroyed = Math.random() < 0.7 ? 1 : 0;

  if (destroyed) {
    q.enemies -= 1;
    game.enemiesRemaining -= 1;
    log("Phaser strike destroyed one raider.");
    checkVictory();
  } else {
    log("Phaser strike missed.");
    enemyCounterAttack();
  }
}

function fireTorpedo() {
  const q = getCurrentQuadrant();

  if (game.player.torpedoes <= 0) {
    log("No torpedoes remaining.");
    return;
  }

  if (q.enemies <= 0) {
    log("No raiders in this quadrant.");
    return;
  }

  game.player.torpedoes -= 1;

  const destroyed = Math.random() < 0.55 ? 1 : 0;

  if (destroyed) {
    q.enemies -= 1;
    game.enemiesRemaining -= 1;
    log("Torpedo impact. Raider destroyed.");
    checkVictory();
  } else {
    log("Torpedo missed.");
    enemyCounterAttack();
  }
}

function dockOrRepair() {
  const q = getCurrentQuadrant();

  if (!q.base) {
    log("No friendly outpost in this quadrant.");
    return;
  }

  game.player.energy = 3000;
  game.player.shields = 1000;
  game.player.torpedoes = 8;

  log("Docked with outpost. Energy, shields, and torpedoes restored.");
}

function enemyCounterAttack() {
  const q = getCurrentQuadrant();

  if (q.enemies <= 0) return;

  const damage = q.enemies * (randomInt(120) + 80);
  game.player.shields -= damage;

  if (game.player.shields < 0) {
    game.player.energy += game.player.shields;
    game.player.shields = 0;
  }

  log(`Enemy counter-attack. Shield damage: ${damage}.`);

  if (game.player.energy <= 0) {
    log("Command vessel destroyed. Mission failed.");
  }
}

function checkVictory() {
  if (game.enemiesRemaining <= 0) {
    log("All raiders cleared. Frontier secured.");
  }
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
  log("Game saved to this browser.");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);

  if (!raw) {
    log("No saved game found.");
    return;
  }

  game = JSON.parse(raw);
  log("Saved game loaded.");
  render();
}

function startNewGame() {
  game = createGame();
  render();
}

el.newGameBtn.addEventListener("click", startNewGame);
el.saveBtn.addEventListener("click", saveGame);
el.loadBtn.addEventListener("click", loadGame);
el.scanBtn.addEventListener("click", longScan);
el.phaserBtn.addEventListener("click", firePhasers);
el.torpedoBtn.addEventListener("click", fireTorpedo);
el.dockBtn.addEventListener("click", dockOrRepair);

startNewGame();
