const SAVE_KEY = "deepSectorSave_v1";
const SIZE = 8;
const STARTING_STARDATE = 4200;
const MISSION_DAYS = 42;
const MAX_ENERGY = 3000;
const MAX_SHIELDS = 1000;
const MAX_TORPEDOES = 8;
const SECTOR_MOVE_COST = 25;
const DEFAULT_PHASER_ENERGY = 450;
const MIN_PHASER_ENERGY = 100;
const MAX_PHASER_ENERGY = 900;
const TORPEDO_RANGE = 5;
const TORPEDO_HIT_CHANCE = 0.72;
const EXPLOSION_DURATION_MS = 950;
const PHASER_BEAM_DURATION_MS = 550;
const HEADING_ORDER = ["N", "E", "S", "W"];
const HEADING_DATA = {
  N: { dx: 0, dy: -1, glyph: "▲" },
  E: { dx: 1, dy: 0, glyph: "▶" },
  S: { dx: 0, dy: 1, glyph: "▼" },
  W: { dx: -1, dy: 0, glyph: "◀" }
};
 
let game = null;
let targetingMode = null;
let torpedoTrailTimer = null;
let explosionTimer = null;
let phaserBeamTimer = null;

const el = {
  galaxyMap: document.getElementById("galaxyMap"),
  sectorMap: document.getElementById("sectorMap"),
  log: document.getElementById("log"),
  alertReadout: document.getElementById("alertReadout"),
  stardateReadout: document.getElementById("stardateReadout"),
  quadrantReadout: document.getElementById("quadrantReadout"),
  energyReadout: document.getElementById("energyReadout"),
  shieldReadout: document.getElementById("shieldReadout"),
  torpedoReadout: document.getElementById("torpedoReadout"),
  enemyReadout: document.getElementById("enemyReadout"),
  baseReadout: document.getElementById("baseReadout"),
  energyMeter: document.getElementById("energyMeter"),
  phaserEnergyInput: document.getElementById("phaserEnergyInput"),
  phaserEnergyReadout: document.getElementById("phaserEnergyReadout"),
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

function placeInEmptyCell(grid, value) {
  let placed = false;

  while (!placed) {
    const x = randomInt(SIZE);
    const y = randomInt(SIZE);

    if (!grid[y][x]) {
      grid[y][x] = value;
      placed = true;
    }
  }
}

function createSectorLayout(q, player = null) {
  const sector = makeEmptyGrid();

  if (player) {
    sector[player.sy][player.sx] = "P";
  }

  for (let i = 0; i < q.enemies; i++) {
    placeInEmptyCell(sector, "E");
  }

  if (q.base) {
    placeInEmptyCell(sector, "B");
  }

  for (let i = 0; i < q.stars; i++) {
    placeInEmptyCell(sector, "*");
  }

  return sector;
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
        scanned: false,
        sector: null
      };

      totalEnemies += enemies;
      totalBases += base;
    }
  }

  const qx = randomInt(SIZE);
  const qy = randomInt(SIZE);
  const sx = randomInt(SIZE);
  const sy = randomInt(SIZE);

  galaxy[qy][qx].scanned = true;

  const newGame = {
    version: 1,
    status: "active",
    stardate: STARTING_STARDATE,
    deadline: STARTING_STARDATE + MISSION_DAYS,
    player: {
      qx,
      qy,
      sx,
      sy,
      heading: "N",
      energy: MAX_ENERGY,
      shields: MAX_SHIELDS,
      torpedoes: MAX_TORPEDOES
    },
    galaxy,
    enemiesRemaining: totalEnemies,
    basesRemaining: totalBases,
    phaserEnergy: DEFAULT_PHASER_ENERGY,
    lastTorpedoTrack: null,
    phaserBeam: null,
    explosion: null,
    log: [
      "Command vessel launched.",
      "Mission: clear raiders from the frontier before the sector collapses."
    ]
  };

  galaxy[qy][qx].sector = createSectorLayout(galaxy[qy][qx], newGame.player);

  return newGame;
}

function getCurrentQuadrant() {
  return game.galaxy[game.player.qy][game.player.qx];
}

function ensureCurrentSector() {
  const q = getCurrentQuadrant();

  if (!q.sector) {
    q.sector = createSectorLayout(q, game.player);
  }

  for (const row of q.sector) {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "P") row[x] = null;
    }
  }

  game.player.sx = Math.min(game.player.sx, SIZE - 1);
  game.player.sy = Math.min(game.player.sy, SIZE - 1);

  if (q.sector[game.player.sy][game.player.sx]) {
    const empty = findEmptyCell(q.sector);
    game.player.sx = empty.x;
    game.player.sy = empty.y;
  }

  q.sector[game.player.sy][game.player.sx] = "P";
  return q.sector;
}

function findEmptyCell(grid) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!grid[y][x]) return { x, y };
    }
  }

  return { x: 0, y: 0 };
}

function removeOneEnemyFromSector() {
  const q = getCurrentQuadrant();

  if (!q.sector) return;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (q.sector[y][x] === "E") {
        q.sector[y][x] = null;
        return;
      }
    }
  }
}

function removeEnemyAt(x, y) {
  const q = getCurrentQuadrant();
  const sector = ensureCurrentSector();

  if (sector[y][x] !== "E") return false;

  sector[y][x] = null;
  q.enemies -= 1;
  game.enemiesRemaining -= 1;
  return true;
}

function findSectorCells(value) {
  const sector = ensureCurrentSector();
  const cells = [];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (sector[y][x] === value) cells.push({ x, y });
    }
  }

  return cells;
}

function moveRaidersTowardPlayer() {
  const q = getCurrentQuadrant();

  if (q.enemies <= 0) return 0;

  const sector = ensureCurrentSector();
  const raiders = findSectorCells("E");
  let moved = 0;

  for (const raider of raiders) {
    if (sector[raider.y][raider.x] !== "E") continue;

    const options = [
      { x: raider.x, y: raider.y - 1 },
      { x: raider.x + 1, y: raider.y },
      { x: raider.x, y: raider.y + 1 },
      { x: raider.x - 1, y: raider.y }
    ].filter(({ x, y }) => (
      x >= 0 &&
      x < SIZE &&
      y >= 0 &&
      y < SIZE &&
      !sector[y][x]
    ));

    if (options.length === 0) continue;

    options.sort((a, b) => {
      const aDistance = Math.abs(a.x - game.player.sx) + Math.abs(a.y - game.player.sy);
      const bDistance = Math.abs(b.x - game.player.sx) + Math.abs(b.y - game.player.sy);
      return aDistance - bDistance;
    });

    const bestDistance = Math.abs(options[0].x - game.player.sx) + Math.abs(options[0].y - game.player.sy);
    const bestOptions = options.filter(({ x, y }) => (
      Math.abs(x - game.player.sx) + Math.abs(y - game.player.sy) === bestDistance
    ));
    const destination = bestOptions[randomInt(bestOptions.length)];

    sector[raider.y][raider.x] = null;
    sector[destination.y][destination.x] = "E";
    moved++;
  }

  return moved;
}

function isStraightLine(x1, y1, x2, y2) {
  return x1 === x2 || y1 === y2 || Math.abs(x1 - x2) === Math.abs(y1 - y2);
}

function getLineCells(x1, y1, x2, y2) {
  if (!isStraightLine(x1, y1, x2, y2)) return null;

  const { dx, dy } = getStepDirection(x1, y1, x2, y2);
  const cells = [];
  let x = x1 + dx;
  let y = y1 + dy;

  while (x !== x2 || y !== y2) {
    cells.push({ x, y });
    x += dx;
    y += dy;
  }

  cells.push({ x: x2, y: y2 });
  return cells;
}

function isLineBlockedByMass(cells) {
  const sector = ensureCurrentSector();

  for (const cell of cells.slice(0, -1)) {
    if (sector[cell.y][cell.x] === "*" || sector[cell.y][cell.x] === "B") {
      return true;
    }
  }

  return false;
}

function findPhaserTarget() {
  const p = game.player;
  const raiders = findSectorCells("E");
  const visibleRaiders = raiders.filter(({ x, y }) => {
    const line = getLineCells(p.sx, p.sy, x, y);
    return line && !isLineBlockedByMass(line);
  });

  visibleRaiders.sort((a, b) => (
    getSectorDistance(p.sx, p.sy, a.x, a.y) - getSectorDistance(p.sx, p.sy, b.x, b.y)
  ));

  return visibleRaiders[0] || null;
}

function isValidPhaserTarget(x, y) {
  const sector = ensureCurrentSector();

  if (sector[y][x] !== "E") return false;

  const line = getLineCells(game.player.sx, game.player.sy, x, y);
  return Boolean(line && !isLineBlockedByMass(line));
}

function isAdjacentToValue(value) {
  const sector = ensureCurrentSector();
  const p = game.player;

  return [
    { x: p.sx, y: p.sy - 1 },
    { x: p.sx + 1, y: p.sy },
    { x: p.sx, y: p.sy + 1 },
    { x: p.sx - 1, y: p.sy }
  ].some(({ x, y }) => (
    x >= 0 &&
    x < SIZE &&
    y >= 0 &&
    y < SIZE &&
    sector[y][x] === value
  ));
}

function getPhaserHitChance(energy, range) {
  const effectiveRange = Math.max(1, range);
  const requiredEnergy = 120 + effectiveRange * effectiveRange * 38;
  const chance = energy / requiredEnergy;

  return Math.max(0.15, Math.min(0.98, chance));
}

function getSectorDistance(x1, y1, x2, y2) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

function getMoveHeading(dx, dy) {
  return HEADING_ORDER.find((heading) => {
    const data = HEADING_DATA[heading];
    return data.dx === dx && data.dy === dy;
  });
}

function getTurnSteps(fromHeading, toHeading) {
  const from = HEADING_ORDER.indexOf(fromHeading);
  const to = HEADING_ORDER.indexOf(toHeading);
  const clockwise = (to - from + HEADING_ORDER.length) % HEADING_ORDER.length;

  return Math.min(clockwise, HEADING_ORDER.length - clockwise);
}

function getStepDirection(x1, y1, x2, y2) {
  return {
    dx: Math.sign(x2 - x1),
    dy: Math.sign(y2 - y1)
  };
}

function getTorpedoTrack(targetX, targetY) {
  const p = game.player;

  if (p.sx === targetX && p.sy === targetY) {
    return null;
  }

  if (!isStraightLine(p.sx, p.sy, targetX, targetY)) {
    return null;
  }

  if (getSectorDistance(p.sx, p.sy, targetX, targetY) > TORPEDO_RANGE) {
    return null;
  }

  const line = getLineCells(p.sx, p.sy, targetX, targetY);

  if (!line || isLineBlockedByMass(line)) {
    return null;
  }

  const { dx, dy } = getStepDirection(p.sx, p.sy, targetX, targetY);
  const track = [];
  let x = p.sx + dx;
  let y = p.sy + dy;

  while (x >= 0 && x < SIZE && y >= 0 && y < SIZE && track.length < TORPEDO_RANGE) {
    track.push({ x, y });
    x += dx;
    y += dy;
  }

  return track;
}

function advanceTime(days, reason) {
  if (game.status !== "active") return;

  game.stardate += days;

  if (reason) {
    log(`${reason} Stardate advanced by ${days}.`, false);
  }

  if (game.stardate > game.deadline && game.enemiesRemaining > 0) {
    endGame("failed", "Mission clock expired. Raider networks overran the frontier.");
    return;
  }

  render();
}

function showTorpedoTrail(track) {
  game.lastTorpedoTrack = track;

  if (torpedoTrailTimer) {
    clearTimeout(torpedoTrailTimer);
  }

  torpedoTrailTimer = setTimeout(() => {
    game.lastTorpedoTrack = null;
    torpedoTrailTimer = null;
    render();
  }, 500);
}

function showExplosion(x, y) {
  game.explosion = { x, y };

  if (explosionTimer) {
    clearTimeout(explosionTimer);
  }

  explosionTimer = setTimeout(() => {
    game.explosion = null;
    explosionTimer = null;
    render();
  }, EXPLOSION_DURATION_MS);
}

function showPhaserBeam(cells) {
  const direction = cells.length > 1
    ? getStepDirection(cells[0].x, cells[0].y, cells[1].x, cells[1].y)
    : { dx: 1, dy: 0 };

  game.phaserBeam = cells.map((cell, index) => ({ ...cell, index, ...direction }));

  if (phaserBeamTimer) {
    clearTimeout(phaserBeamTimer);
  }

  phaserBeamTimer = setTimeout(() => {
    game.phaserBeam = null;
    phaserBeamTimer = null;
    render();
  }, PHASER_BEAM_DURATION_MS);
}

function log(message, shouldRender = true) {
  game.log.push(message);
  if (game.log.length > 80) game.log.shift();
  if (shouldRender) render();
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
  const sector = ensureCurrentSector();
  const trackKeys = new Set((game.lastTorpedoTrack || []).map(({ x, y }) => `${x},${y}`));
  const beamByKey = new Map((game.phaserBeam || []).map((cell) => [`${cell.x},${cell.y}`, cell]));
  const explosionKey = game.explosion ? `${game.explosion.x},${game.explosion.y}` : null;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const value = sector[y][x];
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.title = `Sector ${x + 1}, ${y + 1}`;

      if (value === "P") {
        cell.textContent = HEADING_DATA[game.player.heading || "N"].glyph;
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
        cell.classList.add("empty");
      }

      if (trackKeys.has(`${x},${y}`)) {
        cell.classList.add("torpedo-track");
      }

      if (beamByKey.has(`${x},${y}`)) {
        const beam = beamByKey.get(`${x},${y}`);
        const intensity = Math.min(4, beam.index);
        const directionClass = beam.dy !== 0 && beam.dx !== 0
          ? (beam.dx === beam.dy ? "beam-diag-down" : "beam-diag-up")
          : (beam.dx !== 0 ? "beam-horizontal" : "beam-vertical");
        cell.classList.add("phaser-beam", `beam-${intensity}`, directionClass);
      }

      if (explosionKey === `${x},${y}`) {
        cell.classList.add("explosion");
      }

      if (
        targetingMode === "torpedo" &&
        (x !== game.player.sx || y !== game.player.sy) &&
        getTorpedoTrack(x, y)
      ) {
        cell.classList.add("targetable");
      }

      if (targetingMode === "phaser" && isValidPhaserTarget(x, y)) {
        cell.classList.add("targetable", "phaser-target");
      }

      cell.addEventListener("click", () => handleSectorClick(x, y));
      el.sectorMap.appendChild(cell);
    }
  }
}

function renderStatus() {
  const p = game.player;
  const q = getCurrentQuadrant();
  const daysRemaining = Math.max(0, game.deadline - game.stardate);
  const alert = getAlertState(q, daysRemaining);

  el.alertReadout.textContent = alert.label;
  el.alertReadout.className = alert.className;
  el.stardateReadout.textContent = `${game.stardate}.${daysRemaining} days left`;
  el.quadrantReadout.textContent = `${p.qx + 1}, ${p.qy + 1}`;
  el.energyReadout.textContent = p.energy;
  el.energyMeter.style.width = `${Math.max(0, Math.min(100, (p.energy / MAX_ENERGY) * 100))}%`;
  el.energyMeter.classList.toggle("low", p.energy <= MAX_ENERGY * 0.2);
  el.energyMeter.classList.toggle("mid", p.energy > MAX_ENERGY * 0.2 && p.energy <= MAX_ENERGY * 0.5);
  const maxPhaserEnergy = Math.max(MIN_PHASER_ENERGY, Math.min(MAX_PHASER_ENERGY, p.energy));
  el.phaserEnergyInput.max = maxPhaserEnergy;
  if (game.phaserEnergy > maxPhaserEnergy) game.phaserEnergy = maxPhaserEnergy;
  el.phaserEnergyInput.value = game.phaserEnergy;
  el.phaserEnergyReadout.textContent = game.phaserEnergy;
  el.shieldReadout.textContent = p.shields;
  el.torpedoReadout.textContent = p.torpedoes;
  el.enemyReadout.textContent = game.enemiesRemaining;
  el.baseReadout.textContent = game.basesRemaining;

  const disabled = game.status !== "active";
  el.scanBtn.disabled = disabled;
  el.phaserBtn.disabled = disabled || game.player.energy < MIN_PHASER_ENERGY;
  el.torpedoBtn.disabled = disabled || game.player.torpedoes <= 0;
  el.dockBtn.disabled = disabled;
  el.phaserEnergyInput.disabled = disabled || game.player.energy < MIN_PHASER_ENERGY;

  el.torpedoBtn.classList.toggle("armed", targetingMode === "torpedo");
  el.phaserBtn.classList.toggle("armed", targetingMode === "phaser");
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

function getAlertState(q, daysRemaining) {
  if (game.status === "won") return { label: "SECURED", className: "alert good" };
  if (game.status === "failed") return { label: "MISSION LOST", className: "alert danger" };
  if (q.enemies > 0) return { label: "RED", className: "alert danger" };
  if (game.player.energy <= 600) return { label: "LOW POWER", className: "alert warning" };
  if (game.player.shields <= 250) return { label: "DAMAGED", className: "alert warning" };
  if (daysRemaining <= 8) return { label: "TIME LOW", className: "alert warning" };
  return { label: "GREEN", className: "alert good" };
}

function moveToQuadrant(x, y) {
  if (game.status !== "active") return;
  targetingMode = null;
  game.lastTorpedoTrack = null;
  clearPhaserBeam();

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
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();

  const q = getCurrentQuadrant();
  q.scanned = true;

  log(`Jumped to quadrant ${x + 1}, ${y + 1}. Energy cost: ${cost}.`);
  advanceTime(Math.max(1, distance), "Warp jump complete.");

  if (game.status === "active" && q.enemies > 0) {
    raiderTacticalResponse(1);
  }

  render();
}

function longScan() {
  if (game.status !== "active") return;
  targetingMode = null;
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();

  if (game.player.energy < 50) {
    log("Not enough energy for long-range scan.");
    return;
  }

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
  advanceTime(1, "Sensor crew burned the dark away.");
}

function armPhasers() {
  if (game.status !== "active") return;
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();

  const q = getCurrentQuadrant();

  if (q.enemies <= 0) {
    log("No raiders in this quadrant.");
    return;
  }

  if (!findPhaserTarget()) {
    log("No clear phaser solution. Stellar mass or outpost shields block every firing line.");
    return;
  }

  if (game.player.energy < MIN_PHASER_ENERGY) {
    log("Not enough energy to fire phasers.");
    return;
  }

  targetingMode = targetingMode === "phaser" ? null : "phaser";
  log(targetingMode ? "Phasers armed. Select a highlighted raider." : "Phasers safed.");
}

function firePhasersAt(x, y) {
  if (!isValidPhaserTarget(x, y)) {
    log("No clear phaser solution to that target.");
    return;
  }

  const cost = Math.min(game.phaserEnergy, game.player.energy);
  if (game.player.energy < cost) {
    log("Not enough energy to fire phasers.");
    return;
  }

  targetingMode = null;
  game.player.energy -= cost;

  const beamCells = getLineCells(game.player.sx, game.player.sy, x, y);
  showPhaserBeam(beamCells);
  showExplosion(x, y);

  const range = getSectorDistance(game.player.sx, game.player.sy, x, y);
  const hitChance = getPhaserHitChance(cost, range);
  const hit = Math.random() <= hitChance;

  if (hit) {
    removeEnemyAt(x, y);
    log(`Phaser hit at sector ${x + 1}, ${y + 1}. Raider destroyed. Energy used: ${cost}.`);
  } else {
    log(`Phaser energy dispersed at range ${range}. Shot failed. Energy used: ${cost}.`);
  }

  advanceTime(1, "Weapons cycle completed.");
  checkVictory();

  if (game.status === "active" && q.enemies > 0) {
    raiderTacticalResponse(1);
  }
}

function armTorpedo() {
  if (game.status !== "active") return;

  const q = getCurrentQuadrant();

  if (game.player.torpedoes <= 0) {
    log("No torpedoes remaining.");
    return;
  }

  if (q.enemies <= 0) {
    log("No raiders in this quadrant.");
    return;
  }

  targetingMode = targetingMode === "torpedo" ? null : "torpedo";
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();
  log(targetingMode ? `Torpedo armed. Select a bearing within ${TORPEDO_RANGE} sectors.` : "Torpedo safed.");
}

function fireTorpedoAt(targetX, targetY) {
  const q = getCurrentQuadrant();
  const sector = ensureCurrentSector();
  const track = getTorpedoTrack(targetX, targetY);

  if (!track) {
    log(`Invalid firing bearing. Torpedoes need a straight or diagonal line within ${TORPEDO_RANGE} sectors.`);
    return;
  }

  game.player.torpedoes -= 1;
  targetingMode = null;
  showTorpedoTrail(track);

  for (let i = 0; i < track.length; i++) {
    const point = track[i];
    const value = sector[point.y][point.x];

    if (value === "E") {
      showTorpedoTrail(track.slice(0, i + 1));
      showExplosion(point.x, point.y);
      advanceTime(1, "Torpedo track resolved.");

      if (Math.random() <= TORPEDO_HIT_CHANCE) {
        sector[point.y][point.x] = null;
        q.enemies -= 1;
        game.enemiesRemaining -= 1;
        log(`Torpedo impact. Raider destroyed at sector ${point.x + 1}, ${point.y + 1}.`);
        checkVictory();
        if (game.status === "active" && q.enemies > 0) raiderTacticalResponse(0.85);
      } else {
        log(`Torpedo proximity fuse failed near sector ${point.x + 1}, ${point.y + 1}.`);
        if (game.status === "active") raiderTacticalResponse(1);
      }

      return;
    }

    if (value === "*" || value === "B") {
      showTorpedoTrail(track.slice(0, i + 1));
      showExplosion(point.x, point.y);
      advanceTime(1, "Torpedo track resolved.");

      if (value === "B") {
        endGame("failed", `Torpedo destroyed the starbase at sector ${point.x + 1}, ${point.y + 1}. Mission failed.`);
        return;
      }

      log(`Torpedo detonated against stellar debris at sector ${point.x + 1}, ${point.y + 1}.`);
      if (game.status === "active") raiderTacticalResponse(1);
      return;
    }
  }

  log("Torpedo spent itself in empty space.");
  advanceTime(1, "Torpedo track resolved.");
  if (game.status === "active") raiderTacticalResponse(1);
}

function dockOrRepair() {
  if (game.status !== "active") return;
  targetingMode = null;
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();

  const q = getCurrentQuadrant();

  if (!q.base) {
    log("No friendly outpost in this quadrant.");
    return;
  }

  if (!isAdjacentToValue("B")) {
    log("Docking requires an adjacent starbase.");
    return;
  }

  game.player.energy = MAX_ENERGY;
  game.player.shields = MAX_SHIELDS;
  game.player.torpedoes = MAX_TORPEDOES;

  log("Docked with outpost. Energy, shields, and torpedoes restored.");
  advanceTime(2, "Repair crews stood down.");
}

function raiderTacticalResponse(exposure = 1) {
  const moved = moveRaidersTowardPlayer();

  if (moved > 0) {
    log(`${moved === 1 ? "Raider shifts" : "Raiders shift"} to pursue your vector.`, false);
  }

  enemyCounterAttack(exposure);
}

function enemyCounterAttack(exposure = 1) {
  const q = getCurrentQuadrant();

  if (q.enemies <= 0) return;

  const hitChance = Math.min(0.92, 0.38 + q.enemies * 0.1 + exposure * 0.18);

  if (Math.random() > hitChance) {
    log("Enemy fire splashed wide.");
    return;
  }

  const damage = Math.round(q.enemies * (randomInt(120) + 80) * exposure);
  game.player.shields -= damage;

  if (game.player.shields < 0) {
    game.player.energy += game.player.shields;
    game.player.shields = 0;
  }

  log(`Enemy counter-attack. Shield damage: ${damage}.`);

  if (game.player.energy <= 0) {
    endGame("failed", "Command vessel destroyed. Mission failed.");
  }
}

function checkVictory() {
  if (game.enemiesRemaining <= 0) {
    endGame("won", "All raiders cleared. Frontier secured.");
  }
}

function endGame(status, message) {
  game.status = status;
  log(message);
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

  targetingMode = null;
  clearTorpedoTrail();
  clearExplosion();
  game = normalizeGame(JSON.parse(raw));
  log("Saved game loaded.");
  render();
}

function normalizeGame(savedGame) {
  savedGame.status = savedGame.status || "active";
  savedGame.stardate = savedGame.stardate || STARTING_STARDATE;
  savedGame.deadline = savedGame.deadline || STARTING_STARDATE + MISSION_DAYS;
  savedGame.player.heading = savedGame.player.heading || "N";
  savedGame.phaserEnergy = savedGame.phaserEnergy || DEFAULT_PHASER_ENERGY;
  if (typeof savedGame.basesRemaining !== "number") {
    savedGame.basesRemaining = savedGame.galaxy.flat().reduce((total, q) => total + q.base, 0);
  }
  savedGame.lastTorpedoTrack = savedGame.lastTorpedoTrack || null;
  savedGame.phaserBeam = null;
  savedGame.explosion = null;

  for (const row of savedGame.galaxy) {
    for (const q of row) {
      if (!Object.prototype.hasOwnProperty.call(q, "sector")) q.sector = null;
    }
  }

  return savedGame;
}

function startNewGame() {
  targetingMode = null;
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();
  game = createGame();
  render();
}

function clearTorpedoTrail() {
  if (torpedoTrailTimer) {
    clearTimeout(torpedoTrailTimer);
    torpedoTrailTimer = null;
  }

  if (game) {
    game.lastTorpedoTrack = null;
  }
}

function clearPhaserBeam() {
  if (phaserBeamTimer) {
    clearTimeout(phaserBeamTimer);
    phaserBeamTimer = null;
  }

  if (game) {
    game.phaserBeam = null;
  }
}

function clearExplosion() {
  if (explosionTimer) {
    clearTimeout(explosionTimer);
    explosionTimer = null;
  }

  if (game) {
    game.explosion = null;
  }
}

function handleSectorClick(x, y) {
  if (game.status !== "active") return;

  if (targetingMode === "phaser") {
    firePhasersAt(x, y);
    return;
  }

  if (targetingMode === "torpedo") {
    fireTorpedoAt(x, y);
    return;
  }

  moveWithinSector(x, y);
}

function moveWithinSector(x, y) {
  const q = getCurrentQuadrant();
  const sector = ensureCurrentSector();
  const destination = sector[y][x];

  if (destination === "P") return;

  if (destination) {
    log("Helm cannot plot through occupied local space.");
    return;
  }

  const dx = x - game.player.sx;
  const dy = y - game.player.sy;
  const distance = Math.abs(dx) + Math.abs(dy);

  if (distance !== 1) {
    log("Impulse helm accepts one-sector orthogonal moves only.");
    return;
  }

  const newHeading = getMoveHeading(dx, dy);
  const turnSteps = getTurnSteps(game.player.heading || "N", newHeading);
  const exposure = [0.35, 0.85, 1.45][turnSteps];
  const maneuverName = ["forward burn", "banking turn", "reverse turn"][turnSteps];
  const cost = SECTOR_MOVE_COST + turnSteps * 20;

  if (game.player.energy < cost) {
    log("Insufficient energy for impulse maneuver.");
    return;
  }

  sector[game.player.sy][game.player.sx] = null;
  game.player.sx = x;
  game.player.sy = y;
  game.player.heading = newHeading;
  sector[y][x] = "P";
  game.player.energy -= cost;
  clearTorpedoTrail();
  clearPhaserBeam();
  clearExplosion();

  log(`Impulse ${maneuverName} to sector ${x + 1}, ${y + 1}. Energy cost: ${cost}.`);
  advanceTime(turnSteps === 0 ? 0 : 1, turnSteps === 0 ? "" : "Helm turn completed.");

  if (game.status === "active" && q.enemies > 0) {
    raiderTacticalResponse(exposure);
  }
}

function updatePhaserEnergy() {
  game.phaserEnergy = Number(el.phaserEnergyInput.value);
  renderStatus();
}

el.newGameBtn.addEventListener("click", startNewGame);
el.saveBtn.addEventListener("click", saveGame);
el.loadBtn.addEventListener("click", loadGame);
el.scanBtn.addEventListener("click", longScan);
el.phaserBtn.addEventListener("click", armPhasers);
el.torpedoBtn.addEventListener("click", armTorpedo);
el.dockBtn.addEventListener("click", dockOrRepair);
el.phaserEnergyInput.addEventListener("input", updatePhaserEnergy);

startNewGame();
