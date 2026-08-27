const storage = {
  diamonds: Number(localStorage.getItem("lumiDiamonds") || 0),
  selectedCar: localStorage.getItem("lumiSelectedCar") || "starter",
  selectedMap: localStorage.getItem("lumiSelectedMap") || "city",
  ownedCars: JSON.parse(localStorage.getItem("lumiOwnedCars") || '["starter"]')
};

const cars = [
  { id: "starter", name: "Blue Racer", price: 0, accent: "#2965ef", image: "download (8).png", description: "Base model" },
  { id: "blaze", name: "Yellow Racer", price: 25, accent: "#ffb21c", image: "download.png", description: "Aero boost" },
  { id: "phantom", name: "Red Racer", price: 60, accent: "#f2383d", image: "download (9).png", description: "Night predator" },
  { id: "titan", name: "Galaxy Racer", price: 120, accent: "#8d5cff", image: "download (1).png", description: "Cosmic elite drift" }
];

const roadLanes = [25, 50, 75];
const scoreValue = document.getElementById("scoreValue");
const speedValue = document.getElementById("speedValue");
const diamondValue = document.getElementById("diamondValue");
const walletValue = document.getElementById("walletValue");
const shopList = document.getElementById("shopList");
const obstaclesLayer = document.getElementById("obstacles");
const diamondsLayer = document.getElementById("diamonds");
const heartsLayer = document.getElementById("hearts");
const tacosLayer = document.getElementById("tacos");
const starsLayer = document.getElementById("stars");
const playerCar = document.getElementById("playerCar");
const crashOverlay = document.getElementById("crashOverlay");
const shopPanel = document.getElementById("shopPanel");
const messageBanner = document.getElementById("messageBanner");
const startBtn = document.getElementById("startBtn");
const shopBtn = document.getElementById("shopBtn");
const loadingScreen = document.getElementById("loadingScreen");
const loadingBar = document.getElementById("loadingBar");
const loadingText = document.getElementById("loadingText");
const playBtn = document.getElementById("playBtn");
const mapSelect = document.getElementById("mapSelect");
const speedNeedle = document.getElementById("speedNeedle");
const gameArea = document.getElementById("gameArea");
const crashShopBtn = document.getElementById("crashShopBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const lobbyMusic = document.getElementById("lobbyMusic");
const driveMusic = document.getElementById("driveMusic");
const crashSound = document.getElementById("crashSound");
const tacoMusic = document.getElementById("tacoMusic");
const galaxyMusic = document.getElementById("galaxyMusic");

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
  currentCar: cars.find((car) => car.id === storage.selectedCar) || cars[0]
};

function saveProgress() {
  localStorage.setItem("lumiDiamonds", String(storage.diamonds));
  localStorage.setItem("lumiSelectedCar", storage.selectedCar);
  localStorage.setItem("lumiOwnedCars", JSON.stringify(storage.ownedCars));
}

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
  localStorage.setItem("lumiSelectedMap", selectedMap);
}

function stopEventMusic() {
  stopAudio(tacoMusic);
  stopAudio(galaxyMusic);
}

function startRandomEvent() {
  if (gameState.eventType) return;

  gameState.eventType = Math.random() < 0.5 ? "taco" : "galaxy";
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

function updatePlayerPosition(delta) {
  const smoothing = Math.min(1, delta / 120);
  gameState.playerX += (gameState.targetX - gameState.playerX) * smoothing;
  playerCar.style.left = `${gameState.playerX}%`;
  playerCar.style.transform = `translateX(-50%) scale(${gameState.boostActive ? 1.04 : 1})`;
}

function buildShop() {
  shopList.innerHTML = cars.map((car) => {
    const owned = storage.ownedCars.includes(car.id);
    const selected = storage.selectedCar === car.id;
    const label = selected ? "Selected" : owned ? "Use" : `Buy ${car.price}`;
    const className = selected ? "selected" : owned ? "" : "locked";

    return `
      <div class="shop-item">
        <div class="shop-car-preview" style="--car-image: url('${car.image}');"></div>
        <div>
          <h3>${car.name}</h3>
          <p>${car.description}</p>
        </div>
        <button class="shop-button ${className}" data-car-id="${car.id}">${label}</button>
      </div>
    `;
  }).join("");

  shopList.querySelectorAll(".shop-button").forEach((button) => {
    button.addEventListener("click", () => {
      const carId = button.dataset.carId;
      const car = cars.find((item) => item.id === carId);
      if (!car) return;

      if (storage.ownedCars.includes(carId)) {
        storage.selectedCar = carId;
        saveProgress();
        applyCarSkin(carId);
        buildShop();
        showBanner(`${car.name} equipped`);
        return;
      }

      if (storage.diamonds >= car.price) {
        storage.diamonds -= car.price;
        storage.ownedCars.push(carId);
        storage.selectedCar = carId;
        saveProgress();
        applyCarSkin(carId);
        buildShop();
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
  storage.diamonds += gameState.diamondsCollected;
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
  shopPanel.classList.remove("hidden");
  shopList.scrollIntoView({ behavior: "smooth", block: "nearest" });
  showBanner("Garage open");
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

  if (key === "arrowleft" || key === "a") {
    gameState.lane = Math.max(0, gameState.lane - 1);
    movePlayer();
  }

  if (key === "arrowright" || key === "d") {
    gameState.lane = Math.min(2, gameState.lane + 1);
    movePlayer();
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

startBtn.addEventListener("click", () => {
  resetGame();
});

mapSelect.addEventListener("change", () => {
  if (gameState.running) return;
  applyMap(mapSelect.value);
  showBanner(`${mapSelect.options[mapSelect.selectedIndex].text} selected`);
});

shopBtn.addEventListener("click", () => {
  if (gameState.running) {
    showBanner("Crash first");
    return;
  }

  openShop();
});

crashShopBtn.addEventListener("click", openShop);
tryAgainBtn.addEventListener("click", resetGame);

function runLoadingScreen() {
  const steps = [
    { value: 15, text: "Booting arcade systems..." },
    { value: 35, text: "Warming neon circuits..." },
    { value: 62, text: "Downloading drift routes..." },
    { value: 82, text: "Unlocking garage..." },
    { value: 100, text: "Ready to race" }
  ];

  let index = 0;
  const interval = setInterval(() => {
    const step = steps[index];
    if (!step) {
      clearInterval(interval);
      playBtn.classList.remove("hidden");
      return;
    }

    loadingBar.style.width = `${step.value}%`;
    loadingText.textContent = step.text;
    index += 1;
  }, 420);
}

playBtn.addEventListener("click", () => {
  loadingScreen.classList.add("hidden");
  playAudio(lobbyMusic);
  showBanner("Garage online");
});

addCarWheels(playerCar);
applyCarSkin(storage.selectedCar);
applyMap(storage.selectedMap);
mapSelect.disabled = false;
movePlayer();
updatePlayerPosition(100);
updateHud();
buildShop();
runLoadingScreen();
requestAnimationFrame(tick);