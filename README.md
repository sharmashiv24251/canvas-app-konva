# 🎨 ImageLayoutBuilder — Next.js + Konva.js + Redux

<img src="https://opfjwckyarxymdkzuwdk.supabase.co/storage/v1/object/public/temp-blue-bnb/canvas-project.png" alt="ImageLayoutBuilder Preview" width="500">

---

## 🌍 Live Demo

🔗 **Live Project:** [https://canvas-app-konva.vercel.app/](https://canvas-app-konva.vercel.app/)

---

## 🧩 About the Project

**ImageLayoutBuilder** is a powerful and intuitive canvas-based design tool that lets you create stunning visual layouts by adding images, shapes, text, and arrows — all with pixel-perfect control and a clean, responsive interface.

Think of it as a **lightweight Canva or Excalidraw** — built for creators who need a fast, flexible way to compose visual content. The app features a **professional toolbar**, a **live elements sidebar** for layer management, and an **inspector panel** for detailed property editing.

---

## 🚀 Features

### 🖼️ Canvas Editor

- **Infinite canvas** powered by **Konva.js** for smooth, hardware-accelerated rendering.
- Add multiple element types: **Rectangles**, **Circles**, **Rings**, **Arrows**, **Text**, and **Images**.
- **Drag-and-drop images** directly onto the canvas.
- **Transform controls** — resize, rotate, and reposition elements with intuitive handles.
- **Selection system** with visual feedback and bounding boxes.

### 🎛️ Element Management

- **Elements Sidebar** displays all canvas objects in a structured list.
- **Reorder layers** via drag-and-drop to control z-index.
- **Delete elements** individually or via keyboard shortcuts.
- **Move elements up/down** in the layer stack with one click.
- Real-time preview thumbnails for each element.

### 🔍 Inspector Panel

- **Dynamic property editor** that updates based on selected element type.
- Modify **position** (x, y), **size** (width, height), **rotation**, **color**, and **opacity**.
- Toggle **rounded corners** and adjust corner radius for rectangles.
- Change **stroke width**, **fill color**, and other shape-specific properties.
- All changes reflect instantly on the canvas.

### ⌨️ Keyboard Shortcuts

- **Delete** — Remove selected element(s).
- **Ctrl/Cmd + Z** — Undo last action.
- **Ctrl/Cmd + Y** — Redo action.
- **Ctrl/Cmd + C** — Copy selected element.
- **Ctrl/Cmd + V** — Paste element.
- **Cross-window paste** — Copy elements from one browser window and paste into another.

### 💾 Persistent Storage

- All canvas data saved automatically to **local storage** in **JSON format**.
- **Session persistence** — your designs remain intact even after refresh.
- **Demo project** loads on first visit, showcasing all features for new users.
- Export and import functionality for sharing designs.

### 🧰 Toolbar Actions

- **Add Shapes** — Rectangle, Circle, Ring, Arrow.
- **Add Text** — Click to place editable text elements.
- **Add Images** — Upload from your device or drag-and-drop.
- **Undo/Redo** — Navigate through your edit history.
- **Delete** — Remove selected elements quickly.

---

## ⚙️ Tech Stack

| Category           | Technology                       |
| ------------------ | -------------------------------- |
| Frontend Framework | **Next.js**                      |
| Styling            | **Tailwind CSS**                 |
| Canvas Rendering   | **Konva.js**                     |
| State Management   | **Redux Toolkit**                |
| Data Persistence   | **Local Storage (JSON)**         |
| Drag & Drop        | **Native HTML5 Drag & Drop API** |

---

## 🧠 Technical Highlights

- 🎯 **Centralized state management** with a dedicated `canvasSlice` in Redux.
- ⚡ **Optimized rendering** using Konva.js for 60fps canvas performance.
- 🔄 **Undo/Redo system** with complete state history tracking.
- 📦 **JSON-based serialization** for easy import/export of projects.
- 🧩 **Component-driven architecture** with reusable UI elements.
- 🎨 **Pixel-perfect inspector** for granular control over element properties.
- 🖱️ **Cross-window clipboard** — copy/paste elements between browser tabs.
- 🧹 **Clean code structure** with separation of concerns and modular design.

---

## 🧭 How It Works

1. Open the app and explore the **demo project** pre-loaded on first visit.
2. Use the **toolbar** to add shapes, text, arrows, or images to the canvas.
3. **Drag elements** to reposition, **resize handles** to scale, and **rotate** as needed.
4. Select any element to view its properties in the **Inspector Panel**.
5. Adjust colors, sizes, positions, and other attributes in real-time.
6. Manage layer order using the **Elements Sidebar** — drag to reorder or delete.
7. Use **keyboard shortcuts** for faster editing (copy, paste, undo, redo, delete).
8. Your work is **automatically saved** to local storage and persists across sessions.

---

## 🧱 Project Setup

```bash
# Clone the repository
git clone https://github.com/sharmashiv24251/canvas-app-konva

# Navigate to project directory
cd canvas-app-konva

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧑‍💻 About the Developer

Built with ❤️ by **[Shivansh Sharma](https://www.linkedin.com/in/sharmashiv24251/)**  
Front-end developer passionate about building intuitive design tools, state-driven architectures, and pixel-perfect user interfaces.

- 🌐 **GitHub:** [https://github.com/sharmashiv24251](https://github.com/sharmashiv24251)
- 💼 **LinkedIn:** [https://www.linkedin.com/in/sharmashiv24251/](https://www.linkedin.com/in/sharmashiv24251/)

---

## 📜 License

This project is for educational and demonstration purposes only.
