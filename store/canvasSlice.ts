// src/store/canvasSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnyEl, CanvasState } from "@/types/canvas";
import { nanoid } from "nanoid";

const MAX_HISTORY = 10;

const initialPresent: Omit<CanvasState, "past" | "future"> = {
    elements: [
      {
        id: "img-1",
        type: "image",
        x: 578.2502751914502,
        y: 395,
        width: 323,
        height: 198,
        src: "/images/canvas-01.jpg",
        rotation: 0,
        name: "Image 01",
        cornerRadius: 51,
      },
      {
        id: "fVtOVWXcHv9OZQWh_0h2t",
        type: "arrow",
        x: 474.9597314886694,
        y: 228.30938106113484,
        points: [0, 0, 249.17171499585385, 0],
        stroke: "#090b10",
        strokeWidth: 4,
        rotation: 40.746017809651136,
        name: "Arrow",
      },
      {
        id: "uAK1cO5MnKEa_jpGzCAvf",
        type: "rect",
        x: 177.9510159218683,
        y: 54,
        width: 320,
        height: 200,
        fill: "#87CEEB",
        cornerRadius: 64,
        rotation: 0,
        name: "Rectangle",
      },
      {
        id: "Zsi2XL4WOar2jFMBr20x5",
        type: "text",
        x: 222.04650735508005,
        y: 101,
        text: "This is a Windows 11",
        fontSize: 24,
        fill: "#111827",
        rotation: 0,
        name: "Text",
      },
      {
        id: "H7FDBtMB7FDujkmxVIN_J",
        type: "text",
        x: 225.04568178072947,
        y: 129,
        text: "Wallpaper",
        fontSize: 24,
        fill: "#111827",
        rotation: 0,
        name: "Text",
      },
      {
        id: "-0XbMBXH38G1MVdV4PvZG",
        type: "ring",
        cx: 157.12920051858413,
        cy: 417.89177928613515,
        innerRadius: 68,
        outerRadius: 75,
        fill: "#FACC15",
        rotation: 0,
        name: "Ring",
      },
      {
        id: "KqZvRvloc0Krts0lNx5zE",
        type: "circle",
        cx: 120.14467660702464,
        cy: 402.0736772128781,
        radius: 17,
        fill: "#696969",
        rotation: 0,
        name: "Circle",
      },
      {
        id: "LiDxWjJxtzlkq7gu7pzog",
        type: "circle",
        cx: 181.02170209214208,
        cy: 401.96803975935757,
        radius: 15,
        fill: "#696969",
        rotation: 0,
        name: "Circle",
      },
      {
        id: "o1vQxH1YjbGyz40XR_YAw",
        type: "ring",
        cx: 160.1637079435547,
        cy: 444.8951830267829,
        innerRadius: 21,
        outerRadius: 23,
        fill: "#fb1313",
        rotation: 0,
        name: "Ring",
      },
      {
        id: "3-4DGC78GctPx_OvcvZui",
        type: "rect",
        x: 114.0487088866813,
        y: 420.11748043523113,
        width: 89,
        height: 29,
        fill: "#ffffff",
        rotation: 0,
        name: "Rectangle",
      },
    ],
    selectedId: null,
  };
  

const initialState: CanvasState = { ...initialPresent, past: [], future: [] };

function pushHistory(state: CanvasState) {
  // cap at 10
  if (state.past.length >= MAX_HISTORY) state.past.shift();
  state.past.push({ elements: state.elements, selectedId: state.selectedId });
  state.future = [];
}

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    select(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    addElement: {
      prepare(el: Partial<AnyEl>) {
        return { payload: { id: nanoid(), rotation: 0, name: undefined, ...el } as AnyEl };
      },
      reducer(state, action: PayloadAction<AnyEl>) {
        pushHistory(state);
        state.elements.push(action.payload);
        state.selectedId = action.payload.id;
      },
    },
    removeElement(state, action: PayloadAction<string>) {
      pushHistory(state);
      state.elements = state.elements.filter((e) => e.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },
    updateElement(state, action: PayloadAction<{ id: string; patch: Partial<AnyEl> }>) {
      const { id, patch } = action.payload;
      const idx = state.elements.findIndex((e) => e.id === id);
      if (idx === -1) return;
      pushHistory(state);
      state.elements[idx] = { ...state.elements[idx], ...patch } as AnyEl;
    },
    moveElementToIndex(state, action: PayloadAction<{ id: string; to: number }>) {
      pushHistory(state);
      const { id, to } = action.payload;
      const from = state.elements.findIndex((e) => e.id === id);
      if (from === -1) return;
      const el = state.elements.splice(from, 1)[0];
      const clamped = Math.max(0, Math.min(to, state.elements.length));
      state.elements.splice(clamped, 0, el);
    },
    undo(state) {
      const prev = state.past.pop();
      if (!prev) return;
      const present = { elements: state.elements, selectedId: state.selectedId };
      // cap future too (optional)
      state.future.unshift(present);
      if (state.future.length > MAX_HISTORY) state.future.pop();
      state.elements = prev.elements;
      state.selectedId = prev.selectedId;
    },
    redo(state) {
      const next = state.future.shift();
      if (!next) return;
      // cap past on redo push
      if (state.past.length >= MAX_HISTORY) state.past.shift();
      state.past.push({ elements: state.elements, selectedId: state.selectedId });
      state.elements = next.elements;
      state.selectedId = next.selectedId;
    },
    setAll(state, action: PayloadAction<Omit<CanvasState, "past" | "future">>) {
      pushHistory(state);
      state.elements = action.payload.elements;
      state.selectedId = action.payload.selectedId;
    },
  },
});

export const {
  select,
  addElement,
  removeElement,
  updateElement,
  moveElementToIndex,
  undo,
  redo,
  setAll,
} = canvasSlice.actions;

export default canvasSlice.reducer;
