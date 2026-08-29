const defaultStorage = {
  diamonds: 0,
  selectedCar: "starter",
  selectedMap: "city",
  player: "Lukaas",
  ownedCars: ["starter"]
};

const storage = { ...defaultStorage };
const defaultAdminNames = ["Lukaas", "Mich"];

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function readProfiles() {
  try {
    const raw = localStorage.getItem("lumiPlayerProfiles");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getKnownPlayers() {
  return [...defaultAdminNames];
}

function syncKnownPlayers() {
  return getKnownPlayers();
}

function ensurePlayerProfile(name) {
  const safeName = normalizeName(name);
  if (!safeName) return;

  const profiles = readProfiles();
  profiles[safeName] = profiles[safeName] || {
    diamonds: 0,
    selectedCar: "starter",
    selectedMap: "city",
    ownedCars: ["starter"],
    score: 0
  };

  localStorage.setItem("lumiPlayerProfiles", JSON.stringify(profiles));
}

const profileForCurrentUser = defaultStorage;
storage.diamonds = Number(profileForCurrentUser.diamonds || 0);
storage.selectedCar = profileForCurrentUser.selectedCar || "starter";
storage.selectedMap = profileForCurrentUser.selectedMap || "city";
storage.ownedCars = Array.isArray(profileForCurrentUser.ownedCars) && profileForCurrentUser.ownedCars.length
  ? [...profileForCurrentUser.ownedCars]
  : ["starter"];

storage.player = normalizeName(storage.player) || "Lukaas";
ensurePlayerProfile(storage.player);
syncKnownPlayers();

Object.keys(defaultStorage).forEach((key) => {
  if (key === "ownedCars") {
    storage.ownedCars = [...storage.ownedCars];
  }
});

const cars = [
  { id: "starter", name: "Blue Racer", price: 0, accent: "#2965ef", image: "download (8).png", description: "Base model" },
  { id: "blaze", name: "Yellow Racer", price: 50, accent: "#ffb21c", image: "download.png", description: "Aero boost" },
  { id: "phantom", name: "Red Racer", price: 150, accent: "#f2383d", image: "download (9).png", description: "Night predator" },
  { id: "titan", name: "Galaxy Racer", price: 300, accent: "#8d5cff", image: "download (1).png", description: "Cosmic elite drift" },
  { id: "slime", name: "Slime Car", price: 1500, accent: "#73ff62", image: "Slime Car.png", description: "Radioactive speed" },
  { id: "admin", name: "Admin Car", adminOnly: true, accent: "#ff65d7", image: "Admin Car.png", description: "Admin only" }
];

const roadLanes = [25.33, 50, 74.67];
const scoreValue = document.getElementById("scoreValue");
const speedValue = document.getElementById("speedValue");
const diamondValue = document.getElementById("diamondValue");
const walletValue = document.getElementById("walletValue");
const shopList = document.getElementById("shopList");
const inventoryList = document.getElementById("inventoryList");
const inventoryCount = document.getElementById("inventoryCount");
const garageTabs = document.querySelectorAll(".garage-tab");
const shopSection = document.getElementById("shopSection");
const inventorySection = document.getElementById("inventorySection");
const bundlesSection = document.getElementById("bundlesSection");
const obstaclesLayer = document.getElementById("obstacles");
const diamondsLayer = document.getElementById("diamonds");
const heartsLayer = document.getElementById("hearts");
const tacosLayer = document.getElementById("tacos");
const starsLayer = document.getElementById("stars");
const playerCar = document.getElementById("playerCar");
const crashOverlay = document.getElementById("crashOverlay");
const shopPanel = document.getElementById("shopPanel");
const adminPanel = document.getElementById("adminPanel");
const messageBanner = document.getElementById("messageBanner");
const globalMessageDisplay = document.getElementById("globalMessageDisplay");
const startBtn = document.getElementById("startBtn");
const shopBtn = document.getElementById("shopBtn");
const mapSelect = document.getElementById("mapSelect");
const playerSelect = document.getElementById("playerSelect");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const giveCarsBtn = document.getElementById("giveCarsBtn");
const startTacoEventBtn = document.getElementById("startTacoEventBtn");
const startGalaxyEventBtn = document.getElementById("startGalaxyEventBtn");
const globalMessageInput = document.getElementById("globalMessageInput");
const sendGlobalMessageBtn = document.getElementById("sendGlobalMessageBtn");
const autoRaceBtn = document.getElementById("autoRaceBtn");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const adminTargetSelect = document.getElementById("adminTargetSelect");
const adminCarSelect = document.getElementById("adminCarSelect");
const adminGiftDiamonds = document.getElementById("adminGiftDiamonds");
const adminGiftScore = document.getElementById("adminGiftScore");
const giveCarToPlayerBtn = document.getElementById("giveCarToPlayerBtn");
const giveDiamondsToPlayerBtn = document.getElementById("giveDiamondsToPlayerBtn");
const giveScoreToPlayerBtn = document.getElementById("giveScoreToPlayerBtn");
const playerNameInput = document.getElementById("playerNameInput");
const savePlayerNameBtn = document.getElementById("savePlayerNameBtn");
const playerSetupOverlay = document.getElementById("playerSetupOverlay");
const giftOverlay = document.getElementById("giftOverlay");
const giftDetail = document.getElementById("giftDetail");
const claimGiftBtn = document.getElementById("claimGiftBtn");
const speedNeedle = document.getElementById("speedNeedle");
const gameArea = document.getElementById("gameArea");
const crashShopBtn = document.getElementById("crashShopBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const lobbyMusic = document.getElementById("lobbyMusic");
const driveMusic = document.getElementById("driveMusic");
const crashSound = document.getElementById("crashSound");
const tacoMusic = document.getElementById("tacoMusic");
const galaxyMusic = document.getElementById("galaxyMusic");
const MUSIC_VOLUME = 0.25;

const firebaseConfigs = [
  {
    name: "LuMiRace",
    apiKey: "AIzaSyDbXgHX43UoNG2yKhaFkXQmLgNV4SGlh-A",
    authDomain: "lumirace-d2426.firebaseapp.com",
    databaseURL: "https://lumirace-d2426-default-rtdb.firebaseio.com",
    projectId: "lumirace-d2426",
    storageBucket: "lumirace-d2426.firebasestorage.app",
    messagingSenderId: "863831691846",
    appId: "1:863831691846:web:82c77ad1bc1fb9bd817047",
    measurementId: "G-8JLWSSFN49"
  },
  {
    name: "LuMiRace1",
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
];

function initializeFirebaseConnection() {
  if (typeof firebase === "undefined") return null;

  const validConfigs = firebaseConfigs.filter((config) => config && config.databaseURL && config.apiKey && config.projectId);

  for (const config of validConfigs) {
    try {
      const hasApp = firebase.apps.some((app) => app.name === config.projectId || app.options && app.options.projectId === config.projectId);
      if (!hasApp) {
        firebase.initializeApp(config, config.projectId);
      }

      const app = firebase.app(config.projectId);
      return {
        app,
        database: app.database(),
        config
      };
    } catch (error) {
      console.warn(`Firebase init failed for ${config.name}:`, error);
    }
  }

  return null;
}

const firebaseConnection = initializeFirebaseConnection();
const globalMessages = firebaseConnection ? firebaseConnection.database.ref("globalMessages") : null;
const globalEvents = firebaseConnection ? firebaseConnection.database.ref("globalEvents") : null;

[lobbyMusic, driveMusic, crashSound, tacoMusic, galaxyMusic].forEach((audio) => {
  audio.volume = MUSIC_VOLUME;
});

function getKnownPlayers() {
  return [...defaultAdminNames];
}

function syncKnownPlayers() {
  const known = getKnownPlayers();
  localStorage.setItem("lumiKnownPlayers", JSON.stringify(known));
  return known;
}

function showGiftOverlay(message) {
  if (giftOverlay) giftOverlay.classList.add("hidden");
}

function hideGiftOverlay() {
  if (giftOverlay) giftOverlay.classList.add("hidden");
  localStorage.removeItem("lumiPendingGift");
}

function processIncomingGift() {
  localStorage.removeItem("lumiPendingGift");
  if (giftOverlay) giftOverlay.classList.add("hidden");
}

function refreshKnownPlayers() {
  const names = getKnownPlayers();
  const deviceName = normalizeName(getDeviceName());
  const currentPlayer = normalizeName(storage.player);
  const options = names.length ? names : [currentPlayer || deviceName || "Player"];

  const buildOptions = (select, value) => {
    const rendered = [...new Set(options.map((name) => normalizeName(name)).filter(Boolean))];
    select.innerHTML = rendered.map((name) => `<option value="${name}">${name}</option>`).join("");

    const valueToUse = normalizeName(value || currentPlayer || deviceName || rendered[0]);
    if (rendered.includes(valueToUse)) {
      select.value = valueToUse;
    } else if (rendered[0]) {
      select.value = rendered[0];
    }
  };

  buildOptions(playerSelect, storage.player);
  buildOptions(adminTargetSelect, storage.player || options[0]);
  adminCarSelect.innerHTML = cars
    .filter((car) => !car.adminOnly)
    .map((car) => `<option value="${car.id}">${car.name}</option>`)
    .join("");
}

function saveProgress() {
  const safeName = normalizeName(storage.player);
  if (!safeName) {
    localStorage.removeItem("lumiPlayer");
    return;
  }

  ensurePlayerProfile(safeName);
  localStorage.setItem("lumiPlayer", safeName);

  const profiles = readProfiles();
  profiles[safeName] = {
    diamonds: Number(storage.diamonds || 0),
    selectedCar: storage.selectedCar,
    selectedMap: storage.selectedMap,
    ownedCars: [...storage.ownedCars],
    score: Number(Math.floor(gameState.score || 0))
  };

  localStorage.setItem("lumiPlayerProfiles", JSON.stringify(profiles));
  persistKnownNames(Object.keys(profiles));
}

const gameState = {
  running: false,
  score: 0,
  speed: 0,
  lane: 1,
  playerX: 50,
  targetX: 50,
  obstacles: [],
  diamonds: [],
  hearts: [],
  tacos: [],
  stars: [],
  obstacleTimer: 0,
  diamondTimer: 0,
  heartTimer: 0,
  eventTimer: 0,
  eventType: null,
  eventTimeLeft: 0,
  diamondsCollected: 0,
  reviveAvailable: false,
  boostHeld: false,
  boostActive: false,
  boostTimer: 0,
  boostCooldown: 0,
  dayNightTimer: 0,
  isNight: false,
  lastFrame: 0,
  currentCar: cars.find((car) => car.id === storage.selectedCar) || cars[0],
  autoRace: false,
  autoRaceTimer: 0
};

function updateHud() {
  scoreValue.textContent = `🏆 ${Math.floor(gameState.score)}`;
  const speedValueNumber = Math.min(240, Math.round(gameState.speed * 0.45));
  speedValue.textContent = speedValueNumber;
  speedNeedle.style.transform = `translate(-50%, -80%) rotate(${(-120 + (speedValueNumber / 240) * 240)}deg)`;
  diamondValue.textContent = `💎 ${storage.diamonds}`;
  walletValue.textContent = `💎 ${storage.diamonds}`;
}

function showBanner(text) {
  messageBanner.textContent = text;
  messageBanner.classList.add("show");
  clearTimeout(showBanner.timeoutId);
  showBanner.timeoutId = setTimeout(() => {
    messageBanner.classList.remove("show");
  }, 1300);
}

function showGlobalMessage(message) {
  globalMessageDisplay.textContent = message;
  globalMessageDisplay.classList.add("visible");
  clearTimeout(showGlobalMessage.timeoutId);
  showGlobalMessage.timeoutId = setTimeout(() => {
    globalMessageDisplay.classList.remove("visible");
  }, 5000);
}

function sendGlobalMessage() {
  const message = globalMessageInput.value.trim();
  if (!message) return;

  const sender = ["Lukaas", "Mich"].includes(playerSelect.value) ? playerSelect.value : "Lukaas";
  const fullMessage = `${sender}: ${message}`;
  showGlobalMessage(fullMessage);
  globalMessageInput.value = "";
  globalMessageInput.blur();

  if (!globalMessages) {
    showBanner("Message shown locally; Firebase is unavailable");
    return;
  }

  globalMessages.push({ message: fullMessage, createdAt: Date.now() })
    .then(() => {
      showBanner("Global message sent");
    })
    .catch(() => showBanner("Firebase rules block this message"));
}

if (globalMessages) {
  globalMessages.limitToLast(1).on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data && data.message) showGlobalMessage(data.message);
  });

  globalMessages.on("value", () => {
    sendGlobalMessageBtn.disabled = false;
  }, () => showBanner("Firebase connection failed"));
}

function startGlobalEvent(eventType) {
  if (!globalEvents) {
    startEvent(eventType);
    return;
  }

  globalEvents.push({ eventType, createdAt: Date.now() })
    .catch(() => showBanner("Firebase rules block this event"));
}

if (globalEvents) {
  globalEvents.limitToLast(1).on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data && (data.eventType === "taco" || data.eventType === "galaxy")) {
      startEvent(data.eventType);
    }
  }, () => showBanner("Firebase event connection failed"));
}

function playAudio(audio) {
  audio.play().catch(() => {});
}

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function pauseAudio(audio) {
  audio.pause();
}

function applyMap(mapId) {
  const selectedMap = ["city", "desert", "snow"].includes(mapId) ? mapId : "city";
  storage.selectedMap = selectedMap;
  mapSelect.value = selectedMap;
  gameArea.classList.remove("map-city", "map-desert", "map-snow");
  gameArea.classList.add(`map-${selectedMap}`);
  saveProgress();
}

function stopEventMusic() {
  stopAudio(tacoMusic);
  stopAudio(galaxyMusic);
}

function startRandomEvent() {
  if (gameState.eventType) return;

  startEvent(Math.random() < 0.5 ? "taco" : "galaxy");
}

function startEvent(eventType) {
  if (gameState.eventType) {
    showBanner("An event is already active");
    return;
  }

  if (!gameState.running) {
    showBanner("Start a race first");
    return;
  }

  gameState.eventType = eventType;
  gameState.eventTimeLeft = 12000;
  gameState.eventTimer = 0;
  pauseAudio(driveMusic);
  stopEventMusic();
  playAudio(gameState.eventType === "taco" ? tacoMusic : galaxyMusic);
  gameArea.classList.toggle("taco-event", gameState.eventType === "taco");
  gameArea.classList.toggle("galaxy-event", gameState.eventType === "galaxy");
  showBanner(gameState.eventType === "taco" ? "🌮 Taco rain! +5 each" : "🌌 Galaxy event! +10 each");
}

function endRandomEvent() {
  gameState.eventType = null;
  gameState.eventTimeLeft = 0;
  tacosLayer.innerHTML = "";
  starsLayer.innerHTML = "";
  gameState.tacos = [];
  gameState.stars = [];
  stopEventMusic();
  if (gameState.running) playAudio(driveMusic);
  gameArea.classList.remove("taco-event", "galaxy-event");
  showBanner("Event ended");
}

function applyCarSkin(carId) {
  const selected = cars.find((car) => car.id === carId) || cars[0];
  playerCar.style.setProperty("--car-color", selected.accent);
  playerCar.style.setProperty("--car-image", `url("${selected.image}")`);
  gameState.currentCar = selected;
}

function addCarWheels(carElement) {
  carElement.innerHTML = '<span class="wheel left front"></span><span class="wheel left rear"></span><span class="wheel right front"></span><span class="wheel right rear"></span>';
}

function movePlayer() {
  gameState.targetX = roadLanes[gameState.lane];
}

function changeLane(direction) {
  gameState.lane = Math.max(0, Math.min(roadLanes.length - 1, gameState.lane + direction));
  movePlayer();
}

function autoAvoidObstacles(delta) {
  gameState.autoRaceTimer += delta;
  if (gameState.autoRaceTimer < 120) return;
  gameState.autoRaceTimer = 0;

  const dangerRange = gameState.obstacles.filter((obstacle) => obstacle.y > 170 && obstacle.y < 440);
  const blockedLanes = new Set(dangerRange.map((obstacle) => obstacle.lane));
  if (!blockedLanes.has(gameState.lane)) return;

  const safestLane = roadLanes.reduce((bestLane, lanePosition, laneIndex) => {
    const nearestObstacle = gameState.obstacles
      .filter((obstacle) => obstacle.lane === laneIndex && obstacle.y > 80 && obstacle.y < 470)
      .reduce((nearest, obstacle) => Math.max(nearest, obstacle.y), -1);
    const bestObstacle = gameState.obstacles
      .filter((obstacle) => obstacle.lane === bestLane && obstacle.y > 80 && obstacle.y < 470)
      .reduce((nearest, obstacle) => Math.max(nearest, obstacle.y), -1);
    return nearestObstacle < bestObstacle ? laneIndex : bestLane;
  }, gameState.lane);

  if (safestLane !== gameState.lane && !blockedLanes.has(safestLane)) {
    gameState.lane = safestLane;
    movePlayer();
    showBanner("Auto race: obstacle avoided");
  }
}

function updatePlayerPosition(delta) {
  const smoothing = Math.min(1, delta / 120);
  gameState.playerX += (gameState.targetX - gameState.playerX) * smoothing;
  playerCar.style.left = `${gameState.playerX}%`;
  playerCar.style.transform = `translateX(-50%) scale(${gameState.boostActive ? 1.04 : 1})`;
}

function showGarageView(viewName) {
  const nextView = viewName || "shop";
  const isAdmin = nextView === "admin";

  shopSection.classList.toggle("hidden", nextView !== "shop");
  inventorySection.classList.toggle("hidden", nextView !== "inventory");
  bundlesSection.classList.toggle("hidden", nextView !== "bundles");
  adminPanel.classList.toggle("hidden", !isAdmin);

  garageTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === nextView);
  });

  if (nextView !== "admin") {
    shopPanel.classList.remove("hidden");
  }
}

function renderInventory() {
  const ownedCars = cars.filter((car) => storage.ownedCars.includes(car.id));
  inventoryCount.textContent = `${ownedCars.length} cars`;

  inventoryList.innerHTML = ownedCars.map((car) => {
    const selected = storage.selectedCar === car.id;
    return `
      <div class="shop-item">
        <div class="shop-car-preview" style="--car-image: url('${car.image}');"></div>
        <div>
          <h3>${car.name}</h3>
          <p>${car.description}</p>
        </div>
        <button class="shop-button ${selected ? "selected" : ""}" data-car-id="${car.id}" type="button">${selected ? "Equipped" : "Use"}</button>
      </div>
    `;
  }).join("");

  inventoryList.querySelectorAll(".shop-button").forEach((button) => {
    button.addEventListener("click", () => {
      const carId = button.dataset.carId;
      const car = cars.find((item) => item.id === carId);
      if (!car) return;

      storage.selectedCar = carId;
      saveProgress();
      applyCarSkin(carId);
      renderInventory();
      buildShop();
      showBanner(`${car.name} equipped`);
    });
  });
}

function buildShop() {
  shopList.innerHTML = cars.map((car) => {
    const owned = storage.ownedCars.includes(car.id);
    const selected = storage.selectedCar === car.id;
    const label = car.adminOnly && !owned ? "Admin only" : selected ? "Selected" : owned ? "Owned" : `Buy ${car.price}`;
    const className = car.adminOnly && !owned ? "admin-only" : selected ? "selected" : owned ? "owned" : "locked";
    const disabled = car.adminOnly && !owned ? "disabled" : owned ? "disabled" : "";

    return `
      <div class="shop-item">
        <div class="shop-car-preview" style="--car-image: url('${car.image}');"></div>
        <div>
          <h3>${car.name}</h3>
          <p>${car.description}</p>
        </div>
        <button class="shop-button ${className}" data-car-id="${car.id}" ${disabled}>${label}</button>
      </div>
    `;
  }).join("");

  shopList.querySelectorAll(".shop-button").forEach((button) => {
    button.addEventListener("click", () => {
      const carId = button.dataset.carId;
      const car = cars.find((item) => item.id === carId);
      if (!car) return;

      if (storage.ownedCars.includes(carId)) {
        showBanner(`${car.name} is owned — equip it in Inventory`);
        return;
      }

      if (car.adminOnly) return;

      if (storage.diamonds >= car.price) {
        storage.diamonds -= car.price;
        storage.ownedCars.push(carId);
        saveProgress();
        buildShop();
        renderInventory();
        updateHud();
        showBanner(`${car.name} unlocked`);
      } else {
        showBanner("Not enough diamonds");
      }
    });
  });
}

function resetGame() {
  stopAudio(lobbyMusic);
  stopAudio(crashSound);
  playAudio(driveMusic);
  crashOverlay.classList.remove("visible");
  shopPanel.classList.add("hidden");
  applyMap(storage.selectedMap);
  mapSelect.disabled = true;
  gameState.running = true;
  gameState.score = 0;
  gameState.speed = 150;
  gameState.lane = 1;
  gameState.playerX = 50;
  gameState.targetX = 50;
  gameState.obstacles = [];
  gameState.diamonds = [];
  gameState.hearts = [];
  gameState.tacos = [];
  gameState.stars = [];
  gameState.obstacleTimer = 0;
  gameState.diamondTimer = 0;
  gameState.heartTimer = 0;
  gameState.eventTimer = 0;
  gameState.eventType = null;
  gameState.eventTimeLeft = 0;
  gameState.diamondsCollected = 0;
  gameState.reviveAvailable = false;
  gameState.boostHeld = false;
  gameState.boostActive = false;
  gameState.boostTimer = 0;
  gameState.boostCooldown = 0;
  gameState.dayNightTimer = 0;
  gameState.isNight = false;
  gameState.lastFrame = 0;

  obstaclesLayer.innerHTML = "";
  diamondsLayer.innerHTML = "";
  heartsLayer.innerHTML = "";
  tacosLayer.innerHTML = "";
  starsLayer.innerHTML = "";
  stopEventMusic();
  applyCarSkin(storage.selectedCar);
  gameArea.classList.remove("night");
  movePlayer();
  updatePlayerPosition(100);
  updateHud();
  showBanner("Race started");
}

function finishRace() {
  if (!gameState.running) return;
  gameState.running = false;
  stopAudio(driveMusic);
  stopEventMusic();
  gameState.eventType = null;
  gameState.eventTimeLeft = 0;
  tacosLayer.innerHTML = "";
  starsLayer.innerHTML = "";
  gameState.tacos = [];
  gameState.stars = [];
  gameArea.classList.remove("taco-event", "galaxy-event");
  crashSound.currentTime = 0;
  playAudio(crashSound);
  setTimeout(() => {
    if (!gameState.running) playAudio(lobbyMusic);
  }, 900);
  crashOverlay.classList.add("visible");
  mapSelect.disabled = false;
  saveProgress();
  updateHud();
  buildShop();
  shopPanel.classList.remove("hidden");
  showBanner(`Crash! +${gameState.diamondsCollected} diamonds`);
}

function openShop() {
  crashOverlay.classList.remove("visible");
  stopAudio(driveMusic);
  playAudio(lobbyMusic);
  showGarageView("shop");
  shopList.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showBanner("Garage open");
}

function openAdminPanel() {
  showGarageView("admin");
  refreshKnownPlayers();
  showBanner("Admin panel opened");
}

function updatePlayerProfile(targetName, updater) {
  const safeName = normalizeName(targetName);
  if (!safeName) return;

  const profiles = readProfiles();
  const profile = profiles[safeName] || {
    diamonds: 0,
    selectedCar: "starter",
    selectedMap: "city",
    ownedCars: ["starter"],
    score: 0
  };

  updater(profile);
  profiles[safeName] = profile;
  localStorage.setItem("lumiPlayerProfiles", JSON.stringify(profiles));
  syncKnownPlayers();
}

function giftPlayer(targetName, gift) {
  const safeName = normalizeName(targetName);
  if (!safeName) return;

  updatePlayerProfile(safeName, (profile) => {
    if (gift.type === "car") {
      if (!profile.ownedCars.includes(gift.carId)) {
        profile.ownedCars.push(gift.carId);
      }
      profile.selectedCar = gift.carId;
    }

    if (gift.type === "diamonds") {
      profile.diamonds = (Number(profile.diamonds) || 0) + Number(gift.amount || 0);
    }

    if (gift.type === "score") {
      profile.score = (Number(profile.score) || 0) + Number(gift.amount || 0);
    }
  });
}

function unlockCarForPlayer(playerName, carId) {
  const safeName = normalizeName(playerName);
  const car = cars.find((item) => item.id === carId);
  if (!safeName || !car || car.adminOnly) return;

  giftPlayer(safeName, { type: "car", carId, carName: car.name });
  showBanner(`${car.name} gifted to ${safeName}`);
}

function giveDiamondsToPlayer(playerName, amount) {
  const safeName = normalizeName(playerName);
  if (!safeName || !Number.isFinite(amount) || amount <= 0) return;

  giftPlayer(safeName, { type: "diamonds", amount });
  showBanner(`+${amount} diamonds to ${safeName}`);
}

function giveScoreToPlayer(playerName, amount) {
  const safeName = normalizeName(playerName);
  if (!safeName || !Number.isFinite(amount) || amount <= 0) return;

  giftPlayer(safeName, { type: "score", amount });
  showBanner(`+${amount} score to ${safeName}`);
}

function updateAutoRaceButton() {
  autoRaceBtn.textContent = gameState.autoRace ? "Deactivate Auto Race" : "Activate Auto Race";
  autoRaceBtn.classList.toggle("selected", gameState.autoRace);
}

function addAdminDiamonds() {
  const amount = Math.max(1, Number(diamondsAmount.value) || 0);
  storage.diamonds += amount;
  saveProgress();
  updateHud();
  showBanner(`+${amount} diamonds`);
}

function addAdminScore() {
  const amount = Math.max(1, Number(scoreAmount.value) || 0);
  gameState.score += amount;
  updateHud();
  showBanner(`+${amount} score`);
}

function giveAllCars() {
  storage.ownedCars = cars.map((car) => car.id);
  saveProgress();
  buildShop();
  showBanner("All cars unlocked");
}

function updateDayNight(delta) {
  gameState.dayNightTimer += delta;
  if (gameState.dayNightTimer >= 10000) {
    gameState.dayNightTimer = 0;
    gameState.isNight = !gameState.isNight;
    gameArea.classList.toggle("night", gameState.isNight);
    showBanner(gameState.isNight ? "Night race" : "Day race");
  }
}

function revivePlayer() {
  gameState.reviveAvailable = false;
  gameState.running = true;
  crashOverlay.classList.remove("visible");
  gameState.obstacles = [];
  gameState.diamonds = [];
  gameState.hearts = [];
  obstaclesLayer.innerHTML = "";
  diamondsLayer.innerHTML = "";
  heartsLayer.innerHTML = "";
  gameState.score += 35;
  showBanner("Revived!");
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * roadLanes.length);
  const obstacle = document.createElement("div");
  obstacle.className = "traffic-car";
  obstacle.style.left = `${roadLanes[lane]}%`;
  obstacle.style.top = "-120px";
  obstacle.style.setProperty("--car-image", ["url('download (8).png')", "url('download.png')", "url('download (9).png')"][Math.floor(Math.random() * 3)]);
  addCarWheels(obstacle);
  obstaclesLayer.appendChild(obstacle);

  gameState.obstacles.push({
    lane,
    y: -120,
    element: obstacle,
    speed: 180 + Math.random() * 55
  });
}

function spawnDiamond() {
  const lane = Math.floor(Math.random() * roadLanes.length);
  const diamond = document.createElement("div");
  diamond.className = "diamond";
  diamond.style.left = `${roadLanes[lane]}%`;
  diamond.style.top = "-30px";
  diamondsLayer.appendChild(diamond);

  gameState.diamonds.push({
    lane,
    y: -30,
    element: diamond,
    speed: 180 + Math.random() * 45
  });
}

function spawnHeart() {
  const lane = Math.floor(Math.random() * roadLanes.length);
  const heart = document.createElement("div");
  heart.className = "heart-pickup";
  heart.style.left = `${roadLanes[lane]}%`;
  heart.style.top = "-30px";
  heartsLayer.appendChild(heart);

  gameState.hearts.push({
    lane,
    y: -30,
    element: heart,
    speed: 170 + Math.random() * 40
  });
}

function spawnEventItem() {
  const isTaco = gameState.eventType === "taco";
  const item = document.createElement("div");
  item.className = isTaco ? "event-item taco" : "event-item star";
  item.style.left = `${roadLanes[Math.floor(Math.random() * roadLanes.length)]}%`;
  item.style.top = "-70px";
  (isTaco ? tacosLayer : starsLayer).appendChild(item);

  gameState[isTaco ? "tacos" : "stars"].push({
    y: -70,
    element: item,
    speed: 170 + Math.random() * 80
  });
}

function updateBoost(delta) {
  if (gameState.boostHeld && !gameState.boostActive && gameState.boostCooldown <= 0) {
    gameState.boostActive = true;
    gameState.boostTimer = 5000;
    showBanner("Boost! 5s");
  }

  if (gameState.boostActive) {
    gameState.boostTimer -= delta;
    if (gameState.boostTimer <= 0) {
      gameState.boostActive = false;
      gameState.boostCooldown = 5000;
      showBanner("Boost cooling");
    }
  } else if (gameState.boostCooldown > 0) {
    gameState.boostCooldown = Math.max(0, gameState.boostCooldown - delta);
  }
}

function getHitbox(element, horizontalInset = 0, verticalInset = 0) {
  const bounds = element.getBoundingClientRect();
  return {
    left: bounds.left + bounds.width * horizontalInset,
    right: bounds.right - bounds.width * horizontalInset,
    top: bounds.top + bounds.height * verticalInset,
    bottom: bounds.bottom - bounds.height * verticalInset
  };
}

function elementsOverlap(firstElement, secondElement, tight = false) {
  const inset = tight ? 0.2 : 0;
  const verticalInset = tight ? 0.08 : 0;
  const first = getHitbox(firstElement, inset, verticalInset);
  const second = getHitbox(secondElement, inset, verticalInset);
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function updateEntities(deltaMs) {
  const step = deltaMs / 1000;

  gameState.obstacles.forEach((obstacle) => {
    obstacle.y += obstacle.speed * step;
    obstacle.element.style.top = `${obstacle.y}px`;

    if (elementsOverlap(playerCar, obstacle.element, true)) {
      if (gameState.reviveAvailable) {
        revivePlayer();
      } else {
        finishRace();
      }
    }
  });

  gameState.diamonds.forEach((diamond) => {
    diamond.y += diamond.speed * step;
    diamond.element.style.top = `${diamond.y}px`;

    if (elementsOverlap(playerCar, diamond.element)) {
      diamond.collected = true;
      diamond.element.remove();
      gameState.diamondsCollected += 1;
      storage.diamonds += 1;
      saveProgress();
      updateHud();
      showBanner("+1 diamond");
    }
  });

  gameState.hearts.forEach((heart) => {
    heart.y += heart.speed * step;
    heart.element.style.top = `${heart.y}px`;

    if (elementsOverlap(playerCar, heart.element)) {
      heart.collected = true;
      heart.element.remove();
      gameState.reviveAvailable = true;
      showBanner("Heart collected");
    }
  });

  [
    [gameState.tacos, 5, "🌮 +5 diamonds"],
    [gameState.stars, 10, "⭐ +10 diamonds"]
  ].forEach(([items, reward, message]) => {
    items.forEach((item) => {
      item.y += item.speed * step;
      item.element.style.top = `${item.y}px`;
      if (elementsOverlap(playerCar, item.element, true)) {
        item.collected = true;
        item.element.remove();
        storage.diamonds += reward;
        saveProgress();
        updateHud();
        showBanner(message);
      }
    });
  });

  gameState.obstacles = gameState.obstacles.filter((obstacle) => {
    if (obstacle.y > 760) {
      obstacle.element.remove();
      return false;
    }
    return true;
  });

  gameState.diamonds = gameState.diamonds.filter((diamond) => {
    if (diamond.collected) return false;
    if (diamond.y > 760) {
      diamond.element.remove();
      return false;
    }
    return true;
  });

  gameState.hearts = gameState.hearts.filter((heart) => {
    if (heart.collected) return false;
    if (heart.y > 760) {
      heart.element.remove();
      return false;
    }
    return true;
  });

  gameState.tacos = gameState.tacos.filter((item) => {
    if (item.collected) return false;
    if (item.y > 760) {
      item.element.remove();
      return false;
    }
    return true;
  });

  gameState.stars = gameState.stars.filter((item) => {
    if (item.collected) return false;
    if (item.y > 760) {
      item.element.remove();
      return false;
    }
    return true;
  });
}

function tick(timestamp) {
  if (!gameState.lastFrame) {
    gameState.lastFrame = timestamp;
  }

  const delta = timestamp - gameState.lastFrame;
  gameState.lastFrame = timestamp;

  if (gameState.running) {
    if (gameState.autoRace) autoAvoidObstacles(delta);
    updateBoost(delta);
    updateDayNight(delta);

    if (gameState.eventType) {
      gameState.eventTimeLeft -= delta;
      gameState.eventTimer += delta;
      if (gameState.eventTimer > 420) {
        spawnEventItem();
        gameState.eventTimer = 0;
      }
      if (gameState.eventTimeLeft <= 0) endRandomEvent();
    } else if (Math.random() < delta / 18000) {
      startRandomEvent();
    }

    const boostFactor = gameState.boostActive ? 1.8 : 1;
    gameState.speed = Math.min(420, gameState.speed + delta * 0.022 * boostFactor);
    gameState.score += delta * 0.018 * boostFactor;

    gameState.obstacleTimer += delta;
    gameState.diamondTimer += delta;
    gameState.heartTimer += delta;

    if (gameState.obstacleTimer > 1700) {
      spawnObstacle();
      gameState.obstacleTimer = 0;
    }

    if (gameState.diamondTimer > 1500) {
      spawnDiamond();
      gameState.diamondTimer = 0;
    }

    if (gameState.heartTimer > 9000) {
      spawnHeart();
      gameState.heartTimer = 0;
    }

    updatePlayerPosition(delta);
    updateEntities(delta);
    updateHud();
  }

  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const activeElement = document.activeElement;
  const targetElement = event.target || activeElement;
  const isTypingInInput = !!(targetElement && (
    targetElement.tagName === "INPUT" ||
    targetElement.tagName === "TEXTAREA" ||
    targetElement.tagName === "SELECT" ||
    targetElement.isContentEditable
  ));

  if (isTypingInInput) {
    if (event.code === "Space" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!event.ctrlKey && !event.altKey && event.key.length === 1 && event.key !== " ") {
      window.adminCommand = `${window.adminCommand || ""}${key}`.slice(-16);
      if (window.adminCommand === "openadminpanel10") openAdminPanel();
    }
    return;
  }

  if (!event.ctrlKey && !event.altKey && event.key.length === 1) {
    window.adminCommand = `${window.adminCommand || ""}${key}`.slice(-16);
    if (window.adminCommand === "openadminpanel10") openAdminPanel();
  }

  if (key === "arrowleft" || key === "a") {
    changeLane(-1);
  }

  if (key === "arrowright" || key === "d") {
    changeLane(1);
  }

  if (key === "e") {
    gameState.boostHeld = true;
  }

  if (event.code === "Space" && !gameState.running) {
    resetGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key.toLowerCase() === "e") {
    gameState.boostHeld = false;
  }
});

let touchStartX = null;

gameArea.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

gameArea.addEventListener("touchend", (event) => {
  if (touchStartX === null) return;

  const swipeDistance = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;

  if (Math.abs(swipeDistance) < 35) return;

  changeLane(swipeDistance < 0 ? -1 : 1);
}, { passive: true });

leftBtn.addEventListener("click", () => changeLane(-1));
rightBtn.addEventListener("click", () => changeLane(1));

giveCarsBtn.addEventListener("click", giveAllCars);
startTacoEventBtn.addEventListener("click", () => startGlobalEvent("taco"));
startGalaxyEventBtn.addEventListener("click", () => startGlobalEvent("galaxy"));
sendGlobalMessageBtn.addEventListener("click", sendGlobalMessage);
globalMessageInput.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.key === " ") {
    event.stopPropagation();
    return;
  }

  if (event.key === "Enter") sendGlobalMessage();
});
autoRaceBtn.addEventListener("click", () => {
  gameState.autoRace = !gameState.autoRace;
  updateAutoRaceButton();
  showBanner(gameState.autoRace ? "Auto race active" : "Auto race off");
});

giveCarToPlayerBtn.addEventListener("click", () => {
  const target = normalizeName(adminTargetSelect.value);
  const carId = adminCarSelect.value;
  if (!target || !carId) return;
  unlockCarForPlayer(target, carId);
});

giveDiamondsToPlayerBtn.addEventListener("click", () => {
  const target = normalizeName(adminTargetSelect.value);
  const amount = Number(adminGiftDiamonds.value || 0);
  if (!target || !amount || amount <= 0) return;
  giveDiamondsToPlayer(target, amount);
});

giveScoreToPlayerBtn.addEventListener("click", () => {
  const target = normalizeName(adminTargetSelect.value);
  const amount = Number(adminGiftScore.value || 0);
  if (!target || !amount || amount <= 0) return;
  giveScoreToPlayer(target, amount);
});

closeAdminBtn.addEventListener("click", () => {
  showGarageView("shop");
  showBanner("Admin panel closed");
});

garageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.view === "admin") {
      openAdminPanel();
      return;
    }

    showGarageView(tab.dataset.view);
  });
});

startBtn.addEventListener("click", () => {
  storage.player = normalizeName(storage.player) || "Lukaas";
  if (playerSetupOverlay) playerSetupOverlay.classList.add("hidden");
  resetGame();
});

mapSelect.addEventListener("change", () => {
  if (gameState.running) return;
  applyMap(mapSelect.value);
  showBanner(`${mapSelect.options[mapSelect.selectedIndex].text} selected`);
});

playerSelect.value = storage.player || "Lukaas";
playerSelect.addEventListener("change", () => {
  const nextName = normalizeName(playerSelect.value) || "Lukaas";
  storage.player = nextName;
  ensurePlayerProfile(nextName);
  localStorage.setItem("lumiPlayer", nextName);
  refreshKnownPlayers();
  showBanner(`Gebruiker: ${nextName}`);
});

if (savePlayerNameBtn) {
  savePlayerNameBtn.addEventListener("click", () => {
    storage.player = normalizeName(playerNameInput.value) || "Lukaas";
    ensurePlayerProfile(storage.player);
    localStorage.setItem("lumiPlayer", storage.player);
    if (playerSetupOverlay) playerSetupOverlay.classList.add("hidden");
    refreshKnownPlayers();
    showBanner(`Welkom ${storage.player}`);
  });
}

if (claimGiftBtn) {
  claimGiftBtn.addEventListener("click", () => {
    hideGiftOverlay();
  });
}

shopBtn.addEventListener("click", () => {
  if (gameState.running) {
    showBanner("Crash first");
    return;
  }

  openShop();
});

crashShopBtn.addEventListener("click", openShop);
tryAgainBtn.addEventListener("click", resetGame);

addCarWheels(playerCar);
refreshKnownPlayers();
if (playerSetupOverlay) playerSetupOverlay.classList.add("hidden");
adminPanel.classList.remove("hidden");
processIncomingGift();
applyCarSkin(storage.selectedCar || "starter");
applyMap(storage.selectedMap || "city");
mapSelect.disabled = false;
movePlayer();
updatePlayerPosition(100);
updateHud();
buildShop();
renderInventory();
showGarageView("shop");
updateAutoRaceButton();
playAudio(lobbyMusic);
requestAnimationFrame(tick);