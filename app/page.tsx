import Canvas from "./components/canvas";
import Header from "./components/Header";
import Sidebar from "./components/sidebar/SidebarPanel";
import Toolbar from "./components/Toolbar";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Toolbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <Canvas />
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
