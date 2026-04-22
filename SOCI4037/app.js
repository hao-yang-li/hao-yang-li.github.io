const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const stage = document.querySelector(".stage-wrap");
const contextMenu = document.getElementById("contextMenu");
const addHereButton = document.getElementById("addHereButton");
const editToggle = document.getElementById("editToggle");
const zoomLabel = document.getElementById("zoomLabel");
const editor = document.getElementById("editor");
const form = document.getElementById("itemForm");

const controls = {
  fit: document.getElementById("fitButton"),
  zoomIn: document.getElementById("zoomInButton"),
  zoomOut: document.getElementById("zoomOutButton"),
  export: document.getElementById("exportButton"),
  import: document.getElementById("importInput"),
  closeEditor: document.getElementById("closeEditorButton"),
  delete: document.getElementById("deleteButton"),
  removeImage: document.getElementById("removeImageButton"),
  label: document.getElementById("labelInput"),
  url: document.getElementById("urlInput"),
  x: document.getElementById("xInput"),
  y: document.getElementById("yInput"),
  width: document.getElementById("widthInput"),
  height: document.getElementById("heightInput"),
  rotation: document.getElementById("rotationInput"),
  image: document.getElementById("imageInput"),
};

const STORAGE_KEY = "carnivalesque-map-v1";
const WORLD = { width: 2200, height: 1300 };
const AXIS = { x: 770, y: 650 };
const MIN_SCALE = 0.25;
const MAX_SCALE = 3.5;

const state = {
  items: [],
  imageCache: new Map(),
  selectedId: null,
  editMode: true,
  menuWorld: null,
  view: { scale: 1, x: 0, y: 0 },
  pointer: {
    mode: null,
    id: null,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    startItem: null,
    startView: null,
  },
};

const starterItems = [
  { label: "美国斩杀线", x: 175, y: 490, width: 120, height: 585, rotation: 0 },
  { label: "CCCCCC", x: 690, y: 655, width: 300, height: 120, rotation: 0 },
  { label: "丁真", x: 815, y: 780, width: 430, height: 110, rotation: -31 },
  { label: "胖猫", x: 1000, y: 925, width: 585, height: 105, rotation: 0 },
  { label: "东北往事", x: 655, y: 1055, width: 600, height: 95, rotation: 0 },
  { label: "社会摇", x: 225, y: 1180, width: 300, height: 112, rotation: 0 },
  { label: " ", x: 1125, y: 555, width: 300, height: 120, rotation: 0 },
  { label: " ", x: 1010, y: 170, width: 300, height: 115, rotation: 0 },
].map((item, index) => ({
  id: crypto.randomUUID(),
  url: "",
  image: "",
  ...item,
  z: index,
}));

function bootstrap() {
  load();
  resizeCanvas();
  bindEvents();
  draw();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      state.items = Array.isArray(data.items) ? data.items : starterItems;
      state.view = data.view || state.view;
      state.editMode = data.editMode ?? true;
    } else {
      state.items = starterItems;
    }
  } catch {
    state.items = starterItems;
  }
  updateEditToggle();
  state.items.forEach(cacheImage);
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      view: state.view,
      editMode: state.editMode,
    })
  );
}

function bindEvents() {
  window.addEventListener("resize", () => {
    resizeCanvas();
    draw();
  });

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("click", (event) => {
    if (!contextMenu.contains(event.target)) hideContextMenu();
  });

  addHereButton.addEventListener("click", () => {
    if (!state.menuWorld) return;
    const item = createItem(state.menuWorld.x, state.menuWorld.y);
    state.items.push(item);
    state.selectedId = item.id;
    hideContextMenu();
    openEditor(item);
    save();
    draw();
  });

  editToggle.addEventListener("click", () => {
    state.editMode = !state.editMode;
    if (!state.editMode) {
      closeEditor();
      state.selectedId = null;
    }
    updateEditToggle();
    save();
    draw();
  });

  controls.fit.addEventListener("click", fitView);
  controls.zoomIn.addEventListener("click", () => zoomAt(canvas.width / 2, canvas.height / 2, 1.18));
  controls.zoomOut.addEventListener("click", () => zoomAt(canvas.width / 2, canvas.height / 2, 1 / 1.18));
  controls.closeEditor.addEventListener("click", closeEditor);
  controls.delete.addEventListener("click", deleteSelected);
  controls.removeImage.addEventListener("click", removeSelectedImage);
  controls.export.addEventListener("click", exportJson);
  controls.import.addEventListener("change", importJson);
  controls.image.addEventListener("change", setSelectedImage);
  form.addEventListener("input", updateSelectedFromForm);
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (!localStorage.getItem(STORAGE_KEY)) fitView(false);
}

function fitView(shouldDraw = true) {
  const display = getDisplaySize();
  const margin = 48;
  const scale = Math.min((display.width - margin) / WORLD.width, (display.height - margin) / WORLD.height);
  state.view.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  state.view.x = (display.width - WORLD.width * state.view.scale) / 2;
  state.view.y = (display.height - WORLD.height * state.view.scale) / 2;
  updateZoomLabel();
  save();
  if (shouldDraw) draw();
}

function getDisplaySize() {
  const ratio = window.devicePixelRatio || 1;
  return { width: canvas.width / ratio, height: canvas.height / ratio };
}

function draw() {
  const display = getDisplaySize();
  ctx.clearRect(0, 0, display.width, display.height);
  drawPageBackground(display);

  ctx.save();
  ctx.translate(state.view.x, state.view.y);
  ctx.scale(state.view.scale, state.view.scale);
  drawMap();
  state.items
    .slice()
    .sort((a, b) => (a.z || 0) - (b.z || 0))
    .forEach(drawItem);
  ctx.restore();

  updateZoomLabel();
}

function drawPageBackground(display) {
  ctx.fillStyle = "#fbfaf6";
  ctx.fillRect(0, 0, display.width, display.height);
}

function drawMap() {
  ctx.save();
  ctx.fillStyle = "#fffefb";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = "#9db0e4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, AXIS.y);
  ctx.lineTo(WORLD.width * 0.69, AXIS.y);
  ctx.moveTo(AXIS.x, 22);
  ctx.lineTo(AXIS.x, WORLD.height - 95);
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.font = "700 42px Georgia, 'Times New Roman', serif";
  ctx.textBaseline = "top";
  ctx.fillText("carnivalesque propaganda", 24, 18);
  ctx.fillText("carnivalesque sociopolitical protest", 912, 18);
  ctx.textBaseline = "bottom";
  ctx.fillText("carnivalesque mass entertainment", 24, WORLD.height - 16);
  ctx.fillText("carnivalesque sociocultural critique", 882, WORLD.height - 16);

  ctx.font = "38px Georgia, 'Times New Roman', serif";
  ctx.fillText("x-axis: pro-status quo or anti-status quo", 1510, 215);
  ctx.fillText("y-axis: degree of political relevance", 1510, 270);
  ctx.restore();
}

function drawItem(item) {
  const selected = item.id === state.selectedId;
  const radians = degreesToRadians(item.rotation || 0);
  const image = item.image ? state.imageCache.get(item.id) : null;

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(radians);

  ctx.beginPath();
  ctx.ellipse(0, 0, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);

  if (image && image.complete) {
    ctx.save();
    ctx.clip();
    drawCoverImage(image, -item.width / 2, -item.height / 2, item.width, item.height);
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
  }

  ctx.lineWidth = selected ? 7 : 5;
  ctx.strokeStyle = selected ? "#e7468b" : "#030303";
  ctx.stroke();

  if (item.label.trim()) {
    const size = Math.max(26, Math.min(46, item.height * 0.36));
    ctx.fillStyle = "#111";
    ctx.font = `${size}px "Songti SC", "SimSun", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    wrapText(item.label, 0, 0, item.width * 0.72, size * 1.18);
  }

  if (state.editMode && item.url) {
    ctx.fillStyle = selected ? "#e7468b" : "#111";
    ctx.beginPath();
    ctx.arc(item.width / 2 - 18, -item.height / 2 + 18, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCoverImage(image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text);
  const lines = [];
  let line = "";
  chars.forEach((char) => {
    const trial = line + char;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = trial;
    }
  });
  if (line) lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, startY + index * lineHeight);
  });
}

function onPointerDown(event) {
  hideContextMenu();
  canvas.setPointerCapture(event.pointerId);
  const screen = getPointer(event);
  const world = screenToWorld(screen.x, screen.y);
  const item = findItemAt(world.x, world.y);
  state.pointer.startScreen = screen;
  state.pointer.startWorld = world;

  if (item && state.editMode && event.button === 0) {
    state.selectedId = item.id;
    state.pointer.mode = "item";
    state.pointer.id = item.id;
    state.pointer.startItem = { ...item };
    bringToFront(item);
    openEditor(item);
  } else if (item && !state.editMode && event.button === 0) {
    state.selectedId = item.id;
    draw();
  } else {
    state.pointer.mode = "pan";
    state.pointer.startView = { ...state.view };
  }

  canvas.classList.add("dragging");
  draw();
}

function onPointerMove(event) {
  if (!state.pointer.mode) return;
  const screen = getPointer(event);
  if (state.pointer.mode === "pan") {
    state.view.x = state.pointer.startView.x + (screen.x - state.pointer.startScreen.x);
    state.view.y = state.pointer.startView.y + (screen.y - state.pointer.startScreen.y);
    save();
    draw();
    return;
  }

  if (state.pointer.mode === "item") {
    const item = getSelected();
    if (!item) return;
    const world = screenToWorld(screen.x, screen.y);
    item.x = Math.round(state.pointer.startItem.x + (world.x - state.pointer.startWorld.x));
    item.y = Math.round(state.pointer.startItem.y + (world.y - state.pointer.startWorld.y));
    syncForm(item);
    save();
    draw();
  }
}

function onPointerUp(event) {
  if (!state.pointer.mode && !state.selectedId) return;
  const screen = getPointer(event);
  const moved = distance(screen, state.pointer.startScreen) > 5;
  const item = state.selectedId ? state.items.find((entry) => entry.id === state.selectedId) : null;

  if (!state.editMode && item && !moved && item.url) {
    window.open(item.url, "_blank", "noopener");
  }

  state.pointer.mode = null;
  state.pointer.id = null;
  state.pointer.startItem = null;
  state.pointer.startView = null;
  canvas.classList.remove("dragging");
}

function onWheel(event) {
  event.preventDefault();
  const pointer = getPointer(event);
  const factor = event.deltaY < 0 ? 1.09 : 1 / 1.09;
  zoomAt(pointer.x, pointer.y, factor);
}

function onContextMenu(event) {
  event.preventDefault();
  if (!state.editMode) return;
  const pointer = getPointer(event);
  const world = screenToWorld(pointer.x, pointer.y);
  const item = findItemAt(world.x, world.y);

  if (item) {
    state.selectedId = item.id;
    openEditor(item);
    draw();
    return;
  }

  state.menuWorld = world;
  const rect = stage.getBoundingClientRect();
  contextMenu.style.left = `${event.clientX - rect.left}px`;
  contextMenu.style.top = `${event.clientY - rect.top}px`;
  contextMenu.hidden = false;
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    hideContextMenu();
    closeEditor();
    return;
  }
  if ((event.key === "Delete" || event.key === "Backspace") && state.editMode && state.selectedId) {
    const active = document.activeElement;
    if (active && ["INPUT", "TEXTAREA"].includes(active.tagName)) return;
    deleteSelected();
  }
}

function zoomAt(screenX, screenY, factor) {
  const before = screenToWorld(screenX, screenY);
  state.view.scale = clamp(state.view.scale * factor, MIN_SCALE, MAX_SCALE);
  state.view.x = screenX - before.x * state.view.scale;
  state.view.y = screenY - before.y * state.view.scale;
  updateZoomLabel();
  save();
  draw();
}

function screenToWorld(x, y) {
  return {
    x: (x - state.view.x) / state.view.scale,
    y: (y - state.view.y) / state.view.scale,
  };
}

function getPointer(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function findItemAt(x, y) {
  return state.items
    .slice()
    .sort((a, b) => (b.z || 0) - (a.z || 0))
    .find((item) => pointInItem(item, x, y));
}

function pointInItem(item, x, y) {
  const radians = -degreesToRadians(item.rotation || 0);
  const dx = x - item.x;
  const dy = y - item.y;
  const localX = dx * Math.cos(radians) - dy * Math.sin(radians);
  const localY = dx * Math.sin(radians) + dy * Math.cos(radians);
  return (localX * localX) / Math.pow(item.width / 2, 2) + (localY * localY) / Math.pow(item.height / 2, 2) <= 1;
}

function createItem(x, y) {
  return {
    id: crypto.randomUUID(),
    label: "新 item",
    url: "",
    image: "",
    x: Math.round(x),
    y: Math.round(y),
    width: 240,
    height: 110,
    rotation: 0,
    z: nextZ(),
  };
}

function openEditor(item) {
  if (!state.editMode) return;
  state.selectedId = item.id;
  editor.hidden = false;
  syncForm(item);
}

function closeEditor() {
  editor.hidden = true;
  state.selectedId = null;
  controls.image.value = "";
  draw();
}

function syncForm(item) {
  controls.label.value = item.label;
  controls.url.value = item.url || "";
  controls.x.value = Math.round(item.x);
  controls.y.value = Math.round(item.y);
  controls.width.value = Math.round(item.width);
  controls.height.value = Math.round(item.height);
  controls.rotation.value = Math.round(item.rotation || 0);
}

function updateSelectedFromForm(event) {
  if (event.target === controls.image) return;
  const item = getSelected();
  if (!item) return;
  item.label = controls.label.value;
  item.url = controls.url.value.trim();
  item.x = Number(controls.x.value) || item.x;
  item.y = Number(controls.y.value) || item.y;
  item.width = clamp(Number(controls.width.value) || item.width, 40, 600);
  item.height = clamp(Number(controls.height.value) || item.height, 30, 420);
  item.rotation = Number(controls.rotation.value) || 0;
  save();
  draw();
}

function setSelectedImage() {
  const item = getSelected();
  const file = controls.image.files && controls.image.files[0];
  if (!item || !file) return;
  const reader = new FileReader();
  reader.onload = () => {
    item.image = reader.result;
    cacheImage(item);
    save();
    draw();
  };
  reader.readAsDataURL(file);
}

function removeSelectedImage() {
  const item = getSelected();
  if (!item) return;
  item.image = "";
  state.imageCache.delete(item.id);
  controls.image.value = "";
  save();
  draw();
}

function deleteSelected() {
  if (!state.selectedId) return;
  state.items = state.items.filter((item) => item.id !== state.selectedId);
  state.imageCache.delete(state.selectedId);
  closeEditor();
  save();
  draw();
}

function cacheImage(item) {
  if (!item.image) return;
  const image = new Image();
  image.onload = draw;
  image.src = item.image;
  state.imageCache.set(item.id, image);
}

function bringToFront(item) {
  item.z = nextZ();
}

function nextZ() {
  return state.items.reduce((max, item) => Math.max(max, item.z || 0), 0) + 1;
}

function getSelected() {
  return state.items.find((item) => item.id === state.selectedId);
}

function hideContextMenu() {
  contextMenu.hidden = true;
  state.menuWorld = null;
}

function updateEditToggle() {
  editToggle.classList.toggle("active", state.editMode);
  editToggle.textContent = state.editMode ? "编辑中" : "浏览中";
  editToggle.setAttribute("aria-pressed", String(state.editMode));
}

function updateZoomLabel() {
  zoomLabel.value = `${Math.round(state.view.scale * 100)}%`;
}

function exportJson() {
  const payload = JSON.stringify({ items: state.items, view: state.view }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "carnivalesque-map.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.items)) throw new Error("Invalid map data");
      state.items = data.items;
      state.imageCache.clear();
      state.items.forEach(cacheImage);
      if (data.view) state.view = data.view;
      closeEditor();
      save();
      draw();
    } catch {
      alert("JSON 格式不正确，导入失败。");
    } finally {
      controls.import.value = "";
    }
  };
  reader.readAsText(file);
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

bootstrap();
