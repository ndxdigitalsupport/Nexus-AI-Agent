import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ArtifactStudio from "@/components/ArtifactStudio";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import History from "@/pages/History";
import Agents from "@/pages/Agents";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ActionBoardPage from "@/pages/ActionBoardPage";
import LoginPage from "@/pages/LoginPage";
import { useStore } from "@/store";

function ProtectedLayout() {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-full w-full inset-0 fixed bg-[#070913] overflow-hidden selection:bg-primary selection:text-background font-sans text-text">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Live Artifact & Document Preview Canvas */}
      <ArtifactStudio />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/action-board" element={<ActionBoardPage />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
        </Route>
      </Routes>
    </Router>
  );
}
