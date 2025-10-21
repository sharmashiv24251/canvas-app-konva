// src/store/canvasSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnyEl, CanvasState } from "@/types/canvas";
import { nanoid } from "nanoid";
import { INITIAL_CANVAS_STATE } from "@/constants";

const MAX_HISTORY = 10;

const initialState: CanvasState = { ...INITIAL_CANVAS_STATE, past: [], future: [] };

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
