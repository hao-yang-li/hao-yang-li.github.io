const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const stage = document.querySelector(".stage-wrap");
const contextMenu = document.getElementById("contextMenu");
const detailCard = document.getElementById("detailCard");
const addHereButton = document.getElementById("addHereButton");
const editToggle = document.getElementById("editToggle");
const languageButton = document.getElementById("languageButton");
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const zoomLabel = document.getElementById("zoomLabel");
const editor = document.getElementById("editor");
const form = document.getElementById("itemForm");
const titleHeading = document.querySelector(".title-block h1");
const hint = document.getElementById("hint");
const floatingXAxis = document.getElementById("floatingXAxis");
const floatingYAxis = document.getElementById("floatingYAxis");

const controls = {
  fit: document.getElementById("fitButton"),
  zoomIn: document.getElementById("zoomInButton"),
  zoomOut: document.getElementById("zoomOutButton"),
  dataTools: document.querySelector(".data-tools"),
  export: document.getElementById("exportButton"),
  importLabel: document.getElementById("importLabel"),
  import: document.getElementById("importInput"),
  closeEditor: document.getElementById("closeEditorButton"),
  delete: document.getElementById("deleteButton"),
  removeImage: document.getElementById("removeImageButton"),
  addLink: document.getElementById("addLinkButton"),
  linksEditor: document.getElementById("linksEditor"),
  labelZh: document.getElementById("labelZhInput"),
  labelEn: document.getElementById("labelEnInput"),
  introZh: document.getElementById("introZhInput"),
  introEn: document.getElementById("introEnInput"),
  image: document.getElementById("imageInput"),
  imageDropZone: document.getElementById("imageDropZone"),
  quadrants: [
    document.getElementById("quadrantTopLeft"),
    document.getElementById("quadrantTopRight"),
    document.getElementById("quadrantBottomLeft"),
    document.getElementById("quadrantBottomRight"),
  ],
};

const STORAGE_KEY = "carnivalesque-map-v2";
const LEGACY_STORAGE_KEY = "carnivalesque-map-v1";
const EDIT_PASSWORD = "114514";
const WORLD = { width: 2200, height: 1300 };
const AXIS = { x: 770, y: 650 };
const MIN_SCALE = 0.7;
const MAX_SCALE = 3.5;
const MIN_ITEM = { width: 70, height: 38 };

const copy = {
  zh: {
    title: "SOCI4037 Project Carnivalesque Map of Chinese Internet",
    language: "English",
    settings: "设置",
    editOn: "退出编辑",
    editOff: "进入编辑",
    add: "在这里新建 item",
    hint: "右键空白处新建 item。滚轮缩放画布；鼠标悬停 item 后滚轮调整椭圆大小；拖动控制点调整形状和方向。选中 item 后可拖入或粘贴图片。",
    emptyIntro: "还没有 intro。",
    emptyLinks: "还没有链接。",
    imageDrop: "上传、拖入，或复制图片后按 Cmd/Ctrl+V",
    newItem: "新 item",
    newIntro: "在右侧编辑面板填写简介、图片和链接。",
    axisX: "x-axis: pro-status quo or anti-status quo",
    axisY: "y-axis: degree of political relevance",
    quadrants: [
      "carnivalesque propaganda",
      "carnivalesque sociopolitical protest",
      "carnivalesque mass entertainment",
      "carnivalesque sociocultural critique",
    ],
  },
  en: {
    title: "SOCI4037 Project Carnivalesque Map of Chinese Internet",
    language: "中文",
    settings: "Settings",
    editOn: "Exit edit",
    editOff: "Enter edit",
    add: "Add item here",
    hint: "Right-click blank space to add an item. Scroll to zoom the map; hover an item and scroll to resize it; drag handles to reshape or rotate. Select an item to drop or paste an image.",
    emptyIntro: "No intro yet.",
    emptyLinks: "No links yet.",
    imageDrop: "Upload, drop, or paste an image with Cmd/Ctrl+V",
    newItem: "New item",
    newIntro: "Add intro, image, and links in the editor panel.",
    axisX: "x-axis: pro-status quo or anti-status quo",
    axisY: "y-axis: degree of political relevance",
    quadrants: [
      "carnivalesque propaganda",
      "carnivalesque sociopolitical protest",
      "carnivalesque mass entertainment",
      "carnivalesque sociocultural critique",
    ],
  },
};

const starterItems = [
  { labelZh: "美国斩杀线", labelEn: "US Kill Line", x: 175, y: 490, width: 120, height: 585, rotation: 0 },
  { labelZh: "CCCCCC", labelEn: "CCCCCC", x: 690, y: 655, width: 300, height: 120, rotation: 0 },
  { labelZh: "丁真", labelEn: "Ding Zhen", x: 815, y: 780, width: 430, height: 110, rotation: -31 },
  { labelZh: "胖猫", labelEn: "Pangmao", x: 1000, y: 925, width: 585, height: 105, rotation: 0 },
  { labelZh: "东北往事", labelEn: "A Northeast Past", x: 655, y: 1055, width: 600, height: 95, rotation: 0 },
  { labelZh: "社会摇", labelEn: "Social Shake", x: 225, y: 1180, width: 300, height: 112, rotation: 0 },
  { labelZh: "", labelEn: "", x: 1125, y: 555, width: 300, height: 120, rotation: 0 },
  { labelZh: "", labelEn: "", x: 1010, y: 170, width: 300, height: 115, rotation: 0 },
].map((item, index) => ({
  id: makeId(),
  introZh: "",
  introEn: "",
  image: "",
  links: [],
  z: index,
  ...item,
}));

const state = {
  items: [],
  imageCache: new Map(),
  selectedId: null,
  hoverId: null,
  editMode: false,
  language: navigator.language && navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en",
  menuWorld: null,
  view: { scale: 1, x: 0, y: 0 },
  pointer: {
    mode: null,
    handle: null,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    startItem: null,
    startView: null,
  },
};

function bootstrap() {
  load();
  resizeCanvas();
  bindEvents();
  updateLanguageUi();
  draw();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      state.items = Array.isArray(data.items) ? data.items.map(normalizeItem) : starterItems;
      state.view = data.view || state.view;
      state.language = data.language || state.language;
    } else {
      state.items = starterItems;
    }
  } catch {
    state.items = starterItems;
  }
  state.items.forEach(cacheImage);
}

function normalizeItem(item, index) {
  const legacyLabel = item.label || "";
  const legacyLinks = item.url ? [{ title: "Link", url: item.url }] : [];
  return {
    id: item.id || makeId(),
    labelZh: item.labelZh ?? legacyLabel,
    labelEn: item.labelEn ?? legacyLabel,
    introZh: item.introZh || "",
    introEn: item.introEn || "",
    image: item.image || "",
    links: Array.isArray(item.links) ? item.links : legacyLinks,
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    width: clamp(Number(item.width) || 240, MIN_ITEM.width, 680),
    height: clamp(Number(item.height) || 110, MIN_ITEM.height, 460),
    rotation: Number(item.rotation) || 0,
    z: Number(item.z) || index || 0,
  };
}

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      view: state.view,
      language: state.language,
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
  window.addEventListener("paste", onPasteImage);
  window.addEventListener("click", (event) => {
    if (!contextMenu.contains(event.target)) hideContextMenu();
    if (!settingsMenu.contains(event.target) && event.target !== settingsButton) closeSettings();
  });

  addHereButton.addEventListener("click", () => {
    if (!state.menuWorld) return;
    const item = createItem(state.menuWorld.x, state.menuWorld.y);
    state.items.push(item);
    state.selectedId = item.id;
    hideContextMenu();
    renderDetailCard();
    openEditor(item);
    save();
    draw();
  });

  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    settingsMenu.hidden = !settingsMenu.hidden;
    settingsButton.setAttribute("aria-expanded", String(!settingsMenu.hidden));
  });

  editToggle.addEventListener("click", toggleEditMode);

  languageButton.addEventListener("click", () => {
    state.language = state.language === "zh" ? "en" : "zh";
    updateLanguageUi();
    renderDetailCard();
    save();
    closeSettings();
    draw();
  });

  controls.fit.addEventListener("click", fitView);
  controls.zoomIn.addEventListener("click", () => zoomAt(canvasDisplayWidth() / 2, canvasDisplayHeight() / 2, 1.18));
  controls.zoomOut.addEventListener("click", () => zoomAt(canvasDisplayWidth() / 2, canvasDisplayHeight() / 2, 1 / 1.18));
  controls.closeEditor.addEventListener("click", closeEditor);
  controls.delete.addEventListener("click", deleteSelected);
  controls.removeImage.addEventListener("click", removeSelectedImage);
  controls.export.addEventListener("click", exportJson);
  controls.import.addEventListener("change", importJson);
  controls.image.addEventListener("change", setSelectedImage);
  controls.imageDropZone.addEventListener("dragover", onImageDragOver);
  controls.imageDropZone.addEventListener("dragleave", onImageDragLeave);
  controls.imageDropZone.addEventListener("drop", onImageDrop);
  detailCard.addEventListener("dragover", onImageDragOver);
  detailCard.addEventListener("dragleave", onImageDragLeave);
  detailCard.addEventListener("drop", onImageDrop);
  controls.addLink.addEventListener("click", addLink);
  controls.linksEditor.addEventListener("input", updateLinkFromInput);
  controls.linksEditor.addEventListener("click", onLinksEditorClick);
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
  if (!localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(LEGACY_STORAGE_KEY)) fitView(false);
  constrainView();
}

function fitView(shouldDraw = true) {
  const display = getDisplaySize();
  const margin = 54;
  const scale = Math.min((display.width - margin) / WORLD.width, (display.height - margin) / WORLD.height);
  state.view.scale = clamp(scale, MIN_SCALE, MAX_SCALE);
  centerAxis();
  updateZoomLabel();
  save();
  if (shouldDraw) draw();
}

function centerAxis() {
  const display = getDisplaySize();
  state.view.x = display.width / 2 - AXIS.x * state.view.scale;
  state.view.y = display.height / 2 - AXIS.y * state.view.scale;
}

function getDisplaySize() {
  const ratio = window.devicePixelRatio || 1;
  return { width: canvas.width / ratio, height: canvas.height / ratio };
}

function canvasDisplayWidth() {
  return getDisplaySize().width;
}

function canvasDisplayHeight() {
  return getDisplaySize().height;
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
  const selected = getSelected();
  if (selected && state.editMode) drawHandles(selected);
  ctx.restore();

  updateDetailCardPosition();
  updateFloatingUi();
  updateZoomLabel();
}

function drawPageBackground(display) {
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, display.width, display.height);
}

function drawMap() {
  const display = getDisplaySize();
  const left = screenToWorld(-60, 0).x;
  const right = screenToWorld(display.width + 60, 0).x;
  const top = screenToWorld(0, -60).y;
  const bottom = screenToWorld(0, display.height + 60).y;

  ctx.save();
  ctx.fillStyle = "#fffef9";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = "#718bd2";
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(left, AXIS.y);
  ctx.lineTo(right, AXIS.y);
  ctx.moveTo(AXIS.x, top);
  ctx.lineTo(AXIS.x, bottom);
  ctx.stroke();
  ctx.restore();
}

function drawItem(item) {
  const selected = item.id === state.selectedId;
  const hovered = item.id === state.hoverId;
  const radians = degreesToRadians(item.rotation || 0);
  const label = getLocalized(item, "label") || (state.language === "zh" ? "未命名" : "Untitled");

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(radians);

  ctx.beginPath();
  ctx.ellipse(0, 0, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = selected ? "rgba(255, 232, 240, 0.7)" : "rgba(255, 255, 255, 0.18)";
  ctx.fill();

  ctx.lineWidth = selected ? 7 : hovered ? 6 : 4.5;
  ctx.strokeStyle = selected ? "#d63f72" : "#050505";
  ctx.stroke();

  const size = Math.max(24, Math.min(44, item.height * 0.36));
  ctx.fillStyle = "#111";
  ctx.font = `${size}px "Songti SC", "SimSun", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(label, 0, 0, item.width * 0.72, size * 1.18);

  ctx.restore();
}

function drawHandles(item) {
  const handles = getHandles(item);
  ctx.save();
  ctx.lineWidth = 2 / state.view.scale;
  ctx.strokeStyle = "#d63f72";
  ctx.fillStyle = "#fff";

  const top = handles.find((handle) => handle.type === "top");
  const rotate = handles.find((handle) => handle.type === "rotate");
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(rotate.x, rotate.y);
  ctx.stroke();

  handles.forEach((handle) => {
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, handle.radius, 0, Math.PI * 2);
    ctx.fillStyle = handle.type === "rotate" ? "#d63f72" : "#fff";
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function getHandles(item) {
  const radius = 8 / state.view.scale;
  const rotateGap = 46 / state.view.scale;
  return [
    localPointToWorld(item, 0, 0, "move", radius),
    localPointToWorld(item, -item.width / 2, 0, "left", radius),
    localPointToWorld(item, item.width / 2, 0, "right", radius),
    localPointToWorld(item, 0, -item.height / 2, "top", radius),
    localPointToWorld(item, 0, item.height / 2, "bottom", radius),
    localPointToWorld(item, 0, -item.height / 2 - rotateGap, "rotate", radius),
  ];
}

function localPointToWorld(item, localX, localY, type, radius) {
  const radians = degreesToRadians(item.rotation || 0);
  return {
    type,
    radius,
    x: item.x + localX * Math.cos(radians) - localY * Math.sin(radians),
    y: item.y + localX * Math.sin(radians) + localY * Math.cos(radians),
  };
}

function findHandleAt(item, world) {
  if (!item) return null;
  return getHandles(item)
    .slice()
    .reverse()
    .find((handle) => distance(handle, world) <= handle.radius * 1.45);
}

function onPointerDown(event) {
  hideContextMenu();
  canvas.setPointerCapture(event.pointerId);
  const screen = getPointer(event);
  const world = screenToWorld(screen.x, screen.y);
  const selected = getSelected();
  const handle = state.editMode ? findHandleAt(selected, world) : null;
  const item = handle ? selected : findItemAt(world.x, world.y);

  state.pointer.startScreen = screen;
  state.pointer.startWorld = world;

  if (handle && state.editMode) {
    state.pointer.mode = handle.type === "move" ? "item" : "handle";
    state.pointer.handle = handle.type;
    state.pointer.startItem = { ...selected };
  } else if (item && state.editMode && event.button === 0) {
    state.selectedId = item.id;
    state.pointer.mode = "item";
    state.pointer.handle = null;
    state.pointer.startItem = { ...item };
    bringToFront(item);
    openEditor(item);
    renderDetailCard();
  } else if (item && event.button === 0) {
    state.selectedId = item.id;
    renderDetailCard();
  } else {
    state.pointer.mode = "pan";
    state.pointer.startView = { ...state.view };
    state.selectedId = null;
    closeEditor(false);
    renderDetailCard();
  }

  canvas.classList.add("dragging");
  draw();
}

function onPointerMove(event) {
  const screen = getPointer(event);
  const world = screenToWorld(screen.x, screen.y);

  if (!state.pointer.mode) {
    updateHover(world);
    return;
  }

  if (state.pointer.mode === "pan") {
    state.view.x = state.pointer.startView.x + (screen.x - state.pointer.startScreen.x);
    state.view.y = state.pointer.startView.y + (screen.y - state.pointer.startScreen.y);
    constrainView();
    save();
    draw();
    return;
  }

  const item = getSelected();
  if (!item || !state.pointer.startItem) return;

  if (state.pointer.mode === "item") {
    item.x = Math.round(state.pointer.startItem.x + (world.x - state.pointer.startWorld.x));
    item.y = Math.round(state.pointer.startItem.y + (world.y - state.pointer.startWorld.y));
  } else if (state.pointer.mode === "handle") {
    applyHandleDrag(item, state.pointer.startItem, world, state.pointer.handle);
  }

  save();
  draw();
}

function onPointerUp() {
  state.pointer.mode = null;
  state.pointer.handle = null;
  state.pointer.startItem = null;
  state.pointer.startView = null;
  canvas.classList.remove("dragging");
}

function updateHover(world) {
  const item = findItemAt(world.x, world.y);
  const selected = getSelected();
  const handle = state.editMode ? findHandleAt(selected, world) : null;
  const nextHoverId = item ? item.id : null;
  const cursor = handle ? cursorForHandle(handle.type) : item ? (state.editMode ? "move" : "pointer") : "grab";

  if (state.hoverId !== nextHoverId || canvas.style.cursor !== cursor) {
    state.hoverId = nextHoverId;
    canvas.style.cursor = cursor;
    draw();
  }
}

function cursorForHandle(type) {
  if (type === "left" || type === "right") return "ew-resize";
  if (type === "top" || type === "bottom") return "ns-resize";
  if (type === "rotate") return "crosshair";
  return "move";
}

function applyHandleDrag(item, startItem, world, handleType) {
  if (handleType === "rotate") {
    item.rotation = Math.round(radiansToDegrees(Math.atan2(world.y - startItem.y, world.x - startItem.x)) + 90);
    return;
  }

  const local = worldToItemLocal(startItem, world.x, world.y);
  if (handleType === "left" || handleType === "right") {
    item.width = Math.round(clamp(Math.abs(local.x) * 2, MIN_ITEM.width, 760));
  }
  if (handleType === "top" || handleType === "bottom") {
    item.height = Math.round(clamp(Math.abs(local.y) * 2, MIN_ITEM.height, 520));
  }
}

function onWheel(event) {
  const pointer = getPointer(event);
  const world = screenToWorld(pointer.x, pointer.y);
  const item = findItemAt(world.x, world.y);

  event.preventDefault();
  if (item && state.editMode) {
    const factor = event.deltaY < 0 ? 1.06 : 1 / 1.06;
    item.width = Math.round(clamp(item.width * factor, MIN_ITEM.width, 760));
    item.height = Math.round(clamp(item.height * factor, MIN_ITEM.height, 520));
    state.selectedId = item.id;
    renderDetailCard();
    openEditor(item);
    save();
    draw();
    return;
  }

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
    renderDetailCard();
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
    state.selectedId = null;
    renderDetailCard();
    draw();
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
  if (state.view.scale <= MIN_SCALE + 0.001) {
    centerAxis();
  } else {
    state.view.x = screenX - before.x * state.view.scale;
    state.view.y = screenY - before.y * state.view.scale;
    constrainView();
  }
  updateZoomLabel();
  save();
  draw();
}

function constrainView() {
  state.view.scale = clamp(state.view.scale, MIN_SCALE, MAX_SCALE);
  const display = getDisplaySize();
  const scaledWidth = WORLD.width * state.view.scale;
  const scaledHeight = WORLD.height * state.view.scale;
  const marginX = Math.min(display.width * 0.6, 760);
  const marginY = Math.min(display.height * 0.6, 520);

  state.view.x = clamp(state.view.x, display.width - scaledWidth - marginX, marginX);
  state.view.y = clamp(state.view.y, display.height - scaledHeight - marginY, marginY);
}

function screenToWorld(x, y) {
  return {
    x: (x - state.view.x) / state.view.scale,
    y: (y - state.view.y) / state.view.scale,
  };
}

function worldToScreen(x, y) {
  return {
    x: state.view.x + x * state.view.scale,
    y: state.view.y + y * state.view.scale,
  };
}

function worldToItemLocal(item, x, y) {
  const radians = -degreesToRadians(item.rotation || 0);
  const dx = x - item.x;
  const dy = y - item.y;
  return {
    x: dx * Math.cos(radians) - dy * Math.sin(radians),
    y: dx * Math.sin(radians) + dy * Math.cos(radians),
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
  const local = worldToItemLocal(item, x, y);
  return (local.x * local.x) / Math.pow(item.width / 2, 2) + (local.y * local.y) / Math.pow(item.height / 2, 2) <= 1;
}

function createItem(x, y) {
  return {
    id: makeId(),
    labelZh: copy.zh.newItem,
    labelEn: copy.en.newItem,
    introZh: copy.zh.newIntro,
    introEn: copy.en.newIntro,
    image: "",
    links: [],
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

function closeEditor(clearSelection = true) {
  editor.hidden = true;
  controls.image.value = "";
  if (clearSelection) state.selectedId = null;
  draw();
}

function syncForm(item) {
  controls.labelZh.value = item.labelZh || "";
  controls.labelEn.value = item.labelEn || "";
  controls.introZh.value = item.introZh || "";
  controls.introEn.value = item.introEn || "";
  renderLinksEditor(item);
}

function updateSelectedFromForm(event) {
  if (event.target === controls.image || event.target.closest(".links-editor")) return;
  const item = getSelected();
  if (!item) return;
  item.labelZh = controls.labelZh.value;
  item.labelEn = controls.labelEn.value;
  item.introZh = controls.introZh.value;
  item.introEn = controls.introEn.value;
  renderDetailCard();
  save();
  draw();
}

function renderLinksEditor(item) {
  controls.linksEditor.replaceChildren();
  item.links.forEach((link, index) => {
    const row = document.createElement("div");
    row.className = "link-row";

    const titleLabel = document.createElement("label");
    titleLabel.innerHTML = "<span>展示名</span>";
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = link.title || "";
    titleInput.dataset.index = String(index);
    titleInput.dataset.field = "title";
    titleLabel.append(titleInput);

    const urlLabel = document.createElement("label");
    urlLabel.innerHTML = "<span>URL</span>";
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = "https://example.com";
    urlInput.value = link.url || "";
    urlInput.dataset.index = String(index);
    urlInput.dataset.field = "url";
    urlLabel.append(urlInput);

    const remove = document.createElement("button");
    remove.className = "icon-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "删除链接";
    remove.dataset.index = String(index);
    remove.dataset.action = "remove-link";

    row.append(titleLabel, urlLabel, remove);
    controls.linksEditor.append(row);
  });
}

function updateLinkFromInput(event) {
  const input = event.target;
  if (!input.dataset || !input.dataset.field) return;
  const item = getSelected();
  if (!item) return;
  const index = Number(input.dataset.index);
  const field = input.dataset.field;
  item.links[index][field] = input.value;
  renderDetailCard();
  save();
}

function onLinksEditorClick(event) {
  const button = event.target.closest("button[data-action='remove-link']");
  if (!button) return;
  const item = getSelected();
  if (!item) return;
  item.links.splice(Number(button.dataset.index), 1);
  renderLinksEditor(item);
  renderDetailCard();
  save();
}

function addLink() {
  const item = getSelected();
  if (!item) return;
  item.links.push({ title: "bilibili", url: "" });
  renderLinksEditor(item);
  renderDetailCard();
  save();
}

function setSelectedImage() {
  const item = getSelected();
  const file = controls.image.files && controls.image.files[0];
  if (!item || !file) return;
  setImageFromFile(file);
}

function setImageFromFile(file) {
  const item = getSelected();
  if (!item || !file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    item.image = reader.result;
    cacheImage(item);
    renderDetailCard();
    save();
  };
  reader.readAsDataURL(file);
}

function onImageDragOver(event) {
  if (!getSelected()) return;
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function onImageDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function onImageDrop(event) {
  if (!getSelected()) return;
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");
  const file = Array.from(event.dataTransfer.files || []).find((entry) => entry.type.startsWith("image/"));
  if (file) setImageFromFile(file);
}

function onPasteImage(event) {
  const item = getSelected();
  if (!item) return;
  const active = document.activeElement;
  const editingText = active && ["INPUT", "TEXTAREA"].includes(active.tagName);
  const file = Array.from(event.clipboardData?.items || [])
    .find((entry) => entry.type.startsWith("image/"))
    ?.getAsFile();
  if (!file) return;
  event.preventDefault();
  if (editingText) active.blur();
  setImageFromFile(file);
}

function removeSelectedImage() {
  const item = getSelected();
  if (!item) return;
  item.image = "";
  state.imageCache.delete(item.id);
  controls.image.value = "";
  renderDetailCard();
  save();
}

function deleteSelected() {
  if (!state.selectedId) return;
  state.items = state.items.filter((item) => item.id !== state.selectedId);
  state.imageCache.delete(state.selectedId);
  closeEditor();
  renderDetailCard();
  save();
  draw();
}

function renderDetailCard() {
  const item = getSelected();
  detailCard.replaceChildren();
  if (!item) {
    detailCard.hidden = true;
    return;
  }

  const t = copy[state.language];
  if (item.image) {
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = getLocalized(item, "label") || "item image";
    detailCard.append(image);
  }

  const title = document.createElement("h2");
  title.textContent = getLocalized(item, "label") || (state.language === "zh" ? "未命名" : "Untitled");
  detailCard.append(title);

  const intro = document.createElement("p");
  const introText = getLocalized(item, "intro");
  intro.textContent = introText || t.emptyIntro;
  if (!introText) intro.className = "detail-empty";
  detailCard.append(intro);

  const validLinks = item.links.filter((link) => link.url && link.title);
  if (validLinks.length) {
    const links = document.createElement("div");
    links.className = "detail-links";
    validLinks.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.title;
      links.append(anchor);
    });
    detailCard.append(links);
  } else {
    const empty = document.createElement("p");
    empty.className = "detail-empty";
    empty.textContent = t.emptyLinks;
    detailCard.append(empty);
  }

  detailCard.hidden = false;
  updateDetailCardPosition();
}

function updateDetailCardPosition() {
  const item = getSelected();
  if (!item || detailCard.hidden) return;
  const stageRect = stage.getBoundingClientRect();
  const screen = worldToScreen(item.x, item.y);
  const leftCandidate = screen.x + (item.width / 2) * state.view.scale + 18;
  const topCandidate = screen.y - 90;
  const width = detailCard.offsetWidth || 330;
  const height = detailCard.offsetHeight || 260;

  let left = clamp(leftCandidate, 12, stageRect.width - width - 12);
  if (stageRect.width - leftCandidate < width + 16) {
    left = clamp(screen.x - (item.width / 2) * state.view.scale - width - 18, 12, stageRect.width - width - 12);
  }
  const top = clamp(topCandidate, 12, stageRect.height - height - 12);

  detailCard.style.left = `${left}px`;
  detailCard.style.top = `${top}px`;
}

function cacheImage(item) {
  if (!item.image) return;
  const image = new Image();
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

function closeSettings() {
  settingsMenu.hidden = true;
  settingsButton.setAttribute("aria-expanded", "false");
}

function toggleEditMode() {
  if (!state.editMode && !requestEditLogin()) return;
  state.editMode = !state.editMode;
  if (!state.editMode) {
    closeEditor();
    hideContextMenu();
  }
  updateEditToggle();
  closeSettings();
  draw();
}

function requestEditLogin() {
  const password = window.prompt("请输入编辑密码");
  if (password === null) return false;
  if (password === EDIT_PASSWORD) {
    return true;
  }
  window.alert("密码不正确。");
  return false;
}

function updateLanguageUi() {
  const t = copy[state.language];
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  document.title = t.title;
  titleHeading.textContent = t.title;
  settingsButton.textContent = t.settings;
  languageButton.textContent = t.language;
  addHereButton.textContent = t.add;
  hint.textContent = t.hint;
  controls.imageDropZone.textContent = t.imageDrop;
  controls.quadrants.forEach((label, index) => {
    label.textContent = t.quadrants[index];
  });
  updateEditToggle();
  updateFloatingUi();
}

function updateFloatingUi() {
  const display = getDisplaySize();
  const axisScreen = worldToScreen(AXIS.x, AXIS.y);
  const xAxisVisible = axisScreen.y >= 0 && axisScreen.y <= display.height;
  const yAxisVisible = axisScreen.x >= 0 && axisScreen.x <= display.width;
  floatingXAxis.hidden = xAxisVisible;
  floatingYAxis.hidden = yAxisVisible;
  const pinnedX = clamp(axisScreen.x, 42, Math.max(42, display.width - 42));
  const pinnedY = clamp(axisScreen.y, 42, Math.max(42, display.height - 42));
  floatingYAxis.style.left = `${pinnedX}px`;
  floatingXAxis.style.top = `${pinnedY}px`;
}

function updateEditToggle() {
  const t = copy[state.language];
  editToggle.classList.toggle("active", state.editMode);
  editToggle.textContent = state.editMode ? t.editOn : t.editOff;
  editToggle.setAttribute("aria-pressed", String(state.editMode));
  controls.dataTools.hidden = true;
  controls.dataTools.style.display = state.editMode ? "flex" : "none";
  if (state.editMode) controls.dataTools.hidden = false;
  hint.hidden = !state.editMode;
}

function updateZoomLabel() {
  zoomLabel.value = `${Math.round(state.view.scale * 100)}%`;
}

function getLocalized(item, field) {
  const primary = item[`${field}${state.language === "zh" ? "Zh" : "En"}`];
  const fallback = item[`${field}${state.language === "zh" ? "En" : "Zh"}`];
  return (primary || fallback || "").trim();
}

function exportJson() {
  const payload = JSON.stringify({ items: state.items, view: state.view, language: state.language }, null, 2);
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
      state.items = data.items.map(normalizeItem);
      state.imageCache.clear();
      state.items.forEach(cacheImage);
      if (data.view) state.view = data.view;
      if (data.language) state.language = data.language;
      state.selectedId = null;
      closeEditor(false);
      renderDetailCard();
      updateLanguageUi();
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

  const visibleLines = lines.slice(0, 3);
  const startY = y - ((visibleLines.length - 1) * lineHeight) / 2;
  visibleLines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, startY + index * lineHeight);
  });
}

function makeId() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

bootstrap();
