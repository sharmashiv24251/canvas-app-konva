// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import canvasReducer from "./canvasSlice";
import { loadState, saveState } from "./persist";

// 1) Root reducer defines the store shape
const rootReducer = combineReducers({
  canvas: canvasReducer,
});

// 2) Root types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// 3) Load persisted state (must match RootState shape)
const preloadedState: RootState | undefined = loadState<RootState>();

// 4) Create store
export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: process.env.NODE_ENV !== "production",
});

// 5) Persist only the canvas slice
let prevCanvas = store.getState().canvas;
store.subscribe(() => {
  const { canvas } = store.getState();
  if (canvas !== prevCanvas) {
    prevCanvas = canvas;
    // Persist as RootState shape
    saveState<RootState>({ canvas });
  }
});
