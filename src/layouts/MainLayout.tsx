import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-black text-white font-sans antialiased overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-zinc-950 to-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
