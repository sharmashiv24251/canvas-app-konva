import { configureStore, combineReducers } from "@reduxjs/toolkit";
import canvasReducer from "./canvasSlice";
import { INITIAL_CANVAS_STATE } from "@/constants";

const STORAGE_KEY = "canvas-v1";

const rootReducer = combineReducers({
  canvas: canvasReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Check if localStorage key EXISTS (not just has data)
function getPreloadedState(): RootState | undefined {
  if (typeof window === "undefined") {
    return undefined; // SSR
  }

  try {
    // Check if key exists in localStorage
    const hasKey = localStorage.getItem(STORAGE_KEY) !== null;
    
    if (hasKey) {
      // User has used the app before - load their data (even if empty)
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      return {
        canvas: {
          elements: parsed.elements || [],
          selectedId: parsed.selectedId || null,
          past: parsed.past || [],
          future: parsed.future || []
        }
      };
    } else {
      // New user - show demo state
      return {
        canvas: {
          ...INITIAL_CANVAS_STATE,
          past: [],
          future: []
        }
      };
    }
  } catch (error) {
    console.error("Failed to load state:", error);
    // On error, show demo state
    return {
      canvas: {
        ...INITIAL_CANVAS_STATE,
        past: [],
        future: []
      }
    };
  }
}

const preloadedState = getPreloadedState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: process.env.NODE_ENV !== "production",
});

// Persist canvas slice with debouncing
let timeoutId: NodeJS.Timeout | null = null;
let prevCanvas = store.getState().canvas;

store.subscribe(() => {
  const { canvas } = store.getState();
  
  if (canvas !== prevCanvas) {
    prevCanvas = canvas;
    
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(canvas));
        } catch (error) {
          console.error("Failed to save state:", error);
        }
      }
    }, 300);
  }
});
