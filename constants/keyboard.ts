// Keyboard shortcuts used by KeyboardShortcuts hook/component
export const KEY = {
  delete: "Delete",
  backspace: "Backspace",
  escape: "Escape",
  enter: "Enter",
  space: " ",
  arrowUp: "ArrowUp",
  arrowDown: "ArrowDown",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  z: "z",
  y: "y",
  d: "d",
  a: "a",
  r: "r",
  c: "c",
  t: "t",

  // 🔧 Add these:
  x: "x",  // Cut
  v: "v",  // Paste
};

export const MOD = {
  meta: "Meta",
  ctrl: "Control",
  alt: "Alt",
  shift: "Shift",
};

// Optional: define named combos (not required by your component, but handy)
export const SHORTCUTS = {
  undo: { key: KEY.z, meta: true },                 // ⌘Z / Ctrl+Z
  redoMac: { key: KEY.z, meta: true, shift: true }, // ⌘⇧Z
  redoWin: { key: KEY.y, ctrl: true },              // Ctrl+Y
  delete: { keys: [KEY.delete, KEY.backspace] },
  cut: { key: KEY.x, metaOrCtrl: true },
  copy: { key: KEY.c, metaOrCtrl: true },
  paste: { key: KEY.v, metaOrCtrl: true },
  nudgeUp: KEY.arrowUp,
  nudgeDown: KEY.arrowDown,
  nudgeLeft: KEY.arrowLeft,
  nudgeRight: KEY.arrowRight,
};
