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
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingMessage = document.getElementById("loadingMessage");
const saveToast = document.getElementById("saveToast");

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
const SUPABASE_URL = "https://vylfsuvkcikfzfbmwlsb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YKei57ev0P26HhOKYp7_7Q_e7VxBfxc";
const SUPABASE_TABLE = "map_state";
const SUPABASE_MAP_ID = "main";
const SUPABASE_IMAGE_BUCKET = "map-images";
const EDIT_PASSWORD = "114514";
const WORLD = { width: 2200, height: 1300 };
const AXIS = { x: 770, y: 650 };
const DESKTOP_MIN_SCALE = 0.7;
const ABSOLUTE_MIN_SCALE = 0.25;
const MAX_SCALE = 3.5;
const MIN_SCALE_EPSILON = 0.035;
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
    loadingRemote: "正在拉取云端数据...",
    savingRemote: "正在保存到云端...",
    savingAuto: "正在自动保存...",
    savedRemote: "已保存到云端",
    savedLocal: "已保存在本地",
    saveFailed: "保存失败，已保存在本地",
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
    loadingRemote: "Loading cloud data...",
    savingRemote: "Saving to cloud...",
    savingAuto: "Auto-saving...",
    savedRemote: "Saved to cloud",
    savedLocal: "Saved locally",
    saveFailed: "Save failed. Kept locally.",
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
  supabase: null,
  remoteChannel: null,
  remoteSaveTimer: null,
  remoteSavePromise: null,
  remoteErrorShown: false,
  hasUnsavedRemoteChanges: false,
  ignoreRemoteUntil: 0,
  pendingUploads: 0,
  saveToastTimer: null,
  viewAnimation: null,
  zoomAnimation: null,
  zoomTarget: null,
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
  isFirstLoad: false,
};

function bootstrap() {
  initSupabase();
  if (!state.supabase) hideLoadingOverlay();
  load();
  resizeCanvas();
  bindEvents();
  updateLanguageUi();
  draw();
  loadRemoteMap();
  subscribeRemoteMap();
}

function initSupabase() {
  if (!globalThis.supabase || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return;
  state.supabase = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
	      state.items = Array.isArray(data.items) ? data.items.map(normalizeItem) : starterItems;
	      state.view = data.view || state.view;
	      state.language = data.language || state.language;
		  state.isFirstLoad = false;
    } else {
      state.items = starterItems;
	  state.isFirstLoad = false;
    }
  } catch {
    state.items = starterItems;
    state.isFirstLoad = false;
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
  saveLocalState();
  if (!state.supabase) {
    showSaveToast("saved", copy[state.language].savedLocal, 1800);
    state.hasUnsavedRemoteChanges = false;
    return;
  }
  state.hasUnsavedRemoteChanges = true;
  state.ignoreRemoteUntil = Date.now() + 1800;
  scheduleRemoteSave();
}

function saveLocalState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      view: state.view,
      language: state.language,
    })
  );
}

function scheduleRemoteSave() {
  if (!state.supabase) return;
  showSaveToast("saving", copy[state.language].savingAuto, 0);
  updateEditToggle();
  window.clearTimeout(state.remoteSaveTimer);
  state.remoteSavePromise = new Promise((resolve) => {
    state.remoteSaveTimer = window.setTimeout(async () => {
      state.remoteSaveTimer = null;
      const result = await saveRemoteMap();
      state.remoteSavePromise = null;
      resolve(result);
    }, 250);
  });
}

async function saveRemoteMap() {
  if (!state.supabase) return;
  const shouldNotify = state.hasUnsavedRemoteChanges || state.pendingUploads > 0;
  const updatedAt = Date.now();
  const payload = {
    id: SUPABASE_MAP_ID,
    data: {
      items: state.items,
      view: state.view,
      language: state.language,
      updatedAt,
    },
    updated_at: new Date(updatedAt).toISOString(),
  };
  const { error } = await state.supabase.from(SUPABASE_TABLE).upsert(payload);
  if (error) {
    showSaveToast("error", copy[state.language].saveFailed, 3600);
    showRemoteError(`Supabase 保存失败：${error.message}`);
  }
  if (!error) {
    state.hasUnsavedRemoteChanges = false;
    if (shouldNotify) {
      showSaveToast("saved", copy[state.language].savedRemote, 1800);
    } else {
      saveToast.hidden = true; 
    }
  }
  updateEditToggle();
  return !error;
}

async function loadRemoteMap() {
  if (!state.supabase) return;
  showLoadingOverlay(copy[state.language].loadingRemote);
  const { data, error } = await state.supabase
    .from(SUPABASE_TABLE)
    .select("data")
    .eq("id", SUPABASE_MAP_ID)
    .maybeSingle();

  if (error) {
    showRemoteError(`Supabase 读取失败：${error.message}`);
    hideLoadingOverlay();
    return;
  }

  if (!data?.data?.items) {
    await saveRemoteMap();
    hideLoadingOverlay();
    return;
  }

  applyRemoteData(data.data);

  if (state.isFirstLoad) {
     fitView(false);
  } 
  hideLoadingOverlay();
}

function subscribeRemoteMap() {
  if (!state.supabase || state.remoteChannel) return;
  state.remoteChannel = state.supabase
    .channel("map-state-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: SUPABASE_TABLE,
        filter: `id=eq.${SUPABASE_MAP_ID}`,
      },
      (payload) => {
        if (Date.now() < state.ignoreRemoteUntil) return;
        if (state.editMode) return;
        if (state.viewAnimation) return;
	const nextData = payload.new?.data;
	if (nextData?.items) applyRemoteData(nextData);
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") showRemoteError("Supabase 实时同步连接失败，请检查 Realtime 配置。");
    });
}

function applyRemoteData(data) {
  state.items = data.items.map(normalizeItem);
  state.imageCache.clear();
  state.items.forEach(cacheImage);
  updateLanguageUi();
  renderDetailCard();
  draw();
  saveLocalState();
}

function showRemoteError(message) {
  console.warn(message);
  if (state.remoteErrorShown) return;
  state.remoteErrorShown = true;
  window.alert(message);
}

function showLoadingOverlay(message) {
  loadingMessage.textContent = message;
  loadingOverlay.hidden = false;
}

function hideLoadingOverlay() {
  loadingOverlay.hidden = true;
}

function showSaveToast(type, message, timeout = 1800) {
  saveToast.textContent = message;
  saveToast.className = `save-toast ${type}`;
  saveToast.hidden = false;
  window.clearTimeout(state.saveToastTimer);
  if (timeout > 0) {
    state.saveToastTimer = window.setTimeout(() => {
      saveToast.hidden = true;
    }, timeout);
  }
}

async function waitForPendingSync() {
  if (!hasPendingSync()) {
    saveToast.hidden = true;
    return true;
  }
  
  window.clearTimeout(state.remoteSaveTimer);
  state.remoteSaveTimer = null;
  showLoadingOverlay(copy[state.language].savingRemote);
  showSaveToast("saving", copy[state.language].savingAuto, 0);
  while (state.pendingUploads > 0) {
    await delay(120);
  }
  state.remoteSavePromise = null;
  const ok = await saveRemoteMap();
  hideLoadingOverlay();
  return ok;
}

async function saveCardWithOverlay() {
  if (!state.supabase || !state.hasUnsavedRemoteChanges) return;
  showSaveToast("saving", copy[state.language].savingAuto, 0);
  await waitForPendingSync();
}

function hasPendingSync() {
  return state.hasUnsavedRemoteChanges || state.pendingUploads > 0 || Boolean(state.remoteSaveTimer || state.remoteSavePromise);
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function bindEvents() {
  window.addEventListener("resize", () => {
    resizeCanvas();
    keepMinimumZoomCentered();
  });

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", onContextMenu);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("paste", onPasteImage);
  window.addEventListener("beforeunload", (event) => {
    if (!hasPendingSync()) return;
    event.preventDefault();
    event.returnValue = "";
  });
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
    saveLocalState();
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
  form.addEventListener("change", () => {
    if (state.editMode) saveCardWithOverlay();
  });
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
  keepMinimumZoomCentered();
}

function fitView(shouldDraw = true) {
  const target = fittedContentView();
  if (shouldDraw) {
    animateViewTo(target);
  } else {
    setView(target);
    saveLocalState(); 
  }
}

function centerAxis() {
  animateViewTo(centeredAxisView(state.view.scale), 240, true);
}

function fittedContentView() {
  const minScale = getMinimumScale();
  const bounds = getContentBounds();
  const display = getDisplaySize();
  const scale = clamp(minScale, ABSOLUTE_MIN_SCALE, MAX_SCALE);
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  return {
    scale,
    x: display.width / 2 - centerX * scale,
    y: display.height / 2 - centerY * scale,
  };
}

function centeredAxisView(scale) {
  const display = getDisplaySize();
  return {
    scale,
    x: display.width / 2 - AXIS.x * scale,
    y: display.height / 2 - AXIS.y * scale,
  };
}

function setView(view) {
  state.view.scale = view.scale;
  state.view.x = view.x;
  state.view.y = view.y;
  updateZoomLabel();
  draw();
}

function keepMinimumZoomCentered() {
  if (isMinimumZoom()) {
    setView(fittedContentView());
  } else {
    constrainView();
    draw();
  }
}

function animateViewTo(target, duration = 220, forceMotion = false) {
  if (state.viewAnimation) cancelAnimationFrame(state.viewAnimation);
  const start = forceMotion ? createAnimatedStart(target) : { ...state.view };
  const startTime = performance.now();

  const tick = (now) => {
    const progress = clamp((now - startTime) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    state.view.scale = lerp(start.scale, target.scale, eased);
    state.view.x = lerp(start.x, target.x, eased);
    state.view.y = lerp(start.y, target.y, eased);
    updateZoomLabel();
    draw();

    if (progress < 1) {
      state.viewAnimation = requestAnimationFrame(tick);
    } else {
      state.viewAnimation = null;
      setView(target);
    }
  };

  state.viewAnimation = requestAnimationFrame(tick);
}

function animateZoomTo(target) {
  state.zoomTarget = target;
  if (state.zoomAnimation) return;

  const tick = () => {
    if (!state.zoomTarget) {
      state.zoomAnimation = null;
      return;
    }

    const targetView = state.zoomTarget;
    state.view.scale = lerp(state.view.scale, targetView.scale, 0.28);
    state.view.x = lerp(state.view.x, targetView.x, 0.28);
    state.view.y = lerp(state.view.y, targetView.y, 0.28);
    updateZoomLabel();
    draw();

    const done =
      Math.abs(state.view.scale - targetView.scale) < 0.001 &&
      Math.abs(state.view.x - targetView.x) < 0.5 &&
      Math.abs(state.view.y - targetView.y) < 0.5;

    if (done) {
      setView(targetView);
      state.zoomTarget = null;
      state.zoomAnimation = null;
      return;
    }

    state.zoomAnimation = requestAnimationFrame(tick);
  };

  state.zoomAnimation = requestAnimationFrame(tick);
}

function createAnimatedStart(target) {
  const dx = Math.abs(state.view.x - target.x);
  const dy = Math.abs(state.view.y - target.y);
  const ds = Math.abs(state.view.scale - target.scale);
  if (dx + dy + ds > 8) return { ...state.view };
  return {
    scale: target.scale,
    x: target.x + 28,
    y: target.y,
  };
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

  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  drawFittedText(label, 0, 0, item.width * 0.7, item.height * 0.62);

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
    if (isMinimumZoom()) {
      setView(fittedContentView());
    } else {
      state.view.x = state.pointer.startView.x + (screen.x - state.pointer.startScreen.x);
      state.view.y = state.pointer.startView.y + (screen.y - state.pointer.startScreen.y);
      constrainView();
    }
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

  draw();
}

function onPointerUp() {
  if (state.pointer.mode === "item" || state.pointer.mode === "handle") save();
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
  const baseView = state.zoomTarget || state.view;
  const before = {
    x: (screenX - baseView.x) / baseView.scale,
    y: (screenY - baseView.y) / baseView.scale,
  };
  const minScale = getMinimumScale();
  const targetScale = clamp(baseView.scale * factor, minScale, MAX_SCALE);
  if (factor < 1 && targetScale <= minScale + MIN_SCALE_EPSILON) {
    animateViewTo(fittedContentView(), 260, true);
  } else {
    const target = constrainViewValues({
      scale: targetScale,
      x: screenX - before.x * targetScale,
      y: screenY - before.y * targetScale,
    });
    animateZoomTo(target);
  }
}

function constrainView() {
  const constrained = constrainViewValues(state.view);
  state.view.scale = constrained.scale;
  state.view.x = constrained.x;
  state.view.y = constrained.y;
}

function constrainViewValues(view) {
  const scale = clamp(view.scale, getMinimumScale(), MAX_SCALE);
  const display = getDisplaySize();
  const scaledWidth = WORLD.width * scale;
  const scaledHeight = WORLD.height * scale;
  const marginX = Math.min(display.width * 0.6, 760);
  const marginY = Math.min(display.height * 0.6, 520);
  return {
    scale,
    x: clamp(view.x, display.width - scaledWidth - marginX, marginX),
    y: clamp(view.y, display.height - scaledHeight - marginY, marginY),
  };
}

function normalizeMinimumZoomView() {
  if (!isMinimumZoom()) return;
  const target = fittedContentView();
  state.view.scale = target.scale;
  state.view.x = target.x;
  state.view.y = target.y;
}

function isMinimumZoom() {
  return state.view.scale <= getMinimumScale() + MIN_SCALE_EPSILON;
}

function getMinimumScale() {
  const display = getDisplaySize();
  const bounds = getContentBounds();
  const padding = Math.max(80, Math.min(display.width, display.height) * 0.08);
  const fitScale = Math.min(
    (display.width - padding * 2) / Math.max(1, bounds.right - bounds.left),
    (display.height - padding * 2) / Math.max(1, bounds.bottom - bounds.top)
  );
  return clamp(Math.min(DESKTOP_MIN_SCALE, fitScale), ABSOLUTE_MIN_SCALE, DESKTOP_MIN_SCALE);
}

function getContentBounds() {
  if (!state.items.length) {
    return { left: 0, top: 0, right: WORLD.width, bottom: WORLD.height };
  }

  const pad = 90;
  return state.items.reduce(
    (bounds, item) => {
      const radius = getRotatedItemRadius(item);
      return {
        left: Math.min(bounds.left, item.x - radius.x - pad, AXIS.x - pad),
        top: Math.min(bounds.top, item.y - radius.y - pad, AXIS.y - pad),
        right: Math.max(bounds.right, item.x + radius.x + pad, AXIS.x + pad),
        bottom: Math.max(bounds.bottom, item.y + radius.y + pad, AXIS.y + pad),
      };
    },
    { left: AXIS.x, top: AXIS.y, right: AXIS.x, bottom: AXIS.y }
  );
}

function getRotatedItemRadius(item) {
  const radians = degreesToRadians(item.rotation || 0);
  const halfWidth = item.width / 2;
  const halfHeight = item.height / 2;
  return {
    x: Math.abs(halfWidth * Math.cos(radians)) + Math.abs(halfHeight * Math.sin(radians)),
    y: Math.abs(halfWidth * Math.sin(radians)) + Math.abs(halfHeight * Math.cos(radians)),
  };
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

async function setImageFromFile(file) {
  const item = getSelected();
  if (!item || !file || !file.type.startsWith("image/")) return;
  const previousImage = item.image;
  const cloudUrl = await uploadImageFile(item, file);
  if (cloudUrl) {
    item.image = cloudUrl;
    if (previousImage && previousImage !== cloudUrl) deleteCloudImage(previousImage);
    cacheImage(item);
    renderDetailCard();
    save();
    saveCardWithOverlay();
    return;
  }
  showRemoteError("图片上传失败：Supabase Storage 没有配置好，图片不会保存。");
}

async function uploadImageFile(item, file) {
  if (!state.supabase) {
    showRemoteError("Supabase 未连接，无法上传图片。");
    return "";
  }
  state.pendingUploads += 1;
  showSaveToast("saving", copy[state.language].savingAuto, 0);
  updateEditToggle();
  const safeName = sanitizeFileName(file.name || "pasted-image.png");
  const path = `items/${item.id}/${Date.now()}-${safeName}`;
  try {
    const { error } = await state.supabase.storage
      .from(SUPABASE_IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      showRemoteError(`Supabase 图片上传失败：${error.message}`);
      return "";
    }

    const { data } = state.supabase.storage.from(SUPABASE_IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl || "";
  } finally {
    state.pendingUploads = Math.max(0, state.pendingUploads - 1);
    updateEditToggle();
  }
}

function sanitizeFileName(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || "image.png";
}

function getStoragePathFromPublicUrl(url) {
  if (!url || !url.includes(`/storage/v1/object/public/${SUPABASE_IMAGE_BUCKET}/`)) return "";
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${SUPABASE_IMAGE_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return "";
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return "";
  }
}

async function deleteCloudImage(url) {
  if (!state.supabase) return;
  const path = getStoragePathFromPublicUrl(url);
  if (!path) return;
  const { error } = await state.supabase.storage.from(SUPABASE_IMAGE_BUCKET).remove([path]);
  if (error) console.warn("Supabase image delete failed:", error.message);
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

async function removeSelectedImage() {
  const item = getSelected();
  if (!item) return;
  const previousImage = item.image;
  item.image = "";
  state.imageCache.delete(item.id);
  controls.image.value = "";
  renderDetailCard();
  await deleteCloudImage(previousImage);
  save();
  saveCardWithOverlay();
}

async function deleteSelected() {
  if (!state.selectedId) return;
  const item = getSelected();
  state.items = state.items.filter((item) => item.id !== state.selectedId);
  state.imageCache.delete(state.selectedId);
  await deleteCloudImage(item?.image || "");
  closeEditor();
  renderDetailCard();
  save();
  saveCardWithOverlay();
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

async function toggleEditMode() {
  if (!state.editMode && !requestEditLogin()) return;
  if (state.editMode) {
    await waitForPendingSync();
    state.editMode = false;
    closeEditor();
    hideContextMenu();
    loadRemoteMap(); 
  } else {
    state.editMode = true;
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
  if (state.hasUnsavedRemoteChanges || state.pendingUploads > 0) editToggle.textContent = "保存中...";
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

function drawFittedText(text, x, y, maxWidth, maxHeight) {
  const maxFont = Math.min(44, Math.max(18, Math.min(maxWidth * 0.42, maxHeight * 0.72)));
  const minFont = 12;
  let best = null;

  for (let size = maxFont; size >= minFont; size -= 1) {
    ctx.font = `${size}px "Songti SC", "SimSun", Georgia, serif`;
    const lineHeight = size * 1.15;
    const lines = getWrappedLines(text, maxWidth);
    const textHeight = lines.length * lineHeight;
    const widest = lines.reduce((width, line) => Math.max(width, ctx.measureText(line).width), 0);
    if (textHeight <= maxHeight && widest <= maxWidth) {
      best = { lines, size, lineHeight };
      break;
    }
  }

  if (!best) {
    const size = minFont;
    ctx.font = `${size}px "Songti SC", "SimSun", Georgia, serif`;
    const lineHeight = size * 1.12;
    const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
    best = {
      lines: getWrappedLines(text, maxWidth).slice(0, maxLines),
      size,
      lineHeight,
    };
  }

  ctx.font = `${best.size}px "Songti SC", "SimSun", Georgia, serif`;
  const startY = y - ((best.lines.length - 1) * best.lineHeight) / 2;
  best.lines.forEach((lineText, index) => {
    ctx.fillText(lineText, x, startY + index * best.lineHeight);
  });
}

function getWrappedLines(text, maxWidth) {
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
  return lines;
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

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

bootstrap();
